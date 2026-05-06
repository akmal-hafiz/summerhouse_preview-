"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import styles from "./Contact.module.css";

const contactItems = [
  {
    icon: FiMapPin,
    label: "Visit",
    value: "Jl. Raya Campuhan, Ubud, Bali 80571",
  },
  {
    icon: FiPhone,
    label: "Call",
    value: "+62 811 388 999",
  },
  {
    icon: FiMail,
    label: "Email",
    value: "hello@summerhousebali.com",
  },
];

const fieldMotion = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Contact() {
  return (
    <div className={styles.contactPage}>
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className={styles.heroInner}
        >
          <p className={styles.eyebrow}>Summerhouses Bali</p>
          <h1>
            Start the conversation <em>before you arrive.</em>
          </h1>
          <p className={styles.heroText}>
            Tell us what kind of stay you are imagining. Our team will help with availability,
            private villa details, and the quiet practical things that make Bali feel effortless.
          </p>
        </motion.div>
      </section>

      <section className={styles.contactEditorial}>
        <div className={styles.mediaColumn}>
          <motion.figure {...fieldMotion} className={styles.mainImage}>
            <Image
              src="/homepage_villa/curated-7.webp"
              alt="Summerhouses villa pool and tropical garden"
              width={1100}
              height={1400}
              sizes="(min-width: 1024px) 42vw, 100vw"
              className={styles.image}
            />
          </motion.figure>
          <motion.div {...fieldMotion} className={styles.note}>
            <span>Concierge note</span>
            <p>For urgent arrival support, call our Bali team directly.</p>
          </motion.div>
        </div>

        <motion.div {...fieldMotion} className={styles.formPanel}>
          <div className={styles.formHeading}>
            <p>Contact us</p>
            <h2>Share a few details</h2>
          </div>

          <form className={styles.form}>
            <div className={styles.fieldGrid}>
              <label>
                <span>First name *</span>
                <input type="text" placeholder="Jane" />
              </label>
              <label>
                <span>Last name</span>
                <input type="text" placeholder="Smith" />
              </label>
            </div>

            <div className={styles.fieldGrid}>
              <label>
                <span>Email *</span>
                <input type="email" placeholder="jane@email.com" />
              </label>
              <label>
                <span>Phone</span>
                <input type="tel" placeholder="+62 811 388 999" />
              </label>
            </div>

            <label>
              <span>Message *</span>
              <textarea placeholder="Tell us about your dates, villa preference, or what you need help with." />
            </label>

            <button type="submit">Send inquiry</button>
          </form>
        </motion.div>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoHeader}>
          <p className={styles.eyebrow}>Direct details</p>
          <h2>Reach the Summerhouses team.</h2>
        </div>

        <div className={styles.infoGrid}>
          {contactItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article {...fieldMotion} key={item.label} className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <Icon />
                </div>
                <div>
                  <span>{item.label}</span>
                  <p>{item.value}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
