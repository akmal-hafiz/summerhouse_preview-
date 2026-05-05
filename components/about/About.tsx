"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { StatsSection } from './StatsSection';
import JournalPreviewSection from './JournalPreviewSection';
import editorialStyles from './AboutEditorialSections.module.css';

// --- Constants & Types ---

type ServiceItem = {
    title: string;
};

const servicesData: ServiceItem[] = [
    { title: '24/7 Concierge Service' },
    { title: 'Wellness & Spa Center' },
    { title: 'Gourmet On-Site Dining' },
    { title: 'Rooftop Pool & Lounge' },
];

// --- Section 1: Brand Intro ---

const EditorialImage = ({ src, alt, className, sizes = "(min-width: 1024px) 80vw, 100vw" }: { src: string; alt: string; className: string; sizes?: string }) => (
    <motion.figure
        initial={{ opacity: 0, y: 34, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`${editorialStyles.mediaFrame} ${className}`}
    >
        <Image
            src={src}
            alt={alt}
            width={1600}
            height={1100}
            sizes={sizes}
            className={editorialStyles.mediaImage}
        />
    </motion.figure>
);

const BrandIntroSection = () => (
    <section className={editorialStyles.brandStory}>
        <div className={editorialStyles.mastheadShell}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className={editorialStyles.mastheadTopline}
            >
                <span>Summerhouses Bali</span>
                <span>Private island homes</span>
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={editorialStyles.mastheadTitle}
            >
                Summerhouses <em>Bali</em>
            </motion.h2>

            <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={editorialStyles.mastheadIntro}
            >
                <p className={editorialStyles.introLead}>
                    Welcome to Summerhouses. <em>Your elegant retreat in the heart of Bali.</em>
                </p>
                <p className={editorialStyles.introText}>
                    We provide an experience of refined comfort, timeless elegance, and heartfelt hospitality.
                    Nestled in the most coveted corners of Bali, our private estates invite travelers to slow down
                    and feel the quiet soul of the island.
                </p>
                <Link href="#summerhouses-umalas" className={editorialStyles.textLink}>
                    More about us
                </Link>
            </motion.div>

            <div className={editorialStyles.mastheadImageRow}>
                <EditorialImage
                    src="/bellevoire/landscape.png"
                    alt="Summerhouses Landscape"
                    className={editorialStyles.panoramaFrame}
                />
                <motion.aside
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className={editorialStyles.mastheadNote}
                >
                    <span>01</span>
                    <p>
                        Calm spaces, open air, and considered details for the rhythm of Bali living.
                    </p>
                </motion.aside>
            </div>
        </div>
    </section>
);

// --- Section 2: Brand Editorial ---

const BrandEditorialSection = () => (
    <section id="summerhouses-umalas" className={editorialStyles.villaStory}>
        <div className={editorialStyles.villaShell}>
            <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.32 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className={editorialStyles.villaHeading}
            >
                <p className={editorialStyles.chapter}>Summerhouses Collection</p>
                <h3 className={editorialStyles.villaTitle}>
                    Bali awaits at <em>Your Summerhouse Retreat</em>
                </h3>
            </motion.div>

            <div className={editorialStyles.villaEditorialGrid}>
                <motion.aside
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.85, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={editorialStyles.villaCopy}
                >
                    <span className={editorialStyles.villaNumber}>01</span>
                    <p className={editorialStyles.villaLabel}>Summerhouses</p>
                    <h4>Umalas</h4>
                    <p>
                        Nestled in the artistic heart of Bali, this boutique retreat blends bohemian charm with
                        serene rice-field views and panoramic sunsets. A space designed for quiet reflection.
                    </p>
                    <Link href="/villas/umalas" className={editorialStyles.textLink}>
                        Learn more
                    </Link>
                </motion.aside>

                <div className={editorialStyles.villaImageStack}>
                    <EditorialImage
                        src="/bellevoire/editorial_large.png"
                        alt="Umalas Main"
                        className={editorialStyles.villaMainFrame}
                    />

                    <div className={editorialStyles.villaLowerRow}>
                        <EditorialImage
                            src="/bellevoire/editorial_small.png"
                            alt="Umalas Detail"
                            className={editorialStyles.villaDetailFrame}
                            sizes="360px"
                        />
                        <div className={editorialStyles.villaIndex}>
                            <span>Villa note</span>
                            <strong>Quiet mornings, shaded rooms, and warm afternoon light.</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// --- Section 3: Philosophy ---

const PhilosophySection = () => (
    <section className={editorialStyles.philosophyStory}>
        <div className={editorialStyles.philosophyShell}>
            <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className={editorialStyles.philosophyCopy}
            >
                <p className={editorialStyles.chapter}>The Summerhouse Story</p>
                <h3>Not a hotel. <em>A home.</em></h3>
                <p>
                    We did not set out to build another villa rental. We set out to answer one question:
                    what does it feel like to stay somewhere that truly gets you? The result is Summerhouse,
                    where every detail exists to make you feel at home, not like a guest.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={editorialStyles.philosophyServices}
            >
                {servicesData.map((service, index) => (
                    <div key={service.title} className={editorialStyles.philosophyService}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <p>{service.title}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    </section>
);

// --- Section 4: More Than Stay (Transitional) ---

const MoreThanStaySection = () => {
    return (
        <section className={editorialStyles.moreStay}>
            <div className={editorialStyles.moreStayMedia}>
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
                    className={editorialStyles.moreStayImageWrap}
                >
                    <Image 
                        src="/bellevoire/beach_stay.png" 
                        alt="Serene Beach" 
                        width={1600}
                        height={1000}
                        sizes="100vw"
                        className={editorialStyles.moreStayImage}
                    />
                </motion.div>
                <div className={editorialStyles.moreStayOverlay} />
            </div>

            <div className={editorialStyles.moreStayBrand}>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    whileInView={{ opacity: 1 }} 
                    viewport={{ once: true }}
                >
                    <span>Summerhouses</span>
                </motion.div>
            </div>

            <div className={editorialStyles.moreStayContent}>
                <div className={editorialStyles.moreStayWords}>
                    <motion.h2 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className={`${editorialStyles.moreStayWord} ${editorialStyles.moreStayWordLeft}`}
                    >
                        More
                    </motion.h2>

                    <motion.h2 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className={`${editorialStyles.moreStayWord} ${editorialStyles.moreStayWordCenter}`}
                    >
                        than
                    </motion.h2>

                    <motion.h2 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`${editorialStyles.moreStayWord} ${editorialStyles.moreStayWordRight}`}
                    >
                        stay
                    </motion.h2>
                </div>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.7 }}
                    className={editorialStyles.moreStayText}
                >
                    At Summerhouses, every detail is designed to make you feel at home &mdash; with the elegance of Bali just beyond your door
                </motion.p>
            </div>
        </section>
    );
};




// --- Main Page Component ---

const About = () => {
    return (
        <div className={editorialStyles.aboutShell}>
            <BrandIntroSection />
            <BrandEditorialSection />
            <PhilosophySection />
            <MoreThanStaySection />
            <JournalPreviewSection />
            <StatsSection />
        </div>
    );
};

export default About;
