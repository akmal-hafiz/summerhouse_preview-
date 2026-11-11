"use client";

import Image from "next/image";
import Link from "next/link";
import type { ArticleListItem } from "@/lib/journal";
import styles from "./JournalPreviewSection.module.css";

type JournalPreviewSectionProps = {
  articles: ArticleListItem[];
  content?: {
    title?: string;
  };
};

export default function JournalPreviewSection({ articles, content }: JournalPreviewSectionProps) {
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
    <section id="journal" className={styles.section}>
      <div className={styles.inner}>
        <header
          className={styles.header}
        >
          <h2 className={styles.title}>{content?.title || "The Journal."}</h2>
        </header>

        <div className={styles.grid} aria-label="Latest Journal stories">
          {cards.map((article, index) => (
            <article
              key={article.slug}
              className={styles.card}
              data-about-reveal
            >
              <Link href={`/journal/${article.slug}`} className={styles.cardLink}>
                <div className={styles.imageWrap} data-journal-media>
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
                  <p className={styles.source}>
                    <span className={styles.category}>{article.category}</span>
                    {/^\d{4}-\d{2}-\d{2}$/.test(article.date) && (
                      <time dateTime={article.date}>
                        {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
                          .format(new Date(`${article.date}T00:00:00Z`))}
                      </time>
                    )}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
