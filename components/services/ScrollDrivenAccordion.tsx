"use client";

import { useId } from "react";
import styles from "./ScrollDrivenAccordion.module.css";

export type ScrollAccordionItem = { title: string; text: string };

/** Retains the service data contract, with deliberate native disclosures instead of scroll-driven selection. */
export default function ScrollDrivenAccordion({ items, label }: { items: ScrollAccordionItem[]; label: string }) {
  const name = useId();
  return (
    <div className={styles.accordion} role="group" aria-label={label}>
      {items.map((item, index) => (
        <details className={styles.item} data-motion-rule-host name={name} key={`${item.title}-${index}`} open={index === 0}>
          <summary className={styles.trigger}><span>{item.title}</span><span className={styles.icon} aria-hidden="true" /><span data-motion-rule aria-hidden="true" /></summary><p className={styles.answer}>{item.text}</p>
        </details>
      ))}
    </div>
  );
}
