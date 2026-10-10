import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { GET, POST } from "../app/api/session/[...path]/route";

const origin = "http://localhost:3100";
const nonce = "a".repeat(64);
const context = (path: string) => ({ params: Promise.resolve({ path: path.split("/") }) });
function writeRequest(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`${origin}/api/session/${path}`, { method: "POST", headers: {
    origin, cookie: `smh-csrf=${nonce}`, "x-csrf-token": nonce,
    "content-type": "application/json", ...headers,
  }, body: JSON.stringify({ email: "GUEST@EXAMPLE.TEST", password: "test-password" }) });
}

test("session boundary refuses CSRF failures before contacting upstream", async () => {
  const previous = process.env.SESSION_ALLOWED_ORIGINS;
  process.env.SESSION_ALLOWED_ORIGINS = origin;
  try {
    const invalidHeaders: Record<string, string>[] = [{ origin: "https://evil.test" }, { "x-csrf-token": "invalid" }, { cookie: "" }];
    for (const headers of invalidHeaders) {
      const response = await POST(writeRequest("auth/login", headers), context("auth/login"));
      assert.equal(response.status, 403);
    }
  } finally {
    if (previous === undefined) delete process.env.SESSION_ALLOWED_ORIGINS;
    else process.env.SESSION_ALLOWED_ORIGINS = previous;
  }
});

test("login keeps bearer token HttpOnly and strips it from public payload", async () => {
  const original = globalThis.fetch;
  const previous = process.env.SESSION_ALLOWED_ORIGINS;
  process.env.SESSION_ALLOWED_ORIGINS = origin;
  let forwarded = "";
  globalThis.fetch = async (_url, init) => {
    assert.equal(new Headers(init?.headers).has("authorization"), false);
    forwarded = String(init?.body);
    return Response.json({ success: true, user: { id: 1 }, token: "private-bearer-test" });
  };
  try {
    const response = await POST(writeRequest("auth/login", { authorization: "Bearer attacker" }), context("auth/login"));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).token, undefined);
    assert.match(response.headers.get("set-cookie") || "", /HttpOnly/i);
    assert.match(response.headers.get("set-cookie") || "", /SameSite=lax/i);
    assert.equal(JSON.parse(forwarded).email, "guest@example.test");
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.SESSION_ALLOWED_ORIGINS;
    else process.env.SESSION_ALLOWED_ORIGINS = previous;
  }
});

test("logout accepts a bodyless legacy request and always clears the session cookie", async () => {
  const original = globalThis.fetch;
  const previous = process.env.SESSION_ALLOWED_ORIGINS;
  process.env.SESSION_ALLOWED_ORIGINS = origin;
  let forwardedBody = "unset";
  globalThis.fetch = async (_url, init) => {
    forwardedBody = String(init?.body);
    return Response.json({ success: true });
  };

  try {
    const request = new NextRequest(`${origin}/api/session/auth/logout`, {
      method: "POST",
      headers: {
        origin,
        cookie: `smh-session=private-session; smh-csrf=${nonce}`,
        "x-csrf-token": nonce,
        "content-type": "application/json",
      },
    });
    const response = await POST(request, context("auth/logout"));

    assert.equal(response.status, 200);
    assert.equal(forwardedBody, "{}");
    assert.match(response.headers.get("set-cookie") || "", /Max-Age=0/i);
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.SESSION_ALLOWED_ORIGINS;
    else process.env.SESSION_ALLOWED_ORIGINS = previous;
  }
});

test("logout clears the browser credential when the upstream service fails", async () => {
  const original = globalThis.fetch;
  const previous = process.env.SESSION_ALLOWED_ORIGINS;
  process.env.SESSION_ALLOWED_ORIGINS = origin;
  globalThis.fetch = async () => { throw new TypeError("network unavailable"); };

  try {
    const request = new NextRequest(`${origin}/api/session/auth/logout`, {
      method: "POST",
      headers: {
        origin,
        cookie: `smh-session=private-session; smh-csrf=${nonce}`,
        "x-csrf-token": nonce,
        "content-type": "application/json",
      },
      body: "{}",
    });
    const response = await POST(request, context("auth/logout"));

    assert.equal(response.status, 503);
    assert.match(response.headers.get("set-cookie") || "", /Max-Age=0/i);
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.SESSION_ALLOWED_ORIGINS;
    else process.env.SESSION_ALLOWED_ORIGINS = previous;
  }
});

test("session GET is never cached and expired upstream session clears cookie", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ message: "Unauthenticated" }, { status: 401 });
  try {
    const response = await GET(new NextRequest(`${origin}/api/session/auth/user`, { headers: { cookie: "smh-session=expired" } }), context("auth/user"));
    assert.equal(response.status, 401);
    assert.match(response.headers.get("cache-control") || "", /no-store/);
    assert.match(response.headers.get("set-cookie") || "", /Max-Age=0/i);
  } finally { globalThis.fetch = original; }
});

test("avatar upload forwards only a bounded multipart body with the session credential", async () => {
  const original = globalThis.fetch;
  const previous = process.env.SESSION_ALLOWED_ORIGINS;
  process.env.SESSION_ALLOWED_ORIGINS = origin;
  let forwarded = false;
  globalThis.fetch = async (_url, init) => {
    forwarded = true;
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer private-session");
    assert.match(new Headers(init?.headers).get("content-type") || "", /^multipart\/form-data; boundary=/);
    assert.ok(init?.body instanceof ArrayBuffer);
    return Response.json({ success: true, user: { id: 1, avatarUrl: "https://example.test/avatar.webp" } });
  };
  try {
    const headers = { origin, cookie: `smh-session=private-session; smh-csrf=${nonce}`, "x-csrf-token": nonce, "content-type": "multipart/form-data; boundary=avatar-test" };
    const small = await POST(new NextRequest(`${origin}/api/session/auth/avatar`, { method: "POST", headers, body: "--avatar-test\r\nContent-Disposition: form-data; name=\"avatar\"; filename=\"a.jpg\"\r\n\r\nx\r\n--avatar-test--" }), context("auth/avatar"));
    assert.equal(small.status, 200);
    assert.equal(forwarded, true);

    forwarded = false;
    const large = await POST(new NextRequest(`${origin}/api/session/auth/avatar`, { method: "POST", headers, body: "x".repeat(3_300_001) }), context("auth/avatar"));
    assert.equal(large.status, 413);
    assert.equal(forwarded, false);
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.SESSION_ALLOWED_ORIGINS;
    else process.env.SESSION_ALLOWED_ORIGINS = previous;
  }
});
