"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { getEffectivePlan } from "@/lib/supabase/types";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

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
  const planLine =
    plan === "pro" ? `Pro · Tier ${profile?.plan_tier} · ${profile?.plan_interval}` : "Free";

  const typeLabel = type === "bug" ? "Bug report" : "Feature request";
  const subject = `[${typeLabel}] ${name} (${planLine})`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #141414; color: #fff;">
      <h2 style="margin: 0 0 16px; font-size: 20px;">${typeLabel}</h2>
      <table style="width: 100%; font-size: 14px; color: #9a9a9a; margin-bottom: 20px;">
        <tr><td style="padding: 4px 0;">From:</td><td style="color: #fff;">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</td></tr>
        <tr><td style="padding: 4px 0;">Username:</td><td style="color: #fff;">${escapeHtml(profile?.username ?? "(unknown)")}</td></tr>
        <tr><td style="padding: 4px 0;">User ID:</td><td style="color: #fff; font-family: monospace; font-size: 12px;">${user.id}</td></tr>
        <tr><td style="padding: 4px 0;">Plan:</td><td style="color: #fff;">${planLine}</td></tr>
        <tr><td style="padding: 4px 0;">Page:</td><td style="color: #fff;">${escapeHtml(pageUrl)}</td></tr>
        <tr><td style="padding: 4px 0;">User agent:</td><td style="color: #9a9a9a; font-size: 12px;">${escapeHtml(userAgent)}</td></tr>
      </table>
      <div style="border-top: 1px solid #2a2a2a; padding-top: 16px;">
        <p style="margin: 0 0 8px; color: #9a9a9a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
        <div style="white-space: pre-wrap; color: #fff; font-size: 14px; line-height: 1.5;">${escapeHtml(message)}</div>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Ultralink <hello@ultralink.bio>",
      to: process.env.FEEDBACK_TO_EMAIL || "franek@ultralink.bio",
      replyTo: email,
      subject,
      html,
    });
  } catch (err) {
    console.error("Failed to send feedback email:", err);
    return { error: "Something went wrong. Try again in a moment." };
  }

  return { ok: true };
}
