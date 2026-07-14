import { StatItem } from "./StatItem";

const stats = [
    { value: 4.9, decimals: 1, suffix: "", label: "Average Guest Rating", delay: 0 },
    { value: 10, decimals: 0, suffix: "K+", label: "Happy Guests Hosted", delay: 0.15 },
    { value: 95, decimals: 0, suffix: "%", label: "Repeat Booking Rate", delay: 0.3 },
    { value: 365, decimals: 0, suffix: "", label: "Days of Warm Hospitality", delay: 0.45 },
];

export const StatsSection = () => {
    return (
        <section className="w-full bg-[var(--color-page)] pb-32 pt-12 lg:pb-48 lg:pt-20 touch-pan-y">
            <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12 lg:px-24">
                {/* Optional hairline divider above the stats for editorial feel */}
                <div className="mb-24 h-px w-full bg-black/[0.05]" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-8">
                    {stats.map((stat, index) => (
                        <StatItem key={index} {...stat} />
                    ))}
                </div>
            </div>
        </section>
    );
};
