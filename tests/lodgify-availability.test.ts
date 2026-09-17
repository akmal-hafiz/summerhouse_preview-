import assert from 'node:assert/strict';
import test from 'node:test';

// Importing the client does not perform requests. Use a dummy configuration
// so these pure availability tests never need real credentials or upstream IO.
process.env.LODGIFY_API_KEY = 'test-not-a-real-key';

test('missing availability is unknown, never available or sold out', async () => {
  const { buildAvailabilityMapFromItems, getRangeAvailabilityStatus } = await import('../lib/lodgify/availability');
  const map = buildAvailabilityMapFromItems([], 1, '2026-10-01', '2026-10-04');
  assert.equal(getRangeAvailabilityStatus(map, '2026-10-01', '2026-10-04'), 'unknown');
  assert.equal(map['2026-10-01'].available, false);
  assert.equal(map['2026-10-01'].reason, 'unknown');
});

test('partial availability does not imply the whole stay is available', async () => {
  const { buildAvailabilityMapFromItems, getRangeAvailabilityStatus } = await import('../lib/lodgify/availability');
  const map = buildAvailabilityMapFromItems([
    { property_id: 1, periods: [{ start: '2026-10-01', end: '2026-10-01', available: 1 }] },
  ], 1, '2026-10-01', '2026-10-04');
  assert.equal(getRangeAvailabilityStatus(map, '2026-10-01', '2026-10-04'), 'unknown');
});

test('confirmed blocked or booked stay is unavailable', async () => {
  const { buildAvailabilityMapFromItems, getRangeAvailabilityStatus } = await import('../lib/lodgify/availability');
  for (const period of [{ closed_period: true }, { bookings: [{ id: 1 }] }]) {
    const map = buildAvailabilityMapFromItems([
      { property_id: 1, periods: [{ start: '2026-10-01', end: '2026-10-04', available: 0, ...period }] },
    ], 1, '2026-10-01', '2026-10-04');
    assert.equal(getRangeAvailabilityStatus(map, '2026-10-01', '2026-10-04'), 'unavailable');
  }
});

test('checkout is not a booked night and other properties cannot overwrite availability', async () => {
  const { buildAvailabilityMapFromItems, getRangeAvailabilityStatus } = await import('../lib/lodgify/availability');
  const map = buildAvailabilityMapFromItems([
    { property_id: 1, periods: [{ start: '2026-10-01', end: '2026-10-03', available: 1 }] },
    { property_id: 2, periods: [{ start: '2026-10-01', end: '2026-10-04', available: 0 }] },
  ], 1, '2026-10-01', '2026-10-04');
  assert.equal(getRangeAvailabilityStatus(map, '2026-10-01', '2026-10-04'), 'available');
  assert.equal(getRangeAvailabilityStatus(map, 'invalid', '2026-10-04'), 'unknown');
});
