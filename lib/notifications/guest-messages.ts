// Guest-facing notification copy. Server and supplier messages are mapped here and never shown as they arrive.
// Tone rules and the moment-to-surface table live in docs/design/notifications.md.

export type FailureContext =
  | "login"
  | "lookup"
  | "register"
  | "verify"
  | "reset-send"
  | "reset"
  | "contact"
  | "review"
  | "owner-story";

export type Failure = {
  status?: number;
  /** First field the server flagged, when it flagged one. Read for routing only. */
  field?: string;
  /** The server's own words. Used only to tell "email already taken" apart; never displayed. */
  raw?: string;
  network?: boolean;
  preview?: boolean;
};

const OUTCOME: Record<FailureContext, string> = {
  login: "You are not signed in yet.",
  lookup: "We could not check this email.",
  register: "We could not send your code.",
  verify: "Your account is not created yet.",
  "reset-send": "We could not send a reset code.",
  reset: "Your password has not changed yet.",
  contact: "Your message was not sent.",
  review: "Your review was not sent.",
  "owner-story": "Your story was not sent.",
};

const PREVIEW: Partial<Record<FailureContext, string>> = {
  contact: "Messages cannot be sent from this preview. Email or WhatsApp us using the details on this page.",
  review: "Reviews cannot be sent from this preview. Please share your stay with us by email instead.",
  "owner-story": "Stories cannot be sent from this preview. Please share your experience with us by email instead.",
};

export const RECOVERY = {
  network: "Check your internet connection and try again.",
  rateLimited: "You have tried a few times in a row. Wait a minute, then try again.",
  server: "This is on our side. Try again in a few minutes.",
  refresh: "Refresh the page and try again.",
  tooLarge: "Shorten your message and try again.",
  details: "Check your details and try again.",
  unknown: "Try again in a moment.",
} as const;

const CODE_MESSAGE = "That code is not right or has expired. Check the latest email from us, or send a new code.";
const EMAIL_MESSAGE = "Enter an email address like name@example.com.";

/** One plain sentence for a field the server rejected. */
export function friendlyFieldMessage(field: string, context: FailureContext): string {
  switch (field) {
    case "email":
    case "reviewer_email":
      return EMAIL_MESSAGE;
    case "name":
    case "author":
      return "Add your name, using at least 2 characters.";
    case "password":
    case "password_confirmation":
      return "Use at least 8 characters, and type the same password in both fields.";
    case "code":
      return CODE_MESSAGE;
    case "text":
      if (context === "review") return "Write at least 20 characters about your stay.";
      if (context === "owner-story") return "Write at least 20 characters about your experience.";
      return "Write at least 20 characters.";
    case "message":
      return "Add a short message so we know how to help.";
    case "stars":
      return "Choose a rating from 1 to 5 stars.";
    case "stay_date":
      return "Choose a stay date that is today or earlier.";
    case "lodgify_property_id":
      return "This villa is no longer listed, so reviews for it are closed.";
    default:
      return "This answer is too long. Shorten it and try again.";
  }
}

function recoveryFor(failure: Failure): string {
  if (failure.network) return RECOVERY.network;
  const status = failure.status ?? 0;
  if (status === 429) return RECOVERY.rateLimited;
  if (status === 401 || status === 403 || status === 419) return RECOVERY.refresh;
  if (status === 413) return RECOVERY.tooLarge;
  if (status >= 500) return RECOVERY.server;
  if (status >= 400) return RECOVERY.details;
  return RECOVERY.unknown;
}

/** A complete, recoverable sentence for a failed guest action. Never echoes `raw`. */
export function describeFailure(context: FailureContext, failure: Failure): string {
  if (failure.preview) return PREVIEW[context] ?? `${OUTCOME[context]} This preview cannot send anything.`;
  if (failure.status === 422 && failure.field) {
    if (context === "login" && failure.field === "email") {
      return "That email and password do not match. Try again, or reset your password.";
    }
    if ((context === "register" || context === "lookup") && failure.field === "email" && /taken|exists/i.test(failure.raw ?? "")) {
      return "An account already uses this email. Sign in instead, or use a different email.";
    }
    return friendlyFieldMessage(failure.field, context);
  }
  return `${OUTCOME[context]} ${recoveryFor(failure)}`;
}

/** Reads what a failed fetch or authFetch error tells us, without keeping its wording for display. */
export function failureFromError(error: unknown): Failure {
  if (error instanceof TypeError) return { network: true };
  const shaped = error as { status?: unknown; message?: unknown; data?: { errors?: Record<string, unknown>; message?: unknown } } | null;
  if (!shaped || typeof shaped.status !== "number") return {};
  const errors = shaped.data?.errors;
  const field = errors ? Object.keys(errors)[0] : undefined;
  const firstMessage = field && Array.isArray(errors?.[field]) ? (errors[field] as unknown[])[0] : undefined;
  const raw = typeof firstMessage === "string" ? firstMessage
    : typeof shaped.data?.message === "string" ? shaped.data.message
      : typeof shaped.message === "string" ? shaped.message : undefined;
  return { status: shaped.status, ...(field ? { field } : {}), ...(raw ? { raw } : {}) };
}

/** Promotion code feedback. The supplier's name and wording stay out of guest copy. */
export function promotionErrorMessage(failure: { status?: number; code?: string; network?: boolean }): string {
  if (failure.network) return "We could not check this code. Check your internet connection and try again.";
  if (failure.code === "not_applicable") {
    return "This code does not lower the price for these dates. Check the code, or try other dates.";
  }
  if (failure.status === 429) return "You have tried a few codes in a row. Wait a minute, then try again.";
  if (failure.status === 422) return "This villa cannot take a code for these dates. Try other dates, or book without a code.";
  if (failure.status === 400) return "Check the code and your dates, then apply it again.";
  return "We could not check this code just now. Try again in a minute, or book without it.";
}

const PROMPT_NAME_LIMIT = 28;

/** Copy for the guest "keep this villa" prompt. Long names fall back to "This villa" so the prompt stays two lines. */
export function savePromptCopy(villaName: string): { title: string; body: string } {
  const name = villaName.trim();
  const subject = name && name.length <= PROMPT_NAME_LIMIT ? name : "This villa";
  return {
    title: "Keep this villa",
    body: `${subject} is saved in this browser for now. Sign in to keep it on every device.`,
  };
}

export function mergedVillasTitle(count: number): string {
  return `${count} ${count === 1 ? "villa" : "villas"} added to your saved list`;
}

/** Inline line under the heart when a signed-in save or remove fails. States what is true now. */
export function saveErrorMessage({ wasSaved, signedOut }: { wasSaved: boolean; signedOut: boolean }): string {
  if (signedOut) return "You have been signed out. Sign in again to keep saving villas.";
  return wasSaved
    ? "This villa is still saved. Tap the heart to try again."
    : "This villa was not saved. Tap the heart to try again.";
}

export const SAVE_TOASTS = {
  guestSaved: { title: "Saved for now", message: "Sign in to keep it on every device." },
  saved: { title: "Saved to your villas" },
  removed: { title: "Removed from your villas" },
  undoFailed: { title: "We could not put this villa back", message: "Tap the heart on the villa to save it again." },
} as const;
