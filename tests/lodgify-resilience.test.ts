import assert from 'node:assert/strict';
import test from 'node:test';
import { errorKindForStatus, isRetriableStatus, LodgifyError, normalizeLodgifyError } from '../lib/lodgify/errors';
import { lodgifyResilienceConfig, mapWithConcurrency, withLodgifyResilience } from '../lib/lodgify/resilience';

test('HTTP classification retries transient failures only', () => {
  for (const status of [429, 500, 502, 503, 504]) assert.equal(isRetriableStatus(status), true);
  for (const status of [400, 401, 403, 404, 422]) assert.equal(isRetriableStatus(status), false);
  assert.equal(errorKindForStatus(401), 'authentication');
  assert.equal(errorKindForStatus(403), 'authentication');
  assert.equal(errorKindForStatus(404), 'not_found');
  assert.equal(errorKindForStatus(429), 'rate_limited');
  assert.equal(errorKindForStatus(503), 'server_error');
});

test('nested connect timeout is normalized without exposing upstream details', () => {
  const error = normalizeLodgifyError(new TypeError('fetch failed', {
    cause: { code: 'UND_ERR_CONNECT_TIMEOUT', message: 'Connect Timeout Error' },
  }), 'rooms');
  assert.equal(error.kind, 'timeout');
  assert.equal(error.retriable, true);
  assert.equal(error.message, 'Lodgify request timed out');
  assert.equal(normalizeLodgifyError(error, 'rooms'), error);
});

test('rooms concurrency is bounded and output order is stable', async () => {
  let active = 0;
  let peak = 0;
  const values = await mapWithConcurrency(Array.from({ length: 40 }, (_, i) => i), 5, async (value) => {
    active++;
    peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, value % 3));
    active--;
    return value * 2;
  });
  assert.equal(peak, 5);
  assert.deepEqual(values, Array.from({ length: 40 }, (_, i) => i * 2));
  assert.deepEqual(await mapWithConcurrency([], 5, async value => value), []);
});

test('one transient retry recovers, permanent errors never retry', async () => {
  let attempts = 0;
  const previous = lodgifyResilienceConfig.maxRetries;
  lodgifyResilienceConfig.maxRetries = 1;
  try {
    assert.equal(await withLodgifyResilience('test-recovery', async () => {
      if (++attempts === 1) throw new LodgifyError('Timeout', 'timeout', 'test', null, true);
      return 'recovered';
    }), 'recovered');
    assert.equal(attempts, 2);
    for (const status of [401, 403, 404]) {
      attempts = 0;
      await assert.rejects(withLodgifyResilience('test-permanent', async () => {
        attempts++;
        throw new LodgifyError('Permanent', errorKindForStatus(status), 'test', status, false);
      }), LodgifyError);
      assert.equal(attempts, 1);
    }
  } finally {
    lodgifyResilienceConfig.maxRetries = previous;
  }
});

test('circuit stops additional requests and permits one recovery probe', async () => {
  const previous = { ...lodgifyResilienceConfig };
  Object.assign(lodgifyResilienceConfig, { maxRetries: 0, circuitFailureThreshold: 2, circuitCooldownMs: 60_000 });
  let calls = 0;
  try {
    for (let i = 0; i < 2; i++) {
      await assert.rejects(withLodgifyResilience('test-open', async () => {
        calls++;
        throw new LodgifyError('Unavailable', 'server_error', 'test', 503, true);
      }), LodgifyError);
    }
    await assert.rejects(withLodgifyResilience('test-blocked', async () => {
      calls++;
    }), (error: unknown) => error instanceof LodgifyError && error.kind === 'circuit_open');
    assert.equal(calls, 2);
    lodgifyResilienceConfig.circuitCooldownMs = 0;
    let finishProbe!: (value: string) => void;
    const probe = withLodgifyResilience('test-probe', () => new Promise<string>(resolve => { finishProbe = resolve; }));
    await assert.rejects(withLodgifyResilience('test-second-probe', async () => 'blocked'),
      (error: unknown) => error instanceof LodgifyError && error.kind === 'circuit_open');
    finishProbe('healthy');
    assert.equal(await probe, 'healthy');
    assert.equal(await withLodgifyResilience('test-closed', async () => 'healthy'), 'healthy');
  } finally {
    lodgifyResilienceConfig.circuitCooldownMs = 0;
    await withLodgifyResilience('test-cleanup', async () => true);
    Object.assign(lodgifyResilienceConfig, previous);
  }
});
