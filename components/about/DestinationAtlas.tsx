"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { formatDestinationStartingRates } from "@/lib/lodgify/destinations";
import type { AboutDestination } from "./About";
import styles from "./DestinationAtlas.module.css";
import { isShowcasePreview } from "@/lib/showcase-preview";

const LibreDestinationMap = dynamic(() => import("./LibreDestinationMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading Bali map...</div>,
});

type DestinationAtlasProps = {
  destinations: AboutDestination[];
  eyebrow: string;
  title: string;
  description: string;
};

function villaCount(destination: AboutDestination) {
  return `${destination.villas} ${destination.villas === 1 ? "villa" : "villas"}`;
}

export default function DestinationAtlas({ destinations, eyebrow, title, description }: DestinationAtlasProps) {
  const fallbackRate = isShowcasePreview ? "Rates available on request" : "View live rates";
  const [requestedName, setRequestedName] = useState<string | null>(null);
  const selected = destinations.find((destination) => destination.name === requestedName) ?? destinations[0];

  return (
    <section className={styles.section} aria-labelledby="destination-atlas-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h2 id="destination-atlas-title">{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        {destinations.length > 0 ? (
          <>
            <div className={styles.regionList} aria-label="Explore Summerhouses regions">
              {destinations.map((destination) => (
                <button
                  key={destination.name}
                  type="button"
                  className={styles.regionRow}
                  data-selected={selected.name === destination.name}
                  aria-pressed={selected.name === destination.name}
                  onClick={() => setRequestedName(destination.name)}
                >
                  <span className={styles.regionIdentity}>
                    <strong>{destination.name}</strong>
                    <small>{villaCount(destination)}</small>
                  </span>
                  <span className={styles.regionRate}>{formatDestinationStartingRates(destination) || fallbackRate}</span>
                </button>
              ))}
            </div>

            <div className={styles.regionTabs} aria-label="Choose a Bali region">
              {destinations.map((destination) => (
                <button
                  key={destination.name}
                  type="button"
                  className={styles.regionTab}
                  data-selected={selected.name === destination.name}
                  aria-pressed={selected.name === destination.name}
                  onClick={() => setRequestedName(destination.name)}
                >
                  {destination.name}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <div className={styles.mapFrame}>
          <LibreDestinationMap
            destinations={destinations}
            selectedName={selected?.name ?? null}
            onSelect={setRequestedName}
          />
        </div>

        {selected ? (
          <div className={styles.mobileDetail} aria-live="polite">
            <div>
              <strong>{selected.name}</strong>
              <span>{villaCount(selected)}</span>
            </div>
            <p>{formatDestinationStartingRates(selected) || fallbackRate}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
