'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import { AdminLogout } from './admin-logout';

const NAV_ITEMS = [
  {
    href: 'products',
    label: 'Products',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    href: 'orders',
    label: 'Orders',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    href: 'shipping',
    label: 'Shipping',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    href: 'settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14M12 2v2m0 18v-2m10-8h-2M4 12H2" />
      </svg>
    ),
  },
];

export function AdminShell({ locale, children }: { locale: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F7F7F5]">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-black/8 bg-white sm:flex sm:flex-col">
        {/* Brand */}
        <div className="border-b border-black/8 px-5 py-5">
          <span className="text-base font-bold tracking-[0.15em]">NOIRE</span>
          <p className="mt-0.5 text-[11px] text-black/40 uppercase tracking-wider">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname.includes(`/admin/${item.href}`);
            return (
              <Link
                key={item.href}
                href={`/${locale}/admin/${item.href}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${active
                    ? 'bg-black text-white'
                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                  }`}
              >
                <span className={active ? 'opacity-100' : 'opacity-60'}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-black/8 p-3">
          <AdminLogout locale={locale} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-black/8 bg-white px-4 py-3 sm:hidden">
        <span className="text-base font-bold tracking-[0.15em]">NOIRE Admin</span>
        <div className="flex items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname.includes(`/admin/${item.href}`);
            return (
              <Link
                key={item.href}
                href={`/${locale}/admin/${item.href}`}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${active ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="min-w-0 flex-1 pt-14 sm:pt-0">
        <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
