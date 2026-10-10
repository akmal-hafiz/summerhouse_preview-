"use client";

import { useEffect, useMemo, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import type { AboutDestination } from "./About";
import styles from "./DestinationAtlas.module.css";

type LibreDestinationMapProps = {
  destinations: AboutDestination[];
  selectedName: string | null;
  onSelect: (name: string) => void;
};

const BALI_CENTER: [number, number] = [115.1889, -8.4095];

function hasCoordinates(destination: AboutDestination) {
  return typeof destination.latitude === "number"
    && Number.isFinite(destination.latitude)
    && destination.latitude >= -90
    && destination.latitude <= 90
    && typeof destination.longitude === "number"
    && Number.isFinite(destination.longitude)
    && destination.longitude >= -180
    && destination.longitude <= 180;
}

export default function LibreDestinationMap({ destinations, selectedName, onSelect }: LibreDestinationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const fittedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const selectedNameRef = useRef(selectedName);
  onSelectRef.current = onSelect;
  selectedNameRef.current = selectedName;
  const plotted = useMemo(() => destinations.filter(hasCoordinates), [destinations]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: BALI_CENTER,
      zoom: 9,
      minZoom: 7,
      maxZoom: 15,
      attributionControl: false,
      cooperativeGestures: true,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const drawMarkers = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      const bounds = new maplibregl.LngLatBounds();

      plotted.forEach((destination) => {
        const button = document.createElement("button");
        const label = document.createElement("span");
        const point: [number, number] = [destination.longitude as number, destination.latitude as number];

        button.type = "button";
        button.className = styles.marker;
        button.dataset.name = destination.name;
        button.dataset.selected = String(destination.name === selectedNameRef.current);
        button.dataset.side = point[0] > BALI_CENTER[0] ? "left" : "right";
        button.setAttribute("aria-label", `Show ${destination.name}, ${destination.villas} ${destination.villas === 1 ? "villa" : "villas"}`);
        button.setAttribute("aria-pressed", String(destination.name === selectedNameRef.current));
        label.className = styles.markerLabel;
        label.textContent = destination.name;
        button.append(label);
        button.addEventListener("click", () => onSelectRef.current(destination.name));

        markersRef.current.push(new maplibregl.Marker({ element: button, anchor: "center" }).setLngLat(point).addTo(map));
        bounds.extend(point);
      });

      if (!fittedRef.current && !bounds.isEmpty()) {
        fittedRef.current = true;
        const compact = window.matchMedia("(max-width: 850px)").matches;
        map.fitBounds(bounds, {
          padding: compact ? { top: 54, right: 54, bottom: 54, left: 54 } : { top: 90, right: 120, bottom: 90, left: 120 },
          maxZoom: 10.3,
          duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650,
        });
      }
    };

    if (map.loaded()) drawMarkers();
    else map.once("load", drawMarkers);

    return () => { map.off("load", drawMarkers); };
  }, [plotted]);

  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const button = marker.getElement();
      const isSelected = button.dataset.name === selectedName;
      button.dataset.selected = String(isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
  }, [selectedName]);

  return (
    <div className={styles.mapPanel} aria-label="Map of Summerhouses Bali regions">
      <div ref={containerRef} className={styles.mapCanvas} />
      {plotted.length === 0 ? (
        <div className={styles.mapFallback}>
          <div><strong>Bali destinations</strong><span>Map locations are temporarily unavailable.</span></div>
        </div>
      ) : null}
    </div>
  );
}
