"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Page } from "@/lib/supabase/types";
import { deletePage } from "@/app/actions/pages";

interface LinksListProps {
  pages: Page[];
  siteUrl: string;
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
        className="p-1.5 rounded-lg transition-colors cursor-pointer"
        style={{ color: "#9A9A9A" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#9A9A9A"; e.currentTarget.style.background = ""; }}
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
          <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-[10px] py-1 shadow-[0_4px_20px_rgba(0,0,0,0.60)]" style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.10)" }}>
            <Link
              href={`/dashboard/links/${page.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
              style={{ color: "#9A9A9A" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#9A9A9A"; e.currentTarget.style.background = ""; }}
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M11 2l3 3-8 8H3v-3L11 2z" strokeLinejoin="round" />
              </svg>
              Edit
            </Link>
            <div className="mx-2 my-1" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }} />
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
                    className="flex-1 py-1 text-xs text-red-400 hover:text-red-300 border border-red-800/50 rounded hover:bg-red-950/30 transition-colors cursor-pointer"
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
  const [copied, setCopied] = useState(false);

  const pageUrl = `${siteUrl}/${page.slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="flex items-center gap-3 p-4 group"
      style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, marginBottom: 8 }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "#ffffff" }}>
          {page.title || <span className="italic" style={{ color: "#9A9A9A" }}>Untitled</span>}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs truncate" style={{ color: "#9A9A9A" }}>{pageUrl}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 p-0.5 rounded transition-colors cursor-pointer"
            style={{ color: copied ? "#34d399" : "#9A9A9A" }}
            aria-label="Copy link"
          >
            {copied ? (
              <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

  return (
    <div>
      {/* Counts + sort */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-sm" style={{ color: "#9A9A9A" }}>
          <span className="font-medium" style={{ color: "#ffffff" }}>{pages.length}</span>{" "}
          {pages.length === 1 ? "link" : "links"}
        </p>
        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "manual" | "newest")}
            className="text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", color: "#9A9A9A" }}
          >
            <option value="newest">Newest</option>
            <option value="manual">Manual order</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg
          viewBox="0 0 16 16"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "#9A9A9A" }}
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
          placeholder="Search links…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
          style={{
            background: "#1A1A1A",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 12,
            color: "#ffffff",
          }}
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm py-8" style={{ color: "#9A9A9A" }}>
          {search ? "No links match your search." : ""}
        </p>
      ) : (
        <div>
          {filtered.map((page) => (
            <PageRow key={page.id} page={page} siteUrl={siteUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
