"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /**
   * className applies to the wrapper. Pass `inputClassName` for the input itself
   * so existing styles (e.g. `auth-field input`) still cascade correctly.
   */
  inputClassName?: string;
  wrapperClassName?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { inputClassName, wrapperClassName, ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`password-input-wrap${wrapperClassName ? ` ${wrapperClassName}` : ""}`}>
      <input
        ref={ref}
        {...rest}
        type={visible ? "text" : "password"}
        className={inputClassName}
        style={{ paddingRight: "2.75rem", ...(rest.style || {}) }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="password-input-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
      </button>
    </div>
  );
});

export default PasswordInput;
