import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const hadCodeVerifier = (await cookies())
      .getAll()
      .some((c) => c.name.includes("code-verifier"));

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // Log the real cause server-side instead of leaving this a black box.
    // Never log the raw code — it's a single-use credential.
    console.error("[auth/callback] exchangeCodeForSession failed", {
      errorName: error.name,
      errorMessage: error.message,
      errorStatus: (error as { status?: number }).status,
      hadCodeVerifierCookie: hadCodeVerifier,
    });
  }

  // Supabase's own /verify endpoint reports a specific reason (e.g. an
  // expired or already-used link) via `error`/`error_code` query params on
  // this same callback URL. Forward the specific code so /login can show the
  // matching friendly banner instead of the generic fallback below.
  const supabaseErrorCode = searchParams.get("error_code") ?? searchParams.get("error");
  if (supabaseErrorCode) {
    console.error("[auth/callback] Supabase reported a specific error", {
      errorCode: supabaseErrorCode,
      errorDescription: searchParams.get("error_description"),
    });
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(supabaseErrorCode)}`);
  }

  console.error("[auth/callback] callback reached with no code and no error param", {
    fullUrl: request.url,
  });

  // Truly unexpected failure — redirect with the generic banner.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
