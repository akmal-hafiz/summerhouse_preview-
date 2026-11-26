"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import ModalLayer from "@/components/common/ModalLayer";
import { formatAmenityName, selectAmenityHighlights } from "@/lib/villa-detail-format";

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

export default function VillaAmenities({ groups, preview = [] }: VillaAmenitiesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const visibleItems = selectAmenityHighlights(groups, 10);

  if (groups.length === 0) return null;

  return (
    <>
      {preview.length > 0 && (
        <p className="villa-detail-amenities-preview">{preview.map(formatAmenityName).join(" · ")}</p>
      )}

      <div className="villa-detail-amenities">
        {visibleItems.map(({ groupKey, item }) => (
          <div key={`${groupKey}-${item}`} className="villa-detail-amenity">
            <span className="material-symbols-outlined" aria-hidden="true">{iconForGroup(groupKey)}</span>
            <span>{formatAmenityName(item)}</span>
          </div>
        ))}
      </div>

      <button type="button" className="villa-amenities__show" onClick={() => setIsOpen(true)}>
        Show all {groups.reduce((total, group) => total + group.items.length, 0)} amenities
      </button>

      {isOpen && createPortal(
        <ModalLayer lockScroll onClose={() => setIsOpen(false)} aria-label="All amenities">
          <div className="villa-modal" data-lenis-prevent>
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
                        <span className="material-symbols-outlined" aria-hidden="true">{iconForGroup(group.key)}</span>
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
          </div>
        </ModalLayer>,
        document.body
      )}
    </>
  );
}
