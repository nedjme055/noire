export const RTL_LOCALES = ['ar'];

export function isRtlLocale(locale: string) {
  return RTL_LOCALES.includes(locale);
}
