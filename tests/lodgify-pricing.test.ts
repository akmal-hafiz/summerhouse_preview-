import assert from "node:assert/strict";
import test from "node:test";
import { buildRateQuoteFromCalendar, getStayRestrictionFromCalendar } from "../lib/lodgify/pricing";
import { buildLodgifyCheckoutUrl } from "../lib/lodgify/booking";
import { getComparablePrice, getRealPriceLabel } from "../lib/lodgify/normalizers";

const property = { id: 475365, currency_code: "IDR" };
const request = {
  propertyId: 475365,
  roomTypeId: 100,
  checkIn: "2026-10-01",
  checkOut: "2026-10-04",
  guests: 2,
};

function calendar(prices: unknown[], dates = ["2026-10-01", "2026-10-02", "2026-10-03"]) {
  return { calendar_items: dates.map((date) => ({ date, prices })) };
}

test("catalog starting price never treats converted min_price as IDR", () => {
  const mixed = { currency_code: "IDR", original_min_price: 3_000_000, min_price: 146.35, max_price: 317.07 };
  assert.equal(getRealPriceLabel(mixed), "Rp 3.000.000");
  assert.equal(getComparablePrice(mixed), 3_000_000);
  assert.equal(getRealPriceLabel({ currency_code: "IDR", min_price: 146.35 }), null);
  assert.equal(getComparablePrice({ currency_code: "IDR", min_price: 146.35 }), 0);
  assert.equal(getRealPriceLabel({ currency_code: "IDR", original_min_price: 3_000_000, original_max_price: 2_000_000 }), null);
  assert.equal(getRealPriceLabel({ currency_code: "INVALID", original_min_price: 3_000_000 }), null);
});

test("three and four nights use the matching stay rule on every charged night", () => {
  const prices = [
    { min_stay: 3, max_stay: 3, price_per_day: 1_000_000 },
    { min_stay: 4, max_stay: 4, price_per_day: 900_000 },
  ];
  const three = buildRateQuoteFromCalendar({ property, calendar: calendar(prices), ...request });
  const four = buildRateQuoteFromCalendar({
    property,
    calendar: calendar(prices, ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"]),
    ...request,
    checkOut: "2026-10-05",
  });
  assert.equal(three?.nights, 3);
  assert.equal(three?.nightlySubtotal, 3_000_000);
  assert.equal(four?.nights, 4);
  assert.equal(four?.nightlySubtotal, 3_600_000);
});

test("missing or incompatible rate never produces a zero or guessed quote", () => {
  const good = [{ min_stay: 3, max_stay: 3, price_per_day: 1_000_000 }];
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: calendar(good, ["2026-10-01", "2026-10-02"]), ...request }), null);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: calendar([{ min_stay: 4, price_per_day: 1_000_000 }]), ...request }), null);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: calendar([{ min_stay: 3 }]), ...request }), null);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: calendar([{ min_stay: 3, price_per_day: -10 }]), ...request }), null);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: calendar([]), ...request }), null);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: calendar([{ min_stay: "invalid", price_per_day: 1_000_000 }]), ...request }), null);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: calendar([{ max_stay: 2, price_per_day: 1_000_000 }]), ...request }), null);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: calendar(good), ...request, guests: 0 }), null);
  assert.equal(buildRateQuoteFromCalendar({ property: { id: 475365 }, calendar: calendar(good), ...request }), null);
});

test("known stay limits remain visible without inventing a price", async () => {
  const minimumCalendar = calendar([{ min_stay: 4, price_per_day: 1_000_000 }]);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: minimumCalendar, ...request }), null);
  const minimum = getStayRestrictionFromCalendar(minimumCalendar, request.checkIn, request.checkOut);
  assert.deepEqual(minimum, {
    success: true,
    isMinimumStayValid: false,
    minStay: 4,
    maxStay: null,
    message: "This villa requires at least 4 nights for these dates.",
  });
  const { toPublicRateCheck } = await import("../app/api/lodgify/rate-quote/route");
  assert.deepEqual(toPublicRateCheck(minimum!), minimum);

  const maximum = getStayRestrictionFromCalendar(calendar([{ max_stay: 2, price_per_day: 1_000_000 }]), request.checkIn, request.checkOut);
  assert.deepEqual(maximum, {
    success: true,
    isMinimumStayValid: false,
    minStay: null,
    maxStay: 2,
    message: "This villa allows up to 2 nights for these dates.",
  });
  assert.equal(getStayRestrictionFromCalendar(calendar([]), request.checkIn, request.checkOut), null);
  assert.equal(getStayRestrictionFromCalendar(calendar([{ min_stay: 4, max_stay: 2, price_per_day: 1_000_000 }]), request.checkIn, request.checkOut), null);
});

