import { notFound } from "next/navigation";
import { after } from "next/server";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { captureEvent } from "@/lib/analytics";
import { ProfilePageView } from "@/components/public/profile-page-view";
import { AgeGate } from "@/components/public/age-gate";
import type { Page, PageLink, PageSocial } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("title, bio, avatar_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!page) {
    return { title: "Not found" };
  }

  return {
    title: page.title || slug,
    description: page.bio || undefined,
    openGraph: {
      title: page.title || slug,
      description: page.bio || undefined,
      images: page.avatar_url ? [{ url: page.avatar_url }] : undefined,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: page.title || slug,
      description: page.bio || undefined,
      images: page.avatar_url ? [page.avatar_url] : undefined,
    },
  };
}

export default async function BioPage({ params }: Props) {
  const { slug } = await params;

  // Read request headers BEFORE after() — required by Next.js for Server Components
  const reqHeaders = await headers();
  const ua = reqHeaders.get("user-agent");
  const country = reqHeaders.get("x-vercel-ip-country");
  const referrer = reqHeaders.get("referer");

  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*, page_links(*), page_socials(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!page) notFound();

  // Fire-and-forget view capture — only reaches here if page exists
  after(async () => {
    await captureEvent({
      page_id: page.id,
      kind: "view",
      country,
      ua,
      referrer,
    });
  });

  const typedPage = page as Page & { page_links: PageLink[]; page_socials: PageSocial[] };

  const activeLinks = (typedPage.page_links ?? [])
    .filter((l) => l.is_active)
    .sort((a, b) => a.position - b.position);

  const socials = (typedPage.page_socials ?? []).sort((a, b) => a.position - b.position);

  return (
    <>
      {/* Age gate overlay (client component, uses sessionStorage) */}
      {typedPage.age_gate_enabled && <AgeGate slug={slug} />}

      {/* Public page — footer is rendered inside ProfilePageView on the themed background */}
      <ProfilePageView
        page={typedPage}
        links={activeLinks}
        socials={socials}
        theme={typedPage.theme as Record<string, unknown>}
      />
    </>
  );
}
