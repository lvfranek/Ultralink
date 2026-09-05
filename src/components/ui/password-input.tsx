"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  toggleColor?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ style, toggleColor = "#9a9a9a", ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div style={{ position: "relative" }}>
        <input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          style={{ ...style, paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
            background: "none",
            border: "none",
            color: toggleColor,
            cursor: "pointer",
          }}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }
);
