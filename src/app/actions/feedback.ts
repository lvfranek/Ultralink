"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/supabase/types";
import { sendDiscordNotification } from "@/lib/notifications/discord";

export async function submitFeedback(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, plan_tier, plan_interval, subscription_status")
    .eq("id", user.id)
    .single();

  const type = formData.get("type") === "feature" ? "feature" : "bug";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const pageUrl = String(formData.get("pageUrl") || "").trim();

  if (!message || message.length < 10) return { error: "Message too short." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email." };

  const userAgent = (await headers()).get("user-agent") ?? "";

  const plan = profile ? getEffectivePlan(profile) : "free";
  const planLine = plan === "pro" ? `Pro · Tier ${profile?.plan_tier} · ${profile?.plan_interval}` : "Free";

  const webhookUrl = type === "bug" ? process.env.DISCORD_BUGS_WEBHOOK_URL : process.env.DISCORD_FEATURES_WEBHOOK_URL;

  const emoji = type === "bug" ? "🐛" : "💡";
  const title = type === "bug" ? "Bug report" : "Feature request";
  const color = type === "bug" ? 0xf56565 : 0x63b3ed;

  const truncatedMessage = message.length > 1024 ? `${message.slice(0, 1000)}… (truncated — see admin panel)` : message;

  try {
    await sendDiscordNotification(
      {
        title: `${emoji} ${title}`,
        color,
        fields: [
          { name: "From", value: `${name} <${email}>`, inline: false },
          { name: "Username", value: profile?.username ?? "(unknown)", inline: true },
          { name: "User ID", value: user.id, inline: true },
          { name: "Plan", value: planLine, inline: true },
          { name: "Page", value: pageUrl || "(unknown)", inline: false },
          { name: "User agent", value: userAgent.slice(0, 200) || "(unknown)", inline: false },
          { name: "Message", value: truncatedMessage, inline: false },
        ],
      },
      webhookUrl,
    );
  } catch (err) {
    console.error("Failed to send feedback notification:", err);
    return { error: "Something went wrong. Try again in a moment." };
  }

  return { ok: true };
}
