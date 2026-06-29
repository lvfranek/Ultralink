"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Page } from "@/lib/supabase/types";
import { deletePage } from "@/app/actions/pages";

interface LinksListProps {
  pages: Page[];
  siteUrl: string;
  linkCap?: number;
}

type SortKey = "manual" | "name-az" | "newest" | "oldest";

function PageRow({ page, siteUrl }: { page: Page; siteUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, startDelete] = useTransition();

  const pageUrl = `${siteUrl}/${page.slug}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    startDelete(async () => {
      await deletePage(page.id);
    });
  };

  return (
    <div
      className="flex items-center gap-3 p-4 group cursor-default"
      style={{
        background: hovered ? "#1F1F1F" : "#1A1A1A",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 14,
        marginBottom: 8,
        transition: "background 120ms",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "#ffffff" }}
        >
          {page.title || <span className="italic" style={{ color: "#9A9A9A" }}>Untitled</span>}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs truncate hover:underline"
            style={{ color: "#9A9A9A", textUnderlineOffset: 2 }}
          >
            {pageUrl}
          </a>
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
        {/* Edit */}
        <Link
          href={`/dashboard/links/${page.id}`}
          className="p-1.5 rounded-lg transition-colors cursor-pointer"
          style={{ color: "#9A9A9A" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9A9A9A"; e.currentTarget.style.background = ""; }}
          aria-label="Edit"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M11 2l3 3-8 8H3v-3L11 2z" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Delete */}
        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: "#9A9A9A" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9A9A9A"; e.currentTarget.style.background = ""; }}
            aria-label="Delete"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 4h12M5 4V2h6v2M13 4l-1 10H4L3 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-1 text-xs text-red-400 border border-red-800/50 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-40"
            >
              {deleting ? "…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="px-2 py-1 text-xs border rounded-lg transition-colors cursor-pointer"
              style={{ color: "#9A9A9A", borderColor: "rgba(255,255,255,.12)" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LinksList({ pages, siteUrl, linkCap: _linkCap = 1 }: LinksListProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("manual");

  const filtered = pages
    .filter((p) => {
      const q = search.toLowerCase();
      return p.slug.includes(q) || p.title.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "name-az") {
        return (a.title || a.slug).localeCompare(b.title || b.slug);
      }
      if (sort === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sort === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return 0; // manual
    });

  return (
    <div>
      {/* Search + Sort inline */}
      <div className="flex items-center gap-2 mb-5">
        {/* Search */}
        <div className="relative flex-1">
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

        {/* Sort dropdown — tight arrow */}
        <div className="relative flex-shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-xs focus:outline-none cursor-pointer"
            style={{
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 10,
              color: "#9A9A9A",
              padding: "0 24px 0 10px",
              height: 38,
              appearance: "none",
              WebkitAppearance: "none",
            }}
          >
            <option value="manual">Manual order</option>
            <option value="name-az">Name (A → Z)</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          {/* Tight chevron */}
          <svg
            viewBox="0 0 10 6"
            className="absolute pointer-events-none"
            style={{ width: 8, height: 8, right: 8, top: "50%", transform: "translateY(-50%)", color: "#9A9A9A" }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
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
