"use client";

import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiMapPin, FiSearch } from "react-icons/fi";

export type LocationNode = {
  id: string;
  label: string;
  value?: string;
  children?: LocationNode[];
};

type HierarchicalLocationPickerProps = {
  locations: string[];
  selectedLocation: string;
  isLoading?: boolean;
  error?: string;
  onSelect: (location: string) => void;
  onClose: () => void;
};

const BASE_LOCATION_TREE: LocationNode[] = [
  {
    id: "bali-canggu",
    label: "Canggu",
    value: "Canggu",
    children: [
      { id: "bali-canggu-berawa", label: "Berawa", value: "Canggu - Berawa" },
      { id: "bali-canggu-padonan", label: "Padonan", value: "Canggu - Padonan" },
    ],
  },
  { id: "bali-pererenan", label: "Pererenan", value: "Pererenan" },
  { id: "bali-umalas", label: "Umalas", value: "Umalas" },
  { id: "bali-ubud", label: "Ubud", value: "Ubud" },
  { id: "bali-kerobokan", label: "Kerobokan", value: "Kerobokan" },
  { id: "bali-legian", label: "Legian", value: "Legian" },
];

const LOCATION_ORDER = ["Canggu", "Berawa", "Padonan", "Pererenan", "Umalas", "Ubud", "Kerobokan", "Legian"];

type SearchResult = {
  node: LocationNode;
  path: LocationNode[];
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function compactLocationLabel(value: string) {
  return value
    .replace(/^indonesia,\s*/i, "")
    .replace(/^bali,\s*/i, "")
    .replace(/^canggu\s*-\s*/i, "")
    .trim();
}

function cleanLiveCityLabel(value: string) {
  return value
    .replace(/^indonesia,\s*/i, "")
    .replace(/^bali,\s*/i, "")
    .trim();
}

function isUsefulLiveLocation(value: string, known: Set<string>) {
  const location = compactLocationLabel(value);

  if (!location || /^all bali villas$/i.test(location)) return false;
  if (/^(indonesia|bali)$/i.test(location)) return false;
  if (known.has(normalize(location))) return false;
  if (/[0-9,]/.test(location)) return false;
  if (/\b(jalan|gang|jl|street|road|ave|avenue)\b/i.test(location)) return false;
  return location.split(/\s+/).length <= 3;
}

function findNodeById(nodes: LocationNode[], id: string): LocationNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = node.children ? findNodeById(node.children, id) : null;
    if (child) return child;
  }
  return null;
}

function collectSearchResults(nodes: LocationNode[], query: string, path: LocationNode[] = []): SearchResult[] {
  const needle = normalize(query);
  const results: SearchResult[] = [];

  nodes.forEach((node) => {
    const currentPath = [...path, node];
    const labelMatch = normalize(node.label).includes(needle) || normalize(node.value || "").includes(needle);

    if (labelMatch) {
      results.push({ node, path: currentPath });
    }

    if (node.children) {
      results.push(...collectSearchResults(node.children, query, currentPath));
    }
  });

  return results;
}

function pathLabel(path: LocationNode[]) {
  return path.map((node) => node.label).join(" - ");
}

function sortLocationNodes(nodes: LocationNode[]) {
  return [...nodes].sort((a, b) => {
    const aIndex = LOCATION_ORDER.indexOf(a.label);
    const bIndex = LOCATION_ORDER.indexOf(b.label);
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }

    return a.label.localeCompare(b.label);
  });
}

