import Link from "next/link";
import { couponEndLabel, type MemberCoupon } from "./dashboardFormat";
import { COPY_FAILED } from "./copyCode";

export type CopyState = { code: string; result: "copied" | "failed" } | null;

/**
 * One offer as members see it. The coupon manager in the CMS renders this same row as its live preview.
 * `heading` keeps the outline correct where the row sits: h2 under the Offers page title, h4 inside the CMS preview.
 */
export default function OfferRow({ coupon, copy, copyState, heading: Heading = "h2" }: {
  coupon: MemberCoupon; copy: (code: string, codeNode: HTMLElement | null) => void; copyState: CopyState; heading?: "h2" | "h4";
}) {
  const ends = coupon.expiresAt ? couponEndLabel(coupon.expiresAt) : null;
  const state = copyState?.code === coupon.code ? copyState.result : null;
  const label = state === "copied" ? "Copied" : "Copy";
  return (
    <article className="dash-list-row">
      <div className="dash-list-row-main">
        <Heading className="dash-list-row-title">{coupon.title}</Heading>
        {ends && <span className="dash-list-row-note">Ends {ends}</span>}
        {coupon.description && <p>{coupon.description}</p>}
        {coupon.terms && <small>{coupon.terms}</small>}
      </div>
      <div className="dash-list-row-actions">
        <span className="dash-code">
          <code>{coupon.code}</code>
          <button type="button" onClick={(event) => copy(coupon.code, event.currentTarget.parentElement?.querySelector("code") ?? null)}
            aria-label={`${label} code ${coupon.code}`}>
            {label}
          </button>
        </span>
        <Link href={`/villas?promo=${encodeURIComponent(coupon.code)}`} className="dash-pill" aria-label={`Use code ${coupon.code}`}>Use code</Link>
      </div>
      {state === "failed" && <p className="dash-list-row-error">{COPY_FAILED}</p>}
    </article>
  );
}
