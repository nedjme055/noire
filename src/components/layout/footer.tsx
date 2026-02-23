import Image from 'next/image';
import { Link } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-black/[0.06] bg-[#FAFAF8] pb-24 sm:pb-0">
      <div className="container-mobile py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2">
            <Image src="/noire-logo.png" alt="Noire" width={120} height={36} className="h-7 w-auto" />
            <p className="max-w-xs text-[13px] leading-6 text-black/45">
              Premium clothing curated for the modern Algerian wardrobe. Cash on delivery nationwide.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 pt-1">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] text-black/40 transition-all hover:bg-black hover:text-white" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] text-black/40 transition-all hover:bg-black hover:text-white" aria-label="TikTok">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.12v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.3 6.34 6.34 0 009.49 21.64a6.34 6.34 0 006.34-6.34V9.06a8.16 8.16 0 004.76 1.54v-3.5a4.85 4.85 0 01-1-.41z" />
                </svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] text-black/40 transition-all hover:bg-black hover:text-white" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Information links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">Information</h4>
            <div className="flex flex-col gap-2.5">
              <Link className="text-[13px] text-black/50 transition-colors hover:text-black" href={`/${locale}/about`}>
                {t('about')}
              </Link>
              <Link className="text-[13px] text-black/50 transition-colors hover:text-black" href={`/${locale}/shipping-returns`}>
                {t('shippingReturns')}
              </Link>
              <Link className="text-[13px] text-black/50 transition-colors hover:text-black" href={`/${locale}/contact`}>
                {t('contact')}
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">Shop</h4>
            <div className="flex flex-col gap-2.5">
              <Link className="text-[13px] text-black/50 transition-colors hover:text-black" href={`/${locale}/category/pants`}>Pants</Link>
              <Link className="text-[13px] text-black/50 transition-colors hover:text-black" href={`/${locale}/category/tshirts`}>T-Shirts</Link>
              <Link className="text-[13px] text-black/50 transition-colors hover:text-black" href={`/${locale}/category/shoes`}>Shoes</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-black/[0.06] pt-6">
          <p className="text-[11px] text-black/30">{t('copyright')}</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-black/20">Made in Algeria</p>
        </div>
      </div>
    </footer>
  );
}
