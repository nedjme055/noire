import { getTranslations } from 'next-intl/server';

export default async function ShippingReturnsPage() {
  const t = await getTranslations('static.shipping');

  const sections = [
    { icon: '📦', label: 'Shipping', content: t('p1') },
    { icon: '🔄', label: 'Returns', content: t('p2') },
    { icon: '💰', label: 'Payment', content: t('p3') },
  ];

  return (
    <div className="container-mobile py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-px w-12 bg-black/20" />
          <h1 className="text-2xl font-light tracking-tight text-ink sm:text-3xl">{t('title')}</h1>
        </div>

        {/* Info cards */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.label}
              className="rounded-xl border border-black/[0.06] bg-[#FAFAF8] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{section.icon}</span>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-black/60">
                  {section.label}
                </h3>
              </div>
              <p className="text-[14px] leading-7 text-black/50">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
