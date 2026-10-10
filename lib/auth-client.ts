let csrfToken: string | null = null;
let sessionPresent = false;
export const AUTH_TOKEN_KEY = "summerhouses:auth-token";
export const AUTH_USER_KEY = "summerhouses:auth-user";
export const AUTH_HINT_KEY = "summerhouses:last-user-hint";
const HINT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  isAdmin: boolean;
  avatarUrl?: string | null;
};

export type AuthResponse = {
  success: boolean;
  user?: AuthUser;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function sessionFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (init.method && init.method !== "GET" && !csrfToken) {
    const csrf = await fetch("/api/session/csrf", { cache: "no-store", credentials: "same-origin" });
    if (!csrf.ok) throw new Error("Unable to verify session");
    csrfToken = (await csrf.json()).csrfToken;
  }
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  return fetch(`/api/session/${path.replace(/^\/v1\//, "")}`, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      ...(!isForm ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
      ...(init.headers || {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
  });
}

export async function uploadAvatarRequest(file: File): Promise<AuthResponse> {
  const form = new FormData();
  form.set("avatar", file);
  return authFetch<AuthResponse>("/v1/auth/avatar", { method: "POST", body: form });
}

export async function removeAvatarRequest(): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/v1/auth/avatar", { method: "DELETE" });
}

async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await sessionFetch(path, init);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error((data as { message?: string }).message || "Request failed") as Error & {
      status: number;
      data: unknown;
    };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export type LookupResponse = {
  success: boolean;
  message?: string;
};

export async function lookupIdentifier(email: string): Promise<LookupResponse> {
  return authFetch<LookupResponse>("/v1/auth/lookup", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export type SendOtpResponse = {
  success: boolean;
  message?: string;
  expires_in?: number;
};

export async function sendRegistrationOtp(email: string, name: string): Promise<SendOtpResponse> {
  return authFetch<SendOtpResponse>("/v1/auth/register/send-otp", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
}

export async function verifyRegistrationOtp(
  name: string,
  email: string,
  code: string,
  password: string,
  passwordConfirmation: string
): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/v1/auth/register/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      code,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
}

export type ForgotPasswordResponse = {
  success: boolean;
  message?: string;
  expires_in?: number;
};

export async function sendPasswordResetOtp(email: string): Promise<ForgotPasswordResponse> {
  return authFetch<ForgotPasswordResponse>("/v1/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordRequest(
  email: string,
  code: string,
  password: string,
  passwordConfirmation: string
): Promise<{ success: boolean; message?: string }> {
  return authFetch<{ success: boolean; message?: string }>("/v1/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({
      email,
      code,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
}

export async function updateProfileRequest(token: string, name: string): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/v1/auth/profile", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function changePasswordRequest(
  token: string,
  currentPassword: string,
  password: string,
  passwordConfirmation: string
): Promise<{ success: boolean; message?: string }> {
  return authFetch<{ success: boolean; message?: string }>("/v1/auth/password", {
    method: "POST",
    body: JSON.stringify({
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
}

export async function logoutRequest(token: string): Promise<void> {
  await authFetch("/v1/auth/logout", {
    method: "POST",
    // The session boundary accepts JSON writes only. Keep logout bodyless at
    // the domain level while still sending a valid JSON object over HTTP.
    body: JSON.stringify({}),
  });
}

export async function fetchCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const data = await authFetch<AuthResponse>("/v1/auth/user", {
    });
    return data.user ?? null;
  } catch (error) {
    if ((error as { status?: number }).status === 401) return null;
    throw error;
  }
}

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  // Compatibility marker only, never a bearer credential.
  return sessionPresent ? "cookie-session" : null;
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  return null;
}

export function setStoredAuth(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  sessionPresent = true;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  sessionPresent = false;
}

// ─── Returning-user hint (Airbnb-style "Welcome back") ──────────────
// Survives logout. Cleared by explicit "Not you?" or TTL expiry.

export type AuthHint = {
  name: string;        // first name only
  email: string;       // full email — needed so login/OTP buttons work without retype
  maskedEmail: string; // display-only mask, e.g. "a***z@gmail.com"
  savedAt: number;     // epoch ms
};

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return `${local[0]}***${domain}`;
  return `${local[0]}***${local[local.length - 1]}${domain}`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function getAuthHint(): AuthHint | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_HINT_KEY);
  if (!raw) return null;
  try {
    const hint = JSON.parse(raw) as AuthHint;
    if (!hint?.email || !hint?.savedAt) return null;
    if (Date.now() - hint.savedAt > HINT_TTL_MS) {
      window.localStorage.removeItem(AUTH_HINT_KEY);
      return null;
    }
    return hint;
  } catch {
    return null;
  }
}

export function setAuthHint(user: AuthUser): void {
  if (typeof window === "undefined") return;
  const hint: AuthHint = {
    name: firstName(user.name),
    email: user.email,
    maskedEmail: maskEmail(user.email),
    savedAt: Date.now(),
  };
  window.localStorage.setItem(AUTH_HINT_KEY, JSON.stringify(hint));
}

export function clearAuthHint(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_HINT_KEY);
}
