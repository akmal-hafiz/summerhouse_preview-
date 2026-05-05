"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import type { Article, ArticleContentBlock } from "@/data/articles";
import styles from "./ArticlePage.module.css";

interface ArticlePageProps {
  article: Article;
  relatedArticles: Article[];
}

function formatArticleDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ArticleHero({ article }: { article: Article }) {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroKicker}>
          <span>Summerhouses Journal</span>
          <span>{article.category}</span>
        </div>

        <div className={styles.heroText}>
          <p className={styles.eyebrow}>{formatArticleDate(article.date)}</p>
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.subtitle}>{article.subtitle}</p>
          <p className={styles.meta}>
            By {article.author.name}
            <span aria-hidden="true">/</span>
            {article.readTime}
          </p>
        </div>

        <div className={styles.heroNote}>
          <span>Field notes on tropical homes, thoughtful ownership, and slow island living.</span>
        </div>
      </div>

      <figure className={styles.heroImageFrame}>
        <Image
          src={article.heroImage}
          alt={article.heroAlt}
          fill
          priority
          sizes="(min-width: 1280px) 1180px, calc(100vw - 40px)"
          className={styles.coverImage}
        />
      </figure>
    </header>
  );
}

function CopyFrame({ children }: { children: ReactNode }) {
  return <div className={styles.copyFrame}>{children}</div>;
}

function TextBlock({
  block,
  isFirstParagraph,
}: {
  block: Extract<ArticleContentBlock, { type: "paragraph" | "heading" | "subheading" }>;
  isFirstParagraph: boolean;
}) {
  if (block.type === "paragraph") {
    return (
      <CopyFrame>
        <p className={cx(styles.paragraph, isFirstParagraph && styles.dropCap)}>
          {block.text}
        </p>
      </CopyFrame>
    );
  }

  if (block.type === "subheading") {
    return (
      <CopyFrame>
        <h3 className={styles.subheading}>{block.text}</h3>
      </CopyFrame>
    );
  }

  return (
    <CopyFrame>
      <h2 className={styles.heading}>{block.text}</h2>
    </CopyFrame>
  );
}

function InlineImage({ block }: { block: Extract<ArticleContentBlock, { type: "image" }> }) {
  return (
    <figure className={styles.inlineFigure}>
      <div className={styles.inlineImageFrame}>
        <Image
          src={block.src}
          alt={block.alt}
          fill
          sizes="(min-width: 1080px) 980px, calc(100vw - 40px)"
          className={styles.coverImage}
        />
      </div>
      {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
    </figure>
  );
}

function PullQuote({ text }: { text: string }) {
  return (
    <aside className={styles.quoteFrame}>
      <blockquote className={styles.quote}>"{text}"</blockquote>
    </aside>
  );
}

function ArticleContent({ content }: { content: ArticleContentBlock[] }) {
  const firstParagraphIndex = content.findIndex((block) => block.type === "paragraph");

  return (
    <article className={styles.articleBody}>
      {content.map((block, index) => {
        if (block.type === "image") {
          return <InlineImage key={`${block.type}-${index}`} block={block} />;
        }

        if (block.type === "quote") {
          return <PullQuote key={`${block.type}-${index}`} text={block.text} />;
        }

        return (
          <TextBlock
            key={`${block.type}-${index}`}
            block={block}
            isFirstParagraph={index === firstParagraphIndex}
          />
        );
      })}
    </article>
  );
}

function AuthorSection({ article }: { article: Article }) {
  return (
    <section className={styles.authorSection}>
      <div className={styles.authorCard}>
        <div className={styles.authorAvatar}>
          <Image
            src={article.author.avatar}
            alt={article.author.name}
            fill
            sizes="84px"
            className={styles.coverImage}
          />
        </div>
        <div>
          <p className={styles.authorLabel}>Written by</p>
          <h2 className={styles.authorName}>{article.author.name}</h2>
          <p className={styles.authorRole}>{article.author.role}</p>
          <p className={styles.authorBio}>{article.author.bio}</p>
        </div>
      </div>
    </section>
  );
}

function RelatedArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className={styles.relatedSection}>
      <div className={styles.relatedInner}>
        <div className={styles.relatedHeader}>
          <div>
            <p className={styles.eyebrow}>Read next</p>
            <h2 className={styles.relatedTitle}>More from the island</h2>
          </div>
          <Link href="/about" className={styles.textLink}>
            Journal home
          </Link>
        </div>

        <div className={styles.relatedGrid}>
          {articles.map((article) => (
            <Link key={article.slug} href={`/journal/${article.slug}`} className={styles.relatedCard}>
              <div className={styles.relatedImageFrame}>
                <Image
                  src={article.heroImage}
                  alt={article.heroAlt}
                  fill
                  sizes="(min-width: 900px) 30vw, calc(100vw - 40px)"
                  className={styles.coverImage}
                />
              </div>
              <p className={styles.cardMeta}>
                {article.category} / {formatArticleDate(article.date)}
              </p>
              <h3 className={styles.cardTitle}>{article.title}</h3>
              <p className={styles.cardExcerpt}>{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterCta() {
  return (
    <section className={styles.ctaSection}>
      <p className={styles.ctaEyebrow}>Summerhouses Bali</p>
      <h2 className={styles.ctaTitle}>Find a home that lets Bali breathe through it.</h2>
      <p className={styles.ctaText}>
        Explore private villas, owner services, and stays shaped around quiet comfort.
      </p>
      <div className={styles.ctaActions}>
        <Link href="/villas" className={styles.primaryButton}>
          Explore villas
        </Link>
        <Link href="/contact" className={styles.secondaryButton}>
          Talk to us
        </Link>
      </div>
    </section>
  );
}

export default function ArticlePage({ article, relatedArticles }: ArticlePageProps) {
  return (
    <div className={styles.page}>
      <Navbar alwaysSolid />
      <main className={styles.main}>
        <ArticleHero article={article} />
        <ArticleContent content={article.content} />
        <AuthorSection article={article} />
        <RelatedArticles articles={relatedArticles} />
        <FooterCta />
      </main>
      <Footer />
    </div>
  );
}