function buildLiveLocationTree(locations: string[]) {
  const cityValues = Array.from(
    new Set(
      locations
        .map(cleanLiveCityLabel)
        .map((location) => location.trim())
        .filter((location) => isUsefulLiveLocation(location, new Set()))
    )
  );

  if (cityValues.length === 0) return BASE_LOCATION_TREE;

  const topLevel = new Map<string, LocationNode>();
  const childMap = new Map<string, LocationNode[]>();

  cityValues.forEach((location) => {
    const cangguMatch = location.match(/^Canggu\s*-\s*(.+)$/i);
    if (cangguMatch) {
      const childLabel = cangguMatch[1].trim();
      if (!topLevel.has("Canggu")) {
        topLevel.set("Canggu", { id: "bali-canggu", label: "Canggu", value: "Canggu", children: [] });
      }

      const children = childMap.get("Canggu") || [];
      children.push({
        id: `bali-canggu-${normalize(childLabel).replace(/\s+/g, "-")}`,
        label: childLabel,
        value: location,
      });
      childMap.set("Canggu", children);
      return;
    }

    topLevel.set(location, {
      id: `bali-${normalize(location).replace(/\s+/g, "-")}`,
      label: location,
      value: location,
    });
  });

  return sortLocationNodes(Array.from(topLevel.values()).map((node) => {
    const children = childMap.get(node.label);
    return children?.length ? { ...node, children: sortLocationNodes(children) } : node;
  }));
}

export function getSelectedLocationLabel(value: string) {
  if (!value) return "Location";

  const label = compactLocationLabel(value);
  if (/berawa|padonan|batu bolong|echo beach/i.test(label)) return `Canggu - ${label}`;
  return label;
}

export default function HierarchicalLocationPicker({
  locations,
  selectedLocation,
  isLoading = false,
  error = "",
  onSelect,
  onClose,
}: HierarchicalLocationPickerProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const tree = useMemo(() => buildLiveLocationTree(locations), [locations]);
  const activeNode = activeNodeId ? findNodeById(tree, activeNodeId) : null;
  const visibleNodes = activeNode?.children || tree;
  const results = searchTerm.trim() ? collectSearchResults(tree, searchTerm).slice(0, 12) : [];

  const choose = (node: LocationNode) => {
    if (node.children?.length && !searchTerm.trim()) {
      onSelect(node.value || node.label);
      setActiveNodeId(node.id);
      return;
    }

    onSelect(node.value || node.label);
    onClose();
  };

  return (
    <div className="location-picker" role="dialog" aria-label="Choose a Bali destination">
      <label className="location-picker__search">
        <FiSearch aria-hidden="true" />
        <input
          type="search"
          placeholder="Search destination..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          autoFocus
        />
      </label>

      {!isLoading && error && !searchTerm.trim() && <p className="location-picker__notice">{error}</p>}

      <div className="location-picker__body">
        {searchTerm.trim() ? (
          <div className="location-picker__list">
            {results.length > 0 ? (
              results.map(({ node, path }) => (
                <button
                  type="button"
                  key={`${node.id}-${path.map((item) => item.id).join("-")}`}
                  className={selectedLocation === (node.value || node.label) ? "is-selected" : ""}
                  onClick={() => {
                    onSelect(node.value || node.label);
                    onClose();
                  }}
                >
                  <span className="location-picker__icon">
                    <FiMapPin aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{pathLabel(path)}</strong>
                    <small>Bali destination</small>
                  </span>
                </button>
              ))
            ) : (
              <p className="location-picker__empty">No matching destination found.</p>
            )}
          </div>
        ) : (
          <>
            {activeNode && (
              <button type="button" className="location-picker__back" onClick={() => setActiveNodeId(null)}>
                <FiChevronLeft aria-hidden="true" />
                Back to Bali areas
              </button>
            )}
            <div className="location-picker__list">
              {visibleNodes.map((node) => (
                <button
                  type="button"
                  key={node.id}
                  className={selectedLocation === (node.value || node.label) ? "is-selected" : ""}
                  onClick={() => choose(node)}
                >
                  <span className="location-picker__icon">
                    <FiMapPin aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{node.label}</strong>
                    {node.children?.length ? <small>{node.children.length} sub-areas</small> : <small>Bali area</small>}
                  </span>
                  {node.children?.length ? <FiChevronRight aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
