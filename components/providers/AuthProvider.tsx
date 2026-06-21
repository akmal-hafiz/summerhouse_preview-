"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  clearStoredAuth,
  fetchCurrentUser,
  getStoredAuthToken,
  getStoredAuthUser,
  loginRequest,
  logoutRequest,
  registerRequest,
  setStoredAuth,
  type AuthUser,
} from "@/lib/auth-client";
import { hydrateWishlistFromRemote, writeSavedVillaIds } from "@/components/villas/savedVillas";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    const storedUser = getStoredAuthUser();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(storedUser);

    fetchCurrentUser(storedToken)
      .then((freshUser) => {
        if (freshUser) {
          setUser(freshUser);
          setStoredAuth(storedToken, freshUser);
          hydrateWishlistFromRemote().catch(() => undefined);
        } else {
          clearStoredAuth();
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    if (!response.success || !response.user || !response.token) {
      throw new Error(response.message || "Login failed");
    }
    setStoredAuth(response.token, response.user);
    setUser(response.user);
    setToken(response.token);
    hydrateWishlistFromRemote().catch(() => undefined);
    return response.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const response = await registerRequest(name, email, password, passwordConfirmation);
    if (!response.success || !response.user || !response.token) {
      throw new Error(response.message || "Registration failed");
    }
    setStoredAuth(response.token, response.user);
    setUser(response.user);
    setToken(response.token);
    hydrateWishlistFromRemote().catch(() => undefined);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await logoutRequest(token);
    }
    clearStoredAuth();
    writeSavedVillaIds([]);
    setUser(null);
    setToken(null);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.isAdmin ?? false,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
