export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export function allowedSessionRoute(path: string, method: string): boolean {
  const fixed: Record<string, string[]> = {
    "auth/login": ["POST"], "auth/lookup": ["POST"],
    "auth/register/send-otp": ["POST"], "auth/register/verify-otp": ["POST"],
    "auth/password/forgot": ["POST"], "auth/password/reset": ["POST"],
    "auth/logout": ["POST"], "auth/user": ["GET"],
    "auth/profile": ["POST"], "auth/avatar": ["POST", "DELETE"], "auth/password": ["POST"],
    wishlist: ["GET", "POST"], "wishlist/sync": ["POST"],
  };
  return fixed[path]?.includes(method) === true ||
    (method === "DELETE" && /^wishlist\/[1-9]\d{0,15}$/.test(path));
}

export function sessionOriginAllowed(origin: string | null, requestOrigin: string): boolean {
  if (!origin) return false;
  const configured = (process.env.SESSION_ALLOWED_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean);
  if (process.env.NODE_ENV !== "production" && configured.length === 0) {
    return origin === requestOrigin;
  }
  return configured.includes(origin);
}
