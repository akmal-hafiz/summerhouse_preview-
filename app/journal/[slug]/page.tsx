import type { Metadata } from "next";
import { getArticleBySlug, getAllSlugs } from "@/data/articles";
import ArticlePage from "@/components/journal/ArticlePage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found — Summerhouse Journal",
      description: "This story hasn't been written yet.",
    };
  }

  return {
    title: `${article.title} — Summerhouse Journal`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.heroImage }],
    },
  };
}

export default async function JournalArticlePage({ params }: PageProps) {
  const { slug } = await params;
  return <ArticlePage slug={slug} />;
}
