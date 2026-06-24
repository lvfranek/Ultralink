"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateLinkModal } from "@/components/dashboard/create-link-modal";
import { LinksList } from "@/components/dashboard/links-list";
import type { Page } from "@/lib/supabase/types";

interface DashboardShellProps {
  pages: Page[];
  siteUrl: string;
  initialSlug?: string;
}

export function DashboardShell({ pages, siteUrl, initialSlug }: DashboardShellProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text">Links</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            title="Groups are coming soon"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-subtle border border-border rounded-[var(--radius)] opacity-50 cursor-not-allowed"
          >
            New group
            <span className="text-[10px] uppercase tracking-wide">Soon</span>
          </button>
          <Button variant="gold" size="md" onClick={() => setShowCreate(true)}>
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
            </svg>
            New link
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-[var(--radius-lg)] flex items-center justify-center mb-5 bg-surface-2 border border-border">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M14.828 14.828a4 4 0 015.656 0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text mb-2">
            Create your first link page
          </h2>
          <p className="text-sm text-text-muted max-w-xs mb-6">
            Your link page is where you share everything — your content, links,
            and profile — in one place.
          </p>
          <Button variant="gold" size="md" onClick={() => setShowCreate(true)}>
            Get started
          </Button>
        </div>
      ) : (
        <LinksList pages={pages} siteUrl={siteUrl} />
      )}

      {showCreate && (
        <CreateLinkModal
          initialSlug={initialSlug}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
