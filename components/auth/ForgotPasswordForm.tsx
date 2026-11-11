"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { sendPasswordResetOtp, resetPasswordRequest } from "@/lib/auth-client";
import { useToast } from "@/components/providers/ToastProvider";
import { describeFailure, failureFromError } from "@/lib/notifications/guest-messages";
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
        setError(describeFailure("reset-send", {}));
        return;
      }
      const expiresInSec = response.expires_in ?? OTP_TOTAL_SECONDS;
      setOtpExpiresAt(Date.now() + expiresInSec * 1000);
      setResendCooldown(60);
      setStep("verify");
      setOtpCode("");
      setOtpHasError(false);
      // We never confirm whether an account exists, so this stays an inline status rather than a "sent" toast.
      setInfo(`If an account uses ${email}, we have sent it a reset code. Check your inbox and spam folder.`);
    } catch (err: unknown) {
      setError(describeFailure("reset-send", failureFromError(err)));
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
    const localProblem = otpCode.length !== 6 ? "Enter the 6-digit code from the email."
      : password.length < 8 ? "Use at least 8 characters for your new password."
        : password !== passwordConfirmation ? "The two passwords do not match. Type the same password in both fields." : null;
    if (localProblem) {
      setError(localProblem);
      return;
    }
    setIsSubmitting(true);
    setPendingAction("resetting");
    try {
      const result = await resetPasswordRequest(email, otpCode, password, passwordConfirmation);
      if (!result.success) {
        setError(describeFailure("reset", {}));
        return;
      }
      setCompleted(true);
      toast.success({ title: "Password updated", message: "Sign in with your new password." });
      window.history.replaceState(null, "", "/");
      setTimeout(() => router.replace("/?auth=login"), 1400);
    } catch (err: unknown) {
      setOtpHasError(true);
      setTimeout(() => setOtpHasError(false), 400);
      setError(describeFailure("reset", failureFromError(err)));
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  if (completed) {
    return (
      <div className="auth-form">
        <h1 className="auth-heading">Password updated.</h1>
        <p className="auth-subheading">
          Taking you to sign in. Use your new password there.
        </p>
        <AuthStatusBanner variant="success" message="Your new password is ready to use." />
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h1 className="auth-heading">
        {step === "email" ? "Reset your password." : "Choose a new password."}
      </h1>
      <p className="auth-subheading">
        {step === "email"
          ? "Enter the email you use for Summerhouse. If it has an account, we will send a reset code."
          : `Enter the code we sent to ${email}, then choose a new password.`}
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
            <AuthStatusBanner variant="sending" message={`Sending a reset code to ${email}...`} />
          )}
          {!pendingAction && error && <AuthStatusBanner variant="error" message={error} />}

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
            data-loading={isSubmitting ? "true" : undefined}
          >
            Send reset code
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
                <span className="auth-otp-meta-eyebrow">Code sent to</span>
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
                  Send a new code
                </button>
              )}
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="forgot-password">New password</label>
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
            <label htmlFor="forgot-password-confirm">Confirm new password</label>
            <PasswordInput
              id="forgot-password-confirm"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder="Type the new password again"
              required
              minLength={8}
            />
          </div>

          {pendingAction === "resetting" && (
            <AuthStatusBanner variant="sending" message="Updating your password..." />
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
            Use a different email
          </button>
        </form>
      )}

      <p className="auth-footer">
        Remembered your password?{" "}
        <Link href="/?auth=login">Sign in</Link>
      </p>

      {step === "email" && (
        <p style={{ marginTop: "1rem", fontSize: "13px", color: "rgba(46,46,44,0.72)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <FiCheckCircle aria-hidden="true" /> For your security, we never say whether an email has an account.
        </p>
      )}
    </div>
  );
}
