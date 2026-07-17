import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import SavedVillasClient from "@/components/villas/SavedVillasClient";
import { searchAvailableVillas } from "@/lib/lodgify";

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
        <header className="villa-collection-hero villa-saved-hero">
          <div className="villa-collection-shell">
            <div className="villa-collection-hero-copy">
              <p className="villa-collection-eyebrow">Saved villas</p>
              <h1>Your private shortlist for a quieter Bali stay.</h1>
              <p>
                Keep promising homes in one calm place, then return to availability
                and booking when your dates are ready.
              </p>
            </div>
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
