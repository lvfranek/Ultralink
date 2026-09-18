import { Spinner } from "./auth-icons";

export interface AuthBanner {
  title: string;
  body: string;
  showResend: boolean;
}

/** Explains why sign-in failed (expired link, Supabase error, …) with the technical detail. */
export function AuthErrorBanner({
  banner,
  detail,
  code,
  needsEmail,
  resendSent,
  onResend,
  resendLoading,
  resendCooldown,
}: {
  banner: AuthBanner;
  detail: string | null;
  code: string | null;
  needsEmail: boolean;
  resendSent: boolean;
  onResend: () => void;
  resendLoading: boolean;
  resendCooldown: number;
}) {
  return (
    <div
      style={{
        marginBottom: 20,
        padding: "14px 16px",
        borderRadius: 12,
        background: "rgba(220,38,38,0.05)",
        border: "1px solid rgba(220,38,38,0.18)",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: "#b91c1c", margin: 0 }}>{banner.title}</p>
      <p style={{ fontSize: 13, color: "#6B6B6B", margin: "4px 0 0", lineHeight: 1.5 }}>{banner.body}</p>
      <p style={{ fontSize: 12, color: "#6B6B6B", margin: "6px 0 0", lineHeight: 1.5, wordBreak: "break-word" }}>
        Details: {detail ? `${detail} (${code})` : code}
      </p>
      {needsEmail && (
        <p style={{ fontSize: 12, color: "#b91c1c", margin: "8px 0 0" }}>
          Enter your email to resend the confirmation.
        </p>
      )}
      {banner.showResend && !resendSent && (
        <button
          type="button"
          onClick={onResend}
          disabled={resendLoading || resendCooldown > 0}
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#0A0A0A",
            background: "none",
            border: "none",
            padding: 0,
            cursor: resendLoading || resendCooldown > 0 ? "not-allowed" : "pointer",
            opacity: resendLoading || resendCooldown > 0 ? 0.6 : 1,
            fontFamily: "inherit",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          {resendLoading && <Spinner />}
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend confirmation email"}
        </button>
      )}
      {resendSent && (
        <span
          style={{
            display: "inline-block",
            marginTop: 10,
            padding: "4px 10px",
            borderRadius: 999,
            background: "rgba(5,150,105,0.1)",
            color: "#047857",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Sent — check your inbox.
        </span>
      )}
    </div>
  );
}
