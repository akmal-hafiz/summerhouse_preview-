"use client";

import type { FormEvent, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import StickyBookingBar from "./StickyBookingBar";
import {
  addMonths,
  buildMonthCells,
  dayNames,
  eachNightInRange,
  endOfMonth,
  formatISODate,
  isPastDate,
  monthNames,
  nightsBetween,
  parseISODate,
  startOfMonth,
} from "@/lib/date";
import { buildBookingWhatsAppUrl, buildLodgifyCheckoutUrl } from "@/lib/lodgify/booking";
import { useGlobalContactSettings } from "@/hooks/useGlobalContactSettings";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { lastStayForVilla, latestStay, loadHistory, recordSearch, type LastStay } from "@/lib/search-history-client";
import { promotionErrorMessage } from "@/lib/notifications/guest-messages";
import { withStay } from "@/lib/promo-param";
import { canBookWithPromotion, checkoutPromotion, initialAppliedCode } from "./promotion-state";

type AvailabilityDay = {
  date: string;
  status: "available" | "booked" | "blocked" | "unavailable" | "unknown";
  available: boolean;
  reason: string;
};

const STAY_NOTES = {
  link: { shown: "These are the dates you searched. Pick other days anytime.",
    taken: "This villa is not free on the dates you searched. Pick new dates below." },
  villa: { shown: "These are the dates you last checked here. Pick other days anytime.",
    taken: "The dates you last checked here are no longer free. Pick new dates below." },
  trip: { shown: "These are the dates from your last search. Pick other days anytime.",
    taken: "This villa is not free on the dates from your last search. Pick new dates below." },
};

type AvailabilityCalendarProps = {
  propertyId: string | number;
  roomTypeId?: string | number | null;
  villaName: string;
  location: string;
  priceLabel?: string | null;
  maxGuests?: number;
  /** A validated code from the `?promo=` link param. It starts applied and is checked once the guest has a stay. */
  initialPromotionCode?: string;
  /** The stay carried by the link (from the villa list or the villa before). It wins over the member's history. */
  initialStay?: LastStay | null;
};

type QuoteParts = { rent: number; discount: number; fees: Array<{ name: string; amount: number }>; taxes: number };

type RateQuote = Partial<QuoteParts> & {
  success: boolean;
  minStay?: number | null;
  maxStay?: number | null;
  isMinimumStayValid?: boolean;
  message?: string;
  /** Lodgify's own total for the stay (its checkout's number); absent when Lodgify could not quote it. */
  total?: number;
  currency?: string;
  /** The stay this quote belongs to, so a total is never shown for a different stay. */
  key?: string;
};

type PromotionQuote = {
  success: true;
  currency: string;
  regularTotal: number;
  quotedTotal: number;
  savings: number;
  rent: number;
  discount: number;
  fees: Array<{ name: string; amount: number }>;
  taxes: number;
  warnings: string[];
};

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: currency === "IDR" ? 0 : 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

/** Lodgify's breakdown rows, shown only when they add up to its total (otherwise the total alone is the truth). */
function QuoteLines({ parts, total, currency, discountLabel = "Discount" }: { parts: QuoteParts; total: number; currency: string; discountLabel?: string }) {
  const sum = parts.rent - parts.discount + parts.fees.reduce((acc, fee) => acc + fee.amount, 0) + parts.taxes;
  // A breakdown that is only "Accommodation = total" says nothing new.
  if (Math.abs(sum - total) >= 1 || (!parts.discount && !parts.fees.length && !parts.taxes)) return null;
  return (
    <>
      <div><dt>Accommodation</dt><dd>{formatPrice(parts.rent, currency)}</dd></div>
      {parts.discount > 0 && <div><dt>{discountLabel}</dt><dd>-{formatPrice(parts.discount, currency)}</dd></div>}
      {parts.fees.map((fee, index) => <div key={`${fee.name}-${index}`}><dt>{fee.name}</dt><dd>{formatPrice(fee.amount, currency)}</dd></div>)}
      {parts.taxes > 0 && <div><dt>Taxes</dt><dd>{formatPrice(parts.taxes, currency)}</dd></div>}
    </>
  );
}

export default function AvailabilityCalendar({
  propertyId,
  roomTypeId,
  villaName,
  location,
  priceLabel,
  maxGuests = 12,
  initialPromotionCode = "",
  initialStay = null,
}: AvailabilityCalendarProps) {
  const contact = useGlobalContactSettings();
  const today = useMemo(() => startOfMonth(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(today);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailabilityDay>>({});
  // The first month the loaded map belongs to, so a check never reads the previous window's days.
  const [availabilityRange, setAvailabilityRange] = useState("");
  // A linked stay that has already started (an old link) is ignored; the browser's own date decides.
  const linkedStay = initialStay && initialStay.checkIn >= formatISODate(new Date()) ? initialStay : null;
  const [lastStay, setLastStay] = useState<LastStay | null>(linkedStay);
  const hasLinkedStay = Boolean(linkedStay);
  // Where the prefilled dates came from, so the note under the calendar says the truth.
  const [staySource, setStaySource] = useState<keyof typeof STAY_NOTES>(linkedStay ? "link" : "villa");
  const [prefill, setPrefill] = useState<"pending" | "applied" | "unavailable" | "off">("pending");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [rateQuote, setRateQuote] = useState<RateQuote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [availabilityRetryKey, setAvailabilityRetryKey] = useState(0);
  const [promotionInput, setPromotionInput] = useState(initialPromotionCode);
  // A code from the link ("Use code" on the dashboard) starts applied: it is checked against Lodgify as soon as there is a
  // stay, and re-checked whenever the stay changes, without an extra click. The page validated it with promoCodeFromParam.
  const [appliedPromotionCode, setAppliedPromotionCode] = useState(() => initialAppliedCode(initialPromotionCode, roomTypeId));
  const [promotionQuote, setPromotionQuote] = useState<PromotionQuote | null>(null);
  const [promotionQuoteKey, setPromotionQuoteKey] = useState("");
  const [promotionFailedKey, setPromotionFailedKey] = useState("");
  const [promotionError, setPromotionError] = useState("");
  const [isPromotionLoading, setIsPromotionLoading] = useState(false);
  const [promotionRetryKey, setPromotionRetryKey] = useState(0);
  const [membershipDismissed, setMembershipDismissed] = useState(true);
  const { isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();
  // Only a member session records views; a CMS admin has none.
  const isMember = isAuthenticated && !isAdmin;
  const { openAuth } = useAuthModal();

  useEffect(() => {
    try {
      setMembershipDismissed(window.sessionStorage.getItem("summerhouses:membership-nudge-dismissed") === "1");
    } catch {
      setMembershipDismissed(false);
    }
  }, []);

  const rangeStart = formatISODate(startOfMonth(visibleMonth));
  const rangeEnd = formatISODate(endOfMonth(addMonths(visibleMonth, 1)));
  const nights = nightsBetween(checkIn, checkOut);

  const isRangeValid = useMemo(() => {
    if (!checkIn || !checkOut || nights <= 0) return false;
    return eachNightInRange(checkIn, checkOut).every((date) => availabilityMap[date]?.available);
  }, [availabilityMap, checkIn, checkOut, nights]);
  // Lodgify's total for exactly the stay on screen; a quote for any other stay (a fast date or guest change) never shows.
  const officialQuote = rateQuote && rateQuote.key === `${checkIn}|${checkOut}|${guests}` && typeof rateQuote.total === "number"
    && typeof rateQuote.currency === "string" && !isQuoteLoading ? rateQuote as RateQuote & QuoteParts & { total: number; currency: string } : null;
  // A bookable stay the guest has here goes into the URL, so "Other Summerhouses nearby" carries it to the next villa.
  // Dates that are dropped as taken never clear it: villa A full on 1-3 Dec still sends 1-3 Dec on to villa B.
  useEffect(() => {
    if (!isRangeValid) return;
    const query = withStay(window.location.search, { checkIn, checkOut, guests });
    if (query === window.location.search.slice(1)) return;
    // `null` state is what lets Next.js sync useSearchParams (StayLink) with this native replaceState.
    window.history.replaceState(null, "",`${window.location.pathname}?${query}${window.location.hash}`);
  }, [checkIn, checkOut, guests, isRangeValid]);
  const isMinimumStayValid = rateQuote?.isMinimumStayValid !== false;
  const promotionStayKey = `${propertyId}|${roomTypeId ?? ""}|${checkIn}|${checkOut}|${guests}`;
  const promotionState = { appliedCode: appliedPromotionCode, quoteKey: promotionQuote ? promotionQuoteKey : "",
    failedKey: promotionFailedKey, stayKey: promotionStayKey, loading: isPromotionLoading };
  const isPromotionValidated = canBookWithPromotion(promotionState);
  const checkoutCode = checkoutPromotion(promotionState);
  // Lodgify's price with the code for exactly this stay; the only place the code's numbers are shown.
  const codeQuote = checkoutCode ? promotionQuote : null;
  const isBookingValid = isRangeValid && isMinimumStayValid && !isQuoteLoading && isPromotionValidated;

  const checkoutUrl = useMemo(() => {
    try {
      return buildLodgifyCheckoutUrl({ propertyId, checkIn, checkOut, guests, promotionCode: checkoutCode });
    } catch {
      return "";
    }
  }, [checkIn, checkOut, checkoutCode, guests, propertyId]);
  const whatsAppFallbackUrl = useMemo(() => buildBookingWhatsAppUrl({
    villaName,
    checkIn,
    checkOut,
    guests,
    whatsappNumber: contact.whatsapp,
  }), [checkIn, checkOut, contact.whatsapp, guests, villaName]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      setIsLoading(true);
      setAvailabilityError("");
      const params = new URLSearchParams({
        propertyId: String(propertyId),
        start: rangeStart,
        end: rangeEnd,
      });

      try {
        const response = await fetch(
          `/api/lodgify/availability?${params.toString()}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Availability unavailable.");
        setAvailabilityMap(data.map || {});
        setAvailabilityRange(rangeStart);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setAvailabilityError(fetchError instanceof Error ? fetchError.message : "Availability unavailable.");
        setAvailabilityMap({});
        setAvailabilityRange("");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadAvailability();

    return () => controller.abort();
  }, [propertyId, rangeStart, rangeEnd, availabilityRetryKey]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRateQuote() {
      if (!isRangeValid || !checkIn || !checkOut) {
        setRateQuote(null);
        setQuoteError("");
        setIsQuoteLoading(false);
        return;
      }

      setIsQuoteLoading(true);
      setQuoteError("");

      const params = new URLSearchParams({
        propertyId: String(propertyId),
        checkIn,
        checkOut,
        guests: String(guests),
      });

      if (roomTypeId) params.set("roomTypeId", String(roomTypeId));

      try {
        const response = await fetch(`/api/lodgify/rate-quote?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load rates.");
        }

        setRateQuote({ ...data, key: `${checkIn}|${checkOut}|${guests}` });
      } catch (quoteFetchError) {
        if (controller.signal.aborted) return;
        setRateQuote(null);
        setQuoteError(
          quoteFetchError instanceof Error
            ? quoteFetchError.message
            : "Unable to load rates."
        );
      } finally {
        if (!controller.signal.aborted) setIsQuoteLoading(false);
      }
    }

    loadRateQuote();

    return () => controller.abort();
  }, [checkIn, checkOut, guests, isRangeValid, propertyId, roomTypeId]);

  useEffect(() => {
    const controller = new AbortController();
    if (!appliedPromotionCode || !roomTypeId || !isRangeValid || !checkIn || !checkOut || !isMinimumStayValid) {
      setIsPromotionLoading(false);
      setPromotionQuote(null);
      setPromotionQuoteKey("");
      return () => controller.abort();
    }

    async function loadPromotionQuote() {
      setIsPromotionLoading(true);
      setPromotionQuote(null);
      setPromotionQuoteKey("");
      setPromotionFailedKey("");
      setPromotionError("");
      try {
        const response = await fetch("/api/lodgify/promotion-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId, roomTypeId, checkIn, checkOut, guests, promotionCode: appliedPromotionCode }),
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (controller.signal.aborted) return;
        if (!response.ok || !data.success) {
          // The route's own wording names the supplier; guests get the mapped sentence instead.
          setPromotionError(promotionErrorMessage({ status: response.status, code: typeof data.status === "string" ? data.status : undefined }));
          // The guest can still book this stay, without the code.
          setPromotionFailedKey(promotionStayKey);
          return;
        }
        setPromotionQuote(data as PromotionQuote);
        setPromotionQuoteKey(promotionStayKey);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setPromotionError(promotionErrorMessage({ network: fetchError instanceof TypeError }));
        setPromotionFailedKey(promotionStayKey);
      } finally {
        if (!controller.signal.aborted) setIsPromotionLoading(false);
      }
    }

    loadPromotionQuote();
    return () => controller.abort();
  }, [appliedPromotionCode, checkIn, checkOut, guests, isMinimumStayValid, isRangeValid, promotionRetryKey, promotionStayKey, propertyId, roomTypeId]);

  // A signed-in member viewing a villa is recorded (guests record nothing). Dates join the entry once the range is valid, and the
  // price only while a promotion quote for the current stay is on screen. The write waits briefly so adjusting guests or dates
  // does not record every intermediate step, and a repeat of the same stay and total is sent once.
  const recordedViewRef = useRef("");
  useEffect(() => {
    if (isAuthLoading || !isMember) return;
    const pricedQuote = promotionQuote && promotionQuoteKey === promotionStayKey && !isPromotionLoading ? promotionQuote : null;
    const hasStay = isRangeValid && Boolean(checkIn) && Boolean(checkOut);
    const viewKey = `${propertyId}|${hasStay ? `${checkIn}|${checkOut}` : ""}|${guests}|${pricedQuote ? `${pricedQuote.quotedTotal}|${pricedQuote.currency}` : ""}`;
    if (recordedViewRef.current === viewKey) return;
    const timer = window.setTimeout(() => {
      recordedViewRef.current = viewKey;
      void recordSearch({ kind: "view", propertyId: String(propertyId), guests,
        ...(hasStay ? { checkIn, checkOut } : {}),
        ...(pricedQuote ? { quotedTotal: pricedQuote.quotedTotal, currency: pricedQuote.currency } : {}) }, isMember);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [checkIn, checkOut, guests, isAuthLoading, isMember, isPromotionLoading, isRangeValid, promotionQuote, promotionQuoteKey, promotionStayKey, propertyId]);

  // A signed-in member without dates in the link gets the dates they last checked here, otherwise their newest trip
  // (e.g. villa A was full on 1-3 Dec, so villa B opens on 1-3 Dec), while those are still ahead. Read once per page;
  // guests and CMS admins send nothing. History is a convenience, so any failure just leaves the calendar empty.
  useEffect(() => {
    if (isAuthLoading || !isMember || hasLinkedStay) return;
    const controller = new AbortController();
    void loadHistory(controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      const own = lastStayForVilla(items, String(propertyId));
      setStaySource(own ? "villa" : "trip");
      setLastStay(own ?? latestStay(items));
    });
    return () => controller.abort();
  }, [hasLinkedStay, isAuthLoading, isMember, propertyId]);

  // Fill the dates only if the member has not picked any yet; after that the remembered stay is never applied again.
  useEffect(() => {
    if (!lastStay || prefill !== "pending") return;
    if (checkIn || checkOut) { setPrefill("off"); return; }
    setCheckIn(lastStay.checkIn);
    setCheckOut(lastStay.checkOut);
    if (lastStay.guests) setGuests(Math.min(lastStay.guests, maxGuests));
    setVisibleMonth(startOfMonth(parseISODate(lastStay.checkIn)));
    setPrefill("applied");
  }, [checkIn, checkOut, lastStay, maxGuests, prefill]);

  // Once availability for those months is loaded, drop remembered dates that are no longer bookable.
  // shortcut: the calendar loads two months, so a remembered stay ending after that window is dropped too; load the full range if long stays matter.
  const showsLastStay = prefill === "applied" && !!lastStay && checkIn === lastStay.checkIn && checkOut === lastStay.checkOut;
  useEffect(() => {
    if (!showsLastStay || isLoading || availabilityError || availabilityRange !== rangeStart || isRangeValid) return;
    setCheckIn("");
    setCheckOut("");
    setRateQuote(null);
    setQuoteError("");
    setPrefill("unavailable");
  }, [availabilityError, availabilityRange, isLoading, isRangeValid, rangeStart, showsLastStay]);

  const handleApplyPromotion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = promotionInput.trim();
    if (!/^[A-Za-z0-9_-]{2,64}$/.test(code)) {
      setPromotionError("Enter a valid promotion code using letters, numbers, hyphens, or underscores.");
      return;
    }
    if (!isRangeValid || !roomTypeId) {
      setPromotionError("Choose available dates first, then apply your code.");
      return;
    }
    setPromotionQuote(null);
    setPromotionQuoteKey("");
    setPromotionError("");
    setIsPromotionLoading(true);
    setAppliedPromotionCode(code);
    setPromotionRetryKey((current) => current + 1);
  };

  const removePromotion = () => {
    setAppliedPromotionCode("");
    setPromotionInput("");
    setPromotionQuote(null);
    setPromotionQuoteKey("");
    setPromotionError("");
    setIsPromotionLoading(false);
  };

  const validateRange = (start: string, end: string) => {
    if (parseISODate(end) <= parseISODate(start)) return false;
    return eachNightInRange(start, end).every((date) => availabilityMap[date]?.available);
  };

  const handleDateClick = (date: string) => {
    const day = availabilityMap[date];
    if (availabilityError) {
      setError("Availability is not loaded yet. Please retry before selecting dates.");
      return;
    }

    if (!checkIn || (checkIn && checkOut) || parseISODate(date) <= parseISODate(checkIn)) {
      if (!day?.available) {
        setError(day?.reason === "closed_period" ? "This date is blocked." : "This date is not available.");
        return;
      }

      setError("");
      setBookingError("");
      setCheckIn(date);
      setCheckOut("");
      setRateQuote(null);
      setQuoteError("");
      return;
    }

    setError("");

    if (!validateRange(checkIn, date)) {
      setError("Selected range crosses unavailable dates.");
      return;
    }

    setIsQuoteLoading(true);
    setRateQuote(null);
    setQuoteError("");
    setBookingError("");
    setCheckOut(date);
  };

  const validateBookingDetails = () => {
    if (!propertyId) return "Villa booking information is missing. Please contact us via WhatsApp.";
    if (!checkIn || !checkOut) return "Please choose your check-in and check-out dates first.";
    if (nights <= 0 || parseISODate(checkOut) <= parseISODate(checkIn)) {
      return "Please choose a valid check-out date after check-in.";
    }
    if (!Number.isFinite(guests) || guests < 1) return "Please choose at least one guest.";
    if (guests > maxGuests) return `This villa accepts up to ${maxGuests} guests.`;
    if (availabilityError) return "Availability is temporarily unavailable. Please retry or contact us via WhatsApp.";
    if (!isRangeValid) return "Selected dates are not available. Please choose another date range.";
    if (!isMinimumStayValid) return rateQuote?.message || "Selected dates do not meet the minimum stay rule.";
    if (!isPromotionValidated) return "We are still checking your code. Wait a moment, or remove the code to continue.";
    if (!checkoutUrl) return "Booking is temporarily unavailable. Please contact us via WhatsApp.";
    return "";
  };

  const handleBookNow = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const validationMessage = validateBookingDetails();

    if (validationMessage) {
      setBookingError(validationMessage);
      setError(validationMessage);
      return;
    }

    window.location.href = checkoutUrl;
  };

  const renderMonth = (month: Date) => {
    const cells = buildMonthCells(month);

    return (
      <div className="villa-calendar__month">
        <h3>{monthNames[month.getMonth()]} {month.getFullYear()}</h3>
        <div className="villa-calendar__weekdays">
          {dayNames.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="villa-calendar__grid">
          {cells.map((cell) => {
            const date = formatISODate(cell);
            const day = availabilityMap[date];
            const isOutside = cell.getMonth() !== month.getMonth();
            const isPast = isPastDate(cell);
            const isSelectedStart = date === checkIn;
            const isSelectedEnd = date === checkOut;
            const isInsideRange = checkIn && checkOut && parseISODate(date) > parseISODate(checkIn) && parseISODate(date) < parseISODate(checkOut);
            const isCheckoutCandidate = Boolean(checkIn && !checkOut && parseISODate(date) > parseISODate(checkIn));
            const isValidCheckout = isCheckoutCandidate && validateRange(checkIn, date);
            const isDisabled = isOutside || isPast || (!day?.available && !isValidCheckout);

            return (
              <button
                key={date}
                type="button"
                disabled={isDisabled}
                title={!day?.available && !isOutside ? day?.reason || "Unavailable" : undefined}
                onClick={() => handleDateClick(date)}
                className={[
                  "villa-calendar__day",
                  isOutside ? "is-outside" : "",
                  isPast ? "is-past" : "",
                  day?.status ? `is-${day.status}` : "is-unknown",
                  isSelectedStart ? "is-selected-start" : "",
                  isSelectedEnd ? "is-selected-end" : "",
                  isInsideRange ? "is-in-range" : "",
                ].filter(Boolean).join(" ")}
              >
                {cell.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="villa-calendar-section" id="availability">
      <div className="villa-calendar-section__header">
        <div>
          <p className="villa-detail-section-label">Availability</p>
          <h2>Choose your island dates.</h2>
          <span>
            {checkIn && checkOut
              ? `${checkIn} - ${checkOut}`
              : checkIn
                ? "Select check-out date"
                : "Select check-in date"}
          </span>
          {showsLastStay && <p className="villa-calendar__note" role="status">{STAY_NOTES[staySource].shown}</p>}
          {prefill === "unavailable" && !checkIn && <p className="villa-calendar__note" role="status">{STAY_NOTES[staySource].taken}</p>}
        </div>
        <div className="villa-calendar-section__actions">
          <button type="button" onClick={() => { setCheckIn(""); setCheckOut(""); setError(""); setBookingError(""); setRateQuote(null); setQuoteError(""); setIsQuoteLoading(false); }}>
            Clear dates
          </button>
          {isBookingValid && (
            <a
              href={checkoutUrl}
              onClick={handleBookNow}
              data-booking-property-id={propertyId}
              data-booking-check-in={checkIn}
              data-booking-check-out={checkOut}
              data-booking-guests={guests}
              data-booking-quote-status={rateQuote?.success ? "quoted" : quoteError ? "quote-fallback" : "available"}
            >
              {officialQuote || codeQuote ? "Continue to checkout" : "See your full stay price"}
            </a>
          )}
        </div>
      </div>

      {isBookingValid && codeQuote && (
        <div className="villa-stay-total" aria-live="polite">
          <dl>
            <div className="villa-stay-total__total">
              <dt>Total for {nights} {nights === 1 ? "night" : "nights"}</dt>
              <dd>
                <s className="villa-stay-total__regular"><span className="villa-stay-total__sr">Regular price </span>{formatPrice(codeQuote.regularTotal, codeQuote.currency)}</s>
                {formatPrice(codeQuote.quotedTotal, codeQuote.currency)}
              </dd>
            </div>
            <QuoteLines parts={codeQuote} total={codeQuote.quotedTotal} currency={codeQuote.currency} discountLabel={`${checkoutCode} discount`} />
          </dl>
          <p>Lodgify&apos;s price for these dates with your code, fees and taxes included. Your checkout shows the same total.</p>
        </div>
      )}
      {isBookingValid && !codeQuote && officialQuote && (
        <div className="villa-stay-total" aria-live="polite">
          <dl>
            <div className="villa-stay-total__total">
              <dt>Total for {nights} {nights === 1 ? "night" : "nights"}</dt>
              <dd>{formatPrice(officialQuote.total, officialQuote.currency)}</dd>
            </div>
            <QuoteLines parts={officialQuote} total={officialQuote.total} currency={officialQuote.currency} />
          </dl>
          <p>Lodgify&apos;s price for these dates, with fees and taxes. Your checkout shows the same total.</p>
        </div>
      )}

      <div className="villa-calendar">
        <button
          type="button"
          className="villa-calendar__nav villa-calendar__nav--prev"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
          aria-label="Previous month"
        >
          &#8592;
        </button>
        <div className="villa-calendar__months">
          {isLoading ? (
            <div className="villa-calendar__loading" role="status" aria-live="polite">Checking availability...</div>
          ) : (
            <>
              {renderMonth(visibleMonth)}
              {renderMonth(addMonths(visibleMonth, 1))}
            </>
          )}
        </div>
        <button
          type="button"
          className="villa-calendar__nav villa-calendar__nav--next"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
          aria-label="Next month"
        >
          &#8594;
        </button>
      </div>

      {error && !bookingError && <p className="villa-calendar__error" role="alert">{error}</p>}
      {bookingError && (
        <p className="villa-calendar__error" role="alert">
          {bookingError}{" "}
          <a href={whatsAppFallbackUrl} target="_blank" rel="noopener noreferrer">
            Contact us via WhatsApp.
          </a>
        </p>
      )}
      {availabilityError && (
        <div className="villa-calendar__error villa-calendar__error--retry" role="alert">
          <span>{availabilityError}</span>
          <button
            type="button"
            onClick={() => {
              setError("");
              setBookingError("");
              setAvailabilityRetryKey((current) => current + 1);
            }}
          >
            Retry availability
          </button>
        </div>
      )}
      <p className="villa-calendar__note">See the current rate and any applicable fees before you confirm your stay.</p>

      {!isAuthLoading && !isAuthenticated && !membershipDismissed && isRangeValid && guests > 0 && (
        <div className="villa-membership-note">
          <div>
            <p className="villa-membership-note__title">Keep your favorite villas close.</p>
            <p>With an account, your saved villas are here whenever you return. You can also continue booking as a guest.</p>
          </div>
          <div className="villa-membership-note__actions">
            <button type="button" onClick={() => openAuth("register")}>Create account</button>
            <button type="button" onClick={() => openAuth("login")}>Sign in</button>
            <button type="button" onClick={() => {
              setMembershipDismissed(true);
              try { window.sessionStorage.setItem("summerhouses:membership-nudge-dismissed", "1"); } catch { /* Session storage may be unavailable. */ }
            }}>Not now</button>
          </div>
        </div>
      )}

      {roomTypeId && (
        <div className="villa-promotion">
          <div className="villa-promotion__heading">
            <h3>Have a promotion code?</h3>
            <p>We check your code against the dates and guests you chose.</p>
          </div>
          <form onSubmit={handleApplyPromotion} className="villa-promotion__form">
            <label htmlFor="villa-promotion-code">Promotion code</label>
            <div className="villa-promotion__input-row">
              <input
                id="villa-promotion-code"
                type="text"
                autoComplete="off"
                value={promotionInput}
                onChange={(event) => setPromotionInput(event.target.value)}
                maxLength={64}
                placeholder="Enter code"
                disabled={isPromotionLoading}
                aria-describedby="villa-promotion-feedback"
              />
              <button type="submit" disabled={isPromotionLoading || !isRangeValid || !isMinimumStayValid}>
                {isPromotionLoading ? "Checking..." : "Apply"}
              </button>
              {appliedPromotionCode && <button type="button" className="villa-promotion__remove" onClick={removePromotion}>Remove</button>}
            </div>
          </form>
          <div id="villa-promotion-feedback" aria-live="polite">
            {promotionError && <p className="villa-promotion__error" role="alert">{promotionError}</p>}
            {appliedPromotionCode && !promotionError && !promotionQuote && !isPromotionLoading && !isRangeValid && (
              <p className="villa-promotion__hint">Code {appliedPromotionCode} will be checked when you pick your dates.</p>
            )}
            {codeQuote && (
              <p className="villa-promotion__success">
                {checkoutCode} is applied to this stay and goes with you to checkout.
              </p>
            )}
          </div>
        </div>
      )}

      <StickyBookingBar
        villaName={villaName}
        location={location}
        priceLabel={priceLabel}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={Math.min(guests, maxGuests)}
        maxGuests={maxGuests}
        nights={nights}
        totalLabel={codeQuote ? formatPrice(codeQuote.quotedTotal, codeQuote.currency)
          : officialQuote ? formatPrice(officialQuote.total, officialQuote.currency) : undefined}
        isValid={isBookingValid}
        error={isQuoteLoading ? "Preparing your stay..." : availabilityError || error || (isRangeValid && !isMinimumStayValid ? rateQuote?.message : "")}
        isQuoteLoading={isQuoteLoading}
        checkoutUrl={checkoutUrl}
        whatsAppFallbackUrl={whatsAppFallbackUrl}
        propertyId={propertyId}
        quoteStatus={rateQuote?.success ? "quoted" : quoteError ? "quote-fallback" : "available"}
        onBookNow={handleBookNow}
        onGuestChange={(value) => {
          setIsQuoteLoading(true);
          setRateQuote(null);
          setQuoteError("");
          setBookingError("");
          setGuests(Math.min(value, maxGuests));
        }}
        onClearDates={() => { setCheckIn(""); setCheckOut(""); setError(""); setBookingError(""); setRateQuote(null); setQuoteError(""); setIsQuoteLoading(false); }}
      />
    </section>
  );
}
