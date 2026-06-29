import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLinkCap } from "@/lib/config/pricing";
import type { Plan } from "@/lib/supabase/types";
import { AccountSettingsClient } from "./account-settings-client";

export const metadata: Metadata = {
  title: "Account settings — Ultralink",
  robots: { index: false, follow: false },
};

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, pagesResult] = await Promise.all([
    supabase.from("profiles").select("plan, username").eq("id", user.id).single(),
    supabase.from("pages").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
  ]);

  const plan = (profileResult.data?.plan ?? "free") as Plan;
  const username = profileResult.data?.username ?? "";
  const linkCap = getLinkCap(plan);
  const linksUsed = pagesResult.count ?? 0;

  return (
    <AccountSettingsClient
      email={user.email ?? ""}
      plan={plan}
      username={username}
      linkCap={linkCap}
      linksUsed={linksUsed}
    />
  );
}
