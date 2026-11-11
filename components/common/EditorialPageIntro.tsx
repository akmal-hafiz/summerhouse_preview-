import type { ReactNode } from "react";
import styles from "./EditorialPageIntro.module.css";

type EditorialPageIntroProps = {
  id: string;
  title: string;
  summary: string;
  titleLines?: string[];
  actions?: ReactNode;
  motionRule?: boolean;
};

/** The shared opening composition established by the About page. */
export default function EditorialPageIntro({ id, title, summary, titleLines, actions, motionRule }: EditorialPageIntroProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} className={styles.section} aria-labelledby={titleId} data-page-intro>
      <div className={styles.inner} data-motion-rule-host={motionRule || undefined}>{motionRule ? <span data-motion-rule aria-hidden="true" /> : null}
        <h1 id={titleId} className={styles.heading} aria-label={title} data-lines={Boolean(titleLines?.length)}>
          {titleLines?.length ? (
            <span aria-hidden="true">
              {titleLines.map((line, index) => <span key={`${index}-${line}`}>{line}</span>)}
            </span>
          ) : title}
        </h1>
        <div className={styles.copy}>
          <p className={styles.summary}>{summary}</p>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
