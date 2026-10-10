import assert from "node:assert/strict";
import test from "node:test";
import { fetchCurrentUser, logoutRequest } from "../lib/auth-client";

test("logout client sends a valid empty JSON object", async () => {
  const original = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });

    if (url.endsWith("/api/session/csrf")) {
      return Response.json({ csrfToken: "a".repeat(64) });
    }

    return Response.json({ success: true });
  };

  try {
    await logoutRequest("cookie-session");
    const logoutCall = calls.find(({ url }) => url.endsWith("/api/session/auth/logout"));

    assert.ok(logoutCall);
    assert.equal(logoutCall.init?.method, "POST");
    assert.equal(logoutCall.init?.body, "{}");
  } finally {
    globalThis.fetch = original;
  }
});

test("session validation treats only 401 as signed out", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ message: "Unauthenticated" }, { status: 401 });
    assert.equal(await fetchCurrentUser("cookie-session"), null);

    globalThis.fetch = async () => Response.json({ message: "Service unavailable" }, { status: 503 });
    await assert.rejects(fetchCurrentUser("cookie-session"), (error: unknown) =>
      (error as { status?: number }).status === 503);
  } finally {
    globalThis.fetch = original;
  }
});
