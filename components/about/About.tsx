"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiCoffee,
  FiCompass,
  FiHeart,
  FiHome,
  FiMapPin,
  FiShield,
  FiSmile,
  FiStar,
  FiSun,
  FiWifi,
} from "react-icons/fi";
import styles from "./AboutEditorialSections.module.css";

const LibreDestinationMap = dynamic(() => import("./LibreDestinationMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapPanel} aria-label="Loading Summerhouses Bali destination map">
      <div className={styles.mapLoading}>Loading live destination map...</div>
    </div>
  ),
});

export type AboutDestination = {
  name: string;
  villas: number;
  latitude?: number;
  longitude?: number;
};

type AboutProps = {
  destinations?: AboutDestination[];
};

const defaultDestinations: AboutDestination[] = [
  { name: "Canggu", villas: 16, latitude: -8.6478, longitude: 115.1385 },
  { name: "Ubud", villas: 4, latitude: -8.5243, longitude: 115.255 },
  { name: "Pererenan", villas: 3, latitude: -8.6371, longitude: 115.1335 },
  { name: "Umalas", villas: 3, latitude: -8.659, longitude: 115.1543 },
];

const storyRows = [
  {
    id: "premium-villas",
    value: "Premium",
    title: "Luxury villas",
    text: "Private homes chosen for atmosphere, privacy, light, and the small details that make a stay feel personal.",
    icon: FiHome,
  },
  {
    id: "curated-destinations",
    value: "Bali",
    title: "Curated destinations",
    text: "Bali neighborhoods selected with care, from quiet residential lanes to homes close to restaurants, beaches, and local rhythms.",
    icon: FiCompass,
  },
  {
    id: "guest-support",
    value: "24/7",
    title: "Exceptional guest experience",
    text: "Clear communication, calm arrivals, and local recommendations handled by people who know the homes before you arrive.",
    icon: FiSmile,
  },
];

const featurePills = [
  { id: "trusted-hospitality", label: "Trusted Hospitality", icon: FiShield },
  { id: "premium-locations", label: "Premium Locations", icon: FiMapPin },
  { id: "personalized-service", label: "Personalized Service", icon: FiHeart },
  { id: "verified-properties", label: "Verified Properties", icon: FiHome },
  { id: "local-expertise", label: "Local Expertise", icon: FiCompass },
];

const galleryImages = [
  {
    id: "gallery-dining",
    src: "/homepage_villa/officiana17.webp",
    alt: "Villa dining and kitchen area prepared for guests",
    label: "Dining Room",
    className: styles.galleryDining,
  },
  {
    id: "gallery-bedroom",
    src: "/homepage_villa/88east.webp",
    alt: "Summerhouses villa bedroom with soft textures",
    label: "Bedroom",
    className: styles.galleryBedroom,
  },
  {
    id: "gallery-workspace",
    src: "/homepage_villa/villaarta.webp",
    alt: "Warm villa interior detail with tropical modern styling",
    label: "Creative Workspace",
    className: styles.galleryWorkspace,
  },
  {
    id: "gallery-kitchen",
    src: "/homepage_villa/CactusEstate.webp",
    alt: "Bright villa pool courtyard in Bali",
    label: "Kitchen",
    className: styles.galleryKitchen,
  },
  {
    id: "gallery-living",
    src: "/homepage_villa/curated-5-lounge.webp",
    alt: "Summerhouses villa lounge with warm natural details",
    label: "Living Room",
    className: styles.galleryLiving,
  },
  {
    id: "gallery-guest-bedroom",
    src: "/homepage_villa/VillaZen.webp",
    alt: "Tropical villa suite with serene island atmosphere",
    label: "Guest Bedroom",
    className: styles.galleryGuestBedroom,
  },
  {
    id: "gallery-foyer",
    src: "/homepage_villa/curated-3-corner.webp",
    alt: "Quiet villa architectural corner with tropical planting",
    label: "Decorative Foyer",
    className: styles.galleryFoyer,
  },
  {
    id: "gallery-office",
    src: "/homepage_villa/curated-2-detail.webp",
    alt: "Summerhouses villa detail with calm work-friendly atmosphere",
    label: "Home Office",
    className: styles.galleryOffice,
  },
  {
    id: "gallery-bathroom",
    src: "/homepage_villa/curated-8.webp",
    alt: "Summerhouses villa garden and pool deck",
    label: "Bathroom",
    className: styles.galleryBathroom,
  },
];

