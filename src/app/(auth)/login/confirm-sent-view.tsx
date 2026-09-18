import type { ReactNode, RefObject } from "react";
import { Mail } from "lucide-react";
import { AuthShell } from "../auth-shell";
import { Spinner } from "./auth-icons";

/** Shown after email sign-up: "check your inbox", with resend and change-email actions. */
export function ConfirmSentView({
  email,
  footer,
  resendButtonRef,
  onResend,
  onUseDifferentEmail,
  resendLoading,
  resendCooldown,
}: {
  email: string;
  footer: ReactNode;
  resendButtonRef: RefObject<HTMLButtonElement | null>;
  onResend: () => void;
  onUseDifferentEmail: () => void;
  resendLoading: boolean;
  resendCooldown: number;
}) {
  return (
    <AuthShell footer={footer}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Mail size={24} color="#9a9a9a" aria-hidden="true" style={{ marginBottom: 16 }} />
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0A0A0A", margin: "0 0 8px" }}>Check your inbox.</h1>
        <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.5 }}>
          We just sent a confirmation link to <strong style={{ color: "#0A0A0A" }}>{email}</strong>. Click it to
          activate your account.
        </p>
        <p style={{ fontSize: 12, color: "#6B6B6B", margin: "0 0 24px" }}>
          Didn&apos;t get it? Check your spam folder, or check that the address is right.
        </p>

        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            ref={resendButtonRef}
            type="button"
            onClick={onResend}
            disabled={resendLoading || resendCooldown > 0}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 14px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,.12)",
              background: "transparent",
              color: "#0A0A0A",
              cursor: resendLoading || resendCooldown > 0 ? "not-allowed" : "pointer",
              opacity: resendLoading || resendCooldown > 0 ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            {resendLoading && <Spinner />}
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
          </button>
          <button
            type="button"
            onClick={onUseDifferentEmail}
            style={{
              flex: 1,
              padding: "12px 14px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,.12)",
              background: "transparent",
              color: "#0A0A0A",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Use a different email
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
