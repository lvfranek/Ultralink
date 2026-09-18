import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "../../auth-shell";
import { confirmToken } from "@/app/actions/confirm";

export const metadata: Metadata = {
  title: "Confirm — Ultralink",
  robots: { index: false, follow: false },
};

const COPY: Record<string, { title: string; body: string; cta: string }> = {
  signup: {
    title: "Confirm your email",
    body: "Click below to finish activating your Ultralink account.",
    cta: "Confirm email",
  },
  recovery: {
    title: "Reset your password",
    body: "Click below to continue resetting your password.",
    cta: "Continue",
  },
  email_change: {
    title: "Confirm your new email",
    body: "Click below to confirm this email address change.",
    cta: "Confirm email",
  },
  invite: {
    title: "Accept your invite",
    body: "Click below to accept your invite and finish setting up your account.",
    cta: "Accept invite",
  },
  magiclink: {
    title: "Sign in",
    body: "Click below to finish signing in.",
    cta: "Sign in",
  },
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const { token_hash: tokenHash, type, next } = await searchParams;

  if (!tokenHash || !type || !(type in COPY)) {
    redirect("/login?error=auth_callback_failed");
  }

  const copy = COPY[type];

  return (
    <AuthShell>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0A0A0A", margin: "0 0 8px" }}>{copy.title}</h1>
      <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 24px", lineHeight: 1.5 }}>{copy.body}</p>

      <form action={confirmToken}>
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next ?? ""} />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 10,
            border: "none",
            background: "#0A0A0A",
            color: "#ffffff",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {copy.cta}
        </button>
      </form>
    </AuthShell>
  );
}
