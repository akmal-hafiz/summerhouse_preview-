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
      { id: "bali-canggu-berawa", label: "Berawa", value: "Berawa" },
      { id: "bali-canggu-padonan", label: "Padonan", value: "Padonan" },
      { id: "bali-canggu-batu-bolong", label: "Batu Bolong", value: "Batu Bolong" },
      { id: "bali-canggu-echo-beach", label: "Echo Beach", value: "Echo Beach" },
    ],
  },
  { id: "bali-ubud", label: "Ubud", value: "Ubud" },
  { id: "bali-umalas", label: "Umalas", value: "Umalas" },
  { id: "bali-kerobokan", label: "Kerobokan", value: "Kerobokan" },
  { id: "bali-seminyak", label: "Seminyak", value: "Seminyak" },
  { id: "bali-legian", label: "Legian", value: "Legian" },
  { id: "bali-pererenan", label: "Pererenan", value: "Pererenan" },
  { id: "bali-jimbaran", label: "Jimbaran", value: "Jimbaran" },
  { id: "bali-uluwatu", label: "Uluwatu", value: "Uluwatu" },
  { id: "bali-sanur", label: "Sanur", value: "Sanur" },
  { id: "bali-nusa-dua", label: "Nusa Dua", value: "Nusa Dua" },
];

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

function mergeLiveLocations(baseTree: LocationNode[], locations: string[]) {
  const known = new Set<string>();
  const visit = (nodes: LocationNode[]) => {
    nodes.forEach((node) => {
      known.add(normalize(node.label));
      if (node.value) known.add(normalize(node.value));
      if (node.children) visit(node.children);
    });
  };
  visit(baseTree);

  const liveNodes: LocationNode[] = locations
    .filter((location) => isUsefulLiveLocation(location, known))
    .map(compactLocationLabel)
    .slice(0, 10)
    .map((location) => ({
      id: `live-${normalize(location).replace(/\s+/g, "-")}`,
      label: location,
      value: location,
    }));

  return liveNodes.length ? [...baseTree, ...liveNodes] : baseTree;
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
  const tree = useMemo(() => mergeLiveLocations(BASE_LOCATION_TREE, locations), [locations]);
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
