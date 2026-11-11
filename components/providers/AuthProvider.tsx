"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  changePasswordRequest,
  clearStoredAuth,
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  uploadAvatarRequest,
  removeAvatarRequest,
  sendRegistrationOtp,
  sendAccountVerificationOtp,
  setAuthHint,
  updateProfileRequest,
  verifyRegistrationOtp,
  verifyAccountEmailOtp,
  setStoredAuth,
  type AuthUser,
  type SendOtpResponse,
} from "@/lib/auth-client";
import { clearSavedVillaIds, hydrateWishlistFromRemote, SAVED_VILLAS_SESSION_EXPIRED_EVENT } from "@/components/villas/savedVillas";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  authError: boolean;
  wishlistStatus: "loading" | "ready" | "error";
  refreshWishlist: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  sendOtp: (email: string, name: string) => Promise<SendOtpResponse>;
  verifyOtp: (name: string, email: string, code: string, password: string, passwordConfirmation: string) => Promise<AuthUser>;
  sendEmailVerification: () => Promise<SendOtpResponse>;
  verifyEmail: (code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<AuthUser>;
  uploadAvatar: (file: File) => Promise<AuthUser>;
  removeAvatar: () => Promise<AuthUser>;
  changePassword: (currentPassword: string, password: string, passwordConfirmation: string) => Promise<{ success: boolean; message?: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState<"loading" | "ready" | "error">("loading");
  const wishlistRequestId = useRef(0);

  useEffect(() => {
    const expireSession = () => {
      wishlistRequestId.current += 1;
      clearStoredAuth();
      clearSavedVillaIds();
      setUser(null);
      setToken(null);
      setWishlistStatus("loading");
    };
    window.addEventListener(SAVED_VILLAS_SESSION_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(SAVED_VILLAS_SESSION_EXPIRED_EVENT, expireSession);
  }, []);

  const refreshWishlist = useCallback(async (userId?: number) => {
    if (!userId && user?.isAdmin) { clearSavedVillaIds(); setWishlistStatus("ready"); return; }
    const id = userId ?? user?.id;
    if (!id) return;
    const requestId = ++wishlistRequestId.current;
    setWishlistStatus("loading");
    const success = await hydrateWishlistFromRemote(id).catch(() => false);
    if (requestId === wishlistRequestId.current) {
      setWishlistStatus(success ? "ready" : "error");
    }
  }, [user?.id, user?.isAdmin]);

  useEffect(() => {
    let isMounted = true;
    clearStoredAuth(); // Remove legacy browser credentials, validate the server cookie.
    const storedToken = "cookie-session";

    fetchCurrentUser(storedToken)
      .then((freshUser) => {
        if (!isMounted) return;

        if (freshUser) {
          setUser(freshUser);
          setToken(storedToken);
          setStoredAuth(storedToken, freshUser);
          if (!freshUser.isAdmin) void refreshWishlist(freshUser.id);
          else { clearSavedVillaIds(); setWishlistStatus("ready"); }
        } else {
          clearStoredAuth();
          clearSavedVillaIds();
          setUser(null);
          setToken(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setAuthError(true);
        setWishlistStatus("error");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  // Initial session validation runs once; refreshWishlist only needs the returned user ID.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    if (!response.success || !response.user) {
      throw new Error(response.message || "Sign-in failed");
    }
    setStoredAuth("cookie-session", response.user);
    setAuthHint(response.user);
    setAuthError(false);
    setUser(response.user);
    setToken("cookie-session");
    if (!response.user.isAdmin) void refreshWishlist(response.user.id);
    else { clearSavedVillaIds(); setWishlistStatus("ready"); }
    return response.user;
  }, [refreshWishlist]);

  const sendOtp = useCallback(async (email: string, name: string) => {
    return sendRegistrationOtp(email, name);
  }, []);

  const verifyOtp = useCallback(
    async (name: string, email: string, code: string, password: string, passwordConfirmation: string) => {
      const response = await verifyRegistrationOtp(name, email, code, password, passwordConfirmation);
      if (!response.success || !response.user) {
        throw new Error(response.message || "OTP verification failed");
      }
      setStoredAuth("cookie-session", response.user);
      setAuthHint(response.user);
      setAuthError(false);
      setUser(response.user);
      setToken("cookie-session");
      void refreshWishlist(response.user.id);
      return response.user;
    },
    [refreshWishlist]
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

  const sendEmailVerification = useCallback(async () => {
    if (!token) throw new Error("Not authenticated");
    return sendAccountVerificationOtp();
  }, [token]);

  const verifyEmail = useCallback(async (code: string) => {
    if (!token) throw new Error("Not authenticated");
    const response = await verifyAccountEmailOtp(code);
    if (!response.success || !response.user) throw new Error(response.message || "Could not verify email");
    setUser(response.user);
    return response.user;
  }, [token]);

  const changePassword = useCallback(async (currentPassword: string, password: string, passwordConfirmation: string) => {
    if (!token) throw new Error("Not authenticated");
    return changePasswordRequest(token, currentPassword, password, passwordConfirmation);
  }, [token]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutRequest(token);
      }
    } catch {
      // The session boundary records operational failures and clears the
      // HttpOnly credential. Signing out should remain idempotent for the UI.
    } finally {
      // Logging out is a local security boundary too. Never leave stale UI or
      // browser state behind when the upstream service is temporarily down.
      wishlistRequestId.current += 1;
      clearStoredAuth();
      clearSavedVillaIds();
      setUser(null);
      setToken(null);
      setWishlistStatus("loading");
    }
  }, [token]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!token) throw new Error("Not authenticated");
    const response = await uploadAvatarRequest(file);
    if (!response.success || !response.user) throw new Error(response.message || "Could not upload photo");
    setUser(response.user);
    return response.user;
  }, [token]);

  const removeAvatar = useCallback(async () => {
    if (!token) throw new Error("Not authenticated");
    const response = await removeAvatarRequest();
    if (!response.success || !response.user) throw new Error(response.message || "Could not remove photo");
    setUser(response.user);
    return response.user;
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.isAdmin ?? false,
      isLoading,
      authError,
      wishlistStatus,
      refreshWishlist: async () => refreshWishlist(),
      login,
      sendOtp,
      verifyOtp,
      sendEmailVerification,
      verifyEmail,
      logout,
      updateProfile,
      uploadAvatar,
      removeAvatar,
      changePassword,
    }),
    [user, token, isLoading, authError, wishlistStatus, refreshWishlist, login, sendOtp, verifyOtp, sendEmailVerification, verifyEmail, logout, updateProfile, uploadAvatar, removeAvatar, changePassword]
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
