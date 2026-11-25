"use client";

import "./modal-layer.css";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useToastHost } from "@/components/providers/ToastProvider";
import { keyboardInset } from "@/lib/visual-viewport";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';

// Layers that hold the body scroll lock; the original overflow comes back when the last one closes.
let scrollLocks = 0;
let overflowBeforeLock = "";

// Past this inset the visual viewport is a keyboard, not Safari toolbars showing or hiding.
const KEYBOARD_THRESHOLD = 120;

type ModalLayerProps = {
  /** Lock the page behind from scrolling while open. Off by default, so desktop-style dialogs keep their behaviour. */
  lockScroll?: boolean;
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
export default function ModalLayer({ onClose, lockScroll = false, children, ...label }: ModalLayerProps) {
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

  // Publish the visual viewport on the dialog (no React state, so no re-render per event): iOS shrinks
  // only the visual viewport for the keyboard, and sheet CSS reads these to stay above it.
  useLayoutEffect(() => {
    const dialog = ref.current;
    const vv = window.visualViewport;
    if (!dialog || !vv) return;
    const publish = () => {
      const inset = keyboardInset(window.innerHeight, vv);
      dialog.style.setProperty("--vv-height", `${Math.round(vv.height)}px`);
      dialog.style.setProperty("--keyboard-inset", `${inset}px`);
      if (inset > KEYBOARD_THRESHOLD) dialog.dataset.keyboard = "open";
      else delete dialog.dataset.keyboard;
    };
    publish();
    vv.addEventListener("resize", publish);
    vv.addEventListener("scroll", publish);
    return () => {
      vv.removeEventListener("resize", publish);
      vv.removeEventListener("scroll", publish);
    };
  }, []);

  // Safari ignores overscroll-behavior on the non-scrolling backdrop, so the body lock stays as its fallback.
  useLayoutEffect(() => {
    if (!lockScroll) return;
    if (scrollLocks === 0) {
      overflowBeforeLock = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollLocks += 1;
    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = overflowBeforeLock;
    };
  }, [lockScroll]);

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
