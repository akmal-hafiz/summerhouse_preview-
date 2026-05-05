export interface ArticleContentBlock {
  type: 'paragraph' | 'heading' | 'quote' | 'image';
  text?: string;
  src?: string;
  caption?: string;
}

export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  heroImage: string;
  content: ArticleContentBlock[];
}

export const articles: Article[] = [
  {
    slug: "uluwatu-escape",
    title: "Where Silence Meets the Ocean",
    subtitle: "A meditation on space, stone, and the architecture of stillness at the edge of Bali's southern cliffs.",
    excerpt: "Perched above the Indian Ocean, the new wave of Uluwatu villas redefines what it means to truly arrive.",
    category: "Design & Architecture",
    date: "April 2025",
    author: "Summerhouse Editorial",
    readTime: "8 min read",
    heroImage: "/homepage_villa/curated-6-exterior.webp",
    content: [
      {
        type: "paragraph",
        text: "There is a particular quality of light along the Bukit Peninsula that cannot be replicated. It arrives not as illumination but as atmosphere — a golden haze that softens the limestone, warms the infinity edges, and makes every surface feel as though it were designed specifically for this hour of the day."
      },
      {
        type: "paragraph",
        text: "The new generation of Uluwatu villas understands this. They do not compete with the landscape; they submit to it. Open-air pavilions replace walls. Coral stone pathways dissolve into wild gardens. The architecture is not a statement — it is a surrender."
      },
      {
        type: "heading",
        text: "The Philosophy of Negative Space"
      },
      {
        type: "paragraph",
        text: "At the heart of modern Uluwatu design lies a radical idea: the most luxurious thing a space can offer is emptiness. Not the cold emptiness of minimalism, but the generous emptiness of a cleared mind — room to breathe, room to notice the shift of shadows across a terrazzo floor, room to hear the ocean three hundred feet below."
      },
      {
        type: "quote",
        text: "Luxury is not about what you add to a space. It is about what you have the courage to leave out."
      },
      {
        type: "paragraph",
        text: "Villa architects along the southern coast are increasingly working with local stone quarries, sourcing the same cream-white limestone that makes up the cliff faces themselves. The result is structures that appear to grow organically from the earth — not built upon it, but grown from it."
      },
      {
        type: "image",
        src: "/homepage_villa/curated-1-main.webp",
        caption: "Villa Arta — where raw limestone meets the precision of contemporary design."
      },
      {
        type: "heading",
        text: "Morning Rituals, Redefined"
      },
      {
        type: "paragraph",
        text: "Guests at these clifftop retreats describe a transformation that begins within the first twenty-four hours. The compulsion to check devices fades. Meals stretch longer. Conversations deepen. There is a word in Balinese — 'Tri Hita Karana' — that describes harmony between the human spirit, the natural world, and the divine. These villas, perhaps unintentionally, embody it."
      },
      {
        type: "paragraph",
        text: "Breakfast arrives not at a scheduled time but when you wake. A barefoot butler — trained in the subtle art of anticipation — leaves a tray of tropical fruits, house-made granola, and single-origin coffee from the highlands of Kintamani. No knock. No intrusion. Just nourishment, appearing as if the villa itself were caring for you."
      },
      {
        type: "quote",
        text: "I didn't come to Bali to escape my life. I came to remember what life actually feels like."
      },
      {
        type: "paragraph",
        text: "By evening, the infinity pool becomes a mirror for the sky's final performance. Oranges bleed into violets. The temple drums begin somewhere below the cliff. And for a moment — brief, perfect, unrepeatable — the boundary between guest and place disappears entirely."
      }
    ]
  },
  {
    slug: "bali-slow-living",
    title: "The Art of Slow Living",
    subtitle: "Embracing the Balinese philosophy of time — and learning to measure days not by hours, but by moments.",
    excerpt: "In a world obsessed with speed, Bali offers a radical alternative: the luxury of doing absolutely nothing.",
    category: "Lifestyle",
    date: "March 2025",
    author: "Summerhouse Editorial",
    readTime: "6 min read",
    heroImage: "/homepage_villa/curated-4-view.webp",
    content: [
      {
        type: "paragraph",
        text: "The Balinese do not have a word for 'hurry'. This is not an accident of language but a philosophy of existence — a collective agreement that the present moment is sufficient, that the rice will grow at its own pace, that the ceremony will begin when the offerings are ready and not a second before."
      },
      {
        type: "paragraph",
        text: "For guests arriving from cities that never sleep, this absence of urgency can be disorienting. The first day feels too long. By the third day, it feels perfect. By the fifth, you begin to wonder why you ever lived any other way."
      },
      {
        type: "heading",
        text: "The Rhythm of the Rice Fields"
      },
      {
        type: "paragraph",
        text: "In Ubud, time is measured not in hours but in harvests. The terraced paddies that cascade down the valley walls change color with the seasons — emerald green in the growing months, burnished gold before the cut. To walk among them at dawn, mist rising from the irrigation channels, is to understand that beauty requires patience."
      },
      {
        type: "image",
        src: "/homepage_villa/curated-2-detail.webp",
        caption: "Morning light through the pavilion — a daily masterclass in stillness."
      },
      {
        type: "quote",
        text: "The most productive thing I did in Bali was nothing. And it changed everything."
      },
      {
        type: "paragraph",
        text: "Villa Zen, nestled between two rivers in the heart of the cultural district, was designed around this principle. Every room opens to water — the sound of it, the sight of it, the feel of humidity on skin. There is no television. No alarm clock. Just the forest, the rain, and the distant sound of gamelan practice from the village temple."
      },
      {
        type: "heading",
        text: "Ceremonies of the Everyday"
      },
      {
        type: "paragraph",
        text: "Each morning, the villa's staff prepare canang sari — small offerings woven from palm leaves and filled with flowers, rice, and incense. They are placed at every threshold, every corner, every intersection of path and garden. It is not ritual for the sake of tradition; it is attention for the sake of attention. A reminder that even the smallest gesture can be sacred."
      },
      {
        type: "paragraph",
        text: "Guests are invited to join. To sit cross-legged on the cool stone floor, to fold the leaves, to place the petals. It is meditative, quietly absorbing, and — for many — the single most memorable moment of their stay. Not the sunset. Not the pool. The folding of a palm leaf."
      }
    ]
  },
  {
    slug: "villa-experience",
    title: "Culinary Journeys: Private Dining in Paradise",
    subtitle: "When the kitchen becomes a stage and every meal tells the story of an island.",
    excerpt: "From dawn market runs to candlelit dinners by the pool — inside Bali's most intimate culinary experiences.",
    category: "Gastronomy",
    date: "February 2025",
    author: "Summerhouse Editorial",
    readTime: "7 min read",
    heroImage: "/homepage_villa/curated-5-lounge.webp",
    content: [
      {
        type: "paragraph",
        text: "At five in the morning, the Badung market in Denpasar is already alive. Mountains of chili peppers glow crimson under bare bulbs. Women in kebaya weave between stalls, selecting galangal root, lemongrass, and turmeric with the precision of jewelers examining stones. This is where the day's story begins."
      },
      {
        type: "paragraph",
        text: "For guests who choose our private culinary experience, the morning market run is not optional — it is essential. Chef Wayan, who has cooked in kitchens from Copenhagen to Kyoto before returning to his native island, insists that understanding a dish means understanding its origins."
      },
      {
        type: "heading",
        text: "From Market to Table"
      },
      {
        type: "paragraph",
        text: "By nine, the villa kitchen transforms. What was a serene, minimalist space becomes a theatre of aromatics. Coconut oil sizzles. Mortar and pestle grind fresh sambal. The scent of pandan leaves, steamed over low heat, drifts through the open pavilion and into the garden."
      },
      {
        type: "quote",
        text: "Every ingredient in Bali has a story. The best chefs don't just cook the food — they tell it."
      },
      {
        type: "image",
        src: "/homepage_villa/curated-3-corner.webp",
        caption: "The villa dining pavilion, where the jungle canopy becomes the ceiling."
      },
      {
        type: "paragraph",
        text: "The menu is never written in advance. It emerges from the market — from what is freshest, what is in season, what catches the chef's eye. A perfect mango might become a dessert. An unexpected catch of barramundi reshapes the entire evening. This is cooking as improvisation, as jazz, as living art."
      },
      {
        type: "heading",
        text: "The Evening Performance"
      },
      {
        type: "paragraph",
        text: "By sunset, the dining table — set beneath a canopy of frangipani — becomes something more than furniture. Handmade ceramics from a Tabanan potter. Linen napkins dyed with natural indigo. Candlelight reflecting off the still surface of the infinity pool."
      },
      {
        type: "paragraph",
        text: "Seven courses arrive over three unhurried hours. Each plate is a landscape in miniature — edible flowers, microgreens from the villa's own garden, sauces painted with the back of a spoon. The conversation flows. The wine (a surprising Balinese rosé from the eastern highlands) is poured generously. And somewhere between the fourth and fifth course, time quietly stops."
      },
      {
        type: "quote",
        text: "It wasn't dinner. It was a love letter to Bali, written in flavor."
      }
    ]
  }
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map(a => a.slug);
}
