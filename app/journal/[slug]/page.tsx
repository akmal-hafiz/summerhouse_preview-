import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticlePage from "@/components/journal/ArticlePage";
import { getAllSlugs } from "@/data/articles";
import { getArticleForSlug, getRelatedArticlesForSlug } from "@/lib/journal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleForSlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
      description: "This Summerhouses Journal story is not available.",
    };
  }

  const title = article.title;

  return {
    title,
    description: article.excerpt,
    alternates: {
      canonical: `/journal/${article.slug}`,
    },
    openGraph: {
      title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      authors: [article.author.name],
      images: [
        {
          url: article.heroImage,
          alt: article.heroAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: article.excerpt,
      images: [article.heroImage],
    },
  };
}

export default async function JournalArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleForSlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticlesForSlug(article.slug, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.heroImage,
    datePublished: article.date,
    author: {
      "@type": "Organization",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Summerhouses Bali",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticlePage article={article} relatedArticles={relatedArticles} />
    </>
  );
}
