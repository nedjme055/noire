import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from './routing';

export async function I18nProvider({
  locale,
  children
}: {
  locale: string;
  children: React.ReactNode;
}) {
  if (!routing.locales.includes(locale as 'en' | 'fr' | 'ar')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
