"use client";

import "./auth-modal.css";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiX, FiLogIn, FiUserPlus, FiShield } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";

type Mode = "login" | "register";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
};

export default function AuthModal({ open, onClose, initialMode = "login" }: AuthModalProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminGate, setAdminGate] = useState<{ name: string; redirectUrl: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setError(null);
    setAdminGate(null);
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const adminUrl = (process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "http://localhost:8000/admin");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = mode === "login"
        ? await login(email, password)
        : await register(name, email, password, passwordConfirmation);

      if (user.isAdmin) {
        setAdminGate({ name: user.name, redirectUrl: adminUrl });
      } else {
        onClose();
        router.refresh();
      }
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      setError(firstError || data?.message || (err as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-modal-close" aria-label="Close" onClick={onClose}>
          <FiX aria-hidden="true" />
        </button>

        {adminGate ? (
          <div className="auth-modal-admin-gate">
            <div className="auth-modal-admin-icon"><FiShield aria-hidden="true" /></div>
            <p className="auth-modal-eyebrow">Welcome back</p>
            <h2>{adminGate.name}</h2>
            <p className="auth-modal-admin-copy">
              Admin access detected. Continue to the CMS dashboard.
            </p>
            <a className="auth-modal-submit" href={adminGate.redirectUrl}>Open admin dashboard</a>
            <button type="button" className="auth-modal-secondary" onClick={onClose}>Stay on site</button>
          </div>
        ) : (
          <>
            <div className="auth-modal-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={mode === "login" ? "is-active" : ""}
                onClick={() => { setMode("login"); setError(null); }}
              >
                <FiLogIn aria-hidden="true" />
                <span>Sign in</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={mode === "register" ? "is-active" : ""}
                onClick={() => { setMode("register"); setError(null); }}
              >
                <FiUserPlus aria-hidden="true" />
                <span>Create account</span>
              </button>
            </div>

            <div className="auth-modal-copy">
              <p className="auth-modal-eyebrow">Summerhouses Bali</p>
              <h2>{mode === "login" ? "Welcome back" : "Join Summerhouses"}</h2>
              <p>
                {mode === "login"
                  ? "Sign in to keep your saved villas synced across devices."
                  : "Create an account to save villas and start planning your stay."}
              </p>
            </div>

            <form className="auth-modal-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={mode === "register" ? 8 : undefined}
                />
              </label>

              {mode === "register" && (
                <label>
                  <span>Confirm Password</span>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </label>
              )}

              {error && <p className="auth-modal-error">{error}</p>}

              <button type="submit" className="auth-modal-submit" disabled={isSubmitting}>
                {isSubmitting ? "..." : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="auth-modal-footer">
              {mode === "login" ? (
                <>New here? <button type="button" onClick={() => setMode("register")}>Create an account</button></>
              ) : (
                <>Already have an account? <button type="button" onClick={() => setMode("login")}>Sign in</button></>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
