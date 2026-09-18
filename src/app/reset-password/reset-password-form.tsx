"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/ui/password-input";
import { inputStyle, inputErrorStyle } from "@/app/(auth)/auth-shell";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordError = passwordTouched && password.length < 8 ? "Password must be at least 8 characters." : null;

  const confirmError = confirmTouched && confirmPassword !== password ? "Passwords don't match." : null;

  const isValid = password.length >= 8 && confirmPassword === password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched(true);
    setConfirmTouched(true);
    if (!isValid) return;

    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  return (
    <>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0A0A0A", margin: "0 0 4px" }}>Set a new password</h1>
      <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 24px" }}>Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
        <div>
          <label
            htmlFor="new-password"
            style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6B6B6B", marginBottom: 6 }}
          >
            New password <span style={{ fontWeight: 400, color: "#9a9a9a" }}>(min. 8 characters)</span>
          </label>
          <PasswordInput
            id="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            onBlur={() => setPasswordTouched(true)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            disabled={loading}
            style={passwordError ? inputErrorStyle : inputStyle}
          />
          {passwordError && <p style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>{passwordError}</p>}
        </div>

        <div>
          <label
            htmlFor="confirm-new-password"
            style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6B6B6B", marginBottom: 6 }}
          >
            Confirm new password
          </label>
          <PasswordInput
            id="confirm-new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);
            }}
            onBlur={() => setConfirmTouched(true)}
            placeholder="Repeat new password"
            autoComplete="new-password"
            required
            disabled={loading}
            style={confirmError ? inputErrorStyle : inputStyle}
          />
          {confirmError && <p style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>{confirmError}</p>}
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.25)",
              fontSize: 14,
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(5,150,105,0.08)",
              border: "1px solid rgba(5,150,105,0.25)",
              fontSize: 14,
              color: "#047857",
            }}
          >
            Password updated. Redirecting to your dashboard…
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
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
            cursor: loading || success ? "not-allowed" : "pointer",
            opacity: loading || success ? 0.6 : 1,
            fontFamily: "inherit",
            transition: "opacity 0.15s, transform 0.15s",
          }}
        >
          {loading && (
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                border: "2px solid currentColor",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.75s linear infinite",
              }}
              aria-hidden="true"
            />
          )}
          {success ? "Password updated" : "Update password"}
        </button>
      </form>
    </>
  );
}
