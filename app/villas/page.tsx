import React, { Suspense } from 'react';
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import RefinedVillaGrid from "@/components/villas/RefinedVillaGrid";
import VillaGridLoading from "@/components/villas/VillaGridLoading";
import { getProperties, getPropertyRooms } from "@/lib/lodgify";
import styles from "./Villas.module.css";

export const metadata = {
  title: "Villa Collection | Summerhouse Bali",
  description: "Explore our curated collection of luxury villas in Bali, powered by Lodgify.",
};

async function VillaList() {
  const properties = await getProperties();
  
  const mappedVillas = Array.isArray(properties) ? await Promise.all(properties.map(async (p: any) => {
    const rooms = await getPropertyRooms(p.id);
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      imageUrl: p.image_url,
      bedrooms: rooms?.length || p.rooms_count || 2,
      bathrooms: p.bathrooms_count || 2,
      location: p.location?.name || p.city || "Bali",
      isFeatured: p.is_featured || false
    };
  })) : [];

  if (mappedVillas.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Preparing the collection...</p>
      </div>
    );
  }

  return <RefinedVillaGrid villas={mappedVillas} />;
}

export default function VillasPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      {/* ─── 1. HERO SECTION ─── */}
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroMain}>
              <span className={styles.label}>The Selection</span>
              <h1 className={styles.title}>
                The <br /> <span>Collection</span>
              </h1>
            </div>
            <div className={styles.heroBrief}>
              <p className={styles.description}>
                A curated selection of private sanctuaries, each designed with a deep respect for Balinese heritage and modern minimalist luxury.
              </p>
              <div className={styles.accentLine} />
            </div>
          </div>
          
          <nav className={styles.filterBar}>
            <div className={styles.filterLinks}>
              <button className={`${styles.filterBtn} ${styles.active}`}>All Villas</button>
              <button className={styles.filterBtn}>Available Now</button>
            </div>
          </nav>
        </div>
      </header>

      {/* ─── 2. THE VILLAS GRID SECTION ─── */}
      <section className={styles.gridSection}>
        <div className={styles.container}>
          <Suspense fallback={<VillaGridLoading />}>
            <VillaList />
          </Suspense>
        </div>
      </section>

      {/* ─── 3. BOTTOM DECORATION ─── */}
      <section className={styles.bottomDecor}>
         <div className={styles.decorLine} />
         <h3 className={styles.decorText}>End of Collection</h3>
      </section>

      <Footer />
    </div>
  );
}
