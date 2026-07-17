import type { Metadata } from "next";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import GalleryPage from "@/components/gallery/GalleryPage";
import { getCmsGalleryItems } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore Summerhouses Bali through an editorial gallery of private villas, quiet interiors, pools, and island light.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Gallery | Summerhouse Bali",
    description: "A cinematic look at Summerhouses Bali private villa stays.",
    url: "/gallery",
    images: [
      {
        url: "/homepage_villa/curated-6-exterior.webp",
        width: 1200,
        height: 800,
        alt: "Summerhouses Bali villa gallery",
      },
    ],
  },
};

export default async function GalleryRoute() {
  const items = await getCmsGalleryItems();

  return (
    <div className="gallery-route-shell">
      <Navbar alwaysSolid={true} />
      <main className="gallery-route-main">
        <GalleryPage items={items} />
      </main>
      <Footer />
    </div>
  );
}
