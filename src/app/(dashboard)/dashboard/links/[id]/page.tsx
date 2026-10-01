import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { EditorRoot } from "@/components/dashboard/editor/editor-root";
import { getLinkClicks } from "@/lib/dashboard-stats";
import { getEffectivePlan } from "@/lib/supabase/types";
import { getActiveOwnerId } from "@/lib/team";
import type { Page, PageLink, PageSocial, SubscriptionStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

// Shared by generateMetadata and the page, so the queries run once per request
const loadEditor = cache(async (id: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);

  const [pageResult, linksResult, socialsResult, profileResult] = await Promise.all([
    supabase.from("pages").select("*").eq("id", id).eq("owner_id", activeOwnerId).single(),
    supabase.from("page_links").select("*").eq("page_id", id).order("position", { ascending: true }),
    supabase.from("page_socials").select("*").eq("page_id", id).order("position", { ascending: true }),
    supabase.from("profiles").select("subscription_status, grace_period_ends_at").eq("id", activeOwnerId).single(),
  ]);

  return { user, pageResult, linksResult, socialsResult, profileResult };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await loadEditor(id);
  const slug = (data?.pageResult.data as Page | null)?.slug;

  return {
    // Names the page so several open editor tabs can be told apart
    title: slug ? `Edit @${slug}` : "Edit page",
    robots: { index: false, follow: false },
  };
}

export default async function EditLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const data = await loadEditor(id);
  if (!data) redirect("/login");

  const { user, pageResult, linksResult, socialsResult, profileResult } = data;

  if (!pageResult.data) notFound();

  const page = pageResult.data as Page;
  const links = (linksResult.data ?? []) as PageLink[];
  const socials = (socialsResult.data ?? []) as PageSocial[];
  const subProfile = profileResult.data ?? {
    subscription_status: "none" as SubscriptionStatus,
    grace_period_ends_at: null,
  };
  const effectivePlan = getEffectivePlan(subProfile);

  const pro = effectivePlan === "pro";

  // Clicks per button over the last 30 days, shown next to each link (Pro)
  const clicks = pro
    ? await getLinkClicks(
        await createClient(),
        links.filter((l) => l.item_type === "button").map((l) => l.id),
      )
    : null;

  return (
    <EditorRoot
      page={page}
      links={links}
      socials={socials}
      siteUrl={getSiteUrl()}
      userId={user.id}
      pro={pro}
      clicks={clicks}
    />
  );
}
