"use server";

import { sendSignupNotification } from "@/lib/notifications/signup";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function notifySignup(username: string, email: string): Promise<void> {
  // Fire-and-forget Discord ping — a real signup only ever calls this once,
  // so a generous limit just blocks someone hammering this action directly.
  const ip = await getClientIp();
  if (!rateLimit(`notify-signup:${ip}`, 5, 600).allowed) return;

  await sendSignupNotification(username, email, "Email");
}
