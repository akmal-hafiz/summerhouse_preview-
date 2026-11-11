"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";

type AmenityGroup = {
  key: string;
  title: string;
  items: string[];
};

type VillaAmenitiesProps = {
  groups: AmenityGroup[];
  preview?: string[];
};

const iconForGroup = (key: string) => {
  if (key.includes("bathroom")) return "bathtub";
  if (key.includes("kitchen")) return "skillet";
  if (key.includes("internet")) return "wifi";
  if (key.includes("heating")) return "ac_unit";
  if (key.includes("sleeping")) return "bed";
  if (key.includes("parking")) return "local_parking";
  if (key.includes("outdoor")) return "deck";
  return "check_circle";
};

const formatAmenityName = (name: string) => {
  if (!name) return "";
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .trim();
};

export default function VillaAmenities({ groups, preview = [] }: VillaAmenitiesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const visibleItems = groups.flatMap((group) => group.items.map((item) => ({ group, item }))).slice(0, 12);
  useScrollLock(isOpen);

  if (groups.length === 0) return null;

  return (
    <>
      {preview.length > 0 && (
        <p className="villa-detail-amenities-preview">{preview.join(" - ")}</p>
      )}

      <div className="villa-detail-amenities">
        {visibleItems.map(({ group, item }) => (
          <div key={`${group.key}-${item}`} className="villa-detail-amenity">
            <span className="material-symbols-outlined">{iconForGroup(group.key)}</span>
            <span>{formatAmenityName(item)}</span>
          </div>
        ))}
      </div>

      <button type="button" className="villa-amenities__show" onClick={() => setIsOpen(true)}>
        Show all {groups.reduce((total, group) => total + group.items.length, 0)} amenities
      </button>

      {isOpen && createPortal(
        <div className="villa-modal" data-lenis-prevent role="dialog" aria-modal="true" aria-label="All amenities">
          <div className="villa-modal__backdrop" onClick={() => setIsOpen(false)} />
          <div className="villa-modal__scroll" data-lenis-prevent>
            <div className="villa-modal__panel villa-modal__panel--amenities">
              <div className="villa-modal__header">
                <h2>What this place offers</h2>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close amenities">Close</button>
              </div>

              <div className="villa-amenities-modal__groups">
                {groups.map((group) => (
                  <section key={group.key}>
                    <h3>
                      <span className="material-symbols-outlined">{iconForGroup(group.key)}</span>
                      {group.title}
                    </h3>
                    <div>
                      {group.items.map((item) => (
                        <p key={`${group.key}-${item}`}>{formatAmenityName(item)}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
