export type ArticleContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "subheading";
      text: string;
    }
  | {
      type: "quote";
      text: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    };

export interface ArticleAuthor {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  date: string;
  author: ArticleAuthor;
  readTime: string;
  heroImage: string;
  heroAlt: string;
  tags: string[];
  content: ArticleContentBlock[];
}

const editorialAuthor: ArticleAuthor = {
  name: "Summerhouses Team",
  role: "Editorial Studio",
  bio: "A small team of villa specialists, designers, and Bali hosts sharing notes on tropical living, thoughtful property investment, and the quieter side of island life.",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
};

export const articles: Article[] = [
  {
    slug: "designing-your-dream-villa-in-bali",
    title: "Designing Your Dream Villa in Bali",
    subtitle:
      "A practical guide to tropical modern living, from orientation and materials to the rituals that make a house feel alive.",
    excerpt:
      "Designing a Bali villa is not only about views and finishes. It is about climate, culture, light, and how people move through a day.",
    category: "Property Insight",
    date: "2026-05-06",
    author: editorialAuthor,
    readTime: "9 min read",
    heroImage: "/homepage_villa/villaarta.webp",
    heroAlt: "A refined Bali villa with a pool and warm architectural lighting.",
    tags: ["Property", "Design", "Investment"],
    content: [
      {
        type: "paragraph",
        text: "A dream villa in Bali begins long before the first material sample is chosen. It begins with orientation: where the morning light enters, how the breeze crosses the site, what the garden should reveal first, and which view deserves silence around it.",
      },
      {
        type: "paragraph",
        text: "The strongest homes on the island feel effortless because their decisions are deeply practical. Rooflines manage heat. Courtyards create privacy. Overhangs soften rain. Materials are selected not only for beauty, but for how gracefully they age in a tropical climate.",
      },
      {
        type: "heading",
        text: "Start With Climate, Not Decoration",
      },
      {
        type: "paragraph",
        text: "Tropical modern design works best when architecture collaborates with the weather. Cross-ventilation, shaded thresholds, deep eaves, and planted edges can make a villa feel calm even at midday. Mechanical comfort matters, but the first layer of comfort should come from the plan itself.",
      },
      {
        type: "image",
        src: "/homepage_villa/TKR03549-HDR.webp",
        alt: "A villa pool and terrace designed for tropical outdoor living.",
        caption:
          "Outdoor rooms should feel intentional, not leftover. In Bali, they are often the heart of the home.",
      },
      {
        type: "quote",
        text: "The most successful Bali villas do not copy the island. They make space for the island to enter.",
      },
      {
        type: "heading",
        text: "Design for the Way Guests Actually Live",
      },
      {
        type: "paragraph",
        text: "For owners, a beautiful villa is also an operational product. Bedrooms need privacy. Staff paths should be discreet. Storage must be generous. Lighting should make evening transitions feel natural. The goal is not only a photogenic first impression, but a stay that gets better each day.",
      },
      {
        type: "subheading",
        text: "The Details That Create Value",
      },
      {
        type: "paragraph",
        text: "Durable natural stone, layered planting, shaded dining, flexible lounge areas, and a strong arrival moment can all improve perceived value. The best investment is rarely the loudest feature. It is the combination of many quiet decisions that make guests feel cared for.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map((article) => article.slug);
}

export function getRelatedArticles(slug: string, limit = 3): Article[] {
  const article = getArticleBySlug(slug);

  if (!article) {
    return articles.slice(0, limit);
  }

  const sameCategory = articles.filter(
    (candidate) => candidate.slug !== slug && candidate.category === article.category,
  );
  const remaining = articles.filter(
    (candidate) =>
      candidate.slug !== slug &&
      !sameCategory.some((related) => related.slug === candidate.slug),
  );

  return [...sameCategory, ...remaining].slice(0, limit);
}
