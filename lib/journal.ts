import { getCmsArticleBySlug, getCmsArticles } from "@/lib/cms";
import {
  articles as localArticles,
  getArticleBySlug as getLocalArticleBySlug,
  type Article,
  type ArticleContentBlock,
} from "@/data/articles";

const editorialAuthor = localArticles[0]?.author ?? {
  name: "Summerhouses Team",
  role: "Editorial Studio",
  bio: "",
  avatar: "",
};

function normalizeCmsContent(raw: Array<Record<string, unknown>>): ArticleContentBlock[] {
  return raw
    .map((block): ArticleContentBlock | null => {
      const type = (block.type as string) || "paragraph";

      if (type === "image") {
        if (typeof block.src !== "string" || !block.src) return null;
        return {
          type: "image",
          src: block.src,
          alt: (block.alt as string) || "",
          caption: (block.caption as string) || undefined,
        };
      }

      if (type === "heading" || type === "subheading" || type === "quote" || type === "paragraph") {
        const text = typeof block.text === "string" ? block.text : "";
        if (!text) return null;
        return { type, text };
      }

      return null;
    })
    .filter((block): block is ArticleContentBlock => block !== null);
}

function cmsArticleToArticle(cms: Awaited<ReturnType<typeof getCmsArticleBySlug>>): Article | null {
  if (!cms) return null;

  return {
    slug: cms.slug,
    title: cms.title,
    subtitle: cms.subtitle || "",
    excerpt: cms.excerpt || "",
    category: cms.category || "Journal",
    date: cms.date || "",
    readTime: cms.readTime || "",
    heroImage: cms.heroImage || "/homepage_villa/curated-6-exterior.webp",
    heroAlt: cms.heroAlt || cms.title,
    tags: Array.isArray(cms.tags) ? cms.tags : [],
    content: Array.isArray(cms.content) ? normalizeCmsContent(cms.content) : [],
    author: {
      name: cms.author?.name || editorialAuthor.name,
      role: cms.author?.role || editorialAuthor.role,
      bio: cms.author?.bio || editorialAuthor.bio,
      avatar: cms.author?.avatar || editorialAuthor.avatar,
    },
  };
}

export type ArticleListItem = Pick<
  Article,
  "slug" | "title" | "subtitle" | "excerpt" | "category" | "date" | "readTime" | "heroImage" | "heroAlt" | "tags"
> & {
  authorName: string;
};

export async function getArticleForSlug(slug: string): Promise<Article | null> {
  const cms = await getCmsArticleBySlug(slug);
  const fromCms = cmsArticleToArticle(cms);
  if (fromCms && fromCms.content.length) return fromCms;

  return getLocalArticleBySlug(slug) ?? null;
}

export async function listArticles(): Promise<ArticleListItem[]> {
  const cms = await getCmsArticles();
  if (cms && cms.length) {
    return cms.map((a) => ({
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle || "",
      excerpt: a.excerpt || "",
      category: a.category || "Journal",
      date: a.date || "",
      readTime: a.readTime || "",
      heroImage: a.heroImage || "/homepage_villa/curated-6-exterior.webp",
      heroAlt: a.heroAlt || a.title,
      tags: Array.isArray(a.tags) ? a.tags : [],
      authorName: a.author?.name || editorialAuthor.name,
    }));
  }

  return localArticles.map((a) => ({
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle,
    excerpt: a.excerpt,
    category: a.category,
    date: a.date,
    readTime: a.readTime,
    heroImage: a.heroImage,
    heroAlt: a.heroAlt,
    tags: a.tags,
    authorName: a.author.name,
  }));
}

export async function getRelatedArticlesForSlug(slug: string, limit = 3): Promise<Article[]> {
  const list = await listArticles();
  const same = list.filter((a) => a.slug !== slug).slice(0, limit);

  const detailed = await Promise.all(same.map((a) => getArticleForSlug(a.slug)));
  return detailed.filter((a): a is Article => a !== null);
}