const homeHighlights = [
  { id: "curated-stays", value: "43", label: "Curated stays", text: "A growing collection across Bali's most loved neighborhoods." },
  { id: "support", value: "24/7", label: "Support", text: "A calm team nearby when plans shift, arrivals change, or questions appear." },
  { id: "guest-sentiment", value: "4.9", label: "Guest sentiment", text: "The quiet confidence of homes that feel considered before check-in." },
];

const amenities = [
  { id: "fast-wifi", label: "Fast Wi-Fi", icon: FiWifi },
  { id: "equipped-kitchen", label: "Equipped Kitchen", icon: FiCoffee },
  { id: "private-pools", label: "Private Pools", icon: FiSun },
  { id: "calm-bedrooms", label: "Calm Bedrooms", icon: FiHome },
  { id: "island-guidance", label: "Island Guidance", icon: FiCompass },
  { id: "safety-care", label: "Safety & Care", icon: FiShield },
];

const reviewThemes = [
  {
    id: "quiet-arrivals",
    author: "Guest note",
    location: "Arrival experience",
    date: "Recent stay",
    title: "Quiet arrivals",
    text: "Guests often value that the first moments feel simple: clear directions, a ready home, and a team that responds without fuss.",
  },
  {
    id: "homes-with-atmosphere",
    author: "Guest note",
    location: "Villa atmosphere",
    date: "Recent stay",
    title: "Homes with atmosphere",
    text: "The villas are chosen for the way light, privacy, and materials make daily life feel slower and more personal.",
  },
  {
    id: "local-recommendations",
    author: "Guest note",
    location: "Island guidance",
    date: "Recent stay",
    title: "Local recommendations",
    text: "From restaurants to drivers and island plans, the stay feels easier because the surrounding details are already understood.",
  },
  {
    id: "longer-stays",
    author: "Guest note",
    location: "Longer stays",
    date: "Recent stay",
    title: "Comfort for longer stays",
    text: "Families, couples, and guests working between waves appreciate homes that support both rest and ordinary routines.",
  },
  {
    id: "calm-service",
    author: "Guest note",
    location: "Hospitality",
    date: "Recent stay",
    title: "Service that stays calm",
    text: "Requests are handled with warmth and restraint, so the experience feels hosted, not over-managed.",
  },
  {
    id: "sense-of-bali",
    author: "Guest note",
    location: "Bali rhythm",
    date: "Recent stay",
    title: "A real sense of Bali",
    text: "Each home is presented as a quiet base for living with the island, not just passing through it.",
  },
];

const reviewStats = [
  { id: "cleanliness", value: "4.9", label: "Cleanliness" },
  { id: "accuracy", value: "5.0", label: "Accuracy" },
  { id: "check-in", value: "5.0", label: "Check-in" },
  { id: "communication", value: "5.0", label: "Communication" },
];

