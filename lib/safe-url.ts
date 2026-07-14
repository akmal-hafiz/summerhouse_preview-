const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

export function safeHttpHref(value: string | null | undefined, fallback = "/") {
  const candidate = value?.trim();

  if (!candidate || CONTROL_CHARS.test(candidate)) return fallback;

  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    return fallback;
  }

  return fallback;
}
