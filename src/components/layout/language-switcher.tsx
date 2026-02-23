'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';

const LOCALES = ['en', 'fr', 'ar'] as const;

export function LanguageSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0] ?? 'en';
  const rest = segments.slice(1).join('/');

  return (
    <div className="flex items-center overflow-hidden rounded-full border border-black/10 bg-black/[0.02]">
      {LOCALES.map((locale) => {
        const href = `/${locale}${rest ? `/${rest}` : ''}`;
        const active = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={href}
            className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${active
                ? 'bg-black text-white'
                : 'text-black/35 hover:text-black/60'
              }`}
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
