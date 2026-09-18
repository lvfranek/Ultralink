"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { card, cardHeader, cardBody, label, input, dangerBtn, SectionTitle, FieldRow, StatusMsg } from "./settings-ui";

export function DangerZoneCard({ username }: { username: string }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirm !== username) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmUsername: confirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setDeleting(false);
        return;
      }
      router.push("/");
    } catch {
      setError("Network error. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div style={{ ...card, border: "1px solid rgba(220,38,38,0.2)" }}>
      <div style={cardHeader}>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          <SectionTitle>Danger zone</SectionTitle>
          <svg
            viewBox="0 0 16 16"
            style={{
              width: 16,
              height: 16,
              color: "#6B6B6B",
              transition: "transform 0.15s",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div style={cardBody}>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "#9A9A9A" }}>
            Deleting your account is permanent and cannot be undone. All your pages, links, and data will be removed,
            and any active subscription is canceled immediately.
          </p>
          <FieldRow>
            <label style={label}>
              Type your username <span style={{ color: "#ef4444", fontFamily: "monospace" }}>{username}</span> to
              confirm
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
              placeholder={username}
              style={input}
            />
          </FieldRow>
          {error && <StatusMsg type="error">{error}</StatusMsg>}
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirm !== username || deleting}
              style={dangerBtn(confirm !== username || deleting)}
            >
              {deleting ? "Deleting account…" : "Delete my account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
