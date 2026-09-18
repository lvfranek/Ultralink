"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteEditor, removeEditor, revokeInvite, resendInvite } from "@/app/actions/team";
import type { SubscriptionStatus, TeamMember, TeamInvite } from "@/lib/supabase/types";
import { isProActive } from "@/lib/supabase/types";
import Link from "next/link";
import { card, cardHeader, cardBody, label, input, saveBtn, SectionTitle, StatusMsg } from "./settings-ui";

export type EnrichedMember = TeamMember & { editor_username: string; editor_display_name: string | null };

interface TeamCardProps {
  subscriptionStatus: SubscriptionStatus;
  gracePeriodEndsAt: string | null;
  teamMembers: EnrichedMember[];
  pendingInvites: TeamInvite[];
  ownerUsername: string;
}

export function TeamCard({
  subscriptionStatus,
  gracePeriodEndsAt,
  teamMembers,
  pendingInvites,
  ownerUsername,
}: TeamCardProps) {
  const router = useRouter();
  const isPro = isProActive({ subscription_status: subscriptionStatus, grace_period_ends_at: gracePeriodEndsAt });

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, startInvite] = useTransition();
  const [inviteStatus, setInviteStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);

  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [revoking, setRevoking] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);

  const handleInvite = () => {
    if (!inviteEmail) return;
    setInviteStatus(null);
    startInvite(async () => {
      const res = await inviteEditor(inviteEmail);
      if (res.error) {
        setInviteStatus({ type: "error", msg: res.error });
      } else {
        setInviteStatus({ type: "success", msg: `Invite sent to ${inviteEmail}.` });
        setInviteEmail("");
        router.refresh();
      }
    });
  };

  const handleRemove = async (editorId: string) => {
    setRemoving(editorId);
    setRemoveError(null);
    const res = await removeEditor(editorId);
    setRemoving(null);
    setConfirmRemove(null);
    if (res.error) setRemoveError(res.error);
    else router.refresh();
  };

  const handleRevoke = async (inviteId: string) => {
    setRevoking(inviteId);
    await revokeInvite(inviteId);
    setRevoking(null);
    router.refresh();
  };

  const handleResend = async (inviteId: string) => {
    setResending(inviteId);
    await resendInvite(inviteId);
    setResending(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (!isPro) {
    return (
      <div style={card}>
        <div style={cardHeader}>
          <SectionTitle>Team</SectionTitle>
        </div>
        <div style={cardBody}>
          <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 16px" }}>Inviting team members is a Pro feature.</p>
          <Link
            href="/#pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              background: "#ffffff",
              color: "#000000",
              textDecoration: "none",
            }}
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={cardHeader}>
        <SectionTitle>
          Team · {teamMembers.length + 1} member{teamMembers.length !== 0 ? "s" : ""}
        </SectionTitle>
      </div>
      <div style={cardBody}>
        {/* Members list */}
        <div style={{ marginBottom: 20 }}>
          {/* Owner row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#2A2A2A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              {ownerUsername.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#ffffff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ownerUsername}
              </p>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(201,168,106,0.08)",
                color: "#C9A86A",
                border: "1px solid rgba(201,168,106,0.3)",
                flexShrink: 0,
              }}
            >
              Owner
            </span>
          </div>

          {teamMembers.length === 0 && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "#6B6B6B" }}>
              No team members yet. Invite editors below.
            </p>
          )}

          {teamMembers.map((m) => {
            const displayName = m.editor_display_name || m.editor_username;
            const isConfirming = confirmRemove === m.editor_id;
            const isRemoving = removing === m.editor_id;
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,.05)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#2A2A2A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#ffffff" }}>{displayName}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 12, color: "#6B6B6B" }}>{m.editor_username}</p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.04)",
                    color: "#9A9A9A",
                    border: "1px solid rgba(255,255,255,.08)",
                    flexShrink: 0,
                  }}
                >
                  Editor
                </span>
                {!isConfirming ? (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(m.editor_id)}
                    style={{
                      fontSize: 12,
                      color: "#6B6B6B",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: "4px 8px",
                      borderRadius: 6,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.background = "rgba(239,68,68,.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#6B6B6B";
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    Remove
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleRemove(m.editor_id)}
                      disabled={isRemoving}
                      style={{
                        fontSize: 12,
                        color: "#ef4444",
                        background: "rgba(239,68,68,.10)",
                        border: "1px solid rgba(239,68,68,.3)",
                        borderRadius: 6,
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {isRemoving ? "…" : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(null)}
                      style={{
                        fontSize: 12,
                        color: "#9A9A9A",
                        background: "none",
                        border: "1px solid rgba(255,255,255,.10)",
                        borderRadius: 6,
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {removeError && <StatusMsg type="error">{removeError}</StatusMsg>}
        </div>

        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <div style={{ marginBottom: 20, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#6B6B6B",
                margin: "12px 0 8px",
                textTransform: "uppercase",
              }}
            >
              Pending invites
            </p>
            {pendingInvites.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,.04)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#ffffff" }}>{inv.email}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6B6B6B" }}>Sent {formatDate(inv.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResend(inv.id)}
                  disabled={resending === inv.id}
                  style={{
                    fontSize: 12,
                    color: "#9A9A9A",
                    background: "none",
                    border: "1px solid rgba(255,255,255,.10)",
                    borderRadius: 6,
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  {resending === inv.id ? "…" : "Resend"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRevoke(inv.id)}
                  disabled={revoking === inv.id}
                  style={{
                    fontSize: 12,
                    color: "#6B6B6B",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: "4px 8px",
                    borderRadius: 6,
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#6B6B6B";
                  }}
                >
                  {revoking === inv.id ? "…" : "Revoke"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Invite form */}
        <div style={{ paddingTop: pendingInvites.length > 0 ? 4 : 0 }}>
          <label style={label}>Invite by email</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteStatus(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInvite();
              }}
              placeholder="editor@example.com"
              style={{ ...input, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              style={saveBtn(inviting || !inviteEmail)}
            >
              {inviting ? "Sending…" : "Send invite"}
            </button>
          </div>
          {inviteStatus && <StatusMsg type={inviteStatus.type}>{inviteStatus.msg}</StatusMsg>}
        </div>
      </div>
    </div>
  );
}

// ─── Profile card ─────────────────────────────────────────────────────────────