const faqs = [
  {
    id: "villa-selection",
    question: "How does Summerhouses choose each villa?",
    answer:
      "We look for homes with atmosphere, privacy, thoughtful light, and practical comfort, then make sure the stay can be supported clearly before guests arrive.",
  },
  {
    id: "arrival-support",
    question: "Can the team help with arrivals and island plans?",
    answer:
      "Yes. Arrivals, recommendations, dining, drivers, and daily requests can be handled with care so guests can settle into the pace of the island.",
  },
  {
    id: "long-stays",
    question: "Are the homes suitable for families or longer stays?",
    answer:
      "Many homes are designed for couples, families, and longer stays, with kitchens, calm bedrooms, private pools, and living spaces that feel easy day after day.",
  },
  {
    id: "villa-locations",
    question: "Where are the villas located?",
    answer:
      "The collection is centered around Bali's most requested stay areas, including Canggu, Ubud, Pererenan, Umalas, Kerobokan, and Legian when available.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1] as const },
};

export default function About({ destinations = [] }: AboutProps) {
  const destinationItems = destinations.length ? destinations : defaultDestinations;
  const totalVillas = destinationItems.reduce((total, destination) => total + destination.villas, 0) || 43;
  const trustStats = [
    { id: "active-villas", value: String(totalVillas), label: "Premium Villas" },
    { id: "support", value: "24/7", label: "Guest Support" },
    { id: "sentiment", value: "4.9", label: "Guest Sentiment" },
  ];
  const valuePillItems = [
    ...featurePills.map((pill) => ({ ...pill, renderId: `${pill.id}-primary` })),
    ...featurePills.map((pill) => ({ ...pill, renderId: `${pill.id}-mirror` })),
  ];

  return (
    <div className={styles.aboutShell}>
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
            className={styles.heroCopy}
          >
            <p className={styles.locationPill}>
              <FiMapPin aria-hidden="true" />
              Bali private stays
            </p>
            <h1>Private homes for a slower kind of island living.</h1>
            <p>
              We curate Bali villas for travelers who want more than a beautiful room. They want a home that
              feels considered, cared for, and quietly connected to the island around it.
            </p>
            <Link href="/villas" className={styles.primaryCta}>
              <span>
                <FiArrowUpRight aria-hidden="true" />
              </span>
              Explore Villas
            </Link>
          </motion.div>

          <motion.figure
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.96, ease: [0.22, 1, 0.36, 1] }}
            className={styles.heroVisual}
          >
            <Image
              src="/homepage_villa/curated-6-exterior.webp"
              alt="Summerhouses Bali private villa with tropical architecture"
              fill
              priority
              sizes="(min-width: 1100px) 48vw, 100vw"
              className={styles.coverImage}
            />
          </motion.figure>

          <motion.div {...fadeUp} className={styles.heroStats}>
            <div className={styles.favoriteBadge}>
              <FiStar aria-hidden="true" />
              <span>Guest favorite</span>
            </div>
            {trustStats.map((stat) => (
              <div key={stat.id} className={styles.heroStat}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className={styles.storySection}>
        <Image
          src="/homepage_villa/curated-1-main.webp"
          alt="Summerhouses villa living space framed by warm interiors"
          fill
          sizes="100vw"
          className={styles.coverImage}
        />
        <div className={styles.storyOverlay} />
        <div className={styles.storyInner}>
          <motion.div {...fadeUp} className={styles.storyHeadline}>
            <p className={styles.lightEyebrow}>Our story</p>
            <h2>Built around the feeling of arriving somewhere that already understands you.</h2>
          </motion.div>

          <motion.div {...fadeUp} className={styles.storyCard}>
            {storyRows.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.id} className={styles.storyRow}>
                  <strong>{item.value}</strong>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <div className={styles.storyIcon}>
                    <Icon aria-hidden="true" />
                  </div>
                </article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className={styles.teamSection}>
        <motion.div {...fadeUp} className={styles.teamCard}>
          <Image
            src="/Found_myself..jpg"
            alt="Summerhouses editorial portrait"
            width={96}
            height={96}
            className={styles.teamAvatar}
          />
          <div>
            <h2>Summerhouses Team</h2>
            <p>Island hospitality, villa curation, and practical guest care.</p>
          </div>
          <Link href="/contact" aria-label="Contact Summerhouses">
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.blockquote {...fadeUp} className={styles.teamQuote}>
          "Summerhouses began with a simple belief: the best stays in Bali are not the loudest ones. They
          are the homes that let the day unfold naturally, with good light, thoughtful spaces, and people
          nearby when you need them."
        </motion.blockquote>

        <div className={styles.pillMarquee} aria-label="Summerhouses values">
          {valuePillItems.map((pill) => {
            const Icon = pill.icon;
            return (
              <span key={pill.renderId} className={styles.valuePill}>
                <span>
                  <Icon aria-hidden="true" />
                </span>
                {pill.label}
              </span>
            );
          })}
        </div>
      </section>

      <section className={styles.gallerySection}>
        <motion.div {...fadeUp} className={styles.sectionIntro}>
          <p className={styles.darkEyebrow}>Gallery</p>
          <h2>Inside the quieter side of Bali.</h2>
          <Link href="/gallery" className={styles.smallCta}>
            Explore Full Gallery
          </Link>
        </motion.div>

        <div className={styles.galleryGrid}>
          {galleryImages.map((image, index) => (
            <motion.figure
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: (index % 4) * 0.04 }}
              key={image.id}
              className={`${styles.galleryItem} ${image.className}`}
            >
              <Image
                key={`${image.id}-image`}
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1100px) 24vw, (min-width: 680px) 42vw, 88vw"
                className={styles.coverImage}
              />
              <figcaption key={`${image.id}-caption`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {image.label}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      <section className={styles.highlightsSection}>
        <motion.div {...fadeUp} className={styles.sectionIntro}>
          <p className={styles.darkEyebrow}>Why choose Summerhouses</p>
          <h2>Everything feels easier when the details are already cared for.</h2>
          <p>
            Whether you are arriving for a honeymoon, a family pause, or a longer stay between work and
            waves, our role is to make the home feel ready for the life you came to live.
          </p>
        </motion.div>

        <div className={styles.highlightCards}>
          {homeHighlights.map((highlight) => (
            <motion.article {...fadeUp} key={highlight.id} className={styles.highlightCard}>
              <strong key={`${highlight.id}-value`}>{highlight.value}</strong>
              <div key={`${highlight.id}-copy`}>
                <h3>{highlight.label}</h3>
                <p>{highlight.text}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className={styles.amenityGrid}>
          {amenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.035 }}
                key={amenity.id}
                className={styles.amenityItem}
              >
                <span key={`${amenity.id}-label`}>{amenity.label}</span>
                <Icon key={`${amenity.id}-icon`} aria-hidden="true" />
              </motion.div>
            );
          })}
        </div>

        <motion.div {...fadeUp} className={styles.promoBanner}>
          <Image
            key="promo-image"
            src="/homepage_villa/curated-4-view.webp"
            alt="Summerhouses Bali villa view for a calm stay"
            fill
            sizes="(min-width: 900px) 82vw, 100vw"
            className={styles.coverImage}
          />
          <div key="promo-copy">
            <p className={styles.lightEyebrow}>Begin with a home</p>
            <h3>Discover your next unforgettable stay.</h3>
            <Link href="/villas" className={styles.reserveButton}>
              <span>
                <FiArrowUpRight aria-hidden="true" />
              </span>
              Reserve Now
            </Link>
          </div>
        </motion.div>
      </section>

      <section className={styles.reviewsSection}>
        <motion.div {...fadeUp} className={styles.reviewHeader}>
          <p className={styles.darkEyebrow}>Reviews</p>
          <h2>4.98</h2>
          <p>
            We are proud to shape stays that feel considered before arrival, calm during the visit, and easy
            to remember after check-out.
          </p>
        </motion.div>
        <div className={styles.reviewStatsRow}>
          {reviewStats.map((stat) => (
            <div key={stat.id}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.reviewGrid}>
          {reviewThemes.map((review, index) => (
            <motion.article
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: (index % 3) * 0.05 }}
              key={review.id}
              className={styles.reviewCard}
            >
              <div key={`${review.id}-header`} className={styles.reviewCardHeader}>
                <span className={styles.reviewAvatar}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{review.author}</strong>
                  <span>{review.location}</span>
                </div>
                <em>5.0</em>
              </div>
              <h3 key={`${review.id}-title`}>{review.title}</h3>
              <p key={`${review.id}-text`}>{review.text}</p>
              <time key={`${review.id}-date`}>{review.date}</time>
            </motion.article>
          ))}
        </div>
        <Link href="/contact" className={styles.viewAllButton}>
          View All
        </Link>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqIntro}>
          <p className={styles.darkEyebrow}>FAQ</p>
          <h2>Everything you need to know.</h2>
          <Link href="/contact" className={styles.reserveButtonDark}>
            <span>
              <FiArrowUpRight aria-hidden="true" />
            </span>
            Ask Us
          </Link>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details key={faq.id} className={styles.faqItem}>
              <summary>
                <span>{faq.question}</span>
                <FiChevronDown aria-hidden="true" />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.destinationSection}>
        <div className={styles.destinationInner}>
          <motion.div {...fadeUp} className={styles.destinationHeader}>
            <p className={styles.lightEyebrow}>Location</p>
            <h2>Where Summerhouses stays unfold.</h2>
            <p>
              The collection is centered around Bali's most requested stay areas, with villas selected for
              privacy, atmosphere, and access to the island's everyday rituals.
            </p>
          </motion.div>

          <div className={styles.destinationFacts}>
            <div>
              <span>Featured regions</span>
              <strong>{destinationItems.length}</strong>
            </div>
            <div>
              <span>Active villa points</span>
              <strong>{totalVillas}</strong>
            </div>
            <div>
              <span>Island focus</span>
              <strong>Bali</strong>
            </div>
          </div>

          <LibreDestinationMap destinations={destinationItems} />

          <div className={styles.destinationList}>
            {destinationItems.map((destination) => (
              <article key={destination.name}>
                <span>{destination.name}</span>
                <strong>
                  {destination.villas} {destination.villas === 1 ? "villa" : "villas"}
                </strong>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
