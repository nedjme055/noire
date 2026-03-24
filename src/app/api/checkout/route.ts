import {z} from 'zod';
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db/prisma';
import {checkRateLimit, getClientIp} from '@/lib/rate-limit';

const itemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
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
  if (data.items.some((item) => !item.variantId)) {
    return NextResponse.json({ error: 'Variant selection is required' }, { status: 400 });
  }
  const shipping = await prisma.shippingWilaya.findUnique({where: {code: data.wilayaCode}});
  if (!shipping) {
    return NextResponse.json({error: 'Invalid wilaya'}, {status: 400});
  }
  const deliveryOptionPrice =
    data.deliveryMethod === 'stopdesk' ? shipping.stopdeskPriceDzd : shipping.homePriceDzd;

  const subtotal = data.items.reduce((sum, item) => sum + item.priceDzd * item.quantity, 0);
  const total = subtotal + deliveryOptionPrice;

  const baseUrl = process.env.INVENTORY_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({error: 'Inventory API base URL is not configured'}, {status: 500});
  }

  const payload = {
    customer: {
      name: data.customerName,
      phone: data.phone,
      wilaya: data.wilayaCode,
      commune: data.commune,
      address: data.address,
      deliveryMethod: data.deliveryMethod,
      deliveryPrice: deliveryOptionPrice,
      notes: data.notes || ''
    },
    items: data.items.map((item) => ({
      product_id: Number(item.productId),
      variant_id: item.variantId ? Number(item.variantId) : undefined,
      quantity: item.quantity,
      selling_price: item.priceDzd
    }))
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.INVENTORY_API_KEY) {
    headers['X-STORE-KEY'] = process.env.INVENTORY_API_KEY;
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/store/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Checkout failed' }));
    return NextResponse.json({ error: data.error || 'Checkout failed' }, { status: res.status });
  }

  const result = await res.json();
  const orderId = result?.orderId ?? result?.data?.orderId ?? null;
  const orderNumber = result?.orderNumber ?? result?.data?.orderNumber ?? null;

  return NextResponse.json({ ok: true, orderId, orderNumber });
}
