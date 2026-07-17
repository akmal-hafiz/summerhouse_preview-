import type { Metadata } from "next";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import JournalIndex from "@/components/journal/JournalIndex";
import { listArticles } from "@/lib/journal";

export const metadata: Metadata = {
  title: "The Journal",
  description: "Editorial stories on Bali villa design, slow living, and the people behind Summerhouses.",
  alternates: { canonical: "/journal" },
};

export default async function JournalRoute() {
  const articles = await listArticles();
  const published = articles
    .filter((a) => a.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <Navbar alwaysSolid={true} />
      <main>
        <JournalIndex articles={published.length ? published : articles} />
      </main>
      <Footer />
    </>
  );
}
