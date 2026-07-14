"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { sendPasswordResetOtp, resetPasswordRequest } from "@/lib/auth-client";
import { useToast } from "@/components/providers/ToastProvider";
import OtpDigitInput from "./OtpDigitInput";
import CountdownRing from "./CountdownRing";
import AuthStatusBanner from "./AuthStatusBanner";
import PasswordInput from "./PasswordInput";

type Step = "email" | "verify";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpHasError, setOtpHasError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<"sending" | "resetting" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const OTP_TOTAL_SECONDS = 900; // 15 min

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSend = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    setPendingAction("sending");
    try {
      const response = await sendPasswordResetOtp(email);
      if (!response.success) {
        throw new Error(response.message || "Failed to send reset code");
      }
      const expiresInSec = response.expires_in ?? OTP_TOTAL_SECONDS;
      setOtpExpiresAt(Date.now() + expiresInSec * 1000);
      setResendCooldown(60);
      setStep("verify");
      setOtpCode("");
      setOtpHasError(false);
      setInfo(`Jika ${email} terdaftar, kode reset telah dikirim. Cek inbox dan folder spam.`);
      toast.info({ title: "Reset code sent", message: "Check your inbox and spam folder." });
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      const message = firstError || data?.message || (err as Error).message || "Failed to send reset code";
      setError(message);
      toast.error({ title: "Could not send code", message });
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  const handleEmailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend();
  };

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    setPendingAction("resetting");
    try {
      if (password.length < 8) throw new Error("Password minimal 8 karakter");
      if (password !== passwordConfirmation) throw new Error("Konfirmasi password tidak cocok");
      if (otpCode.length !== 6) throw new Error("Masukkan 6 digit kode OTP");

      const result = await resetPasswordRequest(email, otpCode, password, passwordConfirmation);
      if (!result.success) throw new Error(result.message || "Gagal reset password");
      setCompleted(true);
      setInfo(result.message || "Password berhasil diperbarui.");
      toast.success({ title: "Password updated", message: "Log in with your new password." });
      window.history.replaceState(null, "", "/");
      setTimeout(() => router.replace("/?auth=login"), 1400);
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      setOtpHasError(true);
      setTimeout(() => setOtpHasError(false), 400);
      const message = firstError || data?.message || (err as Error).message || "Gagal reset password";
      setError(message);
      toast.error({ title: "Could not reset password", message });
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  if (completed) {
    return (
      <div className="auth-form">
        <p className="auth-eyebrow">Done</p>
        <h1 className="auth-heading">Password diperbarui.</h1>
        <p className="auth-subheading">
          Mengalihkan ke halaman masuk. Gunakan password baru untuk masuk.
        </p>
        <AuthStatusBanner variant="success" message={info ?? "Password berhasil diperbarui."} />
      </div>
    );
  }

  return (
    <div className="auth-form">
      <p className="auth-eyebrow">{step === "email" ? "Lupa password" : "Reset password"}</p>
      <h1 className="auth-heading">
        {step === "email" ? "Kirim ulang akses." : "Buat password baru."}
      </h1>
      <p className="auth-subheading">
        {step === "email"
          ? "Masukkan email akun Summerhouse. Jika terdaftar, kami akan kirim kode reset password."
          : `Masukkan kode yang tim Summerhouse kirim ke ${email}, lalu buat password baru.`}
      </p>

      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="auth-fields">
          <div className="auth-field">
            <label htmlFor="forgot-email">Email address</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          {pendingAction === "sending" && (
            <AuthStatusBanner variant="sending" message={`Mengirim kode reset ke ${email}...`} />
          )}
          {!pendingAction && error && <AuthStatusBanner variant="error" message={error} />}

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
            data-loading={isSubmitting ? "true" : undefined}
          >
            Kirim kode reset
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="auth-fields">
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
                  onClick={handleSend}
                  disabled={isSubmitting}
                  className="auth-resend-pill"
                >
                  Kirim ulang
                </button>
              )}
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="forgot-password">Password baru</label>
            <PasswordInput
              id="forgot-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="forgot-password-confirm">Konfirmasi password baru</label>
            <PasswordInput
              id="forgot-password-confirm"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder="Ulangi password baru"
              required
              minLength={8}
            />
          </div>

          {pendingAction === "resetting" && (
            <AuthStatusBanner variant="sending" message="Memperbarui password..." />
          )}
          {!pendingAction && error && <AuthStatusBanner variant="error" message={error} />}
          {!pendingAction && info && !error && <AuthStatusBanner variant="info" message={info} />}

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
            data-loading={isSubmitting ? "true" : undefined}
          >
            Reset password
          </button>

          <button
            type="button"
            onClick={() => { setStep("email"); setOtpCode(""); setError(null); setInfo(null); }}
            className="auth-secondary"
            style={{ marginTop: "0.5rem" }}
          >
            Ganti email
          </button>
        </form>
      )}

      <p className="auth-footer">
        Sudah ingat password?{" "}
        <Link href="/?auth=login">Sign in</Link>
      </p>

      {step === "email" && (
        <p style={{ marginTop: "1rem", fontSize: "0.78rem", color: "rgba(26,40,32,0.5)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <FiCheckCircle aria-hidden="true" /> Untuk keamanan, kami tidak konfirmasi apakah email terdaftar.
        </p>
      )}
    </div>
  );
}
