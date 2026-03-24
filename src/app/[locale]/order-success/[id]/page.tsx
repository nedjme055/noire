import { notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';

export default async function OrderSuccessPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  if (!params.id) notFound();
  const orderNumber = params.id;

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const text = encodeURIComponent(`Order ${orderNumber} submitted.`);

  return (
    <div className="container-mobile py-20 text-center">
      <div className="mx-auto max-w-md space-y-8">
        {/* Animated checkmark circle */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
          {/* Inner filled circle */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-light tracking-tight text-ink">Order Confirmed</h1>
          <p className="mt-2 text-[13px] text-black/45">Thank you for your purchase</p>
        </div>

        {/* Order number card */}
        <div className="rounded-xl border border-black/[0.06] bg-[#FAFAF8] px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Order Number</p>
          <p className="mt-1.5 text-[20px] font-semibold tracking-wide text-ink">{orderNumber}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${text}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wider text-white transition-all hover:bg-emerald-700"
              target="_blank"
              rel="noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Send on WhatsApp
            </a>
          )}
          <Link
            href={`/${params.locale}`}
            className="btn-primary w-full"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
