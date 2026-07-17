"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./Services.module.css";

const servicePillars = [
  {
    title: "Villa booking",
    text: "Clear guidance on the right home, area, and stay rhythm before you make a decision.",
  },
  {
    title: "Concierge assistance",
    text: "Drivers, dining, wellness, and daily details arranged through people who know the island.",
  },
  {
    title: "Family and group stays",
    text: "Homes selected for comfort, privacy, sleeping arrangements, and the way people actually gather.",
  },
  {
    title: "Romantic escapes",
    text: "Quiet villas, soft arrivals, and thoughtful recommendations for honeymoons and slower celebrations.",
  },
];

const journey = [
  {
    step: "01",
    title: "Tell us what matters",
    text: "Share your dates, guests, neighborhood preference, and the feeling you want from the stay.",
  },
  {
    step: "02",
    title: "Choose with confidence",
    text: "We help you compare homes clearly, from bedroom setup and location to atmosphere and practical fit.",
  },
  {
    step: "03",
    title: "Arrive without friction",
    text: "The small details are prepared before you land, so the first hour already feels calm.",
  },
  {
    step: "04",
    title: "Live Bali your way",
    text: "From dinner plans to quiet days at home, our support stays available without crowding the experience.",
  },
];

const guestReasons = [
  "Straightforward villa guidance",
  "Local recommendations with taste",
  "Thoughtful arrival support",
  "Homes prepared for real life, not only photos",
];

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.28 },
  transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Services() {
  return (
    <div className={styles.servicesPage}>
      <section className={styles.hero}>
        <Image
          src="/homepage_villa/curated-1-main.webp"
          alt="Private Bali villa pool prepared for guests"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={styles.heroContent}
        >
          <p className={styles.eyebrow}>Guest services</p>
          <h1>Everything around the stay, handled with quiet precision.</h1>
          <p>
            From choosing the right villa to arranging the details that make Bali feel effortless, our service
            is designed around how you want to arrive, gather, rest, and explore.
          </p>
        </motion.div>
      </section>

      <section className={styles.overview}>
        <motion.div {...fadeUp} className={styles.overviewIntro}>
          <div className={styles.motionContents}>
            <p className={styles.eyebrow}>What we help with</p>
            <h2>Hospitality that begins before the booking.</h2>
          </div>
        </motion.div>
        <div className={styles.pillarGrid}>
          {servicePillars.map((item, index) => (
            <motion.article
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: index * 0.06 }}
              key={item.title}
              className={styles.pillarCard}
            >
              <div className={styles.motionContents}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.detailBlocks}>
        <motion.figure {...fadeUp} className={styles.detailImage}>
          <Image
            src="/homepage_villa/curated-8.webp"
            alt="Calm Bali villa living room prepared for a private stay"
            width={1400}
            height={1050}
            sizes="(min-width: 1024px) 48vw, 100vw"
            className={styles.coverImage}
          />
        </motion.figure>
        <motion.div {...fadeUp} className={styles.detailCopy}>
          <div className={styles.motionContents}>
            <p className={styles.eyebrow}>Why guests love it</p>
            <h2>Less arranging. More being there.</h2>
            <p>
              A good stay should not feel like project management. We help guests move from questions to clarity,
              then from arrival to ease, with the Summerhouse team that understands both villa life and Bali's daily rhythm.
            </p>
            <div className={styles.reasonList}>
              {guestReasons.map((reason) => (
                <span key={reason}>{reason}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className={styles.journey}>
        <div className={styles.journeyHeader}>
          <p className={styles.eyebrow}>Guest journey</p>
          <h2>What happens after you reach out.</h2>
        </div>
        <div className={styles.journeyRows}>
          {journey.map((item) => (
            <motion.article {...fadeUp} key={item.step} className={styles.journeyRow}>
              <div className={styles.motionContents}>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <Image
          src="/homepage_villa/curated-4-view.webp"
          alt="Bali villa terrace looking toward the pool"
          fill
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.ctaOverlay} />
        <div className={styles.ctaContent}>
          <p className={styles.eyebrow}>Ready when you are</p>
          <h2>Tell us the stay you have in mind. We will help shape the rest.</h2>
          <Link href="/contact">Plan your stay</Link>
        </div>
      </section>
    </div>
  );
}
