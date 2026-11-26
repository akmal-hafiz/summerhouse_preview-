import Image from "next/image";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { WISHLIST_COPY } from "@/lib/notifications/guest-messages";
import type { WishlistSummary } from "@/lib/wishlist-rules";

type WishlistCardProps = {
  list: WishlistSummary;
  /** Up to three photos (coverPhotos): one large, two stacked beside it. */
  photos: string[];
  href: string;
  /** The dashboard shows a smaller card. */
  compact?: boolean;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
};

/** One wishlist: a cover of its newest villas, its name and how many villas it holds. Used on Saved villas and the dashboard. */
export default function WishlistCard({ list, photos, href, compact = false, headingLevel: Title = "h2", priority = false }: WishlistCardProps) {
  const sizes = compact ? "(max-width: 767px) 90vw, 260px" : "(max-width: 359px) 100vw, (max-width: 767px) 50vw, 33vw";
  return (
    <article className={`wishlist-card${compact ? " wishlist-card--compact" : ""}`}>
      <Link href={href} className="wishlist-card__link">
        <span className="wishlist-card__cover" data-photos={photos.length} aria-hidden="true">
          {photos.length === 0 ? (
            <FiHeart className="wishlist-card__placeholder" />
          ) : (
            photos.map((src, index) => (
              <span key={src} className="wishlist-card__tile">
                <Image
                  src={src}
                  alt=""
                  fill
                  priority={priority && index === 0}
                  sizes={index === 0 ? sizes : compact ? "130px" : "(max-width: 767px) 25vw, 16vw"}
                  className="wishlist-card__image"
                />
              </span>
            ))
          )}
        </span>
        <span className="wishlist-card__body">
          <Title className="wishlist-card__name">{list.name}</Title>
          <span className="wishlist-card__meta">{WISHLIST_COPY.villaCount(list.count)}</span>
        </span>
      </Link>
    </article>
  );
}
