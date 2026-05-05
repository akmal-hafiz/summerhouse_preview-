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
    slug: "uluwatu-escape",
    title: "Where Silence Meets the Ocean",
    subtitle:
      "A meditation on space, stone, and the architecture of stillness at the edge of Bali's southern cliffs.",
    excerpt:
      "Perched above the Indian Ocean, the new wave of Uluwatu villas redefines what it means to truly arrive.",
    category: "Design & Architecture",
    date: "2026-05-01",
    author: editorialAuthor,
    readTime: "8 min read",
    heroImage: "/homepage_villa/curated-6-exterior.webp",
    heroAlt: "A tropical modern villa exterior framed by palms in Bali.",
    tags: ["Architecture", "Uluwatu", "Slow Living"],
    content: [
      {
        type: "paragraph",
        text: "There is a particular quality of light along the Bukit Peninsula that cannot be replicated. It arrives not as illumination but as atmosphere, a golden haze that softens limestone, warms infinity edges, and makes every surface feel designed for this hour of the day.",
      },
      {
        type: "paragraph",
        text: "The new generation of Uluwatu villas understands this. They do not compete with the landscape; they listen to it. Open-air pavilions replace walls. Coral stone pathways dissolve into wild gardens. The architecture becomes less of a statement and more of an invitation.",
      },
      {
        type: "heading",
        text: "The Philosophy of Negative Space",
      },
      {
        type: "paragraph",
        text: "At the heart of modern Uluwatu design lies a radical idea: the most luxurious thing a space can offer is emptiness. Not the cold emptiness of minimalism, but the generous emptiness of a cleared mind, with room to breathe, notice shadows across terrazzo, and hear the ocean below.",
      },
      {
        type: "quote",
        text: "Luxury is not about what you add to a space. It is about what you have the courage to leave out.",
      },
      {
        type: "paragraph",
        text: "Villa architects along the southern coast are increasingly working with local stone quarries, sourcing the same cream-white limestone that makes up the cliff faces themselves. The result is a visual continuity that feels grown from the landscape rather than placed upon it.",
      },
      {
        type: "image",
        src: "/homepage_villa/curated-1-main.webp",
        alt: "A sunlit villa courtyard with natural stone and pool reflections.",
        caption:
          "Raw limestone, shadow, and still water form the quiet grammar of tropical modern design.",
      },
      {
        type: "heading",
        text: "Morning Rituals, Redefined",
      },
      {
        type: "paragraph",
        text: "Guests at clifftop retreats describe a transformation that begins within the first twenty-four hours. The compulsion to check devices fades. Meals stretch longer. Conversations deepen. The villa becomes a gentle structure for paying attention again.",
      },
      {
        type: "paragraph",
        text: "Breakfast arrives when you wake. Tropical fruits, house-made granola, and single-origin coffee from Kintamani appear on a shaded terrace. No rush. No intrusion. Just nourishment, and the sense that the day has widened around you.",
      },
    ],
  },
  {
    slug: "bali-slow-living",
    title: "The Art of Slow Living",
    subtitle:
      "Embracing the Balinese philosophy of time, and learning to measure days not by hours, but by moments.",
    excerpt:
      "In a world obsessed with speed, Bali offers a radical alternative: the luxury of doing less, with more attention.",
    category: "Lifestyle",
    date: "2026-04-18",
    author: editorialAuthor,
    readTime: "6 min read",
    heroImage: "/homepage_villa/curated-4-view.webp",
    heroAlt: "A serene villa view with a pool opening toward lush Bali greenery.",
    tags: ["Lifestyle", "Wellness", "Bali"],
    content: [
      {
        type: "paragraph",
        text: "For guests arriving from cities that never sleep, Bali's softer rhythm can be disorienting. The first day feels too long. By the third day, it feels spacious. By the fifth, you begin to wonder why every calendar was ever allowed to become so crowded.",
      },
      {
        type: "paragraph",
        text: "Slow living is not passivity. It is a discipline of attention. It asks you to choose fewer things, then experience them more completely: morning coffee, a walk through the village, the exact temperature of the pool after rain.",
      },
      {
        type: "heading",
        text: "The Rhythm of the Rice Fields",
      },
      {
        type: "paragraph",
        text: "In Ubud, time is often measured in harvests. Terraced paddies change from emerald to burnished gold with a patience that no itinerary can hurry. To walk among them at dawn is to understand that beauty is rarely instant.",
      },
      {
        type: "image",
        src: "/homepage_villa/curated-2-detail.webp",
        alt: "Morning light moving through a tropical villa pavilion.",
        caption: "Morning light through the pavilion, a daily masterclass in stillness.",
      },
      {
        type: "quote",
        text: "The most restorative thing I did in Bali was nothing. And it changed everything.",
      },
      {
        type: "subheading",
        text: "Ceremonies of the Everyday",
      },
      {
        type: "paragraph",
        text: "Each morning, small offerings appear at thresholds, corners, and garden paths. They are not decoration. They are attention made visible, a reminder that even the smallest gesture can carry grace.",
      },
      {
        type: "paragraph",
        text: "The best villas make room for this kind of quiet. They allow the day to unfold without demanding constant movement, and in doing so, they become places where people remember how to rest.",
      },
    ],
  },
  {
    slug: "villa-experience",
    title: "Culinary Journeys: Private Dining in Paradise",
    subtitle:
      "When the kitchen becomes a stage and every meal tells the story of an island.",
    excerpt:
      "From dawn market runs to candlelit dinners by the pool, inside Bali's most intimate culinary experiences.",
    category: "Gastronomy",
    date: "2026-03-22",
    author: editorialAuthor,
    readTime: "7 min read",
    heroImage: "/homepage_villa/curated-5-lounge.webp",
    heroAlt: "An elegant open-plan villa lounge prepared for private dining.",
    tags: ["Dining", "Hosting", "Experience"],
    content: [
      {
        type: "paragraph",
        text: "At five in the morning, the market is already awake. Mountains of chili glow crimson under bare bulbs. Bundles of lemongrass, turmeric, and galangal pass from hand to hand with the speed of long practice. This is where the day's story begins.",
      },
      {
        type: "paragraph",
        text: "For guests who choose a private dining experience, the morning market run is not a novelty. It is the foundation. Understanding a dish means understanding the weather, the season, the grower, and the route an ingredient took to the table.",
      },
      {
        type: "heading",
        text: "From Market to Table",
      },
      {
        type: "paragraph",
        text: "By noon, the villa kitchen transforms. Coconut oil warms in a pan. A mortar grinds fresh sambal. Pandan leaves steam gently, sending a sweet green fragrance into the garden. The architecture of the villa does its quiet work, turning cooking into theatre without ever becoming loud.",
      },
      {
        type: "quote",
        text: "Every ingredient in Bali has a story. The best chefs do not just cook the food; they tell it.",
      },
      {
        type: "image",
        src: "/homepage_villa/curated-3-corner.webp",
        alt: "A villa corner with tropical greenery and warm natural textures.",
        caption: "The dining pavilion, where garden, shade, and conversation meet.",
      },
      {
        type: "heading",
        text: "The Evening Performance",
      },
      {
        type: "paragraph",
        text: "By sunset, the dining table becomes more than furniture. Handmade ceramics, linen napkins, and candlelight gather around the still surface of the pool. The meal arrives in an unhurried sequence, each course shaped by what the island offered that morning.",
      },
      {
        type: "paragraph",
        text: "Some guests remember a particular sauce. Others remember the silence after dessert, when everyone stayed seated a little longer than usual. The best meal is rarely only about flavor. It is about belonging, briefly and completely, to the place where it was made.",
      },
    ],
  },
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
