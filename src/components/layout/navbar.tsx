'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import { LanguageSwitcher } from './language-switcher';
import { useTranslations } from 'next-intl';
import { useCart } from '@/components/shop/cart-provider';

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const { count } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
      <div className="container-mobile flex items-center justify-between py-3.5 sm:py-4">
        <Link href={`/${locale}`} className="inline-flex items-center" aria-label="Noire home">
          <Image src="/noire-logo.png" alt="Noire" width={145} height={44} priority className="h-8 w-auto sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-7 sm:flex">
          {[
            { href: `/${locale}`, label: t('home') },
            { href: `/${locale}/category/pants`, label: t('pants') },
            { href: `/${locale}/category/tshirts`, label: t('tshirts') },
            { href: `/${locale}/category/shoes`, label: t('shoes') },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative pb-0.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-black/55 transition-colors hover:text-black after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-black after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop search */}
          <form onSubmit={submitSearch} className="hidden items-center sm:flex">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="h-9 w-40 rounded-full border border-black/10 bg-black/[0.03] pl-9 pr-3 text-[12px] outline-none transition-all focus:w-52 focus:border-black/25 focus:bg-white"
                aria-label={t('searchPlaceholder')}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </form>

          {/* Mobile search icon */}
          <Link href={`/${locale}/search`} className="flex h-9 w-9 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black sm:hidden" aria-label={t('search')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          {/* Cart */}
          <Link href={`/${locale}/cart`} className="relative flex h-9 w-9 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white ring-2 ring-white">
                {count}
              </span>
            )}
          </Link>

          <div className="hidden h-5 w-px bg-black/10 sm:block" />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
