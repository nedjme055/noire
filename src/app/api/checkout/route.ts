import {z} from 'zod';
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db/prisma';
import {checkRateLimit, getClientIp} from '@/lib/rate-limit';

const itemSchema = z.object({
  productId: z.union([z.string().min(1), z.number().int().positive()]),
  variantId: z.union([z.string().min(1), z.number().int().positive()]),
  title: z.string().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
  priceDzd: z.number().int().positive(),
  quantity: z.number().int().positive()
});

const payloadSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')),
  wilayaCode: z.string().min(1),
  commune: z.string().min(2),
  address: z.string().min(4),
  notes: z.string().optional(),
  deliveryMethod: z.enum(['home', 'stopdesk']),
  eventId: z.string().min(8),
  items: z.array(itemSchema).min(1)
});

function createOrderNumber() {
  const ts = Date.now().toString().slice(-8);
  return `NR-${ts}`;
}

function toPositiveInt(value: string | number) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `checkout:${ip}`,
    limit: 15,
    windowMs: 60_000
  });
  if (!rate.allowed) {
    return NextResponse.json(
      {error: 'Too many requests. Please wait and try again.'},
      {status: 429, headers: {'Retry-After': String(rate.retryAfter)}}
    );
  }

  const json = await req.json();
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
  }

  const data = parsed.data;
  const shipping = await prisma.shippingWilaya.findUnique({where: {code: data.wilayaCode}});
  if (!shipping) {
    return NextResponse.json({error: 'Invalid wilaya'}, {status: 400});
  }
  const deliveryOptionPrice =
    data.deliveryMethod === 'stopdesk' ? shipping.stopdeskPriceDzd : shipping.homePriceDzd;

  const subtotal = data.items.reduce((sum, item) => sum + item.priceDzd * item.quantity, 0);
  const total = subtotal + deliveryOptionPrice;

  const inventoryBaseUrl = process.env.INVENTORY_API_BASE_URL?.replace(/\/$/, '');
  const inventoryApiKey = process.env.INVENTORY_API_KEY;
  if (!inventoryBaseUrl || !inventoryApiKey) {
    return NextResponse.json(
      {error: 'Store API is not configured on this server.'},
      {status: 500}
    );
  }

  const inventoryItems = data.items.map((item) => {
    const productId = toPositiveInt(item.productId);
    const variantId = toPositiveInt(item.variantId);
    if (!productId || !variantId) {
      throw new Error('Invalid product/variant ids in cart items.');
    }

    return {
      product_id: productId,
      variant_id: variantId,
      quantity: item.quantity,
      selling_price: item.priceDzd,
    };
  });

  const payload = {
    customer: {
      name: data.customerName,
      phone: data.phone,
      wilaya: data.wilayaCode,
      commune: data.commune,
      address: data.address,
      deliveryMethod: data.deliveryMethod,
      notes: data.notes,
    },
    items: inventoryItems,
  };

  let inventoryResponse;
  let inventoryJson: any;
  try {
    inventoryResponse = await fetch(`${inventoryBaseUrl}/api/store/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-STORE-KEY': inventoryApiKey,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    inventoryJson = await inventoryResponse.json().catch(() => ({}));
  } catch (error) {
    return NextResponse.json({error: (error as Error).message}, {status: 400});
  }

  if (!inventoryResponse.ok) {
    const message = inventoryJson?.error || 'Checkout failed at inventory service.';
    const status = inventoryResponse.status === 400 ? 400 : 502;
    return NextResponse.json({error: message}, {status});
  }

  const created = inventoryJson?.data ?? inventoryJson;
  const orderId = created?.orderId ? String(created.orderId) : createOrderNumber();
  const orderNumber = created?.orderNumber ? String(created.orderNumber) : orderId;

  return NextResponse.json({ok: true, orderId, orderNumber});
}
