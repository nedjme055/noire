import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';

export function Hero({ locale }: { locale: string }) {
  const t = useTranslations('home');

  return (
    <section className="relative w-full overflow-hidden bg-cream">
      <div
        className="relative flex min-h-[72vh] items-center justify-center sm:min-h-[88vh]"
        style={{
          background: 'linear-gradient(160deg, #E8DED0 0%, #D4C9B8 25%, #C1B5A2 50%, #AFA28E 75%, #9D917D 100%)',
        }}
      >
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative floating elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-40 w-40 rounded-full bg-white/[0.06] blur-3xl" />
          <div className="absolute bottom-[15%] right-[8%] h-56 w-56 rounded-full bg-black/[0.04] blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          {/* Tag line */}
          <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white/25 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black/50 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-black/30" />
            Limited Edition Online Exclusive
          </p>

          {/* Main heading */}
          <h1
            className="font-display text-5xl font-light italic leading-[1.05] text-ink sm:text-7xl lg:text-8xl"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            {t('heroTitle')}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-black/40">
            Curated fashion for the modern wardrobe
          </p>

          {/* CTA button */}
          <Link
            href={`/${locale}/new-drop`}
            className="mt-8 inline-flex min-h-[48px] items-center justify-center bg-black px-10 py-3.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition-all hover:bg-black/85 active:scale-[0.98]"
          >
            {t('shopNow')}
          </Link>
        </div>
      </div>
    </section>
  );
}
