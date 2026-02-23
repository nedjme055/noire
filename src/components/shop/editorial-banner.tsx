import { Link } from '@/lib/i18n/routing';

export function EditorialBanner({
    locale,
    title,
    subtitle,
    ctaLabel,
    ctaHref,
    bgColor = '#2a2a22',
}: {
    locale: string;
    title: string;
    subtitle?: string;
    ctaLabel: string;
    ctaHref: string;
    bgColor?: string;
}) {
    return (
        <section className="relative w-full overflow-hidden" style={{ backgroundColor: bgColor }}>
            <div className="relative flex min-h-[55vh] items-center justify-center sm:min-h-[65vh]">
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />

                {/* Subtle light streak */}
                <div className="absolute inset-0">
                    <div className="absolute left-1/2 top-0 h-full w-1/3 -translate-x-1/2 bg-white/[0.03] blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center px-6 text-center">
                    {subtitle && (
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
                            {subtitle}
                        </p>
                    )}
                    <h2
                        className="text-4xl font-light italic leading-[1.05] text-white sm:text-6xl lg:text-7xl"
                        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    >
                        {title}
                    </h2>
                    <Link
                        href={ctaHref}
                        className="mt-8 inline-flex min-h-[44px] items-center justify-center border border-white/50 bg-transparent px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-all hover:border-white hover:bg-white hover:text-black active:scale-[0.98]"
                    >
                        {ctaLabel}
                    </Link>
                </div>
            </div>
        </section>
    );
}
