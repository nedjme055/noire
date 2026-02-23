import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  const current = routing.locales.includes(locale as 'en' | 'fr' | 'ar')
    ? (locale as 'en' | 'fr' | 'ar')
    : routing.defaultLocale;

  return {
    locale: current,
    messages: (await import(`../../messages/${current}.json`)).default
  };
});
