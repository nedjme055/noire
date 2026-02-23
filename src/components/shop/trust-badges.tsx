import { useTranslations } from 'next-intl';

const ICONS = [
  // Shipping truck
  <svg key="ship" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>,
  // Shield check
  <svg key="shield" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>,
  // Cash / Banknote
  <svg key="cash" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40">
    <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" />
    <path d="M2 10h2M20 10h2M2 14h2M20 14h2" />
  </svg>,
];

export function TrustBadges() {
  const t = useTranslations('home');
  const badges = [t('badge1'), t('badge2'), t('badge3')];

  return (
    <section className="border-t border-black/[0.06] bg-[#FAFAF8] py-8">
      <div className="container-mobile grid grid-cols-1 gap-6 sm:grid-cols-3">
        {badges.map((badge, index) => (
          <div key={badge} className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04]">
              {ICONS[index]}
            </div>
            <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-black/55">
              {badge}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
