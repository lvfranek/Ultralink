"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { resendConfirmationEmail } from "@/app/actions/account";
import { notifySignup } from "@/app/actions/notify";
import { siteConfig } from "@/lib/config/site";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthShell, inputStyle, inputErrorStyle } from "../auth-shell";
import { isValidEmail, friendlyAuthError } from "@/lib/auth-errors";
import { GoogleIcon, Spinner } from "./auth-icons";
import { ConfirmSentView } from "./confirm-sent-view";
import { AuthErrorBanner } from "./auth-error-banner";
import { ResetPasswordForm } from "./reset-password-form";

type Mode = "signin" | "signup" | "reset";
type View = "form" | "confirm-sent";
type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid";
type EmailCheckState = "idle" | "in-use";

const RESEND_COOLDOWN_SECONDS = 30;

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const prefilledUsername = searchParams.get("username") ?? "";
  const prefilledPlan = searchParams.get("plan") ?? "";
  const requestedMode = searchParams.get("mode");

  const [view, setView] = useState<View>("form");
  const [mode, setMode] = useState<Mode>(
    requestedMode === "signup" || prefilledUsername || prefilledPlan ? "signup" : "signin",
  );
  const [email, setEmail] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [username, setUsername] = useState(prefilledUsername);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedError, setUnconfirmedError] = useState(false);
  const [emailInUseError, setEmailInUseError] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [bannerCode, setBannerCode] = useState<string | null>(null);
  const [bannerDetail, setBannerDetail] = useState<string | null>(null);
  const [bannerHidden, setBannerHidden] = useState(false);
  const [bannerNeedsEmail, setBannerNeedsEmail] = useState(false);
  const [bannerResendSent, setBannerResendSent] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);

  const [usernameState, setUsernameState] = useState<UsernameState>("idle");
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [emailCheckState, setEmailCheckState] = useState<EmailCheckState>("idle");
  const [autoSwitching, setAutoSwitching] = useState(false);
  const autoSwitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSubmittingRef = useRef(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const resendButtonRef = useRef<HTMLButtonElement>(null);
  const resetStatusRef = useRef<HTMLDivElement>(null);

  // A plan in the URL means the visitor came from pricing — show sign-up
  const [prevPlan, setPrevPlan] = useState(prefilledPlan);
  if (prefilledPlan !== prevPlan) {
    setPrevPlan(prefilledPlan);
    if (prefilledPlan) setMode("signup");
  }

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Focus the resend button when the confirmation screen appears
  useEffect(() => {
    if (view === "confirm-sent") {
      requestAnimationFrame(() => resendButtonRef.current?.focus());
    }
  }, [view]);

  useEffect(() => {
    return () => {
      if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
      if (autoSwitchTimeoutRef.current) clearTimeout(autoSwitchTimeoutRef.current);
    };
  }, []);

  // Detect an auth-callback failure from the query string (?error=) or the
  // URL fragment (#error_code=...) that Supabase appends on expired/used links.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const fragmentParams = hash ? new URLSearchParams(hash.slice(1)) : null;
    const code = fragmentParams?.get("error_code") ?? searchParams.get("error");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL #fragment only exists in the browser, not during server render
    if (code) setBannerCode(code);
    const detail = fragmentParams?.get("error_description") ?? searchParams.get("error_description");
    // Comes from the URL, so keep it short — it's shown as plain text
    if (detail) setBannerDetail(detail.slice(0, 200));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read the error from the URL once, on first load
  }, []);

  const banner = useMemo(() => {
    if (!bannerCode || bannerHidden) return null;
    switch (bannerCode) {
      case "otp_expired":
        return {
          title: "This link has expired.",
          body: "Confirmation links are valid for 60 minutes. Sign in below, or request a new link.",
          showResend: true,
        };
      case "access_denied":
        return {
          title: "This link is no longer valid.",
          body: "It may have already been used, or expired. Sign in below to continue.",
          showResend: true,
        };
      case "auth_callback_failed":
        return {
          title: "Something went wrong.",
          body: "The sign-in didn't complete. Try again, or reset your password if you're stuck.",
          showResend: false,
        };
      default:
        return {
          title: "We couldn't sign you in.",
          body: `Please try again. If it keeps happening, email ${siteConfig.supportEmail} with the details below.`,
          showResend: false,
        };
    }
  }, [bannerCode, bannerHidden]);

  const clearErrorFromUrl = useCallback(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (searchParams.get("error")) {
      router.replace("/login", { scroll: false });
    }
  }, [router, searchParams]);

  const clearMessages = () => {
    setError(null);
    setUnconfirmedError(false);
    setEmailInUseError(false);
  };

  const checkUsername = useCallback(
    async (value: string) => {
      if (!USERNAME_RE.test(value)) {
        setUsernameState("invalid");
        return;
      }
      setUsernameState("checking");
      const { data } = await supabase.from("profiles").select("id").eq("username", value).maybeSingle();
      setUsernameState(data ? "taken" : "available");
    },
    [supabase],
  );

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(sanitized);
    clearMessages();
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
    if (sanitized.length < 3) {
      setUsernameState(sanitized.length === 0 ? "idle" : "invalid");
      return;
    }
    setUsernameState("checking");
    usernameDebounceRef.current = setTimeout(() => checkUsername(sanitized), 400);
  };

  const handleModeSwitch = useCallback((m: Mode, prefillEmail?: string) => {
    setMode(m);
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setUsernameTouched(false);
    setPassword("");
    setConfirmPassword("");
    setEmailCheckState("idle");
    setAutoSwitching(false);
    if (prefillEmail) setEmail(prefillEmail);
    clearMessages();
    setResetSent(false);

    requestAnimationFrame(() => {
      if (m === "signup") {
        if (!prefillEmail) emailInputRef.current?.focus();
        else usernameInputRef.current?.focus();
      } else if (m === "signin") {
        if (prefillEmail) passwordInputRef.current?.focus();
        else emailInputRef.current?.focus();
      } else {
        emailInputRef.current?.focus();
      }
    });
  }, []);

  const triggerAutoSwitch = useCallback(
    (emailValue: string) => {
      if (autoSwitchTimeoutRef.current) clearTimeout(autoSwitchTimeoutRef.current);
      setEmailCheckState("in-use");
      setAutoSwitching(true);
      autoSwitchTimeoutRef.current = setTimeout(() => {
        setAutoSwitching(false);
        handleModeSwitch("signin", emailValue);
      }, 1200);
    },
    [handleModeSwitch],
  );

  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearMessages();
    if (bannerCode && !bannerHidden) {
      setBannerHidden(true);
      clearErrorFromUrl();
    }
    if (mode !== "signup" || autoSwitching) return;
    setEmailCheckState("idle");
  };

  const handleBannerResend = async () => {
    if (!isValidEmail(email)) {
      setBannerNeedsEmail(true);
      emailInputRef.current?.focus();
      return;
    }
    setBannerNeedsEmail(false);
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await resendConfirmationEmail(email);
      setBannerResendSent(true);
    } finally {
      setResendLoading(false);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    }
    clearErrorFromUrl();
  };

  const emailError = emailTouched && !isValidEmail(email) ? "Enter a valid email address." : null;

  const passwordError = passwordTouched && password.length < 8 ? "Password must be at least 8 characters." : null;

  const confirmPasswordError = confirmPasswordTouched && confirmPassword !== password ? "Passwords don't match." : null;

  const usernameError =
    usernameTouched && (usernameState === "invalid" || (usernameState === "idle" && username.length === 0))
      ? "3–20 characters, lowercase letters, numbers, underscores."
      : usernameTouched && usernameState === "taken"
        ? "That username is already taken."
        : null;

  const isFormValid =
    isValidEmail(email) &&
    password.length >= 8 &&
    (mode === "signin" ||
      (USERNAME_RE.test(username) && usernameState === "available" && confirmPassword === password));

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    setEmailTouched(true);
    if (!isValidEmail(email)) return;

    clearMessages();
    isSubmittingRef.current = true;
    setResetLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } finally {
      setResetLoading(false);
      setResetSent(true);
      isSubmittingRef.current = false;
      requestAnimationFrame(() => resetStatusRef.current?.focus());
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;
    setEmailTouched(true);
    setPasswordTouched(true);
    if (mode === "signup") {
      setConfirmPasswordTouched(true);
      setUsernameTouched(true);
    }
    if (!isFormValid) return;

    clearMessages();
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Final destination after the confirm-page verification (not the
            // link the email itself points to — that's set by the Supabase
            // email template, see /auth/confirm).
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              username,
              plan: prefilledPlan || undefined,
            },
          },
        });
        if (error) {
          if (
            error.message.toLowerCase().includes("already registered") ||
            error.message.toLowerCase().includes("already exists")
          ) {
            triggerAutoSwitch(email);
            return;
          }
          throw error;
        }
        // Supabase answers a sign-up for an existing, confirmed email with a
        // user that has no identities (instead of an error) — switch to sign-in.
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          triggerAutoSwitch(email);
          return;
        }
        void notifySignup(username, email);
        setConfirmedEmail(email);
        setView("confirm-sent");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const { message, unconfirmed, wrongPassword } = friendlyAuthError(err);
      setError(message);
      if (unconfirmed) setUnconfirmedError(true);
      if (wrongPassword) {
        requestAnimationFrame(() => {
          passwordInputRef.current?.focus();
          passwordInputRef.current?.select();
        });
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
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
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const { message } = friendlyAuthError(err);
      setError(message);
      setGoogleLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await resendConfirmationEmail(confirmedEmail);
    } finally {
      setResendLoading(false);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const handleUseDifferentEmail = () => {
    setView("form");
    setMode("signup");
    setEmail("");
    setConfirmedEmail("");
    setPassword("");
    setConfirmPassword("");
    setEmailCheckState("idle");
    clearMessages();
    requestAnimationFrame(() => emailInputRef.current?.focus());
  };

  const footer = (
    <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "#9A9A9A" }}>
      By continuing, you agree to our{" "}
      <Link href="/terms" style={{ color: "#9a9a9a", textDecoration: "underline", textUnderlineOffset: 2 }}>
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link href="/privacy" style={{ color: "#9a9a9a", textDecoration: "underline", textUnderlineOffset: 2 }}>
        Privacy Policy
      </Link>
      .
      <br />
      <Link
        href="/imprint"
        style={{
          display: "inline-block",
          marginTop: 8,
          color: "#9a9a9a",
          textDecoration: "underline",
          textUnderlineOffset: 2,
        }}
      >
        Imprint
      </Link>
    </p>
  );

  if (view === "confirm-sent") {
    return (
      <ConfirmSentView
        email={confirmedEmail}
        footer={footer}
        resendButtonRef={resendButtonRef}
        onResend={handleResend}
        onUseDifferentEmail={handleUseDifferentEmail}
        resendLoading={resendLoading}
        resendCooldown={resendCooldown}
      />
    );
  }

  return (
    <AuthShell footer={footer}>
      {/* Auth-callback error banner (expired/used confirmation links) */}
      {banner && mode !== "reset" && (
        <AuthErrorBanner
          banner={banner}
          detail={bannerDetail}
          code={bannerCode}
          needsEmail={bannerNeedsEmail}
          resendSent={bannerResendSent}
          onResend={handleBannerResend}
          resendLoading={resendLoading}
          resendCooldown={resendCooldown}
        />
      )}

      {/* Username claim context */}
      {prefilledUsername && mode === "signup" && (
        <div
          style={{
            marginBottom: 20,
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,.08)",
          }}
        >
          <p style={{ fontSize: 12, color: "#6B6B6B", margin: 0, fontWeight: 500 }}>
            Claiming <span style={{ fontWeight: 700, color: "#0A0A0A" }}>ultralink.bio/{prefilledUsername}</span>
          </p>
        </div>
      )}

      {/* Mode toggle */}
      {mode !== "reset" && (
        <div
          role="tablist"
          aria-label="Authentication mode"
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.06)",
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
            gap: 4,
          }}
        >
          {(["signup", "signin"] as Mode[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => handleModeSwitch(m)}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 7,
                border: "none",
                background: mode === m ? "#0A0A0A" : "transparent",
                color: mode === m ? "#ffffff" : "#6B6B6B",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (mode !== m) {
                  e.currentTarget.style.color = "#0A0A0A";
                  e.currentTarget.style.background = "rgba(0,0,0,.06)";
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== m) {
                  e.currentTarget.style.color = "#6B6B6B";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {m === "signup" ? "Create account" : "Sign in"}
            </button>
          ))}
        </div>
      )}

      {/* Heading */}
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0A0A0A", margin: "0 0 4px" }}>
        {mode === "signup" ? "Create your account" : mode === "reset" ? "Reset your password" : "Welcome back"}
      </h1>
      <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 24px" }}>
        {mode === "signup"
          ? "Start for free. No credit card required."
          : mode === "reset"
            ? "Enter your email and we'll send you a link to reset your password."
            : "Sign in to continue to your dashboard."}
      </p>

      {mode === "reset" ? (
        <ResetPasswordForm
          email={email}
          emailError={emailError}
          emailInputRef={emailInputRef}
          resetStatusRef={resetStatusRef}
          resetSent={resetSent}
          resetLoading={resetLoading}
          onEmailChange={(value) => {
            setEmail(value);
            clearMessages();
            setResetSent(false);
          }}
          onEmailBlur={() => setEmailTouched(true)}
          onSubmit={handleResetPassword}
          onBackToSignIn={() => handleModeSwitch("signin")}
        />
      ) : (
        <>
          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,.12)",
              fontSize: 14,
              fontWeight: 500,
              color: "#0A0A0A",
              background: "rgba(0,0,0,0.03)",
              cursor: googleLoading || loading ? "not-allowed" : "pointer",
              opacity: googleLoading || loading ? 0.5 : 1,
              marginBottom: 20,
              fontFamily: "inherit",
              transition: "opacity 0.15s, transform 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!googleLoading && !loading) {
                e.currentTarget.style.background = "rgba(0,0,0,.07)";
                e.currentTarget.style.transform = "scale(0.98)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.03)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {googleLoading ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ position: "relative", margin: "20px 0" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }} aria-hidden="true">
              <div style={{ width: "100%", borderTop: "1px solid rgba(0,0,0,.08)" }} />
            </div>
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <span style={{ padding: "0 12px", background: "#fff", fontSize: 12, color: "#6B6B6B" }}>
                or continue with email
              </span>
            </div>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
            <div>
              <label
                htmlFor="email"
                style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6B6B6B", marginBottom: 6 }}
              >
                Email address
              </label>
              <input
                ref={emailInputRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading || autoSwitching}
                style={emailError || emailInUseError ? inputErrorStyle : inputStyle}
              />
              {emailError && <p style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>{emailError}</p>}
              {mode === "signup" && emailCheckState === "in-use" && (
                <p
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#6B6B6B",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      border: "2px solid #9a9a9a",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.75s linear infinite",
                    }}
                    aria-hidden="true"
                  />
                  You already have an account. Signing you in…
                </p>
              )}
              {emailInUseError && emailCheckState !== "in-use" && (
                <p style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>
                  An account with this email already exists.{" "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("signin", email)}
                    style={{
                      color: "#dc2626",
                      textDecoration: "underline",
                      textUnderlineOffset: 2,
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Sign in instead →
                  </button>
                </p>
              )}
            </div>

            {/* Username field — signup only */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="username"
                  style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6B6B6B", marginBottom: 6 }}
                >
                  Username
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    ref={usernameInputRef}
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    onBlur={() => setUsernameTouched(true)}
                    placeholder="your_username"
                    autoComplete="username"
                    required
                    disabled={loading || autoSwitching}
                    style={{
                      ...(usernameError ? inputErrorStyle : inputStyle),
                      paddingRight: 36,
                    }}
                  />
                  {/* Availability indicator */}
                  {usernameState === "checking" && (
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 14,
                        height: 14,
                        border: "2px solid #9a9a9a",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.75s linear infinite",
                      }}
                      aria-hidden="true"
                    />
                  )}
                  {usernameState === "available" && (
                    <svg
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 16,
                        height: 16,
                        color: "#059669",
                      }}
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M3 8l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {usernameState === "taken" && (
                    <svg
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 16,
                        height: 16,
                        color: "#dc2626",
                      }}
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                {usernameError ? (
                  <p style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>{usernameError}</p>
                ) : usernameState === "available" ? (
                  <p style={{ marginTop: 6, fontSize: 12, color: "#059669" }}>Username is available.</p>
                ) : (
                  <p style={{ marginTop: 6, fontSize: 12, color: "#6B6B6B" }}>
                    3–20 characters, lowercase letters, numbers, underscores.
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6B6B6B", marginBottom: 6 }}
              >
                Password
                {mode === "signup" && (
                  <span style={{ fontWeight: 400, color: "#6B6B6B", marginLeft: 4 }}>(min. 8 characters)</span>
                )}
              </label>
              <PasswordInput
                ref={passwordInputRef}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearMessages();
                }}
                onBlur={() => setPasswordTouched(true)}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                disabled={loading || autoSwitching}
                style={passwordError ? inputErrorStyle : inputStyle}
              />
              {passwordError && <p style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>{passwordError}</p>}
              {mode === "signin" && (
                <p style={{ marginTop: 6, textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("reset", email)}
                    style={{
                      fontSize: 12,
                      color: "#6B6B6B",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: 0,
                      textDecoration: "underline",
                      textUnderlineOffset: 2,
                    }}
                  >
                    Forgot password?
                  </button>
                </p>
              )}
            </div>

            {/* Confirm password — signup only */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="confirm-password"
                  style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6B6B6B", marginBottom: 6 }}
                >
                  Confirm password
                </label>
                <PasswordInput
                  ref={confirmPasswordInputRef}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearMessages();
                  }}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  disabled={loading || autoSwitching}
                  style={confirmPasswordError ? inputErrorStyle : inputStyle}
                />
                {confirmPasswordError && (
                  <p style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>{confirmPasswordError}</p>
                )}
              </div>
            )}

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
                {unconfirmedError && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={async () => {
                        setConfirmedEmail(email);
                        await resendConfirmationEmail(email);
                        setResendCooldown(RESEND_COOLDOWN_SECONDS);
                      }}
                      style={{
                        color: "#b91c1c",
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                        background: "none",
                        border: "none",
                        padding: 0,
                        font: "inherit",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Resend confirmation
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading || autoSwitching}
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
                cursor: loading || googleLoading || autoSwitching ? "not-allowed" : "pointer",
                opacity: loading || googleLoading || autoSwitching ? 0.6 : 1,
                fontFamily: "inherit",
                transition: "opacity 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!loading && !googleLoading && !autoSwitching) {
                  e.currentTarget.style.opacity = "0.82";
                  e.currentTarget.style.transform = "scale(0.98)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = loading || googleLoading || autoSwitching ? "0.6" : "1";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {loading && <Spinner />}
              {loading
                ? mode === "signup"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
