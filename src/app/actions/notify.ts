"use server";

import { sendSignupNotification } from "@/lib/notifications/signup";

export async function notifySignup(username: string, email: string): Promise<void> {
  await sendSignupNotification(username, email, "Email");
}
