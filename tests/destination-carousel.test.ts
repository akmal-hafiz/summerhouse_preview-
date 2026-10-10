import assert from "node:assert/strict";
import test from "node:test";

import { nextCarouselIndex, safeDestinationHref } from "../lib/destination-carousel";

test("destination navigation wraps in both directions", () => {
  assert.equal(nextCarouselIndex(5, 1, 6), 0);
  assert.equal(nextCarouselIndex(0, -1, 6), 5);
  assert.equal(nextCarouselIndex(2, 1, 6), 3);
  assert.equal(nextCarouselIndex(0, 1, 0), -1);
});

test("destination links remain internal even when CMS input is unsafe", () => {
  assert.equal(safeDestinationHref("/destinations/ubud", "Ubud"), "/destinations/ubud");
  assert.equal(
    safeDestinationHref("https://example.com/phishing", "Canggu - Berawa"),
    "/villas?location=Canggu%20-%20Berawa&match=exact",
  );
  assert.equal(
    safeDestinationHref("//example.com/phishing", "Umalas"),
    "/villas?location=Umalas&match=exact",
  );
});
