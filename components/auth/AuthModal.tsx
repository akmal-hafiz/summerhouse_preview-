"use client";

import "./auth-modal.css";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiX, FiLogIn, FiUserPlus, FiShield } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";
import OtpDigitInput from "./OtpDigitInput";
import CountdownRing from "./CountdownRing";
import AuthStatusBanner from "./AuthStatusBanner";
import PasswordInput from "./PasswordInput";

type Mode = "login" | "register";
type RegisterStep = "details" | "otp";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
};

export default function AuthModal({ open, onClose, initialMode = "login" }: AuthModalProps) {
  const router = useRouter();
  const { login, sendOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [registerStep, setRegisterStep] = useState<RegisterStep>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<"sending-otp" | "verifying" | "logging-in" | null>(null);
  const [otpHasError, setOtpHasError] = useState(false);
  const [adminGate, setAdminGate] = useState<{ name: string; redirectUrl: string } | null>(null);

  const OTP_TOTAL_SECONDS = 600;

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setRegisterStep("details");
    setError(null);
    setInfo(null);
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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!open) return null;

  const adminUrl = (process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "http://localhost:8000/admin");

  const handleSendOtp = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    setPendingAction("sending-otp");
    try {
      if (password !== passwordConfirmation) {
        throw new Error("Passwords do not match");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      const response = await sendOtp(email, name);
      if (!response.success) {
        throw new Error(response.message || "Failed to send OTP");
      }
      const expiresInSec = response.expires_in ?? OTP_TOTAL_SECONDS;
      setOtpExpiresAt(Date.now() + expiresInSec * 1000);
      setResendCooldown(60);
      setRegisterStep("otp");
      setOtpCode("");
      setOtpHasError(false);
      setInfo(`Kode 6 digit terkirim ke ${email}. Cek inbox dan folder spam.`);
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      setError(firstError || data?.message || (err as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        setPendingAction("logging-in");
        const user = await login(email, password);
        if (user.isAdmin) {
          setAdminGate({ name: user.name, redirectUrl: adminUrl });
        } else {
          onClose();
          router.refresh();
        }
      } else {
        if (registerStep === "details") {
          await handleSendOtp();
        } else {
          setPendingAction("verifying");
          const user = await verifyOtp(name, email, otpCode, password, passwordConfirmation);
          setInfo("Akun berhasil dibuat. Mengalihkan...");
          if (user.isAdmin) {
            setAdminGate({ name: user.name, redirectUrl: adminUrl });
          } else {
            onClose();
            router.refresh();
          }
        }
      }
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      if (registerStep === "otp") {
        setOtpHasError(true);
        setTimeout(() => setOtpHasError(false), 400);
      }
      setError(firstError || data?.message || (err as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
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
                onClick={() => { setMode("login"); setRegisterStep("details"); setError(null); setInfo(null); }}
              >
                <FiLogIn aria-hidden="true" />
                <span>Sign in</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={mode === "register" ? "is-active" : ""}
                onClick={() => { setMode("register"); setRegisterStep("details"); setError(null); setInfo(null); }}
              >
                <FiUserPlus aria-hidden="true" />
                <span>Create account</span>
              </button>
            </div>

            <div className="auth-modal-copy">
              <p className="auth-modal-eyebrow">Summerhouses Bali</p>
              <h2>
                {mode === "login"
                  ? "Welcome back"
                  : registerStep === "otp"
                    ? "Check your email"
                    : "Join Summerhouses"}
              </h2>
              <p>
                {mode === "login"
                  ? "Sign in to keep your saved villas synced across devices."
                  : registerStep === "otp"
                    ? `Kami mengirim kode 6 digit ke ${email}.`
                    : "Create an account to save villas and start planning your stay."}
              </p>
            </div>

            <form className="auth-modal-form" onSubmit={handleSubmit}>
              {mode === "register" && registerStep === "details" && (
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

              {(mode === "login" || (mode === "register" && registerStep === "details")) && (
                <>
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
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      required
                      minLength={mode === "register" ? 8 : undefined}
                    />
                  </label>
                </>
              )}

              {mode === "register" && registerStep === "details" && (
                <label>
                  <span>Confirm Password</span>
                  <PasswordInput
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </label>
              )}

              {mode === "register" && registerStep === "otp" && (
                <div className="auth-otp-cluster">
                  <OtpDigitInput
                    value={otpCode}
                    onChange={(next) => { setOtpCode(next); if (otpHasError) setOtpHasError(false); }}
                    disabled={isSubmitting}
                    hasError={otpHasError}
                  />
                  <div className="auth-otp-meta-row">
                    <CountdownRing
                      expiresAt={otpExpiresAt}
                      totalSeconds={OTP_TOTAL_SECONDS}
                      label="left"
                      expiredLabel="Expired"
                    />
                    <div className="auth-otp-meta-copy">
                      <span className="auth-otp-meta-eyebrow">Kode dikirim ke</span>
                      <span className="auth-otp-meta-title">{email}</span>
                    </div>
                    {resendCooldown > 0 ? (
                      <span className="auth-resend-cooldown">{resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSubmitting}
                        className="auth-resend-pill"
                      >
                        Kirim ulang
                      </button>
                    )}
                  </div>
                </div>
              )}

              {pendingAction === "sending-otp" && (
                <AuthStatusBanner variant="sending" message={`Mengirim kode ke ${email}...`} />
              )}
              {pendingAction === "verifying" && (
                <AuthStatusBanner variant="sending" message="Memverifikasi kode dan menyiapkan akun..." />
              )}
              {pendingAction === "logging-in" && (
                <AuthStatusBanner variant="sending" message="Masuk ke akun..." />
              )}
              {!pendingAction && error && <AuthStatusBanner variant="error" message={error} />}
              {!pendingAction && info && !error && <AuthStatusBanner variant="success" message={info} />}

              <button
                type="submit"
                className="auth-modal-submit"
                disabled={isSubmitting}
                data-loading={isSubmitting ? "true" : undefined}
              >
                {mode === "login"
                  ? "Sign in"
                  : registerStep === "details"
                    ? "Send verification code"
                    : "Verify & create account"}
              </button>

              {mode === "register" && registerStep === "otp" && (
                <button
                  type="button"
                  onClick={() => { setRegisterStep("details"); setOtpCode(""); setError(null); setInfo(null); }}
                  className="auth-modal-secondary"
                >
                  Back to details
                </button>
              )}
            </form>

            <p className="auth-modal-footer">
              {mode === "login" ? (
                <>New here? <button type="button" onClick={() => { setMode("register"); setRegisterStep("details"); }}>Create an account</button></>
              ) : (
                <>Already have an account? <button type="button" onClick={() => { setMode("login"); setRegisterStep("details"); }}>Sign in</button></>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
