"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Interaction pattern adapted from MagicUI's InteractiveHoverButton.
 * Color-neutral: reads `--ihb-fill` (animated fill layer) and `--ihb-fill-fg`
 * (contrasting text on the fill) from the button's own style. If unset, the
 * fill layer is transparent — the button falls back to its base look and only
 * the arrow slides.
 *
 * Use `href` for link buttons. Existing visual classes remain the source of
 * truth; this component only adds the animated fill/text/icon layers.
 */
interface InteractiveHoverButtonBaseProps {
  arrow?: React.ReactNode;
  hideArrowAtRest?: boolean;
}

type InteractiveHoverButtonButtonProps = InteractiveHoverButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type InteractiveHoverButtonAnchorProps = InteractiveHoverButtonBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type InteractiveHoverButtonProps = InteractiveHoverButtonButtonProps | InteractiveHoverButtonAnchorProps;

const DEFAULT_ARROW = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="ihb-arrow"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

function InteractiveHoverButtonContent({
  children,
  arrow,
  hideArrowAtRest,
}: Pick<InteractiveHoverButtonBaseProps, "arrow" | "hideArrowAtRest"> & {
  children: React.ReactNode;
}) {
  return (
    <>
      <i aria-hidden="true" data-slot="ihb-fill" className="ihb-fill pointer-events-none" />

      <i data-slot="ihb-base" className="ihb-base relative z-[1] inline-flex items-center gap-2">
        {children}
        {!hideArrowAtRest && arrow}
      </i>

      <i aria-hidden="true" data-slot="ihb-hover" className="ihb-hover pointer-events-none absolute inset-0 z-[2] inline-flex items-center justify-center gap-2">
        {children}
        {arrow}
      </i>
    </>
  );
}

const interactiveHoverClassName = "ihb group relative inline-flex items-center justify-center overflow-hidden isolate outline-none";

export const InteractiveHoverButton = React.forwardRef<HTMLElement, InteractiveHoverButtonProps>(
  ({ children, className, arrow = DEFAULT_ARROW, hideArrowAtRest = false, ...props }, ref) => {
    if ("href" in props && props.href) {
      const { href, ...anchorProps } = props as InteractiveHoverButtonAnchorProps;
      const isExternal = /^(https?:|mailto:|tel:)/.test(href);
      const mergedClassName = cn(interactiveHoverClassName, className);

      if (isExternal) {
        return (
          <a ref={ref as React.ForwardedRef<HTMLAnchorElement>} href={href} data-slot="ihb-root" className={mergedClassName} {...anchorProps}>
            <InteractiveHoverButtonContent arrow={arrow} hideArrowAtRest={hideArrowAtRest}>
              {children}
            </InteractiveHoverButtonContent>
          </a>
        );
      }

      return (
        <Link ref={ref as React.ForwardedRef<HTMLAnchorElement>} href={href} data-slot="ihb-root" className={mergedClassName} {...anchorProps}>
          <InteractiveHoverButtonContent arrow={arrow} hideArrowAtRest={hideArrowAtRest}>
            {children}
          </InteractiveHoverButtonContent>
        </Link>
      );
    }

    const buttonProps = props as InteractiveHoverButtonButtonProps;

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        data-slot="ihb-root"
        className={cn(interactiveHoverClassName, className)}
        {...buttonProps}
      >
        <InteractiveHoverButtonContent arrow={arrow} hideArrowAtRest={hideArrowAtRest}>
          {children}
        </InteractiveHoverButtonContent>
      </button>
    );
  },
);
InteractiveHoverButton.displayName = "InteractiveHoverButton";
