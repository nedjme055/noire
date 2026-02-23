import {z} from 'zod';
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db/prisma';
import {checkRateLimit, getClientIp} from '@/lib/rate-limit';
import {DeliveryMethod} from '@prisma/client';

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

function createOrderNumber() {
  const ts = Date.now().toString().slice(-8);
  return `NR-${ts}`;
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

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        if (item.variantId) {
          const variant = await tx.variant.findUnique({where: {id: item.variantId}});
          if (!variant || variant.productId !== item.productId || variant.stock < item.quantity) {
            throw new Error('Variant out of stock');
          }
          await tx.variant.update({
            where: {id: item.variantId},
            data: {stock: {decrement: item.quantity}}
          });
        } else {
          const product = await tx.product.findUnique({where: {id: item.productId}});
          if (!product || product.stock < item.quantity) {
            throw new Error('Product out of stock');
          }
          await tx.product.update({
            where: {id: item.productId},
            data: {stock: {decrement: item.quantity}}
          });
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber: createOrderNumber(),
          customerName: data.customerName,
          phone: data.phone,
          email: data.email || null,
          wilayaCode: data.wilayaCode,
          commune: data.commune,
          address: data.address,
          notes: data.notes,
          shippingPrice: deliveryOptionPrice,
          deliveryMethod: data.deliveryMethod as DeliveryMethod,
          deliveryOptionPrice: 0,
          subtotal,
          total,
          metaEventId: data.eventId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.title,
              size: item.size,
              color: item.color,
              unitPrice: item.priceDzd,
              quantity: item.quantity,
              lineTotal: item.priceDzd * item.quantity
            }))
          }
        }
      });

      for (const productId of new Set(data.items.map((item) => item.productId))) {
        const aggregate = await tx.variant.aggregate({
          where: {productId},
          _sum: {stock: true}
        });
        await tx.product.update({
          where: {id: productId},
          data: {stock: aggregate._sum.stock ?? 0}
        });
      }

      return created;
    });
  } catch (error) {
    return NextResponse.json({error: (error as Error).message}, {status: 400});
  }

  return NextResponse.json({ok: true, orderId: order.id, orderNumber: order.orderNumber});
}
