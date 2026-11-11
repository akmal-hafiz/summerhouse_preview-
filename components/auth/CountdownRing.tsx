"use client";

import { useEffect, useState } from "react";

type CountdownRingProps = {
  expiresAt: number | null;
  totalSeconds: number;
  size?: number;
  stroke?: number;
  label?: string;
  expiredLabel?: string;
};

export default function CountdownRing({
  expiresAt,
  totalSeconds,
  size = 56,
  stroke = 4,
  label,
  expiredLabel = "Kadaluarsa",
}: CountdownRingProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const remainingMs = expiresAt ? Math.max(0, expiresAt - now) : 0;
  const remainingSec = Math.ceil(remainingMs / 1000);
  const ratio = expiresAt ? Math.max(0, Math.min(1, remainingMs / (totalSeconds * 1000))) : 0;

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const display = remainingSec > 0
    ? `${minutes}:${String(seconds).padStart(2, "0")}`
    : "0:00";

  const isExpired = remainingSec <= 0;
  const isWarning = remainingSec <= 60 && remainingSec > 0;

  return (
    <div className="countdown-ring-wrap" aria-live="polite">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="countdown-ring-svg"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(23, 48, 33, 0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isExpired ? "#b94a3c" : isWarning ? "#cca75f" : "#446B4A"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 500ms linear, stroke 240ms ease" }}
        />
      </svg>
      <div className="countdown-ring-text">
        <span className="countdown-ring-value">{isExpired ? "0:00" : display}</span>
        {label && !isExpired && <span className="countdown-ring-label">{label}</span>}
        {isExpired && <span className="countdown-ring-label">{expiredLabel}</span>}
      </div>
    </div>
  );
}
