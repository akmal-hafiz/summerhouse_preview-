"use client";

import { useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import styles from "./Trigger.module.css";

type TriggerProps = {
  /** Set once the guest has chosen anything; the pill then reads back their choices. */
  summary: { where: string; meta: string } | null;
  expanded: boolean;
  onOpen: () => void;
  onClear: () => void;
};

/** The hero's one search control: a quiet pill that opens the search sheet. After a choice it reads the choice back and offers a clear. */
export default function Trigger({ summary, expanded, onOpen, onClear }: TriggerProps) {
  const button = useRef<HTMLButtonElement>(null);
  const title = summary?.where ?? "Where to?";
  const meta = summary?.meta ?? "Add dates · Add guests";
  return (
    <div className={styles.wrap} data-filled={summary ? "true" : undefined}>
      <button ref={button} type="button" onClick={onOpen} className={styles.trigger} aria-haspopup="dialog" aria-expanded={expanded}
        aria-label={summary ? `Edit search: ${summary.where}, ${summary.meta.replace(" · ", ", ")}` : "Start your search"}>
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          <span className={styles.meta}>{meta}</span>
        </span>
        <span className={styles.go} aria-hidden="true"><FiSearch /></span>
      </button>
      {summary ? (
        // The clear button leaves the DOM with the choice, so focus returns to the pill.
        // shortcut: no undo after a clear (the choice is three taps to rebuild), add one if guests report losing searches.
        <button type="button" onClick={() => { onClear(); button.current?.focus(); }} className={styles.clear} aria-label="Clear search">
          <FiX aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
