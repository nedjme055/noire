import { getTranslations } from 'next-intl/server';

export default async function AboutPage() {
  const t = await getTranslations('static.about');

  return (
    <div className="container-mobile py-16">
      <div className="mx-auto max-w-2xl">
        {/* Hero header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-px w-12 bg-black/20" />
          <h1 className="text-2xl font-light tracking-tight text-ink sm:text-3xl">{t('title')}</h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <p className="text-[14px] leading-8 text-black/55">{t('p1')}</p>
          <div className="relative py-4">
            <div className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-black/10" />
            <p className="pl-6 text-[15px] italic leading-8 text-black/40">
              &ldquo;Premium clothing curated for the modern Algerian wardrobe.&rdquo;
            </p>
          </div>
          <p className="text-[14px] leading-8 text-black/55">{t('p2')}</p>
        </div>
      </div>
    </div>
  );
}
