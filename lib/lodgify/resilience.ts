import { LodgifyError } from "./errors";

function intFromEnv(name: string, fallback: number, min: number, max: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.trunc(parsed))) : fallback;
}

export const lodgifyResilienceConfig = {
  timeoutMs: intFromEnv("LODGIFY_REQUEST_TIMEOUT_MS", 12_000, 2_000, 30_000),
  maxRetries: intFromEnv("LODGIFY_MAX_RETRIES", 1, 0, 1),
  retryBaseDelayMs: intFromEnv("LODGIFY_RETRY_BASE_DELAY_MS", 300, 50, 2_000),
  roomsConcurrency: intFromEnv("LODGIFY_ROOMS_CONCURRENCY", 5, 1, 10),
  circuitFailureThreshold: intFromEnv("LODGIFY_CIRCUIT_FAILURE_THRESHOLD", 5, 2, 20),
  circuitWindowMs: intFromEnv("LODGIFY_CIRCUIT_WINDOW_MS", 60_000, 10_000, 300_000),
  circuitCooldownMs: intFromEnv("LODGIFY_CIRCUIT_COOLDOWN_MS", 60_000, 10_000, 300_000),
};

class CircuitBreaker {
  private state: "closed" | "open" | "half_open" = "closed";
  private failures: number[] = [];
  private openedAt = 0;
  private probeInFlight = false;

  assertAllowed(operation: string) {
    const now = Date.now();
    if (this.state === "open" && now - this.openedAt >= lodgifyResilienceConfig.circuitCooldownMs) {
      this.state = "half_open";
      this.probeInFlight = false;
    }
    if (this.state === "open" || (this.state === "half_open" && this.probeInFlight)) {
      throw new LodgifyError("Lodgify circuit is temporarily open", "circuit_open", operation);
    }
    if (this.state === "half_open") this.probeInFlight = true;
  }

  success() {
    this.state = "closed";
    this.failures = [];
    this.probeInFlight = false;
  }

  failure(error: LodgifyError) {
    this.probeInFlight = false;
    if (!error.retriable) return;
    const now = Date.now();
    this.failures = this.failures.filter((time) => now - time <= lodgifyResilienceConfig.circuitWindowMs);
    this.failures.push(now);
    if (this.state === "half_open" || this.failures.length >= lodgifyResilienceConfig.circuitFailureThreshold) {
      this.state = "open";
      this.openedAt = now;
    }
  }
}

const breaker = new CircuitBreaker();
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withLodgifyResilience<T>(operation: string, request: () => Promise<T>): Promise<T> {
  breaker.assertAllowed(operation);
  let lastError: LodgifyError | undefined;
  for (let attempt = 0; attempt <= lodgifyResilienceConfig.maxRetries; attempt += 1) {
    try {
      const value = await request();
      breaker.success();
      return value;
    } catch (error) {
      lastError = error instanceof LodgifyError ? error : new LodgifyError("Lodgify request failed", "network", operation, null, true, { cause: error });
      if (!lastError.retriable || attempt >= lodgifyResilienceConfig.maxRetries) {
        breaker.failure(lastError);
        throw lastError;
      }
      const jitter = Math.floor(Math.random() * lodgifyResilienceConfig.retryBaseDelayMs);
      await wait(lodgifyResilienceConfig.retryBaseDelayMs * (2 ** attempt) + jitter);
    }
  }
  throw lastError;
}

export async function mapWithConcurrency<T, R>(items: T[], limit: number, mapper: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(Math.max(1, limit), items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
