import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDestinationStartingRates,
  summarizeLodgifyDestinations,
} from "../lib/lodgify/destinations";

test("destination summaries expose only comparable validated starting rates", () => {
  const summaries = summarizeLodgifyDestinations([
    { city: "Canggu", is_active: true, original_min_price: 1_200_000, currency_code: "IDR" },
    { city: "Canggu", is_active: true, original_min_price: 3_400_000, currency_code: "IDR" },
    { city: "Canggu", is_active: false, original_min_price: 900_000, currency_code: "IDR" },
    { city: "Ubud", is_active: true, min_price: 120, currency_code: "IDR" },
  ]);

  const canggu = summaries.find((destination) => destination.name === "Canggu");
  const ubud = summaries.find((destination) => destination.name === "Ubud");

  assert.deepEqual(
    {
      villas: canggu?.villas,
      minimum: canggu?.startingPriceMin,
      maximum: canggu?.startingPriceMax,
      currency: canggu?.currencyCode,
    },
    { villas: 2, minimum: 1_200_000, maximum: 3_400_000, currency: "IDR" },
  );
  assert.equal(formatDestinationStartingRates(canggu!), "Rp 1.2m to Rp 3.4m / night");
  assert.equal(formatDestinationStartingRates(ubud!), null);
});

test("mixed currencies fail closed instead of creating a misleading range", () => {
  const [summary] = summarizeLodgifyDestinations([
    { city: "Pererenan", original_min_price: 2_000_000, currency_code: "IDR" },
    { city: "Pererenan", original_min_price: 300, currency_code: "USD" },
  ]);

  assert.equal(summary.startingPriceMin, null);
  assert.equal(summary.startingPriceMax, null);
  assert.equal(summary.currencyCode, null);
  assert.equal(formatDestinationStartingRates(summary), null);
});

test("known regions keep privacy-safe regional centers when property coordinates are absent", () => {
  const [summary] = summarizeLodgifyDestinations([
    { city: "Umalas", original_min_price: 2_000_000, currency_code: "IDR" },
  ]);

  assert.equal(summary.latitude, -8.659);
  assert.equal(summary.longitude, 115.1543);
  assert.equal(formatDestinationStartingRates(summary), "From Rp 2m / night");
});
