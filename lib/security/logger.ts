type LogMeta = Record<string, string | number | boolean | null | undefined>;

function cleanMeta(meta: LogMeta = {}) {
  return Object.fromEntries(
    Object.entries(meta).filter(([key, value]) => {
      if (value === undefined) return false;
      return !/key|token|secret|password|authorization|cookie/i.test(key);
    })
  );
}

export function logServerError(scope: string, error: unknown, meta: LogMeta = {}) {
  const message = error instanceof Error ? error.message : "Unknown server error";
  console.error(scope, {
    ...cleanMeta(meta),
    message,
  });
}

export function logServerWarning(scope: string, meta: LogMeta = {}) {
  console.warn(scope, cleanMeta(meta));
}

// Expected, already-handled misses (e.g. a configured property that is inactive
// in Lodgify). Uses console.warn so Next.js dev does NOT promote it to a red
// "Console Error" overlay, while still leaving a breadcrumb with the cause.
export function logServerNotice(scope: string, error: unknown, meta: LogMeta = {}) {
  const message = error instanceof Error ? error.message : "Unknown server error";
  console.warn(scope, {
    ...cleanMeta(meta),
    message,
  });
}
