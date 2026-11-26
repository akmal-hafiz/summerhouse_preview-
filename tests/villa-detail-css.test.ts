import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const cssPath = path.join(process.cwd(), "app", "(website)", "globals.css");
const css = fs.readFileSync(cssPath, "utf8");

test("villa detail globals.css has no removed legacy selectors", () => {
  const forbiddenSelectors = [
    ".villa-detail-mini-",
    ".villa-detail-icon-button",
    ".villa-detail-mobile-menu",
    ".villa-detail-airbnb-layout",
    ".villa-detail-booking-card",
    ".villa-detail-host-line",
    ".villa-detail-gallery",
    ".villa-detail-hero-media",
    ".villa-detail-body",
    ".villa-detail-layout",
    ".villa-detail-shell",
    ".villa-detail-reserve-",
    ".villa-detail-photo-grid__booking",
  ];

  for (const selector of forbiddenSelectors) {
    assert.equal(
      css.includes(selector),
      false,
      `Expected dead selector "${selector}" to be removed from globals.css`,
    );
  }
});

test("villa booking and calendar rules use semantic tokens instead of #3f704d or #8a3c2d", () => {
  assert.doesNotMatch(css, /#3f704d/i);
  assert.doesNotMatch(css, /#8a3c2d/i);
});

test("villa-detail-section reset does not use !important to cancel post-main-grid divider", () => {
  const sectionRuleMatch = css.match(/\.villa-detail-page--preview\s+\.villa-detail-section\s*\{[^}]*\}/);
  assert.ok(sectionRuleMatch, "Expected .villa-detail-page--preview .villa-detail-section rule");
  assert.doesNotMatch(sectionRuleMatch[0], /border-top:\s*0\s*!important/);
  assert.doesNotMatch(sectionRuleMatch[0], /padding:\s*[^;]*!important/);
});

test("two-photo mosaic collapses side grid to single column on tablet and phone without !important stomp", () => {
  const tabletIdx = css.indexOf("@media (max-width: 1023px) {\r\n  .villa-detail-page--preview .villa-detail-photo-grid") !== -1
    ? css.indexOf("@media (max-width: 1023px) {\r\n  .villa-detail-page--preview .villa-detail-photo-grid")
    : css.indexOf("@media (max-width: 1023px) {\n  .villa-detail-page--preview .villa-detail-photo-grid");
  assert.ok(tabletIdx !== -1, "Expected tablet villa-detail-photo-grid media block");
  const mobileIdx = css.indexOf("@media (max-width: 767px)", tabletIdx);
  assert.ok(mobileIdx !== -1, "Expected mobile villa-detail media block");

  const tabletBlock = css.slice(tabletIdx, mobileIdx);
  assert.match(
    tabletBlock,
    /\.villa-detail-photo-grid\[data-count="2"\]\s+\.villa-detail-photo-grid__side\s*\{\s*grid-template-columns:\s*1fr;/,
  );

  const mobileEndIdx = css.indexOf(".villa-detail-loading", mobileIdx);
  const mobileBlock = css.slice(mobileIdx, mobileEndIdx !== -1 ? mobileEndIdx : mobileIdx + 3500);
  const mobileSideMatch = mobileBlock.match(/\.villa-detail-photo-grid__side\s*\{[^}]*\}/);
  assert.ok(mobileSideMatch, "Expected mobile .villa-detail-photo-grid__side rule");
  assert.doesNotMatch(mobileSideMatch[0], /grid-template-columns:\s*1fr\s+1fr\s*!important/);

  assert.match(
    css,
    /@media\s*\(min-width:\s*1024px\)\s*\{\s*\.villa-detail-page--preview\s+\.villa-detail-photo-grid\[data-count="3"\]/,
  );
});

test("AvailabilityCalendar publishes booking snapshot with an explicit dependency array", () => {
  const calPath = path.join(process.cwd(), "components", "booking", "AvailabilityCalendar.tsx");
  const calSource = fs.readFileSync(calPath, "utf8");
  assert.doesNotMatch(calSource, /useEffect\(\(\)\s*=>\s*\{\s*publishBooking\?\.\(barProps\);\s*\}\);/);
  assert.match(calSource, /useEffect\(\(\)\s*=>\s*\{[\s\S]*?publishBooking\?\.\(/);
});

test("AvailabilityCalendar uses concise guest-friendly rate notes without vendor names", () => {
  const calPath = path.join(process.cwd(), "components", "booking", "AvailabilityCalendar.tsx");
  const calSource = fs.readFileSync(calPath, "utf8");
  const calWithoutComments = calSource.replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
  assert.match(calWithoutComments, /Final price with taxes, fees, and your code included\./);
  assert.match(calWithoutComments, /Final price with taxes and fees included\./);
  assert.doesNotMatch(calWithoutComments, /Lodgify&apos;s|Lodgify's|at checkout/);
});

test("VillaReviews and VillaReviewForm use concise copy, ModalLayer dialog, and editorial underline inputs", () => {
  const reviewsPath = path.join(process.cwd(), "components", "villas", "VillaReviews.tsx");
  const formPath = path.join(process.cwd(), "components", "villas", "VillaReviewForm.tsx");
  const cssModulePath = path.join(process.cwd(), "components", "villas", "VillaReviews.module.css");

  const reviewsSource = fs.readFileSync(reviewsPath, "utf8");
  const formSource = fs.readFileSync(formPath, "utf8");
  const cssModule = fs.readFileSync(cssModulePath, "utf8");

  assert.match(reviewsSource, /No reviews yet\. Be the first to share your stay\./);
  assert.doesNotMatch(reviewsSource, /Share your experience below/);

  assert.match(formSource, /import ModalLayer from "@\/components\/common\/ModalLayer"/);
  assert.match(formSource, /<ModalLayer\s+lockScroll/);
  assert.doesNotMatch(formSource, /role="dialog"|aria-modal/);
  assert.match(formSource, /autoComplete="name"/);
  assert.match(formSource, /autoComplete="email"/);
  assert.match(formSource, /aria-invalid=/);

  const inputRuleMatch = cssModule.match(/\.field\s+input,\s*[\r\n]+\s*\.field\s+textarea\s*\{[^}]*\}/);
  assert.ok(inputRuleMatch, "Expected .field input, .field textarea rule in VillaReviews.module.css");
  assert.match(inputRuleMatch[0], /background:\s*transparent/);
  assert.match(inputRuleMatch[0], /border-bottom:\s*1px\s+solid/);
  assert.doesNotMatch(inputRuleMatch[0], /var\(--color-surface-warm\)/);

  const starRuleMatch = cssModule.match(/\.starButton\s*\{[^}]*\}/);
  assert.ok(starRuleMatch, "Expected .starButton rule in VillaReviews.module.css");
  assert.match(starRuleMatch[0], /border:\s*0/);
});

test("villa-booking-sidebar uses the soft shadow token, not a literal rgb shadow", () => {
  const rule = css.match(/\n\.villa-booking-sidebar\s*\{[^}]*\}/);
  assert.ok(rule, "Expected a .villa-booking-sidebar rule in globals.css");
  assert.match(rule[0], /box-shadow:\s*var\(--sh-shadow-soft\);/);
  assert.doesNotMatch(rule[0], /rgb\(/);
});

test("VillaBookingSidebar shows the calendar's guests and price before hydration", () => {
  const sidebar = fs.readFileSync(path.join(process.cwd(), "components", "booking", "VillaBookingSidebar.tsx"), "utf8");
  const page = fs.readFileSync(path.join(process.cwd(), "app", "(website)", "villas", "[id]", "page.tsx"), "utf8");
  assert.doesNotMatch(sidebar, /2 guests|Up to /);
  assert.doesNotMatch(sidebar, /priceLabel\s*\|\|\s*snapshot\.priceLabel/);
  assert.match(sidebar, /formatGuestCountLabel\(initialGuests\)/);
  assert.match(page, /initialGuests=\{clampGuestCount\(stay\?\.guests, villa\.guests\)\}/);
});

test("AvailabilityCalendar uses one clamped guest value and a roving day tab stop", () => {
  const cal = fs.readFileSync(path.join(process.cwd(), "components", "booking", "AvailabilityCalendar.tsx"), "utf8");
  // Guests start from the link and every setter clamps to the same limit, so links, quotes and attributes agree.
  assert.match(cal, /useState\(\(\) => clampGuestCount\(initialStay\?\.guests \?\? 1, guestLimit\)\)/);
  assert.doesNotMatch(cal, /Math\.min\([^)]*maxGuests\)/);
  assert.match(cal, /data-booking-guests=\{clampedGuests\}/);
  assert.match(cal, /resolveCalendarTabStopDate\(/);
  assert.match(cal, /tabIndex=\{!isDisabled && date === tabStopDate \? 0 : -1\}/);
});

test("AvailabilityCalendar header Clear dates uses the same clear as the bar and sidebar", () => {
  const cal = fs.readFileSync(path.join(process.cwd(), "components", "booking", "AvailabilityCalendar.tsx"), "utf8");
  assert.match(cal, /className="villa-calendar-section__clear" onClick=\{handleClearDates\}/);
});
