import Image from "next/image";
import Link from "next/link";
import styles from "./JournalIndex.module.css";
import type { ArticleListItem } from "@/lib/journal";

function formatDateLong(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatVolume(items: ArticleListItem[]): string {
  if (!items.length) return "Vol. I";
  const newest = items
    .map((i) => new Date(i.date))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  if (!newest) return "Vol. I";
  const year = newest.getFullYear();
  const month = newest.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  return `${month} · ${year}`;
}

type JournalIndexProps = {
  articles: ArticleListItem[];
};

export default function JournalIndex({ articles }: JournalIndexProps) {
  const lead = articles[0];
  const rest = articles.slice(1);
  const volume = formatVolume(articles);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.masthead}>
          <p className={styles.mastheadKicker}>Summerhouses Bali</p>
          <h1 className={styles.mastheadTitle}>The <em>Journal</em></h1>
          <p className={styles.mastheadMeta}>
            <span>{volume}</span>
            <span>Editorial Studio</span>
            <span>Bali, Indonesia</span>
          </p>
        </header>

        {!articles.length && (
          <div className={styles.empty}>
            <p>No stories yet. Come back soon, or <Link href="/villas">browse villas</Link>.</p>
          </div>
        )}

        {lead && (
          <article className={styles.lead}>
            <Link href={`/journal/${lead.slug}`} className={styles.leadImage}>
              <Image
                src={lead.heroImage}
                alt={lead.heroAlt}
                fill
                priority
                sizes="(min-width: 880px) 56vw, 100vw"
              />
            </Link>
            <div className={styles.leadCopy}>
              <p className={styles.leadCategory}>{lead.category}</p>
              <h2 className={styles.leadTitle}>
                <Link href={`/journal/${lead.slug}`}>{lead.title}</Link>
              </h2>
              <p className={styles.leadExcerpt}>{lead.excerpt || lead.subtitle}</p>
              <p className={styles.leadMeta}>
                <span>{formatDateLong(lead.date)}</span>
                {lead.readTime && <span>{lead.readTime}</span>}
                {lead.authorName && <span>By {lead.authorName}</span>}
              </p>
              <Link href={`/journal/${lead.slug}`} className={styles.leadCta}>Read the story</Link>
            </div>
          </article>
        )}

        {rest.length > 0 && (
          <>
            <div className={styles.sectionRule}>
              <span className={styles.sectionRuleLabel}>More stories</span>
            </div>

            <div className={styles.grid}>
              {rest.map((article) => (
                <article key={article.slug} className={styles.card}>
                  <Link href={`/journal/${article.slug}`} className={styles.cardImage}>
                    <Image
                      src={article.heroImage}
                      alt={article.heroAlt}
                      fill
                      sizes="(min-width: 980px) 30vw, (min-width: 640px) 44vw, 88vw"
                    />
                  </Link>
                  <p className={styles.cardCategory}>{article.category}</p>
                  <h3 className={styles.cardTitle}>
                    <Link href={`/journal/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className={styles.cardExcerpt}>{article.excerpt || article.subtitle}</p>
                  <p className={styles.cardMeta}>
                    {formatDateLong(article.date)}
                    {article.readTime ? ` · ${article.readTime}` : ""}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
