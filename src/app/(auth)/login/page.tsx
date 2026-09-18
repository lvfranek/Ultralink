import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  // The root layout's title template already appends " | Ultralink"
  title: "Sign in",
  description: "Sign in or create your Ultralink account.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-bg">
          <div className="w-5 h-5 border-2 border-text border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
