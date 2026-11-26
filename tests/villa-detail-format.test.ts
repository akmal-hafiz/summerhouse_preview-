import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  buildGoogleMapsExternalUrl,
  formatAmenityName,
  formatBedroomLabel,
  formatCalendarDayAriaLabel,
  formatVillaDescriptionHtml,
  isLongReviewText,
  isMonthBeforeToday,
  selectAmenityHighlights,
  selectNearbyVillas,
  clampGuestCount,
  formatGuestCountLabel,
  normalizeGuestLimit,
  resolveCalendarTabStopDate,
} from "../lib/villa-detail-format";
import type { VillaSummary } from "../lib/lodgify/types";

test("formatVillaDescriptionHtml splits leading bracket headings and escapes HTML without em dashes", () => {
  const bracketed = formatVillaDescriptionHtml("[The Design] Sunlit studio with rice field view");
  assert.match(bracketed, /<h3 class="description-heading">The Design<\/h3>/);
  assert.match(bracketed, /<p>Sunlit studio with rice field view<\/p>/);
  assert.doesNotMatch(bracketed, /\u2014/);

  const bullets = formatVillaDescriptionHtml("- one\n- two");
  assert.equal((bullets.match(/<ul class="description-list">/g) ?? []).length, 1);
  assert.match(bullets, /<li>one<\/li>/);
  assert.match(bullets, /<li>two<\/li>/);
  assert.doesNotMatch(bullets, /\u2014/);

  const unsafe = formatVillaDescriptionHtml("<script>x</script>Hi & bye");
  assert.doesNotMatch(unsafe, /<script/i);
  assert.match(unsafe, /Hi &amp; bye/);
  assert.doesNotMatch(unsafe, /\u2014/);
});

