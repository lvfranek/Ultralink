"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeRedirectPath } from "@/lib/url";

const ALLOWED_TYPES: EmailOtpType[] = ["signup", "recovery", "email_change", "invite", "magiclink"];

function isAllowedType(value: FormDataEntryValue | null): value is EmailOtpType {
  return typeof value === "string" && (ALLOWED_TYPES as string[]).includes(value);
}

// Only called from the explicit "Confirm"/"Continue" button submit on
// /auth/confirm — never on a bare page load — so an automated link
// prefetch/scanner visiting the emailed link can't consume the one-time
// token before the user actually clicks it.
export async function confirmToken(formData: FormData) {
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");
  const next = formData.get("next");

  if (typeof tokenHash !== "string" || !tokenHash || !isAllowedType(type)) {
    redirect("/login?error=auth_callback_failed");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    console.error("[auth/confirm] verifyOtp failed", {
      type,
      errorName: error.name,
      errorMessage: error.message,
      errorCode: (error as { code?: string }).code,
    });
    redirect(`/login?error=${encodeURIComponent((error as { code?: string }).code ?? "auth_callback_failed")}`);
  }

  redirect(safeRedirectPath(next));
}
