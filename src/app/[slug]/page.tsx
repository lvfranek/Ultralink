import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*, page_links(*), page_socials(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!page) notFound();

  const typedPage = page as Page & { page_links: PageLink[]; page_socials: PageSocial[] };

  const activeLinks = (typedPage.page_links ?? [])
    .filter((l) => l.is_active)
    .sort((a, b) => a.position - b.position);

  const socials = (typedPage.page_socials ?? []).sort((a, b) => a.position - b.position);

  return (
    <>
      {/* Age gate overlay (client component, uses sessionStorage) */}
      {typedPage.age_gate_enabled && <AgeGate slug={slug} />}

      {/* Public page */}
      <ProfilePageView
        page={typedPage}
        links={activeLinks}
        socials={socials}
        theme={typedPage.theme as Record<string, unknown>}
      />

      {/* Footer */}
      <footer className="w-full flex items-center justify-center gap-4 py-6 mt-4">
        <a href="/privacy" className="text-xs text-text-subtle hover:text-text-muted transition-colors">Privacy</a>
        <span className="text-text-subtle text-xs">·</span>
        <a href="/terms" className="text-xs text-text-subtle hover:text-text-muted transition-colors">Terms</a>
        <span className="text-text-subtle text-xs">·</span>
        <a
          href={`mailto:report@ultralink.bio?subject=Report: ${encodeURIComponent(slug)}`}
          className="text-xs text-text-subtle hover:text-text-muted transition-colors"
        >
          Report
        </a>
      </footer>
    </>
  );
}
