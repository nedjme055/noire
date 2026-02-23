import { getTranslations } from 'next-intl/server';

export default async function ContactPage() {
  const t = await getTranslations('static.contact');

  return (
    <div className="container-mobile py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-px w-12 bg-black/20" />
          <h1 className="text-2xl font-light tracking-tight text-ink sm:text-3xl">{t('title')}</h1>
        </div>

        {/* Contact info cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-black/[0.06] bg-[#FAFAF8] p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-black/50">Phone</h3>
            <p className="mt-1 text-[14px] text-black/60">{t('p1')}</p>
          </div>
          <div className="rounded-xl border border-black/[0.06] bg-[#FAFAF8] p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-black/50">Email</h3>
            <p className="mt-1 text-[14px] text-black/60">{t('p2')}</p>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 rounded-xl border border-black/[0.06] bg-[#FAFAF8] p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-black/50">Address</h3>
          <p className="mt-1 text-[14px] text-black/60">{t('p3')}</p>
        </div>
      </div>
    </div>
  );
}
