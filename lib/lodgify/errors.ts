export type LodgifyErrorKind = "timeout" | "network" | "rate_limited" | "server_error" | "authentication" | "not_found" | "invalid_response" | "cancelled" | "circuit_open";

export class LodgifyError extends Error {
  constructor(
    message: string,
    public readonly kind: LodgifyErrorKind,
    public readonly operation: string,
    public readonly status: number | null = null,
    public readonly retriable = false,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "LodgifyError";
  }
}

export function errorKindForStatus(status: number): LodgifyErrorKind {
  if (status === 401 || status === 403) return "authentication";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server_error";
  return "invalid_response";
}

export const isRetriableStatus = (status: number) => status === 429 || [500, 502, 503, 504].includes(status);

export function normalizeLodgifyError(error: unknown, operation: string): LodgifyError {
  if (error instanceof LodgifyError) return error;
  const candidate = error as { name?: string; message?: string; code?: string; cause?: unknown };
  const cause = candidate?.cause as { code?: string; message?: string } | undefined;
  const message = [candidate?.message, cause?.message].filter(Boolean).join(": ") || "Unknown Lodgify error";
  const code = cause?.code || candidate?.code || "";
  if (candidate?.name === "AbortError" || /TIMEOUT|TIMED_OUT/i.test(code) || /timeout|timed out/i.test(message)) {
    return new LodgifyError("Lodgify request timed out", "timeout", operation, null, true, { cause: error });
  }
  if (/abort/i.test(message)) return new LodgifyError("Lodgify request was cancelled", "cancelled", operation, null, false, { cause: error });
  return new LodgifyError("Lodgify network request failed", "network", operation, null, true, { cause: error });
}
