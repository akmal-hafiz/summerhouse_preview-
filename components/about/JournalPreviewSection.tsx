"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ArticleListItem } from "@/lib/journal";
import styles from "./JournalPreviewSection.module.css";

function formatArticleDate(date: string) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
}

const ArticleMeta = ({ article, light = false }: { article: ArticleListItem; light?: boolean }) => (
  <p className={light ? styles.metaLight : styles.meta}>
    {article.category}
    {article.date && ` / ${formatArticleDate(article.date)}`}
  </p>
);

type JournalPreviewSectionProps = {
  articles: ArticleListItem[];
};

export default function JournalPreviewSection({ articles }: JournalPreviewSectionProps) {
  const sorted = [...articles].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const featuredArticle = sorted[0];
  const supportingArticles = sorted.slice(1, 4);

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
            <Link href="/journal" className={styles.headerLink}>
              Read the journal
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
                  alt={featuredArticle.heroAlt || featuredArticle.title}
                  width={1600}
                  height={1000}
                  className={styles.coverImage}
                  sizes="(min-width: 1024px) 58vw, calc(100vw - 32px)"
                />
              </div>
              <div className={styles.featuredCopy}>
                <ArticleMeta article={featuredArticle} light />
                <h3>{featuredArticle.title}</h3>
                {featuredArticle.excerpt && <p>{featuredArticle.excerpt}</p>}
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
                      alt={article.heroAlt || article.title}
                      width={480}
                      height={600}
                      className={styles.coverImage}
                      sizes="180px"
                    />
                  </div>
                  <div className={styles.storyCopy}>
                    <ArticleMeta article={article} />
                    <h3>{article.title}</h3>
                    {article.excerpt && <p>{article.excerpt}</p>}
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
