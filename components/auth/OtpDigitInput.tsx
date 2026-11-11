"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

type OtpDigitInputProps = {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
};

export default function OtpDigitInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = true,
  hasError = false,
}: OtpDigitInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) {
      const target = inputsRef.current[Math.min(value.length, length - 1)];
      target?.focus();
    }
  }, [autoFocus, length, value.length]);

  useEffect(() => {
    if (value.length === length) {
      onComplete?.(value);
    }
  }, [value, length, onComplete]);

  const updateAt = (index: number, char: string) => {
    const sanitized = char.replace(/\D/g, "").slice(0, 1);
    const arr = digits.slice();
    arr[index] = sanitized;
    const next = arr.join("").slice(0, length);
    onChange(next);
    if (sanitized) {
      const nextEl = inputsRef.current[index + 1];
      nextEl?.focus();
      nextEl?.select();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const arr = digits.slice();
        arr[index] = "";
        onChange(arr.join(""));
        return;
      }
      const prev = inputsRef.current[index - 1];
      prev?.focus();
      prev?.select();
      const arr = digits.slice();
      arr[index - 1] = "";
      onChange(arr.join(""));
    } else if (e.key === "ArrowLeft") {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div
      className={`otp-digit-grid${hasError ? " otp-digit-grid--error" : ""}`}
      role="group"
      aria-label="One-time code"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => updateAt(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          disabled={disabled}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          className="otp-digit-cell"
        />
      ))}
    </div>
  );
}
