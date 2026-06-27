import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import { getLinkCap } from "@/lib/config/pricing";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Page, Plan } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Ultralink Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ username?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [pagesResult, profileResult] = await Promise.all([
    supabase.from("pages").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
  ]);

  const plan = (profileResult.data?.plan ?? "free") as Plan;
  const sp = await searchParams;
  const initialSlug = sp.username ?? "";

  return (
    <DashboardShell
      pages={(pagesResult.data ?? []) as Page[]}
      siteUrl={siteConfig.url}
      initialSlug={initialSlug}
      linkCap={getLinkCap(plan)}
    />
  );
}
