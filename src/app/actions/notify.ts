"use server";

import { sendDiscordNotification } from "@/lib/notifications/discord";
import { getUserCount } from "@/lib/admin/stats";

export async function notifySignup(username: string, email: string): Promise<void> {
  try {
    const totalUsers = await getUserCount();
    await sendDiscordNotification({
      title: "🎉 New signup",
      color: 0x9ae6b4,
      fields: [
        { name: "Username", value: username, inline: true },
        { name: "Email", value: email, inline: true },
        { name: "Total users", value: String(totalUsers), inline: true },
      ],
    });
  } catch (err) {
    console.error("[notify] signup notification failed:", err);
  }
}