test("formatVillaDescriptionHtml decodes HTML entities once, converts entity em dashes, preserves angle text and HTML lists", () => {
  const entities = formatVillaDescriptionHtml("Sun &amp; Sea at Bali&rsquo;s coast &quot;quiet&quot; &#39;stay&#39;");
  assert.doesNotMatch(entities, /&amp;(?:amp|rsquo|quot|#39);/);
  assert.match(entities, /Sun &amp; Sea/);
  assert.match(entities, /Bali\u2019s coast/);

  const bracketEntities = formatVillaDescriptionHtml("[The Space &amp; View] Sunlit &amp; calm");
  assert.match(bracketEntities, /<h3 class="description-heading">The Space &amp; View<\/h3>/);
  assert.match(bracketEntities, /<p>Sunlit &amp; calm<\/p>/);

  const entityDashes = formatVillaDescriptionHtml("Calm &mdash; luxury &#8212; retreat &#x2014; Bali");
  assert.doesNotMatch(entityDashes, /\u2014|&amp;(?:mdash|#8212|#x2014);/i);
  assert.match(entityDashes, /Calm - luxury - retreat - Bali/);

  const bulletEntities = formatVillaDescriptionHtml("- &nbsp;Private pool\n- &amp; garden");
  assert.match(bulletEntities, /<li>Private pool<\/li>/);
  assert.match(bulletEntities, /<li>&amp; garden<\/li>/);

  const angleText = formatVillaDescriptionHtml("Fits 2 < 4 guests > 1 night");
  assert.match(angleText, /Fits 2 &lt; 4 guests &gt; 1 night/);

  const htmlList = formatVillaDescriptionHtml("<ul><li>Private pool</li><li>Ocean view</li></ul>");
  assert.match(htmlList, /<li>Private pool<\/li>/);
  assert.match(htmlList, /<li>Ocean view<\/li>/);
  assert.doesNotMatch(htmlList, /Private poolOcean view/);

  const multilineTag = formatVillaDescriptionHtml('<p\nclass="x">Hello world</p>');
  assert.equal(multilineTag.trim(), "<p>Hello world</p>");

  const emptyBullet = formatVillaDescriptionHtml("-\n- Real item");
  assert.doesNotMatch(emptyBullet, /<li>\s*<\/li>/);
  assert.match(emptyBullet, /<li>Real item<\/li>/);

  const trailingDash = formatVillaDescriptionHtml("Peaceful\u2014");
  assert.equal(trailingDash.trim(), "<p>Peaceful -</p>");
});

test("formatAmenityName splits camelCase and trims whitespace", () => {
  assert.equal(formatAmenityName("RoomBalcony"), "Room Balcony");
  assert.equal(formatAmenityName("ACUnit"), "AC Unit");
  assert.equal(formatAmenityName("  Pool "), "Pool");
});

test("formatBedroomLabel handles singular and plural bed counts", () => {
  assert.equal(formatBedroomLabel(1), "1 bed");
  assert.equal(formatBedroomLabel(0), "0 beds");
  assert.equal(formatBedroomLabel(3), "3 beds");
});

test("buildGoogleMapsExternalUrl encodes coordinates and addresses safely", () => {
  assert.equal(
    buildGoogleMapsExternalUrl("-8.651,115.138"),
    "https://www.google.com/maps/search/?api=1&query=-8.651%2C115.138",
  );
  assert.equal(
    buildGoogleMapsExternalUrl("Jl. Pantai Berawa & Batu Bolong, Bali"),
    "https://www.google.com/maps/search/?api=1&query=Jl.%20Pantai%20Berawa%20%26%20Batu%20Bolong%2C%20Bali",
  );
});

test("isMonthBeforeToday detects past months accurately across years", () => {
  const nov2026 = new Date(2026, 10, 1);
  assert.equal(isMonthBeforeToday(new Date(2026, 9, 1), nov2026), true);
  assert.equal(isMonthBeforeToday(new Date(2026, 10, 1), nov2026), false);
  assert.equal(isMonthBeforeToday(new Date(2025, 11, 1), nov2026), true);
  assert.equal(isMonthBeforeToday(new Date(2026, 11, 1), nov2026), false);
});

test("formatCalendarDayAriaLabel produces accessible English date labels and states", () => {
  const startLabel = formatCalendarDayAriaLabel(new Date(2026, 11, 3), "available", { isSelectedStart: true });
  assert.match(startLabel, /Thursday/);
  assert.match(startLabel, /\b3\b/);
  assert.match(startLabel, /December/);
  assert.match(startLabel, /2026/);
  assert.match(startLabel, /selected check-in/i);

  const rangeLabel = formatCalendarDayAriaLabel(new Date(2026, 11, 4), "available", { isInRange: true });
  assert.match(rangeLabel, /in selected range/i);

  const unavailableLabel = formatCalendarDayAriaLabel(new Date(2026, 11, 5), "unavailable", { isDisabled: true });
  assert.match(unavailableLabel, /unavailable/i);

  const checkoutCandidate = formatCalendarDayAriaLabel(new Date(2026, 11, 5), "booked", { isDisabled: false });
  assert.doesNotMatch(checkoutCandidate, /unavailable/i);
  assert.match(checkoutCandidate, /available for check-out/i);

  const selectedCheckout = formatCalendarDayAriaLabel(new Date(2026, 11, 5), "booked", { isSelectedEnd: true, isDisabled: false });
  assert.match(selectedCheckout, /selected check-out/i);
  assert.doesNotMatch(selectedCheckout, /unavailable/i);
});

test("villa detail CSS has no em dash content", () => {
  const cssPath = path.join(process.cwd(), "app", "(website)", "globals.css");
  const css = fs.readFileSync(cssPath, "utf8");
  assert.doesNotMatch(css, /content:\s*["']\u2014["']/);
});

test("selectAmenityHighlights balances across hospitality groups, deduplicates case-insensitively, and handles empty input", () => {
  assert.deepEqual(selectAmenityHighlights([]), []);

  const groups = [
    {
      key: "bathroom",
      title: "Bathroom",
      items: ["Shower", "Bathtub", "HairDryer", "Towels", "Soap", "Bidet"],
    },
    {
      key: "kitchen",
      title: "Kitchen",
      items: ["CoffeeMaker", "Oven", "Toaster", "Kettle", "Blender", "Fridge", "Dishes", "Stove"],
    },
    { key: "internet", title: "Internet", items: ["WiFi"] },
    { key: "heating", title: "Climate", items: ["AirConditioning"] },
    { key: "outdoor", title: "Outdoor", items: ["PrivatePool", "wifi"] },
    { key: "sleeping", title: "Sleeping", items: ["KingBed", "Linens"] },
    { key: "parking", title: "Parking", items: ["FreeParking"] },
  ];

  const highlights = selectAmenityHighlights(groups, 10);
  assert.equal(highlights.length, 10);

  const distinctGroups = new Set(highlights.map((entry) => entry.groupKey));
  assert.ok(distinctGroups.size >= 5, `expected >= 5 distinct groups, got ${distinctGroups.size}`);

  const wifiIdx = highlights.findIndex((entry) => entry.groupKey === "internet");
  const acIdx = highlights.findIndex((entry) => entry.groupKey === "heating");
  const outdoorIdx = highlights.findIndex((entry) => entry.groupKey === "outdoor");
  const secondBathroomIdx = highlights.findIndex(
    (entry, idx) => entry.groupKey === "bathroom" && highlights.findIndex((e) => e.groupKey === "bathroom") !== idx,
  );
  const secondKitchenIdx = highlights.findIndex(
    (entry, idx) => entry.groupKey === "kitchen" && highlights.findIndex((e) => e.groupKey === "kitchen") !== idx,
  );

  assert.ok(wifiIdx >= 0 && acIdx >= 0 && outdoorIdx >= 0);
  if (secondBathroomIdx !== -1) {
    assert.ok(wifiIdx < secondBathroomIdx && acIdx < secondBathroomIdx && outdoorIdx < secondBathroomIdx);
  }
  if (secondKitchenIdx !== -1) {
    assert.ok(wifiIdx < secondKitchenIdx && acIdx < secondKitchenIdx && outdoorIdx < secondKitchenIdx);
  }

  const normalizedLabels = highlights.map((entry) => formatAmenityName(entry.item).toLowerCase());
  assert.equal(new Set(normalizedLabels).size, normalizedLabels.length);
});

test("selectAmenityHighlights prioritizes real Lodgify group keys (internet-office, heating-cooling) into top 6 phone slots", () => {
  const realLodgifyGroups = [
    { key: "bathroom-laundry", title: "Bathroom & Laundry", items: ["Iron & Board", "Hair dryer", "Towels"] },
    { key: "kitchen-dining", title: "Kitchen & Dining", items: ["Blender", "Coffee machine", "Fridge"] },
    { key: "parking", title: "Parking", items: ["Parking available", "Parking Included"] },
    { key: "sleeping", title: "Sleeping", items: ["Bed linen", "King bed"] },
    { key: "internet-office", title: "Internet & Office", items: ["Wi-Fi", "Desk"] },
    { key: "heating-cooling", title: "Heating & Cooling", items: ["Air conditioning"] },
    { key: "outdoor", title: "Outdoor", items: ["Private pool"] },
  ];

  const highlights = selectAmenityHighlights(realLodgifyGroups, 10);
  const topSixKeys = highlights.slice(0, 6).map((entry) => entry.groupKey);
  assert.equal(topSixKeys[0], "internet-office");
  assert.equal(topSixKeys[1], "heating-cooling");
  assert.equal(topSixKeys[2], "outdoor");
  assert.ok(topSixKeys.includes("kitchen-dining"));
  assert.ok(topSixKeys.includes("bathroom-laundry"));
});

test("selectNearbyVillas excludes current villa, prioritizes same area, trims name at pipe, and maps VillaSearchResult fields", () => {
  const summaries: VillaSummary[] = [
    {
      id: "524256",
      name: "88 East Home Canggu | Private Pool",
      location: "Canggu",
      description: "Current villa",
      imageUrl: "/current.jpg",
      priceLabel: "$240",
      originalPriceLabel: "$280",
      priceValue: 240,
      currencyCode: "USD",
      isFeatured: true,
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
    },
    {
      id: "101",
      name: "Cliff House Uluwatu | Ocean View",
      location: "Uluwatu",
      description: "Cliffside villa",
      imageUrl: "/ulu1.jpg",
      priceLabel: "$310",
      originalPriceLabel: null,
      priceValue: 310,
      currencyCode: "USD",
      isFeatured: false,
      guests: 6,
      bedrooms: 3,
      bathrooms: 3,
    },
    {
      id: "102",
      name: "Casa Leone Canggu | Designer Stay",
      location: "Canggu - Berawa",
      description: "Berawa sanctuary",
      imageUrl: "/canggu1.jpg",
      priceLabel: "$220",
      originalPriceLabel: "$260",
      priceValue: 220,
      currencyCode: "USD",
      isFeatured: false,
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
    },
    {
      id: "103",
      name: "Bukit Retreat",
      location: "Uluwatu",
      description: "Southern hills",
      imageUrl: "/ulu2.jpg",
      priceLabel: "$190",
      originalPriceLabel: null,
      priceValue: 190,
      currencyCode: "USD",
      isFeatured: false,
      guests: null,
      bedrooms: 1,
      bathrooms: 1,
    },
    {
      id: "104",
      name: "Villa Uma | Rice Field Views",
      location: "Canggu",
      description: "Quiet Canggu",
      imageUrl: "/canggu2.jpg",
      priceLabel: "$205",
      originalPriceLabel: "$230",
      priceValue: 205,
      currencyCode: "USD",
      isFeatured: false,
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
    },
  ];

  const nearby = selectNearbyVillas(summaries, "524256", "Canggu", 3);
  assert.equal(nearby.length, 3);
  assert.deepEqual(
    nearby.map((item) => item.id),
    ["102", "104", "101"],
  );
  assert.equal(nearby[0]?.name, "Casa Leone Canggu");
  assert.equal(nearby[0]?.originalPriceLabel, "$260");
  assert.equal(nearby[0]?.capacity, 4);
  assert.deepEqual(nearby[0]?.amenitiesPreview, []);
  assert.equal(nearby[0]?.rating, 0);
  assert.equal(nearby[0]?.isAvailableForSearch, true);
  assert.equal(nearby[0]?.availabilityStatus, "unknown");
  assert.equal(nearby[0]?.availabilityReason, "not_checked");

  const withNullGuests = selectNearbyVillas([summaries[3]!], "524256", "Canggu", 3);
  assert.equal(withNullGuests[0]?.capacity, 0);
});

test("selectNearbyVillas matches an address fallback by its area part, ignoring Bali", () => {
  const base = {
    description: "", imageUrl: "/x.jpg", priceLabel: null, originalPriceLabel: null, priceValue: 0,
    currencyCode: "USD", isFeatured: false, guests: 2, bedrooms: 1, bathrooms: 1,
  };
  const summaries: VillaSummary[] = [
    { ...base, id: "1", name: "Uluwatu Villa", location: "Uluwatu, Bali" },
    { ...base, id: "2", name: "Berawa Villa", location: "Canggu - Berawa" },
  ];
  const nearby = selectNearbyVillas(summaries, "9", "Jl. Pantai Berawa 12, Canggu, Bali", 2);
  assert.deepEqual(nearby.map((item) => item.id), ["2", "1"]);
});

test("isLongReviewText respects 280-char threshold and ignores surrounding whitespace", () => {
  assert.equal(isLongReviewText("a".repeat(120)), false);
  assert.equal(isLongReviewText("a".repeat(280)), false);
  assert.equal(isLongReviewText(`   ${"a".repeat(280)}   `), false);
  assert.equal(isLongReviewText("a".repeat(281)), true);
});

test("normalizeGuestLimit treats unknown capacity as 12 and caps at 20", () => {
  assert.equal(normalizeGuestLimit(undefined), 12);
  assert.equal(normalizeGuestLimit(null), 12);
  assert.equal(normalizeGuestLimit(0), 12);
  assert.equal(normalizeGuestLimit(-3), 12);
  assert.equal(normalizeGuestLimit(Number.NaN), 12);
  assert.equal(normalizeGuestLimit(4), 4);
  assert.equal(normalizeGuestLimit(4.7), 4);
  assert.equal(normalizeGuestLimit(40), 20);
});

test("clampGuestCount keeps guests between 1 and the villa limit", () => {
  assert.equal(clampGuestCount(undefined, 4), 1);
  assert.equal(clampGuestCount(null, 4), 1);
  assert.equal(clampGuestCount(Number.NaN, 4), 1);
  assert.equal(clampGuestCount(0, 4), 1);
  assert.equal(clampGuestCount(-2, 4), 1);
  assert.equal(clampGuestCount(3, 4), 3);
  assert.equal(clampGuestCount(9, 4), 4);
  assert.equal(clampGuestCount(2, 0), 2);
  assert.equal(clampGuestCount(15, 0), 12);
  assert.equal(clampGuestCount(25, 40), 20);
  assert.equal(clampGuestCount(2, undefined), 2);
});

test("formatGuestCountLabel says 1 guest or N guests", () => {
  assert.equal(formatGuestCountLabel(1), "1 guest");
  assert.equal(formatGuestCountLabel(0), "1 guest");
  assert.equal(formatGuestCountLabel(2), "2 guests");
});

test("resolveCalendarTabStopDate picks the first preferred enabled date, else the first enabled date", () => {
  const enabled = ["2026-12-02", "2026-12-03", "2026-12-04", "2026-12-10"];
  assert.equal(resolveCalendarTabStopDate(enabled, ["2026-12-04", "2026-12-02"]), "2026-12-04");
  assert.equal(resolveCalendarTabStopDate(enabled, ["2026-12-01", "2026-12-10"]), "2026-12-10");
  assert.equal(resolveCalendarTabStopDate(enabled, ["", null, undefined]), "2026-12-02");
  assert.equal(resolveCalendarTabStopDate([], ["2026-12-02"]), null);
});
