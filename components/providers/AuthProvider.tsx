"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  changePasswordRequest,
  clearStoredAuth,
  fetchCurrentUser,
  getStoredAuthToken,
  getStoredAuthUser,
  loginRequest,
  logoutRequest,
  sendRegistrationOtp,
  setAuthHint,
  updateProfileRequest,
  verifyRegistrationOtp,
  setStoredAuth,
  type AuthUser,
  type SendOtpResponse,
} from "@/lib/auth-client";
import { hydrateWishlistFromRemote, writeSavedVillaIds } from "@/components/villas/savedVillas";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  sendOtp: (email: string, name: string) => Promise<SendOtpResponse>;
  verifyOtp: (name: string, email: string, code: string, password: string, passwordConfirmation: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<AuthUser>;
  changePassword: (currentPassword: string, password: string, passwordConfirmation: string) => Promise<{ success: boolean; message?: string }>;
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
    setAuthHint(response.user);
    setUser(response.user);
    setToken(response.token);
    hydrateWishlistFromRemote().catch(() => undefined);
    return response.user;
  }, []);

  const sendOtp = useCallback(async (email: string, name: string) => {
    return sendRegistrationOtp(email, name);
  }, []);

  const verifyOtp = useCallback(
    async (name: string, email: string, code: string, password: string, passwordConfirmation: string) => {
      const response = await verifyRegistrationOtp(name, email, code, password, passwordConfirmation);
      if (!response.success || !response.user || !response.token) {
        throw new Error(response.message || "OTP verification failed");
      }
      setStoredAuth(response.token, response.user);
      setAuthHint(response.user);
      setUser(response.user);
      setToken(response.token);
      hydrateWishlistFromRemote().catch(() => undefined);
      return response.user;
    },
    []
  );

  const updateProfile = useCallback(async (nextName: string) => {
    if (!token) throw new Error("Not authenticated");
    const response = await updateProfileRequest(token, nextName);
    if (!response.success || !response.user) {
      throw new Error(response.message || "Failed to update profile");
    }
    setStoredAuth(token, response.user);
    setUser(response.user);
    return response.user;
  }, [token]);

  const changePassword = useCallback(async (currentPassword: string, password: string, passwordConfirmation: string) => {
    if (!token) throw new Error("Not authenticated");
    return changePasswordRequest(token, currentPassword, password, passwordConfirmation);
  }, [token]);

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
      sendOtp,
      verifyOtp,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, token, isLoading, login, sendOtp, verifyOtp, logout, updateProfile, changePassword]
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
