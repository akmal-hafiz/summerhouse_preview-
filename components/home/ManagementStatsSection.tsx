import { motion } from "framer-motion";
import { StatItem } from "../about/StatItem";

const stats = [
    { value: 85, decimals: 0, suffix: "%", label: "Average Occupancy Rate", delay: 0 },
    { value: 40, decimals: 0, suffix: "%+", label: "Revenue Increase for Clients", delay: 0.15 },
    { value: 50, decimals: 0, suffix: "+", label: "Villas Under Management", delay: 0.3 },
    { value: 24, decimals: 0, suffix: "/7", label: "Full-Service Operations", delay: 0.45 },
];

export const ManagementStatsSection = () => {
    return (
        <section className="w-full bg-[var(--color-page)] py-20 lg:py-32 touch-pan-y">
            <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12 lg:px-24">
                
                {/* Micro-label Header */}
                <div className="mb-16 flex flex-col items-center text-center">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand)]"
                        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                    >
                        Proven Performance
                    </motion.span>
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: 40 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="mt-2 h-[2px] bg-[var(--color-border-warm)]"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-0 relative">
                    {stats.map((stat, index) => (
                        <div key={index} className="relative">
                            <StatItem {...stat} variant="strong" />
                            
                            {/* Vertical Divider for Desktop */}
                            {index < stats.length - 1 && (
                                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-[var(--color-border)]" />
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Bottom decorative accent line */}
                <div className="mt-20 flex justify-center">
                    <div className="h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
                </div>
            </div>
        </section>
    );
};
