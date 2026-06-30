import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import { PageBuilder } from "@/components/dashboard/page-builder/page-builder";
import { getEffectivePlan } from "@/lib/supabase/types";
import { getActiveOwnerId } from "@/lib/team";
import type { Page, PageLink, PageSocial, SubscriptionStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ultralink Dashboard",
  robots: { index: false, follow: false },
};

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);

  const [pageResult, linksResult, socialsResult, profileResult] = await Promise.all([
    supabase.from("pages").select("*").eq("id", id).eq("owner_id", activeOwnerId).single(),
    supabase
      .from("page_links")
      .select("*")
      .eq("page_id", id)
      .order("position", { ascending: true }),
    supabase
      .from("page_socials")
      .select("*")
      .eq("page_id", id)
      .order("position", { ascending: true }),
    supabase
      .from("profiles")
      .select("subscription_status, grace_period_ends_at")
      .eq("id", activeOwnerId)
      .single(),
  ]);

  if (!pageResult.data) notFound();

  const page = pageResult.data as Page;
  const links = (linksResult.data ?? []) as PageLink[];
  const socials = (socialsResult.data ?? []) as PageSocial[];
  const subProfile = profileResult.data ?? {
    subscription_status: "none" as SubscriptionStatus,
    grace_period_ends_at: null,
  };
  const effectivePlan = getEffectivePlan(subProfile);

  return (
    <div className="flex flex-col h-screen lg:h-dvh">
      <PageBuilder
        page={page}
        initialLinks={links}
        initialSocials={socials}
        effectivePlan={effectivePlan}
        userId={user.id}
        siteUrl={siteConfig.url}
      />
    </div>
  );
}
