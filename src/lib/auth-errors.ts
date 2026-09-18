// Helpers for the sign-in / sign-up form, kept free of React so they can be unit-tested.

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function friendlyAuthError(err: unknown): { message: string; unconfirmed?: boolean; wrongPassword?: boolean } {
  const raw = err instanceof Error ? err.message : String(err);
  const msg = raw.toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return { message: "Wrong email or password. Try again, or reset your password.", wrongPassword: true };
  }
  if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
    return { message: "Your email isn't confirmed yet. Check your inbox (and spam folder).", unconfirmed: true };
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return { message: "Too many attempts. Wait a moment and try again." };
  }
  if (msg.includes("fetch") || msg.includes("network")) {
    return { message: "Something went wrong. Check your connection and try again." };
  }
  if (msg.includes("password") && (msg.includes("least") || msg.includes("weak") || msg.includes("short"))) {
    return { message: "Password must be at least 8 characters." };
  }
  if (msg.includes("unique") || msg.includes("duplicate")) {
    return { message: "That username was just taken. Please choose another." };
  }
  return { message: "Something went wrong. Please try again." };
}
