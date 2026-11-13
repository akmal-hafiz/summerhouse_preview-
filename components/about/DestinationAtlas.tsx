"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { LuPlane } from "react-icons/lu";
import type { AboutDestination } from "./About";
import { AIRPORT, BALI_MAP, COAST_MAP, kmBetween, labelSides, projectToMap, type GeoPoint } from "./destination-map";
import styles from "./DestinationAtlas.module.css";

type DestinationAtlasProps = {
  destinations: AboutDestination[];
  title: string;
  description: string;
};

const villasLabel = (count: number) => `${count} ${count === 1 ? "villa" : "villas"}`;
const geoPoint = (destination: AboutDestination): GeoPoint | null =>
  typeof destination.longitude === "number" && typeof destination.latitude === "number"
    ? { longitude: destination.longitude, latitude: destination.latitude }
    : null;
const airportKm = (destination: AboutDestination) => {
  const point = geoPoint(destination);
  return point ? kmBetween(point, AIRPORT) : null;
};
const areaMeta = (destination: AboutDestination) =>
  [destination.character, villasLabel(destination.villas)].filter(Boolean).join(" · ");

/* An orientation map, not a villa selector: the homepage "Bali, by Neighbourhood" section owns the route to villas.
   It answers where each area sits, measured from Ngurah Rai Airport, the one place every guest knows.
   Carved frame (carved-frames skill): the inland locator pocket sits top left over the sea side, the selection
   caption sits in a notch at the bottom left, and a straight line draws from the selected area to the airport. */
