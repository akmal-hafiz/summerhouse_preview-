"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import type { AboutDestination } from "./About";
import styles from "./AboutEditorialSections.module.css";

type LibreDestinationMapProps = {
  destinations: AboutDestination[];
};

const BALI_CENTER: [number, number] = [115.1889, -8.4095];

export default function LibreDestinationMap({ destinations }: LibreDestinationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const validDestinations = useMemo(
    () => destinations.filter((destination) => typeof destination.latitude === "number" && typeof destination.longitude === "number"),
    [destinations],
  );

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
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: BALI_CENTER,
      zoom: 9,
      minZoom: 7,
      maxZoom: 15,
      attributionControl: false,
      cooperativeGestures: true,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("summerhouses-destinations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 11,
        clusterRadius: 54,
      });

      map.addLayer({
        id: "destination-clusters",
        type: "circle",
        source: "summerhouses-destinations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#446B4A",
          "circle-radius": ["step", ["get", "point_count"], 22, 4, 28, 8, 34],
          "circle-stroke-color": "#FAFAF9",
          "circle-stroke-width": 2,
          "circle-opacity": 0.92,
        },
      });

      map.addLayer({
        id: "destination-cluster-count",
        type: "symbol",
        source: "summerhouses-destinations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold"],
          "text-size": 13,
        },
        paint: {
          "text-color": "#FAFAF9",
        },
      });

      map.addLayer({
        id: "destination-points",
        type: "circle",
        source: "summerhouses-destinations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#C7A58A",
          "circle-radius": 10,
          "circle-stroke-color": "#FAFAF9",
          "circle-stroke-width": 2,
        },
      });

      map.addLayer({
        id: "destination-labels",
        type: "symbol",
        source: "summerhouses-destinations",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["concat", ["get", "name"], " · ", ["to-string", ["get", "villas"]], " villas"],
          "text-font": ["Open Sans Semibold"],
          "text-size": 12,
          "text-offset": [0, 1.55],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#FAFAF9",
          "text-halo-color": "#2E2E2C",
          "text-halo-width": 1.2,
        },
      });

      map.on("click", "destination-clusters", async (event) => {
        const features = map.queryRenderedFeatures(event.point, { layers: ["destination-clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource("summerhouses-destinations") as GeoJSONSource | undefined;
        if (!source || clusterId === undefined) return;

        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number], zoom });
      });

      map.on("click", "destination-points", (event) => {
        const feature = event.features?.[0];
        const coordinates = (feature?.geometry as GeoJSON.Point | undefined)?.coordinates?.slice() as [number, number] | undefined;
        if (!feature?.properties || !coordinates) return;

        new maplibregl.Popup({ closeButton: false, className: "summerhouses-map-popup" })
          .setLngLat(coordinates)
          .setHTML(`<strong>${feature.properties.name}</strong><span>${feature.properties.villas} villas</span>`)
          .addTo(map);
      });

      map.on("mouseenter", "destination-clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseenter", "destination-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "destination-clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseleave", "destination-points", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || validDestinations.length === 0) return;

    const updateSource = () => {
      const source = map.getSource("summerhouses-destinations") as GeoJSONSource | undefined;
      if (!source) return;

      source.setData({
        type: "FeatureCollection",
        features: validDestinations.map((destination) => ({
          type: "Feature",
          properties: {
            name: destination.name,
            villas: destination.villas,
          },
          geometry: {
            type: "Point",
            coordinates: [destination.longitude as number, destination.latitude as number],
          },
        })),
      });

      const bounds = new maplibregl.LngLatBounds();
      validDestinations.forEach((destination) => {
        bounds.extend([destination.longitude as number, destination.latitude as number]);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 70, maxZoom: 11, duration: 900 });
      }
    };

    if (map.isStyleLoaded()) {
      updateSource();
      return;
    }

    map.once("load", updateSource);
  }, [validDestinations]);

  return (
    <div className={styles.mapPanel} aria-label="Interactive Summerhouses Bali destination map">
      <div ref={containerRef} className={styles.mapCanvas} />
      {validDestinations.length === 0 && (
        <div className={styles.mapFallback}>
          <strong>Bali destination map</strong>
          <span>Live property coordinates will appear here when available.</span>
        </div>
      )}
    </div>
  );
}
