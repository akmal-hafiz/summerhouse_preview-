"use client";

import { useId, useMemo, useState } from "react";

type VillaDescriptionBodyProps = {
  html: string;
};

const COLLAPSE_THRESHOLD = 420;

function countPlainTextLength(html: string): number {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

export default function VillaDescriptionBody({ html }: VillaDescriptionBodyProps) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();
  const isCollapsible = useMemo(() => countPlainTextLength(html) > COLLAPSE_THRESHOLD, [html]);

  return (
    <div
      className={[
        "villa-detail-description-wrap",
        isCollapsible ? "is-collapsible" : "",
        expanded ? "is-expanded" : "",
      ].filter(Boolean).join(" ")}
    >
      <div
        id={bodyId}
        className="villa-detail-description"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {isCollapsible && (
        <button
          type="button"
          className="villa-detail-description-toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : "Read full description"}
        </button>
      )}
    </div>
  );
}