export default function DestinationAtlas({ destinations, title, description }: DestinationAtlasProps) {
  const [requestedName, setRequestedName] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHover = () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); };
  useEffect(() => cancelHover, []);

  // Nearest to the airport first, so the km column reads as a scale; areas without coordinates go last.
  const ordered = useMemo(() => [...destinations].sort((a, b) =>
    (airportKm(a) ?? Infinity) - (airportKm(b) ?? Infinity) || a.name.localeCompare(b.name)), [destinations]);
  // Opens on the area with the most villas, the clearest first example.
  const busiest = useMemo(() => ordered.reduce<AboutDestination | undefined>((best, item) => (!best || item.villas > best.villas ? item : best), undefined), [ordered]);
  const selected = destinations.find((destination) => destination.name === requestedName) ?? busiest;

  const coastal = useMemo(() => {
    const placed = ordered.flatMap((destination) => {
      const geo = geoPoint(destination);
      const point = geo && projectToMap(COAST_MAP.bounds, geo.longitude, geo.latitude);
      return point ? [{ destination, point }] : [];
    });
    const sides = labelSides(placed.map((item) => item.point));
    return placed.map((item, index) => ({ ...item, side: sides[index] }));
  }, [ordered]);
  const inland = useMemo(() => ordered.flatMap((destination) => {
    const geo = geoPoint(destination);
    if (!geo || coastal.some((item) => item.destination === destination)) return [];
    const point = projectToMap(BALI_MAP.bounds, geo.longitude, geo.latitude);
    return point ? [{ destination, point }] : [];
  }), [ordered, coastal]);
  const airport = useMemo(() => projectToMap(COAST_MAP.bounds, AIRPORT.longitude, AIRPORT.latitude), []);
  const islandAirport = useMemo(() => projectToMap(BALI_MAP.bounds, AIRPORT.longitude, AIRPORT.latitude), []);
  const extent = useMemo(() => {
    const { west, north, east, south } = COAST_MAP.bounds;
    const a = projectToMap(BALI_MAP.bounds, west, north), b = projectToMap(BALI_MAP.bounds, east, south);
    return a && b ? { left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y } : null;
  }, []);

  if (!selected) {
    return (
      <section id="destination-footprint" className={styles.section} aria-labelledby="destination-atlas-title">
        <div className={styles.inner}>
          <div className={styles.intro}>
            <h2 id="destination-atlas-title" data-about-reveal>{title}</h2>
            <p className={styles.description}>{description}</p>
          </div>
          <p className={styles.empty}>Villa locations are being updated.</p>
        </div>
      </section>
    );
  }

  const selectedKm = airportKm(selected);
  const selectedCoastal = coastal.find((item) => item.destination.name === selected.name);
  const selectedInland = inland.find((item) => item.destination.name === selected.name);
  const inlandLead = inland[0]?.destination;
  const inlandKm = inlandLead ? airportKm(inlandLead) : null;

  return (
    <section id="destination-footprint" className={styles.section} aria-labelledby="destination-atlas-title">
      <div className={styles.inner}>
        <div className={styles.intro} data-motion-rule-host><span data-motion-rule aria-hidden="true" />
          <h2 id="destination-atlas-title" data-about-reveal>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.stage}>
          <div className={styles.frame} data-has-pocket={inland.length > 0}>
            <div className={styles.viewport}>
              <div className={styles.canvas} style={{ aspectRatio: `${COAST_MAP.width} / ${COAST_MAP.height}`, "--map-ratio": COAST_MAP.width / COAST_MAP.height } as CSSProperties}>
                <img className={styles.mapImage} src={COAST_MAP.src} alt="" width={COAST_MAP.width} height={COAST_MAP.height} loading="lazy" decoding="async" />
                {selectedCoastal && airport ? (
                  <RouteLine key={selected.name} width={COAST_MAP.width} height={COAST_MAP.height} from={selectedCoastal.point} to={airport} />
                ) : null}
                {airport ? (
                  <span className={styles.airport} style={{ left: `${airport.x * 100}%`, top: `${airport.y * 100}%` }} aria-hidden="true">
                    <LuPlane className={styles.airportIcon} />
                    <span className={styles.airportLabel}><span className={styles.airportName}>Ngurah Rai </span>Airport</span>
                  </span>
                ) : null}
                {/* Dots mirror the list; the list is the keyboard path, so the dots stay out of the tab order. */}
                {coastal.map(({ destination, point, side }) => (
                  <button
                    key={destination.name}
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    className={styles.marker}
                    data-side={side}
                    data-selected={destination.name === selected.name}
                    style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
                    onClick={() => setRequestedName(destination.name)}
                  >
                    <span className={styles.markerLabel}>{destination.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {inlandLead ? (
              <button type="button" tabIndex={-1} aria-hidden="true" className={styles.pocket} data-selected={Boolean(selectedInland)} onClick={() => setRequestedName(inlandLead.name)}>
                <span className={styles.locator} style={{ aspectRatio: `${BALI_MAP.width} / ${BALI_MAP.height}` }}>
                  <img src={BALI_MAP.src} alt="" width={BALI_MAP.width} height={BALI_MAP.height} loading="lazy" decoding="async" />
                  {extent ? <span className={styles.extent} style={{ left: `${extent.left * 100}%`, top: `${extent.top * 100}%`, width: `${extent.width * 100}%`, height: `${extent.height * 100}%` }} /> : null}
                  {selectedInland && islandAirport ? (
                    <RouteLine key={selected.name} width={BALI_MAP.width} height={BALI_MAP.height} from={selectedInland.point} to={islandAirport} compact />
                  ) : null}
                  {islandAirport ? <span className={styles.locatorAirport} style={{ left: `${islandAirport.x * 100}%`, top: `${islandAirport.y * 100}%` }} /> : null}
                  {inland.map(({ destination, point }) => (
                    <span key={destination.name} className={styles.locatorDot} data-selected={destination.name === selected.name} style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} />
                  ))}
                </span>
                <span className={styles.pocketText}>
                  <strong>{inland.length === 1 ? `${inlandLead.name}, inland` : "Inland areas"}</strong>
                  <span>{inland.length === 1 ? [villasLabel(inlandLead.villas), inlandKm === null ? null : `${inlandKm} km to the airport`].filter(Boolean).join(" · ") : inland.map((item) => item.destination.name).join(", ")}</span>
                </span>
              </button>
            ) : null}

            <div className={styles.notch} aria-hidden="true">
              <p className={styles.notchTitle}>{selected.name}</p>
              {selectedKm !== null ? (
                <p className={styles.notchRoute}>
                  <svg className={styles.legend} viewBox="0 0 28 4" aria-hidden="true"><line x1="1" y1="2" x2="27" y2="2" /></svg>
                  <span>{selectedKm} km to the airport in a straight line</span>
                </p>
              ) : null}
            </div>
            <span className={styles.attribution}>© OpenStreetMap contributors</span>
          </div>
        </div>

        <div className={styles.list}>
          <p className={styles.listHead} aria-hidden="true"><span>Area</span><span>Straight line to the airport</span></p>
          {/* A legend you browse: resting on a row (hover intent, 140ms) or focusing it shows it on the map; a tap does the same on touch. */}
          <div role="group" aria-label="Villa areas and their distance to Ngurah Rai Airport">
            {ordered.map((destination) => {
              const km = airportKm(destination);
              const show = () => { cancelHover(); setRequestedName(destination.name); };
              const hover = () => { cancelHover(); hoverTimer.current = setTimeout(show, 140); };
              return (
                <button key={destination.name} type="button" className={styles.row} aria-pressed={destination.name === selected.name} onClick={show} onFocus={show} onMouseEnter={hover} onMouseLeave={cancelHover}>
                  <span className={styles.key} aria-hidden="true" />
                  <span className={styles.rowText}>
                    <span className={styles.rowName}>{destination.name}</span>
                    <span className={styles.rowMeta}>{areaMeta(destination)}</span>
                  </span>
                  <span className={styles.rowKm}>{km === null ? "" : <>{km} km<span className={styles.srOnly}> in a straight line to the airport</span></>}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** A dashed straight line from an area to the airport that draws itself in when the selection changes. */
function RouteLine({ width, height, from, to, compact = false }: {
  width: number;
  height: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  compact?: boolean;
}) {
  const id = `route-${compact ? "island" : "coast"}`;
  const points = { x1: from.x * width, y1: from.y * height, x2: to.x * width, y2: to.y * height };
  return (
    <svg className={styles.route} data-compact={compact || undefined} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
        <line className={styles.routeReveal} {...points} pathLength={1} />
      </mask>
      <line className={styles.routeLine} {...points} mask={`url(#${id})`} />
    </svg>
  );
}
