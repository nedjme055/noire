'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { useCart } from '@/components/shop/cart-provider';

const NAV_ICONS = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  pants: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12l-1 20h-4l-1-12-1 12H7z" />
    </svg>
  ),
  tshirts: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
    </svg>
  ),
  shoes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18h20v2H2zM4 18V8l4-2v4l8-2v5c2 0 4 1 6 3v2" />
    </svg>
  ),
  cart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
};

export function MobileDock({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { count } = useCart();

  const links = [
    { href: `/${locale}`, label: t('home'), icon: NAV_ICONS.home },
    { href: `/${locale}/category/pants`, label: t('pants'), icon: NAV_ICONS.pants },
    { href: `/${locale}/category/tshirts`, label: t('tshirts'), icon: NAV_ICONS.tshirts },
    { href: `/${locale}/category/shoes`, label: t('shoes'), icon: NAV_ICONS.shoes },
    { href: `/${locale}/cart`, label: t('cart'), icon: NAV_ICONS.cart, badge: count },
  ];

  return (
    <nav className="safe-py fixed bottom-0 left-0 right-0 z-40 border-t border-white/20 bg-white/75 backdrop-blur-xl sm:hidden">
      <div className="grid grid-cols-5 px-2 pt-2 pb-1">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== `/${locale}` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center gap-0.5 px-1 py-1.5 transition-all ${active ? 'text-black' : 'text-black/35'
                }`}
            >
              {/* Active pill indicator */}
              {active && (
                <span className="absolute -top-2 h-[3px] w-8 rounded-full bg-black" />
              )}

              <div className="relative">
                {link.icon}
                {link.badge != null && link.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black text-[7px] font-bold text-white ring-2 ring-white">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-wider">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
