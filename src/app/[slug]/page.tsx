import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { PageWithLinks } from "@/lib/supabase/types";

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
    .select("*, page_links(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!page) notFound();

  const typedPage = page as PageWithLinks;
  const activeLinks = (typedPage.page_links ?? [])
    .filter((l) => l.is_active)
    .sort((a, b) => a.position - b.position);

  const initial = (typedPage.title || slug).charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center px-4 py-12 sm:py-16">
      {/* Profile card */}
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Avatar */}
        {typedPage.avatar_url ? (
          <img
            src={typedPage.avatar_url}
            alt={typedPage.title || slug}
            className="w-24 h-24 rounded-full object-cover mb-5 border-2 border-gold/30 shadow-[0_0_20px_rgba(201,168,106,0.15)]"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-bg mb-5 shadow-[0_0_20px_rgba(201,168,106,0.15)]"
            style={{ background: "linear-gradient(135deg, #E6C878 0%, #C9A86A 100%)" }}
            aria-hidden="true"
          >
            {initial}
          </div>
        )}

        {/* Name */}
        {typedPage.title && (
          <h1 className="text-xl font-bold text-text text-center mb-2">
            {typedPage.title}
          </h1>
        )}

        {/* Bio */}
        {typedPage.bio && (
          <p className="text-sm text-text-muted text-center mb-8 max-w-xs leading-relaxed">
            {typedPage.bio}
          </p>
        )}

        {/* Links — real anchor tags, always pointing to true destination */}
        {activeLinks.length > 0 ? (
          <nav
            className="w-full space-y-3 mt-2"
            aria-label={`${typedPage.title || slug}'s links`}
          >
            {activeLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-5 py-4 rounded-[var(--radius)] border border-border-strong bg-surface text-text text-sm font-medium hover:border-gold/40 hover:bg-surface-2 hover:text-gold transition-all duration-150 active:scale-[0.99] shadow-sm"
              >
                {link.label || link.url}
              </a>
            ))}
          </nav>
        ) : (
          <p className="text-sm text-text-subtle text-center mt-4">
            No links yet.
          </p>
        )}

        {/* Ultralink attribution */}
        <div className="mt-12 flex items-center gap-1.5">
          <a
            href="https://ultralink.bio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-subtle hover:text-text-muted transition-colors"
          >
            Powered by <span className="text-gold font-medium">ultralink</span>
          </a>
        </div>
      </div>
    </div>
  );
}
