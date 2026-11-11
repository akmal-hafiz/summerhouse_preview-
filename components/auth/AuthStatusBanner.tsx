"use client";

import { FiCheckCircle, FiAlertCircle, FiInfo, FiMail } from "react-icons/fi";

type Variant = "info" | "success" | "error" | "sending";

type AuthStatusBannerProps = {
  variant: Variant;
  message: string;
};

const ICONS: Record<Variant, React.ReactNode> = {
  info: <FiInfo aria-hidden="true" />,
  success: <FiCheckCircle aria-hidden="true" />,
  error: <FiAlertCircle aria-hidden="true" />,
  sending: <FiMail aria-hidden="true" />,
};

export default function AuthStatusBanner({ variant, message }: AuthStatusBannerProps) {
  return (
    <div
      className={`auth-status-banner auth-status-banner--${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className="auth-status-banner-icon">
        {variant === "sending" ? <span className="auth-status-spinner" aria-hidden="true" /> : ICONS[variant]}
      </span>
      <span className="auth-status-banner-text">{message}</span>
    </div>
  );
}
