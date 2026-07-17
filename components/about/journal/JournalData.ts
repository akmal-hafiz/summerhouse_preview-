export interface JournalPage {
  front: string;
  back: string;
  title: string;
  category: string;
  excerpt: string;
}

// These are texture paths relative to /public/textures/
// We use Unsplash images loaded at runtime
export const journalPages: JournalPage[] = [
  {
    front: "book-cover-front",
    back: "journal-1-front",
    title: "Summerhouse Journal",
    category: "Vol. I · 2025",
    excerpt: "Stories from the island. Design, culture, and the art of living well.",
  },
  {
    front: "journal-1-back",
    back: "journal-2-front",
    title: "The New Uluwatu Architecture Wave",
    category: "Design & Architecture",
    excerpt: "Discover the resurgence of tropical modernism along the limestone cliffs of the Bukit Peninsula.",
  },
  {
    front: "journal-2-back",
    back: "journal-3-front",
    title: "The Heart of Ubud",
    category: "Culture",
    excerpt: "A curated guide to the vibrant pulse surrounding Villa Zen. Ancient pathways and artisanal coffee.",
  },
  {
    front: "journal-3-back",
    back: "journal-4-front",
    title: "Culinary Journeys",
    category: "Gastronomy",
    excerpt: "Private dining experiences that redefine luxury in the island of the gods.",
  },
  {
    front: "journal-4-back",
    back: "journal-5-front",
    title: "The Art of Slow Living",
    category: "Lifestyle",
    excerpt: "Embracing the Balinese philosophy of time — reconnect with the present moment.",
  },
  {
    front: "journal-5-back",
    back: "book-cover-back",
    title: "Secret Beaches",
    category: "Exploration",
    excerpt: "Hidden coves and untouched shores along the Bukit Peninsula, waiting to be discovered.",
  },
];

// Map of texture names to actual image URLs — using Picsum for CORS-friendliness with WebGL
export const textureUrls: Record<string, string> = {
  "book-cover-front": "https://picsum.photos/seed/villa-cover/1024/768",
  "book-cover-back":  "https://picsum.photos/seed/villa-back/1024/768",
  "journal-1-front":  "https://picsum.photos/seed/uluwatu-arch/1024/768",
  "journal-1-back":   "https://picsum.photos/seed/villa-room/1024/768",
  "journal-2-front":  "https://picsum.photos/seed/ubud-culture/1024/768",
  "journal-2-back":   "https://picsum.photos/seed/villa-pool2/1024/768",
  "journal-3-front":  "https://picsum.photos/seed/culinary-bali/1024/768",
  "journal-3-back":   "https://picsum.photos/seed/beach-bali1/1024/768",
  "journal-4-front":  "https://picsum.photos/seed/slow-living1/1024/768",
  "journal-4-back":   "https://picsum.photos/seed/bamboo-eco/1024/768",
  "journal-5-front":  "https://picsum.photos/seed/sunset-bali1/1024/768",
  "journal-5-back":   "https://picsum.photos/seed/secret-beach1/1024/768",
  "book-cover-roughness": "https://picsum.photos/seed/rough-texture/512/512",
};
