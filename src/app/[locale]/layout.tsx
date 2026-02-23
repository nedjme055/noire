import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/lib/i18n/routing';
import { isRtlLocale } from '@/lib/i18n/rtl';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { MobileDock } from '@/components/layout/mobile-dock';
import { ConsentBanner } from '@/components/tracking/consent-banner';
import { LocaleDocument } from '@/components/layout/locale-document';
import { AppProviders } from '@/components/app-providers';
import { MetaPixel } from '@/components/tracking/meta-pixel';
import { getSiteSettings } from '@/lib/queries';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as 'en' | 'fr' | 'ar')) {
    notFound();
  }

  const messages = await getMessages();
  const settings = await getSiteSettings();

  return (
    <div
      className="min-h-screen bg-white text-ink"
      lang={locale}
      dir={isRtlLocale(locale) ? 'rtl' : 'ltr'}
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <LocaleDocument locale={locale} />
        <AppProviders>
          <MetaPixel pixelId={settings.metaPixelId} />

          {/* Announcement bar */}
          <div className="announcement-bar">
            Free Shipping Available Nationwide · <a href={`/${locale}/shipping-returns`}>Read More</a>
          </div>

          <div className="safe-pt">
            <Navbar locale={locale} />
            <main className="animate-fade-in pb-28 sm:pb-10">{children}</main>
            <Footer locale={locale} />
          </div>
          <MobileDock locale={locale} />
          <ConsentBanner />
        </AppProviders>
      </NextIntlClientProvider>
    </div>
  );
}
