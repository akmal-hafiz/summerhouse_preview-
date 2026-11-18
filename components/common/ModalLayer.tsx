"use client";

import "./modal-layer.css";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useToastHost } from "@/components/providers/ToastProvider";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';

type ModalLayerProps = {
  /** Called on Esc or the back gesture; the owner unmounts the layer (after any exit animation). */
  onClose: () => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
};

/**
 * A native modal <dialog> around an overlay's existing markup. Mount it only while the overlay is open:
 * showModal() gives the page behind inertness, focus containment and the top layer, and closing on
 * unmount hands focus back to whatever opened it. The dialog itself is an invisible full-viewport
 * frame, so the overlay keeps its own backdrop, panel and animations.
 */
export default function ModalLayer({ onClose, children, ...label }: ModalLayerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Children mount only once the dialog is open: React's autoFocus runs at mount, and a field inside a
  // closed dialog cannot take focus, so showModal() would otherwise send focus to the first button.
  const [isOpen, setIsOpen] = useState(false);
  useToastHost(ref);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    setIsOpen(true);
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  // showModal() ran on an empty dialog and focused the dialog itself. Once the content is in, finish
  // what the browser would have done: focus the first control, unless an autoFocus field already did.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!isOpen || !dialog || document.activeElement !== dialog) return;
    const first = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      .find((element) => element.getClientRects().length > 0);
    first?.focus();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      className="modal-layer"
      {...label}
      onCancel={(event) => {
        // Let React close it, so exit animations still run.
        event.preventDefault();
        onClose();
      }}
      // A repeated Esc may skip the cancel step and close the dialog natively; keep state in step.
      onClose={onClose}
    >
      {isOpen ? children : null}
    </dialog>
  );
}
