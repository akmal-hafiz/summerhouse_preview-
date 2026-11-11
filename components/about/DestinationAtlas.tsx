"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { formatDestinationStartingRates } from "@/lib/lodgify/destinations";
import { isShowcasePreview } from "@/lib/showcase-preview";
import type { AboutDestination } from "./About";
import styles from "./DestinationAtlas.module.css";

const LibreDestinationMap = dynamic(() => import("./LibreDestinationMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading Bali map...</div>,
});

type DestinationAtlasProps = {
  destinations: AboutDestination[];
  title: string;
  description: string;
};

export default function DestinationAtlas({ destinations, title, description }: DestinationAtlasProps) {
  const [requestedName, setRequestedName] = useState<string | null>(null);
  const selected = destinations.find((destination) => destination.name === requestedName) ?? destinations[0];
  const fallbackRate = isShowcasePreview ? "Rates available on request" : "View live rates";

  return (
    <section id="destination-footprint" className={styles.section} aria-labelledby="destination-atlas-title">
      <div className={styles.inner}>
        <div className={styles.intro} data-motion-rule-host><span data-motion-rule aria-hidden="true" />
          <h2 id="destination-atlas-title" data-about-reveal>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        {selected ? (
          <>
            <div className={styles.regionList} aria-label="Explore Summerhouses regions">
              {destinations.map((destination) => (
                <button
                  key={destination.name}
                  type="button"
                  className={styles.regionRow}
                  aria-pressed={selected.name === destination.name}
                  aria-controls="destination-map destination-selection"
                  onClick={() => setRequestedName(destination.name)}
                >
                  <span className={styles.regionName}>{destination.name}</span>
                  <span className={styles.regionRate}>{formatDestinationStartingRates(destination) || fallbackRate}</span>
                  <span className={styles.regionCount}>
                    <span>{destination.villas}</span>
                    <small>{destination.villas === 1 ? "villa" : "villas"}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.mapGroup}>
              <div id="destination-map" className={styles.mapFrame}>
                <LibreDestinationMap destinations={destinations} selectedName={selected.name} onSelect={setRequestedName} />
              </div>
              <div id="destination-selection" className={styles.mapCaption}>
                <span aria-live="polite">{selected.name}</span>
                <Link href={`/villas?location=${encodeURIComponent(selected.name)}`} aria-label={`View villas in ${selected.name}`}>
                  View villas <FiArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <p>Villa locations are being updated.</p>
            <Link href="/villas">Explore our villas <FiArrowUpRight aria-hidden="true" /></Link>
          </div>
        )}
      </div>
    </section>
  );
}
