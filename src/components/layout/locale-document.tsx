'use client';

import {useEffect} from 'react';
import {isRtlLocale} from '@/lib/i18n/rtl';

export function LocaleDocument({locale}: {locale: string}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  return null;
}
