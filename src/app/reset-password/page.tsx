import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "@/app/(auth)/auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AuthShell>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "#F4F4F5", margin: "0 0 4px" }}>
          Link expired
        </h1>
        <p style={{ fontSize: 14, color: "#A1A1AA", margin: "0 0 20px" }}>
          This reset link has expired or is invalid. Request a new one.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 10,
            background: "#ffffff",
            color: "#0A0A0B",
            textDecoration: "none",
            boxSizing: "border-box",
          }}
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <ResetPasswordForm />
    </AuthShell>
  );
}
