"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ArticleListItem } from "@/lib/journal";
import styles from "./JournalPreviewSection.module.css";

type JournalPreviewSectionProps = {
  articles: ArticleListItem[];
};

export default function JournalPreviewSection({ articles }: JournalPreviewSectionProps) {
  const sorted = [...articles].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const cards = sorted.slice(0, 4);

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.eyebrow}>Featured Stories</p>
          <h2 className={styles.title}>The Journal.</h2>
        </motion.header>

        <div className={styles.grid}>
          {cards.map((article, index) => (
            <motion.article
              key={article.slug}
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/journal/${article.slug}`} className={styles.cardLink}>
                <div className={styles.imageWrap}>
                  {article.heroImage ? (
                    <Image
                      src={article.heroImage}
                      alt={article.heroAlt || article.title}
                      width={640}
                      height={480}
                      className={styles.image}
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 300px"
                    />
                  ) : (
                    <div className={styles.imagePlaceholder} aria-hidden="true" />
                  )}
                  <span className={styles.bracketTR} aria-hidden="true" />
                  <span className={styles.bracketBL} aria-hidden="true" />
                </div>
                <div className={styles.copy}>
                  <h3 className={styles.cardTitle}>{article.title}</h3>
                  <p className={styles.source}>{article.category}</p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
