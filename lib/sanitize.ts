const BLOCKED_TAGS = /<(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)[\s\S]*?>[\s\S]*?<\/\1>/gi;
const SELF_CLOSING_BLOCKED_TAGS = /<(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)\b[^>]*\/?>/gi;
const EVENT_HANDLER_ATTRS = /\s+on[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const UNSAFE_URL_ATTRS = /\s+(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi;
const UNSAFE_STYLE_ATTRS = /\s+style\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "span",
  "h2",
  "h3",
  "h4",
]);

export function stripHtml(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeHtml(value?: string | null) {
  if (!value) return "";

  return value
    .replace(BLOCKED_TAGS, "")
    .replace(SELF_CLOSING_BLOCKED_TAGS, "")
    .replace(EVENT_HANDLER_ATTRS, "")
    .replace(UNSAFE_URL_ATTRS, "")
    .replace(UNSAFE_STYLE_ATTRS, "")
    .replace(/<\/?([a-z0-9-]+)(\s[^>]*)?>/gi, (match, tagName: string) => {
      const normalizedTag = tagName.toLowerCase();
      return ALLOWED_TAGS.has(normalizedTag) ? match : "";
    })
    .replace(/\s+/g, " ")
    .trim();
}
