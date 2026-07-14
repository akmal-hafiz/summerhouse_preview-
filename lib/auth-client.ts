const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";
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
};

export type AuthResponse = {
  success: boolean;
  user?: AuthUser;
  token?: string;
  errors?: Record<string, string[]>;
  message?: string;
};

async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${CMS_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });

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
  exists: boolean;
  name?: string;
  masked_email?: string;
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
    headers: { Authorization: `Bearer ${token}` },
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
    headers: { Authorization: `Bearer ${token}` },
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
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => undefined);
}

export async function fetchCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const data = await authFetch<AuthResponse>("/v1/auth/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
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
