import type { FormEvent, RefObject } from "react";
import { inputStyle, inputErrorStyle } from "../auth-shell";
import { Spinner } from "./auth-icons";

/** "Forgot password?" view: asks for the email and sends a reset link. */
export function ResetPasswordForm({
  email,
  emailError,
  emailInputRef,
  resetStatusRef,
  resetSent,
  resetLoading,
  onEmailChange,
  onEmailBlur,
  onSubmit,
  onBackToSignIn,
}: {
  email: string;
  emailError: string | null;
  emailInputRef: RefObject<HTMLInputElement | null>;
  resetStatusRef: RefObject<HTMLDivElement | null>;
  resetSent: boolean;
  resetLoading: boolean;
  onEmailChange: (value: string) => void;
  onEmailBlur: () => void;
  onSubmit: (e: FormEvent) => void;
  onBackToSignIn: () => void;
}) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
      <div>
        <label
          htmlFor="reset-email"
          style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6B6B6B", marginBottom: 6 }}
        >
          Email address
        </label>
        <input
          ref={emailInputRef}
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={onEmailBlur}
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={resetLoading}
          style={emailError ? inputErrorStyle : inputStyle}
        />
        {emailError && <p style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>{emailError}</p>}
      </div>

      {resetSent && (
        <div
          ref={resetStatusRef}
          role="status"
          tabIndex={-1}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(5,150,105,0.08)",
            border: "1px solid rgba(5,150,105,0.25)",
            fontSize: 14,
            color: "#047857",
          }}
        >
          If an account exists for that email, a reset link is on the way.
        </div>
      )}

      <button
        type="submit"
        disabled={resetLoading}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px 0",
          fontSize: 15,
          fontWeight: 600,
          borderRadius: 10,
          border: "none",
          background: "#0A0A0A",
          color: "#ffffff",
          cursor: resetLoading ? "not-allowed" : "pointer",
          opacity: resetLoading ? 0.6 : 1,
          fontFamily: "inherit",
          transition: "opacity 0.15s, transform 0.15s",
        }}
      >
        {resetLoading && <Spinner />}
        {resetLoading ? "Sending reset link…" : "Send reset link"}
      </button>

      <button
        type="button"
        onClick={onBackToSignIn}
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "#6B6B6B",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "underline",
          textUnderlineOffset: 2,
        }}
      >
        Back to sign in
      </button>
    </form>
  );
}
