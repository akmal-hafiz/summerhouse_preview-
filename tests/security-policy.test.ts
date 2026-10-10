import assert from "node:assert/strict";
import test from "node:test";
import { allowedSessionRoute, sessionOriginAllowed } from "../lib/security/session-policy";
import { sanitizeLogText } from "../lib/security/logger";
import { readValidatedCmsResponse } from "../lib/security/cms-response";
import { getTrustedClientIp, rateLimitRequest } from "../lib/security/rateLimit";
import { NextRequest } from "next/server";

test("session proxy permits only fixed customer routes and methods", () => {
  assert.equal(allowedSessionRoute("auth/login", "POST"), true);
  assert.equal(allowedSessionRoute("wishlist/123", "DELETE"), true);
  for (const path of ["https://evil.test", "../admin", "auth/login?target=admin", "wishlist/../admin", "cms/settings"]) {
    assert.equal(allowedSessionRoute(path, "POST"), false);
  }
  assert.equal(allowedSessionRoute("auth/login", "GET"), false);
});

test("write origin allowlist matches exactly and rejects missing or suffix origins", () => {
  const previous = process.env.SESSION_ALLOWED_ORIGINS;
  process.env.SESSION_ALLOWED_ORIGINS = "https://summerhouses.test";
  try {
    assert.equal(sessionOriginAllowed(null, "https://summerhouses.test"), false);
    assert.equal(sessionOriginAllowed("https://summerhouses.test.evil.test", "https://summerhouses.test"), false);
    assert.equal(sessionOriginAllowed("https://summerhouses.test", "http://internal"), true);
  } finally {
    if (previous === undefined) delete process.env.SESSION_ALLOWED_ORIGINS;
    else process.env.SESSION_ALLOWED_ORIGINS = previous;
  }
});

test("logs redact values as well as keys, credentials, email and control characters", () => {
  process.env.TEST_SECRET_KEY = "secret-for-log-test";
  try {
    const result = sanitizeLogText("secret-for-log-test https://alice:password@example.test/path?token=rawtoken Bearer credential guest@example.test\nnext");
    for (const secret of ["secret-for-log-test", "password", "rawtoken", "credential", "guest@example.test", "\n"]) assert.equal(result.includes(secret), false);
    assert.ok(sanitizeLogText("a".repeat(5000)).length <= 2000);
  } finally { delete process.env.TEST_SECRET_KEY; }
});

test("CMS cache candidates reject HTML, HTTP failures and malformed snapshot schema", async () => {
  const path = "/v1/cms/lodgify/snapshot";
  for (const response of [new Response('<br>error', { headers: { 'Content-Type': 'text/html' } }),
    Response.json({ success: true }, { status: 500 }), Response.json({ success: false }),
    Response.json({ success: true, properties: [{ property: { id: 1 }, rooms: 'invalid' }] })]) {
    await assert.rejects(() => readValidatedCmsResponse(response, path));
  }
  const valid = { success: true, properties: [{ property: { id: 1 }, rooms: [] }] };
  assert.deepEqual(await readValidatedCmsResponse(Response.json(valid), path), valid);
});

test("untrusted forwarding headers cannot bypass limits", () => {
  const previous = process.env.TRUSTED_CLIENT_IP_HEADER;
  delete process.env.TRUSTED_CLIENT_IP_HEADER;
  try {
    const first = new NextRequest('http://localhost/test', { headers: { 'x-forwarded-for': '1.2.3.4' } });
    const second = new NextRequest('http://localhost/test', { headers: { 'x-forwarded-for': '5.6.7.8' } });
    assert.equal(getTrustedClientIp(first), null);
    assert.equal(rateLimitRequest(first, { key: 'spoof-test', limit: 1 }), null);
    assert.equal(rateLimitRequest(second, { key: 'spoof-test', limit: 1 })?.status, 429);
    process.env.TRUSTED_CLIENT_IP_HEADER = 'x-real-ip';
    assert.equal(getTrustedClientIp(new NextRequest('http://localhost/test', { headers: { 'x-real-ip': 'invalid' } })), null);
    assert.equal(getTrustedClientIp(new NextRequest('http://localhost/test', { headers: { 'x-real-ip': '192.0.2.1' } })), '192.0.2.1');
  } finally {
    if (previous === undefined) delete process.env.TRUSTED_CLIENT_IP_HEADER;
    else process.env.TRUSTED_CLIENT_IP_HEADER = previous;
  }
});
