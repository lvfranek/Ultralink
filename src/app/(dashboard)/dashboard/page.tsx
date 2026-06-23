import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Page } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Links — Dashboard",
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

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const sp = await searchParams;
  const initialSlug = sp.username ?? "";

  return (
    <DashboardShell
      pages={(pages ?? []) as Page[]}
      siteUrl={siteConfig.url}
      initialSlug={initialSlug}
    />
  );
}