test("additional guest rate is counted only when its rule is complete", () => {
  const prices = [{ min_stay: 3, price_per_day: 1_000_000, price_per_additional_guest: 100_000, additional_guests_starts_from: 2 }];
  const quote = buildRateQuoteFromCalendar({ property, calendar: calendar(prices), ...request, guests: 3 });
  assert.equal(quote?.additionalGuestSubtotal, 300_000);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: calendar([{ min_stay: 3, price_per_day: 1_000_000, price_per_additional_guest: 100_000 }]), ...request }), null);
});

test("public rate response never exposes a payable-looking total", async () => {
  const quote = buildRateQuoteFromCalendar({ property, calendar: calendar([{ min_stay: 3, price_per_day: 1_000_000 }]), ...request });
  assert.ok(quote);
  const { toPublicRateCheck } = await import("../app/api/lodgify/rate-quote/route");
  const publicResult = toPublicRateCheck(quote);
  assert.deepEqual(Object.keys(publicResult).sort(), ["isMinimumStayValid", "maxStay", "message", "minStay", "success"].sort());
  assert.equal(JSON.stringify(publicResult).includes("3000000"), false);
});

test("a valid default rate covers omitted dates but malformed duplicate dates fail closed", () => {
  const prices = [{ min_stay: 3, price_per_day: 1_000_000 }];
  const quote = buildRateQuoteFromCalendar({ property, calendar: { calendar_items: [{ is_default: true, prices }] }, ...request });
  assert.equal(quote?.nightlySubtotal, 3_000_000);
  assert.equal(buildRateQuoteFromCalendar({ property, calendar: {
    calendar_items: [{ date: "2026-10-01", prices }, { date: "2026-10-01", prices }],
  }, ...request }), null);
});

test("checkout link never carries the local quote or accepts an untrusted destination", () => {
  const url = new URL(buildLodgifyCheckoutUrl({ propertyId: 475365, checkIn: "2026-10-01", checkOut: "2026-10-04", guests: 2 }));
  assert.equal(url.hostname, "checkout.lodgify.com");
  assert.equal(url.protocol, "https:");
  assert.equal(url.searchParams.get("checkIn"), "2026-10-01");
  assert.equal(url.searchParams.get("guests"), "2");
  for (const key of ["price", "total", "amount", "nightlyRate"]) assert.equal(url.searchParams.has(key), false);
  assert.equal(url.searchParams.has("currency"), false);
  assert.throws(() => buildLodgifyCheckoutUrl({ propertyId: "../../other" }));
  assert.throws(() => buildLodgifyCheckoutUrl({ propertyId: 475365, checkIn: "invalid", checkOut: "2026-10-04", guests: 2 }));
  assert.throws(() => buildLodgifyCheckoutUrl({ propertyId: 475365, checkIn: "2026-10-01", checkOut: "2026-10-04", guests: 0 }));
  const previous = process.env.NEXT_PUBLIC_LODGIFY_BOOKING_BASE_URL;
  process.env.NEXT_PUBLIC_LODGIFY_BOOKING_BASE_URL = "https://checkout.lodgify.com.evil.test/path?amount=1";
  try {
    assert.throws(() => buildLodgifyCheckoutUrl({ propertyId: 475365 }));
    process.env.NEXT_PUBLIC_LODGIFY_BOOKING_BASE_URL = "https://checkout.lodgify.com/en/summerhouse--bali/{propertyId}/reservation?amount=1";
    assert.throws(() => buildLodgifyCheckoutUrl({ propertyId: 475365 }));
    process.env.NEXT_PUBLIC_LODGIFY_BOOKING_BASE_URL = "https://checkout.lodgify.com:444/en/summerhouse--bali/{propertyId}/reservation";
    assert.throws(() => buildLodgifyCheckoutUrl({ propertyId: 475365 }));
    process.env.NEXT_PUBLIC_LODGIFY_BOOKING_BASE_URL = "https://checkout.lodgify.com/en/summerhouse--bali/{propertyId}/reservation?currency=EUR";
    assert.equal(new URL(buildLodgifyCheckoutUrl({ propertyId: 475365 })).searchParams.has("currency"), false);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_LODGIFY_BOOKING_BASE_URL;
    else process.env.NEXT_PUBLIC_LODGIFY_BOOKING_BASE_URL = previous;
  }
});

test("public rate check rejects manipulated guests, room IDs and stay ranges without a supplier request", async () => {
  const { GET } = await import("../app/api/lodgify/rate-quote/route");
  const { NextRequest } = await import("next/server");
  const base = "http://localhost/api/lodgify/rate-quote?propertyId=475365&checkIn=2026-10-01&checkOut=2026-10-04";
  for (const suffix of ["&guests=0", "&guests=41", "&guests=2.5", "&guests=Infinity", "&roomTypeId=../other", "&checkOut=invalid"]) {
    const response = await GET(new NextRequest(base + suffix));
    assert.equal(response.status, 400, suffix);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});
