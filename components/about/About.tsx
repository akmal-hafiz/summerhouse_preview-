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
    description: string;
    image: string;
    alt: string;
};

const servicesData: ServiceItem[] = [
    {
        title: 'Private Chef',
        description: 'Seasonal ingredients, island flavors, and quiet tableside service shaped around the way you want to gather.',
        image: '/homepage_villa/villaarta.webp',
        alt: 'Private villa dining and kitchen setting',
    },
    {
        title: 'Boarding Assistance',
        description: 'Begin and end your journey with ease through arrival guidance, luggage support, and seamless transfers across Bali.',
        image: '/bellevoire/beach_stay.png',
        alt: 'Quiet beach arrival arranged by Summerhouses',
    },
    {
        title: 'Wellness Rituals',
        description: 'In-villa massage, poolside recovery, and slow morning rituals arranged around your rhythm, privacy, and pace.',
        image: '/homepage_villa/curated-5-lounge.webp',
        alt: 'Poolside wellness moment at a Summerhouses villa',
    },
    {
        title: 'Island Concierge',
        description: 'From private dinners to local reservations, every detail is handled with calm precision before you need to ask.',
        image: '/bellevoire/editorial_large.png',
        alt: 'Summerhouses villa terrace prepared for a private stay',
    },
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

// --- Section 3: Personalized Services ---

const StackedServiceCard = ({
    service,
    index,
}: {
    service: ServiceItem;
    index: number;
}) => (
        <article
            className={`${editorialStyles.servicePanel} about-service-panel`}
            style={{
                ['--stack-index' as string]: index,
                ['--stack-offset' as string]: `${index * 1.65}rem`,
                ['--stack-offset-tablet' as string]: `${index * 1.22}rem`,
                ['--stack-offset-mobile' as string]: `${index * 0.95}rem`,
                ['--stack-z' as string]: 20 + index,
            }}
        >
            <div className={editorialStyles.servicePanelNumber}>
                {String(index + 1).padStart(2, '0')}
            </div>
            <h4 className={editorialStyles.servicePanelTitle}>{service.title}</h4>
            <p className={editorialStyles.servicePanelDescription}>{service.description}</p>
            <figure className={editorialStyles.servicePanelImageFrame}>
                <Image
                    src={service.image}
                    alt={service.alt}
                    width={760}
                    height={560}
                    sizes="(min-width: 1200px) 30vw, (min-width: 768px) 42vw, 100vw"
                    className={editorialStyles.servicePanelImage}
                />
            </figure>
        </article>
);

const PersonalizedServicesSection = () => {
    return (
        <section className={`${editorialStyles.personalizedStory} about-personalized-story`}>
            <div className={`${editorialStyles.personalizedShell} about-personalized-shell`}>
                <motion.header
                    initial={{ opacity: 0, y: 34 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className={`${editorialStyles.personalizedHeader} about-personalized-header`}
                >
                    <h3>Personalized <em>Services</em></h3>
                </motion.header>

                <div className={`${editorialStyles.serviceDeck} about-service-deck`}>
                    {servicesData.map((service, index) => (
                        <StackedServiceCard
                            key={service.title}
                            service={service}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

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
            <PersonalizedServicesSection />
            <MoreThanStaySection />
            <JournalPreviewSection />
            <StatsSection />
        </div>
    );
};

export default About;
