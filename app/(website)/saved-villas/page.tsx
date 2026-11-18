import React from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import SavedVillasClient from "@/components/villas/SavedVillasClient";
import { searchAvailableVillas } from "@/lib/lodgify";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved Villas",
  description: "Review your saved Summerhouses Bali villa selections before booking.",
};

export default async function SavedVillasPage() {
  const villas = await searchAvailableVillas();

  return (
    <div className="villa-collection-page villa-saved-page">
      <Navbar alwaysSolid />

      <main>
        {/* Same opener as /villas (heading, one-line lede, companion link on the right), so the two read as one place. */}
        <header className="villa-collection-hero">
          <div className="villa-collection-shell">
            <div className="villa-collection-hero-copy">
              <h1>Your saved villas.</h1>
              <p>Keep promising homes in one calm place, then book when your dates are ready.</p>
            </div>
            <Link className="villa-collection-saved-link" href="/villas">Villa collection</Link>
          </div>
        </header>

        <section className="villa-collection-list villa-saved-list">
          <div className="villa-collection-shell">
            <SavedVillasClient villas={villas} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
