"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { articles, type Article } from "@/data/articles";
import styles from "./JournalPreviewSection.module.css";

function formatArticleDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

const sortedArticles = [...articles].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

const featuredArticle = sortedArticles[0];
const supportingArticles = sortedArticles.slice(1, 4);

const ArticleMeta = ({ article, light = false }: { article: Article; light?: boolean }) => (
  <p className={light ? styles.metaLight : styles.meta}>
    {article.category} / {formatArticleDate(article.date)}
  </p>
);

export default function JournalPreviewSection() {
  if (!featuredArticle) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className={styles.eyebrow}>Summerhouses Journal</p>
            <h2 className={styles.title}>Notes from the island.</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={styles.intro}
          >
            <p>
              Design stories, rituals, and practical notes for people who want to live with Bali, not just visit it.
            </p>
            <Link href={`/journal/${featuredArticle.slug}`} className={styles.headerLink}>
              Read the latest
            </Link>
          </motion.div>
        </div>

        <div className={styles.layout}>
          <motion.article
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className={styles.featured}
          >
            <Link href={`/journal/${featuredArticle.slug}`} className={styles.featuredLink}>
              <div className={styles.featuredImage}>
                <Image
                  src={featuredArticle.heroImage}
                  alt={featuredArticle.heroAlt}
                  width={1600}
                  height={1000}
                  className={styles.coverImage}
                  sizes="(min-width: 1024px) 58vw, calc(100vw - 32px)"
                />
              </div>
              <div className={styles.featuredCopy}>
                <ArticleMeta article={featuredArticle} light />
                <h3>{featuredArticle.title}</h3>
                <p>{featuredArticle.excerpt}</p>
              </div>
            </Link>
          </motion.article>

          <div className={styles.stack}>
            {supportingArticles.map((article, index) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.75, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={styles.storyCard}
              >
                <Link href={`/journal/${article.slug}`} className={styles.storyLink}>
                  <div className={styles.storyImage}>
                    <Image
                      src={article.heroImage}
                      alt={article.heroAlt}
                      width={480}
                      height={600}
                      className={styles.coverImage}
                      sizes="180px"
                    />
                  </div>
                  <div className={styles.storyCopy}>
                    <ArticleMeta article={article} />
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
