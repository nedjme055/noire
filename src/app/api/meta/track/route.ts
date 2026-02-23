import {createHash} from 'crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getSiteSettings} from '@/lib/queries';
import {checkRateLimit, getClientIp} from '@/lib/rate-limit';

const metaSchema = z.object({
  event_name: z.enum(['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase']),
  event_id: z.string().min(8),
  event_source_url: z.string().url(),
  value: z.number().optional(),
  currency: z.string().optional(),
  user_data: z
    .object({
      email: z.string().optional(),
      phone: z.string().optional()
    })
    .optional(),
  content_name: z.string().optional()
});

function sha256(value: string) {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `meta-track:${ip}`,
    limit: 60,
    windowMs: 60_000
  });
  if (!rate.allowed) {
    return NextResponse.json(
      {error: 'Too many tracking requests.'},
      {status: 429, headers: {'Retry-After': String(rate.retryAfter)}}
    );
  }

  const settings = await getSiteSettings();
  if (!settings.trackingEnabled || !settings.metaPixelId || !settings.metaAccessToken) {
    return NextResponse.json({ok: true, skipped: true});
  }

  const json = await req.json();
  const parsed = metaSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
  }

  const data = parsed.data;

  const payload = {
    data: [
      {
        event_name: data.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: data.event_id,
        action_source: 'website',
        event_source_url: data.event_source_url,
        user_data: {
          em: data.user_data?.email ? [sha256(data.user_data.email)] : undefined,
          ph: data.user_data?.phone ? [sha256(data.user_data.phone)] : undefined
        },
        custom_data: {
          currency: data.currency ?? 'DZD',
          value: data.value ?? 0,
          content_name: data.content_name
        }
      }
    ],
    test_event_code: settings.metaTestEventCode || undefined
  };

  await fetch(`https://graph.facebook.com/v20.0/${settings.metaPixelId}/events?access_token=${settings.metaAccessToken}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });

  return NextResponse.json({ok: true});
}
