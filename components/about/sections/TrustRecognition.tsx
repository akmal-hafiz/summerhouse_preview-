"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FiPlus, FiX } from "react-icons/fi";
import styles from "./TrustRecognition.module.css";

type Pillar = {
  id: string;
  name: string;
  scope: string;
  desc: string;
  image: string;
};

const PILLARS: Pillar[] = [
  {
    id: "verified",
    name: "Verified Villas",
    scope: "Every home",
    desc: "Each villa is personally inspected for comfort, cleanliness, and safety before a guest arrives — so the space feels ready the moment you walk in.",
    image: "/homepage_villa/curated-1-main.webp",
  },
  {
    id: "support",
    name: "24/7 Guest Support",
    scope: "Any time",
    desc: "A real person stays reachable around the clock — for arrivals, late questions, or anything that shifts once you land.",
    image: "/homepage_villa/curated-5-lounge.webp",
  },
  {
    id: "concierge",
    name: "Local Concierge",
    scope: "On the island",
    desc: "Drivers, dining, beach days, and trusted recommendations, arranged by a team that actually lives here.",
    image: "/homepage_villa/88east.webp",
  },
  {
    id: "booking",
    name: "Secure Booking",
    scope: "Every trip",
    desc: "Clear terms, protected payments, and confirmed details before you travel — no guesswork, no grey areas.",
    image: "/homepage_villa/curated-8.webp",
  },
  {
    id: "pricing",
    name: "Transparent Pricing",
    scope: "No surprises",
    desc: "The price you see is the price you pay, with every fee explained up front and nothing added on arrival.",
    image: "/homepage_villa/villaarta.webp",
  },
];

type Stat = {
  id: string;
  label: string;
  to: number;
  decimals?: number;
  suffix?: string;
};

function CountUp({ to, duration = 1.6, decimals = 0, suffix = "" }: { to: number; duration?: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Number((to * eased).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(tick);
      else setValue(to);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration, decimals]);

  return (
    <span ref={ref}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function TrustRecognition({ villas = 43 }: { villas?: number }) {
  const [openId, setOpenId] = useState<string>(PILLARS[0].id);

  const stats: Stat[] = [
    { id: "guests", label: "Happy Guests", to: 200, suffix: "+" },
    { id: "villas", label: "Curated Villas", to: villas },
    { id: "rating", label: "Guest Rating", to: 4.9, decimals: 1 },
    { id: "repeat", label: "Repeat Guests", to: 26, suffix: "%" },
  ];

  return (
    <section className={styles.section} id="trust" aria-label="Why travelers trust Summerhouses">
      <div className={styles.inner}>
        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          A decade of stays, thoughtfully hosted.
        </motion.h2>

        <div className={styles.list}>
          {PILLARS.map((pillar) => {
            const isOpen = openId === pillar.id;
            return (
              <div key={pillar.id} className={`${styles.row} ${isOpen ? styles.rowOpen : ""}`}>
                <button
                  type="button"
                  className={styles.rowHead}
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? "" : pillar.id)}
                >
                  <span className={styles.toggle} aria-hidden="true">
                    {isOpen ? <FiX /> : <FiPlus />}
                  </span>
                  <span className={styles.rowName}>{pillar.name}</span>
                  <span className={styles.rowScope}>{pillar.scope}</span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className={styles.rowBody}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className={styles.rowBodyInner}>
                        <p className={styles.rowDesc}>{pillar.desc}</p>
                        <div className={styles.rowImage}>
                          <Image src={pillar.image} alt="" fill sizes="220px" className={styles.rowImageImg} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className={styles.stats}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              className={styles.stat}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>
                <CountUp to={stat.to} decimals={stat.decimals} suffix={stat.suffix} />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
