"use client";

import { useState } from "react";
import { isLongReviewText } from "@/lib/villa-detail-format";
import styles from "./VillaReviews.module.css";

type VillaReviewTextProps = {
  text: string;
};

export default function VillaReviewText({ text }: VillaReviewTextProps) {
  const isLong = isLongReviewText(text);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.reviewTextWrap}>
      <p className={isLong && !expanded ? `${styles.reviewText} ${styles.reviewTextClamped}` : styles.reviewText}>
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          className={styles.readMoreButton}
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
