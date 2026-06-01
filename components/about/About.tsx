"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import JournalPreviewSection from "./JournalPreviewSection";
import styles from "./AboutEditorialSections.module.css";

const trustStats = [
  { value: "43", label: "curated Bali stays" },
  { value: "24/7", label: "guest support" },
  { value: "4.9", label: "average guest sentiment" },
  { value: "1", label: "island, thoughtfully opened" },
];

const differenceItems = [
  {
    title: "Homes with a point of view",
    text: "We choose villas for atmosphere, privacy, light, and the small details that make a stay feel personal.",
  },
  {
    title: "Service that stays quiet",
    text: "Arrivals, recommendations, dining, and daily requests are handled with care so guests can simply settle in.",
  },
  {
    title: "Local fluency",
    text: "Our team understands Bali's neighborhoods, rhythms, and trusted partners, from family lunches to late arrivals.",
  },
  {
    title: "Stays you can trust",
    text: "Every home is presented clearly, prepared carefully, and supported by people who know the property before you arrive.",
  },
];

const experienceNotes = [
  "Slow mornings beside private pools",
  "Restaurants, drivers, and island plans arranged with ease",
  "Homes that feel calm for couples, families, and long stays",
];

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.28 },
  transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] as const },
};

export default function About() {
  return (
    <div className={styles.aboutShell}>
      <section className={styles.aboutHero}>
        <Image
          src="/homepage_villa/curated-6-exterior.webp"
          alt="Private Bali villa framed by tropical architecture"
          fill
          priority
          sizes="100vw"
          className={styles.aboutHeroImage}
        />
        <div className={styles.aboutHeroOverlay} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={styles.aboutHeroContent}
        >
          <p className={styles.aboutEyebrow}>Summerhouses Bali</p>
          <h1>Private homes for a slower kind of island living.</h1>
          <p>
            We curate Bali villas for travelers who want more than a beautiful room. They want a home that
            feels considered, cared for, and quietly connected to the island around it.
          </p>
        </motion.div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyGrid}>
          <motion.div {...fadeUp} className={styles.storyIntro}>
            <div className={styles.motionContents}>
              <p className={styles.aboutEyebrow}>Our story</p>
              <h2>Built around the feeling of arriving somewhere that already understands you.</h2>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className={styles.storyCopy}>
            <div className={styles.motionContents}>
              <p>
                Summerhouses began with a simple belief: the best stays in Bali are not the loudest ones.
                They are the homes that let the day unfold naturally, with good light, thoughtful spaces,
                and people nearby when you need them.
              </p>
              <p>
                We bring together private villas across the island and shape each stay with practical care:
                clear communication, local recommendations, and a calm arrival experience from the first message.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={styles.differenceSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.aboutEyebrow}>Why guests choose us</p>
          <h2>Curated with restraint, hosted with warmth.</h2>
        </div>
        <div className={styles.differenceGrid}>
          {differenceItems.map((item, index) => (
            <motion.article
              {...fadeUp}
          transition={{ ...fadeUp.transition, delay: index * 0.06 }}
          key={item.title}
          className={styles.differenceCard}
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

      <section className={styles.experienceSection}>
        <motion.figure {...fadeUp} className={styles.experienceImage}>
          <Image
            src="/homepage_villa/curated-7.webp"
            alt="Summerhouses villa with pool and tropical garden"
            width={1500}
            height={1100}
            sizes="(min-width: 1024px) 54vw, 100vw"
            className={styles.imageCover}
          />
        </motion.figure>
        <motion.div {...fadeUp} className={styles.experienceCopy}>
          <div className={styles.motionContents}>
            <p className={styles.aboutEyebrow}>The experience</p>
            <h2>Everything feels easier when the details are already cared for.</h2>
            <p>
              Whether you are arriving for a honeymoon, a family pause, or a longer stay between work and
              waves, our role is to make the home feel ready for the life you came to live.
            </p>
            <ul>
              {experienceNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      <section className={styles.trustSection}>
        <div className={styles.trustGrid}>
          {trustStats.map((stat) => (
            <motion.div {...fadeUp} key={stat.label} className={styles.trustItem}>
              <div className={styles.motionContents}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <JournalPreviewSection />

      <section className={styles.aboutCta}>
        <div>
          <p className={styles.aboutEyebrow}>Begin with a home</p>
          <h2>Find the villa that feels like your part of Bali.</h2>
        </div>
        <Link href="/villas">Explore villas</Link>
      </section>
    </div>
  );
}
