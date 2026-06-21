const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";
export const AUTH_TOKEN_KEY = "summerhouses:auth-token";
export const AUTH_USER_KEY = "summerhouses:auth-user";

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

export async function registerRequest(name: string, email: string, password: string, passwordConfirmation: string): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
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
