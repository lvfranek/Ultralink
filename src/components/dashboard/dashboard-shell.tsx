"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreateLinkModal } from "@/components/dashboard/create-link-modal";
import { LinksList } from "@/components/dashboard/links-list";
import type { Page, SubscriptionStatus } from "@/lib/supabase/types";
import Link from "next/link";

interface DashboardShellProps {
  pages: Page[];
  siteUrl: string;
  initialSlug?: string;
  linkCap?: number;
  upgraded?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  gracePeriodEndsAt?: string | null;
  stripeCustomerId?: string | null;
  survivingPageId?: string | null;
  lapsed?: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DashboardShell({
  pages,
  siteUrl,
  initialSlug,
  linkCap = 1,
  upgraded = false,
  subscriptionStatus = "none",
  gracePeriodEndsAt,
  survivingPageId,
  lapsed = false,
}: DashboardShellProps) {
  const [showCreate, setShowCreate] = useState(false);
  const searchParams = useSearchParams();
  const showUpgradedBanner = upgraded || searchParams.get("upgraded") === "1";

  const isGrace = subscriptionStatus === "grace";
  const hiddenCount = lapsed && survivingPageId ? pages.filter((p) => p.id !== survivingPageId).length : 0;

  return (
    <div className="min-h-full" style={{ background: "#131313" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Upgraded success banner */}
        {showUpgradedBanner && (
          <div
            className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl"
            style={{ background: "rgba(5,150,105,0.10)", border: "1px solid rgba(5,150,105,0.25)" }}
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" fill="none" stroke="#10b981" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#10b981" }}>
              You&apos;re now on Pro. Your pages and analytics are live.
            </p>
          </div>
        )}

        {/* Grace period banner */}
        {isGrace && gracePeriodEndsAt && (
          <div
            className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl"
            style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)" }}
          >
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" fill="none" stroke="#ef4444" strokeWidth="1.5" aria-hidden="true">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm" style={{ color: "#ef4444" }}>
                Your payment failed. Update your card by{" "}
                <strong>{formatDate(gracePeriodEndsAt)}</strong> or your pages will go offline.
              </p>
            </div>
            <Link
              href="/dashboard/account"
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(220,38,38,0.15)", color: "#ef4444", textDecoration: "none", border: "1px solid rgba(220,38,38,0.3)", whiteSpace: "nowrap" }}
            >
              Manage billing
            </Link>
          </div>
        )}

        {/* Lapsed / canceled banner */}
        {lapsed && !isGrace && hiddenCount > 0 && (
          <div
            className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,.10)" }}
          >
            <p className="text-sm" style={{ color: "#9A9A9A" }}>
              Your subscription has ended.{" "}
              <strong style={{ color: "#ffffff" }}>{hiddenCount} {hiddenCount === 1 ? "page is" : "pages are"} hidden</strong>.
              Resubscribe to restore them.
            </p>
            <Link
              href="/#pricing"
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: "#ffffff", color: "#000000", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Upgrade
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ color: "#ffffff" }}>
              Links{" "}
              <span style={{ color: "#6B6B6B", fontWeight: 500 }}>
                {pages.length}/{linkCap}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              title="Groups are coming soon"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 h-9 text-xs font-medium rounded-full cursor-not-allowed"
              style={{ color: "#9A9A9A", border: "1px solid rgba(255,255,255,.08)" }}
            >
              New group
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ color: "#9A9A9A", border: "1px solid rgba(255,255,255,.08)" }}
              >
                Soon
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-full transition-opacity hover:opacity-85 cursor-pointer"
              style={{ background: "#ffffff", color: "#000000" }}
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" />
              </svg>
              New link
            </button>
          </div>
        </div>

        {/* Empty state */}
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)" }}
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" style={{ color: "#9A9A9A" }} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M14.828 14.828a4 4 0 015.656 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "#ffffff" }}>
              Create your first link page
            </h2>
            <p className="text-sm max-w-xs mb-6" style={{ color: "#9A9A9A" }}>
              Your link page is where you share everything — your content, links, and profile — in one place.
            </p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 h-9 px-5 text-xs font-semibold rounded-full transition-opacity hover:opacity-85 cursor-pointer"
              style={{ background: "#ffffff", color: "#000000" }}
            >
              Get started
            </button>
          </div>
        ) : (
          <LinksList
            pages={pages}
            siteUrl={siteUrl}
            linkCap={linkCap}
            survivingPageId={lapsed ? survivingPageId ?? null : null}
          />
        )}

        {showCreate && (
          <CreateLinkModal
            initialSlug={initialSlug}
            onClose={() => setShowCreate(false)}
          />
        )}
      </div>
    </div>
  );
}
