"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const prefilledUsername = searchParams.get("username") ?? "";
  const prefilledPlan = searchParams.get("plan") ?? "";

  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledPlan) setMode("signup");
  }, [prefilledPlan]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: prefilledUsername || undefined,
              plan: prefilledPlan || undefined,
            },
          },
        });
        if (error) throw error;
        setSuccessMessage(
          "Check your email — we sent you a confirmation link to activate your account."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    clearMessages();
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      setError(message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(201,168,106,0.06) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo href="/" iconSize={32} />
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          {/* Username claim context */}
          {prefilledUsername && (
            <div className="mb-5 p-3 rounded-[var(--radius-sm)] bg-gold-dim border border-gold/20">
              <p className="text-xs text-gold font-medium">
                Claiming{" "}
                <span className="font-bold">ultralink.bio/{prefilledUsername}</span>
              </p>
            </div>
          )}

          {/* Mode toggle */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="flex bg-surface-2 rounded-[var(--radius-sm)] p-1 mb-7"
          >
            {(["signup", "signin"] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  clearMessages();
                }}
                className={[
                  "flex-1 py-2 text-sm font-medium rounded-[calc(var(--radius-sm)-2px)] transition-all duration-150 cursor-pointer",
                  mode === m
                    ? "bg-surface text-text shadow-sm"
                    : "text-text-muted hover:text-text",
                ].join(" ")}
              >
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-text mb-1">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-text-muted mb-6">
            {mode === "signup"
              ? "Start for free. No credit card required."
              : "Sign in to continue to your dashboard."}
          </p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[var(--radius)] border border-border-strong text-sm font-medium text-text hover:bg-surface-2 hover:border-gold/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mb-5 cursor-pointer"
          >
            {googleLoading ? (
              <span
                className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-surface text-xs text-text-subtle">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-text-muted mb-1.5"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-text-muted mb-1.5"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={mode === "signup" ? 8 : undefined}
                required
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="p-3 rounded-[var(--radius-sm)] bg-red-950/30 border border-red-800/30 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div
                role="status"
                className="p-3 rounded-[var(--radius-sm)] bg-emerald-950/30 border border-emerald-800/30 text-sm text-emerald-400"
              >
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={loading}
              disabled={googleLoading}
              className="w-full"
            >
              {mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>
        </div>

        {/* Bottom links */}
        <p className="mt-6 text-center text-xs text-text-subtle">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-text-muted hover:text-text underline-offset-2 hover:underline transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-text-muted hover:text-text underline-offset-2 hover:underline transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
