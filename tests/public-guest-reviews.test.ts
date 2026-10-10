import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { publicGuestReviews } from "../data/publicGuestReviews";

test("public guest proof contains the nine approved static reviews", () => {
  assert.equal(publicGuestReviews.length, 9);
  assert.equal(new Set(publicGuestReviews.map((review) => review.id)).size, 9);
});

test("review sources remain traceable and optional avatars stay locally managed", () => {
  for (const review of publicGuestReviews) {
    assert.match(review.sourceUrl, /^https:\/\//);

    if (review.avatarSrc) {
      assert.match(review.avatarSrc, /^\//);
      assert.doesNotMatch(review.avatarSrc, /^\/\//);
      assert.equal(
        existsSync(path.join(process.cwd(), "public", review.avatarSrc.slice(1))),
        true,
        `Missing local testimonial portrait: ${review.avatarSrc}`,
      );
    }
  }
});

test("every public testimonial has a locally managed editorial portrait", () => {
  assert.ok(publicGuestReviews.every((review) => Boolean(review.avatarSrc)));
});

test("unknown Booking.com scores are not presented as invented five-star ratings", () => {
  const bookingReviews = publicGuestReviews.filter(
    (review) => review.sourceLabel === "Booking.com",
  );

  assert.equal(bookingReviews.length, 2);
  assert.ok(bookingReviews.every((review) => review.rating === null));
});
