"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Page } from "@/lib/supabase/types";
import { togglePageActive, deletePage } from "@/app/actions/pages";

interface LinksListProps {
  pages: Page[];
  siteUrl: string;
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${
        active ? "bg-emerald-500" : "bg-border-strong"
      }`}
      aria-label={active ? "Active" : "Inactive"}
    />
  );
}

function KebabMenu({ page }: { page: Page }) {
  const [open, setOpen] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startDelete(async () => {
      await deletePage(page.id);
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-[var(--radius-sm)] text-text-subtle hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
        aria-label="More options"
        aria-expanded={open}
      >
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white border border-border-strong rounded-[var(--radius)] py-1 shadow-[0_4px_20px_rgba(0,0,0,0.10)]">
            <Link
              href={`/dashboard/links/${page.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M11 2l3 3-8 8H3v-3L11 2z" strokeLinejoin="round" />
              </svg>
              Edit
            </Link>
            <div className="border-t border-border mx-2 my-1" />
            {!showConfirm ? (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-surface transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M2 4h12M5 4V2h6v2M13 4l-1 10H4L3 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Delete
              </button>
            ) : (
              <div className="px-3 py-2 space-y-1.5">
                <p className="text-xs text-text-muted">Delete this link?</p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setShowConfirm(false); handleDelete(); }}
                    disabled={deleting}
                    className="flex-1 py-1 text-xs text-red-500 hover:text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    {deleting ? "…" : "Yes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-1 text-xs text-text-muted border border-border rounded hover:bg-surface transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PageRow({ page, siteUrl }: { page: Page; siteUrl: string }) {
  const [active, setActive] = useState(page.is_active);
  const [toggling, startToggle] = useTransition();
  const [copied, setCopied] = useState(false);

  const pageUrl = `${siteUrl}/${page.slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    startToggle(async () => {
      const result = await togglePageActive(page.id, next);
      if ("error" in result) setActive(active);
    });
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-surface/60 transition-colors group first:rounded-t-[var(--radius-lg)] last:rounded-b-[var(--radius-lg)]">
      {/* Drag handle */}
      <div className="cursor-grab text-text-subtle opacity-0 group-hover:opacity-40 transition-opacity shrink-0" aria-hidden="true">
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
          <circle cx="5.5" cy="4.5" r="1" />
          <circle cx="10.5" cy="4.5" r="1" />
          <circle cx="5.5" cy="8" r="1" />
          <circle cx="10.5" cy="8" r="1" />
          <circle cx="5.5" cy="11.5" r="1" />
          <circle cx="10.5" cy="11.5" r="1" />
        </svg>
      </div>

      <StatusDot active={active} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">
          {page.title || <span className="text-text-subtle italic">Untitled</span>}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-text-subtle truncate">{pageUrl}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 p-0.5 rounded text-text-subtle hover:text-text transition-colors cursor-pointer"
            aria-label="Copy link"
          >
            {copied ? (
              <svg viewBox="0 0 14 14" className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M2 7l3.5 3.5L12 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="5" y="5" width="8" height="8" rx="1" />
                <path d="M9 5V2a1 1 0 00-1-1H2a1 1 0 00-1 1v6a1 1 0 001 1h3" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Active toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label={active ? "Deactivate" : "Activate"}
          onClick={handleToggle}
          disabled={toggling}
          className={[
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer disabled:cursor-wait",
            active ? "bg-gold" : "bg-surface-2 border border-border-strong",
          ].join(" ")}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
              active ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>

        <KebabMenu page={page} />
      </div>
    </div>
  );
}

export function LinksList({ pages, siteUrl }: LinksListProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"manual" | "newest">("newest");

  const filtered = pages
    .filter((p) => {
      const q = search.toLowerCase();
      return p.slug.includes(q) || p.title.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

  const activeCount = pages.filter((p) => p.is_active).length;

  return (
    <div>
      {/* Counts + sort */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-sm text-text-muted">
          <span className="text-text font-medium">{pages.length}</span>{" "}
          {pages.length === 1 ? "link" : "links"}
          {" · "}
          <span className="text-text font-medium">{activeCount}</span> active
        </p>
        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "manual" | "newest")}
            className="bg-surface-2 border border-border-strong text-text-muted text-xs rounded-[var(--radius-sm)] px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-text/20 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="manual">Manual order</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          viewBox="0 0 16 16"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="6.5" cy="6.5" r="4" />
          <path d="M11 11l3 3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Search by slug or title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius)] pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-text/20 focus:border-text/30 transition-colors"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-text-subtle py-8">
          {search ? "No links match your search." : ""}
        </p>
      ) : (
        <div className="bg-white border border-border rounded-[var(--radius-lg)] shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          {filtered.map((page) => (
            <PageRow key={page.id} page={page} siteUrl={siteUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
