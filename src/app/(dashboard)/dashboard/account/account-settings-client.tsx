"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateUsername, updateEmail, updatePassword } from "@/app/actions/account";
import { createPortalSession } from "@/app/actions/billing";
import { inviteEditor, removeEditor, revokeInvite, resendInvite } from "@/app/actions/team";
import type { SubscriptionStatus, PlanInterval, TeamMember, TeamInvite } from "@/lib/supabase/types";
import { getEffectivePlan, isProActive } from "@/lib/supabase/types";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid" | "unchanged";

// ─── Shared primitives ────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "#1A1A1A",
  border: "1px solid rgba(255,255,255,.07)",
  borderRadius: 14,
  overflow: "hidden",
  marginBottom: 16,
};

const cardHeader: React.CSSProperties = {
  padding: "14px 20px",
  borderBottom: "1px solid rgba(255,255,255,.06)",
};

const cardBody: React.CSSProperties = {
  padding: "20px",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#9A9A9A",
  marginBottom: 6,
  letterSpacing: "0.02em",
};

const input: React.CSSProperties = {
  width: "100%",
  background: "#2A2A2A",
  border: "1px solid rgba(255,255,255,.10)",
  color: "#ffffff",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const inputError: React.CSSProperties = {
  ...input,
  border: "1px solid rgba(220,38,38,0.5)",
};

const saveBtn = (disabled: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 18px",
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 8,
  border: "none",
  background: disabled ? "rgba(255,255,255,.08)" : "#ffffff",
  color: disabled ? "#6B6B6B" : "#000000",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
  transition: "opacity 0.15s",
});

const dangerBtn = (disabled: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 18px",
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 8,
  border: "1px solid rgba(220,38,38,0.3)",
  background: "rgba(220,38,38,0.08)",
  color: disabled ? "#9A9A9A" : "#ef4444",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
  transition: "opacity 0.15s",
});

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6B6B6B", margin: 0, textTransform: "uppercase" }}>
      {children}
    </p>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>;
}

function StatusMsg({ type, children }: { type: "error" | "success" | "info"; children: React.ReactNode }) {
  const colors = {
    error: { bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.25)", text: "#ef4444" },
    success: { bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.25)", text: "#10b981" },
    info: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)", text: "#9A9A9A" },
  }[type];
  return (
    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: colors.bg, border: `1px solid ${colors.border}`, fontSize: 13, color: colors.text }}>
      {children}
    </div>
  );
}

// ─── Plan & usage ─────────────────────────────────────────────────────────────

interface PlanCardProps {
  subscriptionStatus: SubscriptionStatus;
  planTier: number | null;
  planInterval: PlanInterval | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
  stripeCustomerId: string | null;
  linksUsed: number;
  linkCap: number;
  isEditor: boolean;
}

function PlanCard({
  subscriptionStatus,
  planTier,
  planInterval,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  gracePeriodEndsAt,
  stripeCustomerId,
  linksUsed,
  linkCap,
  isEditor,
}: PlanCardProps) {
  const [pending, startTransition] = useTransition();
  const effectivePlan = getEffectivePlan({ subscription_status: subscriptionStatus });
  const atLimit = linksUsed >= linkCap;
  const isPastDue = subscriptionStatus === "grace";
  const isFullyCanceled = subscriptionStatus === "canceled";
  const isCancelPending = cancelAtPeriodEnd && !isFullyCanceled;
  const isCanceled = isFullyCanceled || isCancelPending;

  const handleManageBilling = () => {
    startTransition(async () => {
      const result = await createPortalSession();
      if ("url" in result) window.location.href = result.url;
    });
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getBillingLabel = (status: SubscriptionStatus): string => {
    if (isCancelPending) return "Access ends";
    switch (status) {
      case "active":
      case "trialing":
        return "Next billing";
      case "grace":
        return "Payment due by";
      case "canceled":
        return "Access ends";
      default:
        return "Next billing";
    }
  };

  const periodEndPassed = currentPeriodEnd ? new Date(currentPeriodEnd) < new Date() : false;
  const showPeriodEndRow =
    currentPeriodEnd && (effectivePlan === "pro" || isCanceled) && !(isCanceled && periodEndPassed);

  if (isEditor) {
    return (
      <div style={card}>
        <div style={cardHeader}><SectionTitle>Plan &amp; usage</SectionTitle></div>
        <div style={cardBody}>
          <p style={{ fontSize: 14, color: "#6B6B6B", margin: 0 }}>
            Switch to your own account to manage billing and team.
          </p>
        </div>
      </div>
    );
  }

  const planLabel =
    effectivePlan === "pro"
      ? `Pro · ${planTier ?? 1} ${planTier === 1 ? "link" : "links"} · ${planInterval === "annual" ? "Annual" : "Monthly"}`
      : "Free";

  return (
    <div style={card}>
      <div style={cardHeader}><SectionTitle>Plan &amp; usage</SectionTitle></div>
      <div style={cardBody}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <span style={{ fontSize: 14, color: "#9A9A9A" }}>Plan</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{planLabel}</span>
            {isPastDue && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(220,38,38,0.12)", color: "#ef4444", border: "1px solid rgba(220,38,38,0.3)" }}>
                Past due
              </span>
            )}
            {isCanceled && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#6B6B6B", border: "1px solid rgba(255,255,255,.10)" }}>
                {isCancelPending ? "Canceling" : "Canceled"}
              </span>
            )}
          </div>
        </div>

        {showPeriodEndRow && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize: 14, color: "#9A9A9A" }}>{getBillingLabel(subscriptionStatus)}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{formatDate(currentPeriodEnd)}</span>
          </div>
        )}

        {isPastDue && gracePeriodEndsAt && (
          <div style={{ padding: "10px 14px", marginBottom: 8, marginTop: 8, borderRadius: 8, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", fontSize: 13, color: "#ef4444" }}>
            Your payment failed. Update your card by {formatDate(gracePeriodEndsAt)} or your pages will go offline.
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
          <span style={{ fontSize: 14, color: "#9A9A9A" }}>Links used</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: atLimit ? "#C47A3A" : "#ffffff" }}>
            {linksUsed} / {linkCap}
          </span>
        </div>

        {atLimit && effectivePlan === "free" && (
          <div style={{ marginTop: 4, padding: "10px 14px", borderRadius: 8, background: "rgba(196,122,58,0.08)", border: "1px solid rgba(196,122,58,0.25)", fontSize: 13, color: "#C47A3A" }}>
            You&apos;ve reached your plan limit.{" "}
            <a href="/#pricing" style={{ color: "#C47A3A", textDecoration: "underline", textUnderlineOffset: 2 }}>
              Upgrade to add more
            </a>
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {stripeCustomerId && (
            <button
              type="button"
              onClick={handleManageBilling}
              disabled={pending}
              style={saveBtn(pending)}
            >
              {pending ? "Loading…" : "Manage billing"}
            </button>
          )}
          {effectivePlan === "free" && (
            <a
              href="/#pricing"
              style={{ display: "inline-flex", alignItems: "center", padding: "9px 18px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", background: "#ffffff", color: "#000000", textDecoration: "none", cursor: "pointer" }}
            >
              Upgrade
            </a>
          )}
          {(isFullyCanceled || isPastDue) && (
            <a
              href="/#pricing"
              style={{ display: "inline-flex", alignItems: "center", padding: "9px 18px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", background: "#ffffff", color: "#000000", textDecoration: "none", cursor: "pointer" }}
            >
              Resubscribe
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Team card ────────────────────────────────────────────────────────────────

type EnrichedMember = TeamMember & { editor_username: string; editor_display_name: string | null };

interface TeamCardProps {
  subscriptionStatus: SubscriptionStatus;
  gracePeriodEndsAt: string | null;
  teamMembers: EnrichedMember[];
  pendingInvites: TeamInvite[];
  ownerUsername: string;
}

function TeamCard({
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
        <div style={cardHeader}><SectionTitle>Team</SectionTitle></div>
        <div style={cardBody}>
          <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 16px" }}>
            Inviting team members is a Pro feature.
          </p>
          <a
            href="/#pricing"
            style={{ display: "inline-flex", alignItems: "center", padding: "9px 18px", fontSize: 13, fontWeight: 600, borderRadius: 8, background: "#ffffff", color: "#000000", textDecoration: "none" }}
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={cardHeader}><SectionTitle>Team · {teamMembers.length + 1} member{teamMembers.length !== 0 ? "s" : ""}</SectionTitle></div>
      <div style={cardBody}>

        {/* Members list */}
        <div style={{ marginBottom: 20 }}>
          {/* Owner row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#ffffff", flexShrink: 0 }}>
              {ownerUsername.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ownerUsername}</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(201,168,106,0.08)", color: "#C9A86A", border: "1px solid rgba(201,168,106,0.3)", flexShrink: 0 }}>
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
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#ffffff", flexShrink: 0 }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#ffffff" }}>{displayName}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 12, color: "#6B6B6B" }}>{m.editor_username}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.04)", color: "#9A9A9A", border: "1px solid rgba(255,255,255,.08)", flexShrink: 0 }}>
                  Editor
                </span>
                {!isConfirming ? (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(m.editor_id)}
                    style={{ fontSize: 12, color: "#6B6B6B", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "4px 8px", borderRadius: 6, flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#6B6B6B"; e.currentTarget.style.background = "none"; }}
                  >
                    Remove
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleRemove(m.editor_id)}
                      disabled={isRemoving}
                      style={{ fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {isRemoving ? "…" : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(null)}
                      style={{ fontSize: 12, color: "#9A9A9A", background: "none", border: "1px solid rgba(255,255,255,.10)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}
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
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6B6B6B", margin: "12px 0 8px", textTransform: "uppercase" }}>Pending invites</p>
            {pendingInvites.map((inv) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#ffffff" }}>{inv.email}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6B6B6B" }}>Sent {formatDate(inv.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResend(inv.id)}
                  disabled={resending === inv.id}
                  style={{ fontSize: 12, color: "#9A9A9A", background: "none", border: "1px solid rgba(255,255,255,.10)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                >
                  {resending === inv.id ? "…" : "Resend"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRevoke(inv.id)}
                  disabled={revoking === inv.id}
                  style={{ fontSize: 12, color: "#6B6B6B", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "4px 8px", borderRadius: 6, flexShrink: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#6B6B6B"; }}
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
              onChange={(e) => { setInviteEmail(e.target.value); setInviteStatus(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
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

function ProfileCard({ initialUsername }: { initialUsername: string }) {
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const [username, setUsername] = useState(initialUsername);
  const [usernameState, setUsernameState] = useState<UsernameState>("unchanged");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback(async (value: string) => {
    if (!USERNAME_RE.test(value)) { setUsernameState("invalid"); return; }
    if (value === initialUsername) { setUsernameState("unchanged"); return; }
    setUsernameState("checking");
    const { data } = await supabaseRef.current.from("profiles").select("id").eq("username", value).maybeSingle();
    setUsernameState(data ? "taken" : "available");
  }, [initialUsername]);

  const handleUsernameChange = (value: string) => {
    const s = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(s);
    setStatus(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (s.length < 3) { setUsernameState(s.length === 0 ? "idle" : "invalid"); return; }
    if (s === initialUsername) { setUsernameState("unchanged"); return; }
    setUsernameState("checking");
    debounceRef.current = setTimeout(() => checkUsername(s), 400);
  };

  const canSave = username !== initialUsername && usernameState === "available";

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    try {
      const result = await updateUsername(username);
      if (result.error) {
        setStatus({ type: "error", msg: result.error });
      } else {
        setStatus({ type: "success", msg: "Username saved." });
        router.refresh();
      }
    } catch (e) {
      setStatus({ type: "error", msg: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  const usernameHint = usernameState === "invalid"
    ? { color: "#ef4444", text: "3–20 characters, lowercase letters, numbers, underscores." }
    : usernameState === "taken"
    ? { color: "#ef4444", text: "That username is already taken." }
    : usernameState === "available"
    ? { color: "#10b981", text: "Username is available." }
    : { color: "#6B6B6B", text: "3–20 characters, lowercase letters, numbers, underscores." };

  return (
    <div style={card}>
      <div style={cardHeader}><SectionTitle>Profile</SectionTitle></div>
      <div style={cardBody}>
        <FieldRow>
          <label style={label}>Username</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              style={{ ...(usernameState === "invalid" || usernameState === "taken" ? inputError : input), paddingRight: 36 }}
            />
            {usernameState === "checking" && (
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, border: "2px solid #9A9A9A", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.75s linear infinite" }} aria-hidden="true" />
            )}
            {usernameState === "available" && (
              <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#10b981" }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 8l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {(usernameState === "taken" || usernameState === "invalid") && (
              <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#ef4444" }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <p style={{ marginTop: 6, fontSize: 12, color: usernameHint.color }}>{usernameHint.text}</p>
        </FieldRow>
        {status && <StatusMsg type={status.type}>{status.msg}</StatusMsg>}
        <div style={{ marginTop: 20 }}>
          <button type="button" onClick={handleSave} disabled={!canSave || saving} style={saveBtn(!canSave || saving)}>
            {saving ? "Saving…" : "Save username"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email card ───────────────────────────────────────────────────────────────

function EmailCard({ email }: { email: string }) {
  const [expanded, setExpanded] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success" | "info"; msg: string } | null>(null);

  const handleSave = async () => {
    if (!newEmail || !currentPassword) return;
    setSaving(true);
    setStatus(null);
    const result = await updateEmail(newEmail, currentPassword);
    setSaving(false);
    if (result.error) {
      setStatus({ type: "error", msg: result.error });
    } else {
      setStatus({ type: "success", msg: result.message ?? "Email change requested." });
      setExpanded(false);
      setNewEmail("");
      setCurrentPassword("");
    }
  };

  return (
    <div style={card}>
      <div style={cardHeader}><SectionTitle>Email</SectionTitle></div>
      <div style={cardBody}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, color: "#ffffff" }}>{email}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B6B6B" }}>Your sign-in email address</p>
          </div>
          <button
            type="button"
            onClick={() => { setExpanded((v) => !v); setStatus(null); }}
            style={{ fontSize: 13, fontWeight: 500, color: "#9A9A9A", background: "none", border: "1px solid rgba(255,255,255,.10)", borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}
          >
            Change email
          </button>
        </div>

        {expanded && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <FieldRow>
              <label style={label}>New email address</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" style={input} />
            </FieldRow>
            <FieldRow>
              <label style={label}>Current password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Verify it&apos;s you" autoComplete="current-password" style={input} />
            </FieldRow>
            {status && <StatusMsg type={status.type}>{status.msg}</StatusMsg>}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button type="button" onClick={handleSave} disabled={saving || !newEmail || !currentPassword} style={saveBtn(saving || !newEmail || !currentPassword)}>
                {saving ? "Sending…" : "Confirm change"}
              </button>
              <button type="button" onClick={() => setExpanded(false)} style={{ fontSize: 13, fontWeight: 500, color: "#9A9A9A", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Password card ────────────────────────────────────────────────────────────

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSave = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    const result = await updatePassword(currentPassword, newPassword);
    setSaving(false);
    if (result.error) {
      setStatus({ type: "error", msg: result.error });
    } else {
      setStatus({ type: "success", msg: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div style={card}>
      <div style={cardHeader}><SectionTitle>Password</SectionTitle></div>
      <div style={cardBody}>
        <FieldRow>
          <label style={label}>Current password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" placeholder="Your current password" style={input} />
        </FieldRow>
        <FieldRow>
          <label style={label}>New password <span style={{ fontWeight: 400, color: "#6B6B6B" }}>(min. 8 characters)</span></label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" style={input} />
        </FieldRow>
        <FieldRow>
          <label style={label}>Confirm new password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Repeat new password" style={mismatch ? inputError : input} />
          {mismatch && <p style={{ marginTop: 6, fontSize: 12, color: "#ef4444" }}>Passwords don&apos;t match.</p>}
        </FieldRow>
        {status && <StatusMsg type={status.type}>{status.msg}</StatusMsg>}
        <div style={{ marginTop: 20 }}>
          <button type="button" onClick={handleSave} disabled={!canSave || saving} style={saveBtn(!canSave || saving)}>
            {saving ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Timezone helpers ─────────────────────────────────────────────────────────

function getTzOffset(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    return raw.replace("GMT", "UTC");
  } catch {
    return "UTC";
  }
}

function getTzLabel(tz: string): string {
  const offset = getTzOffset(tz);
  const name = tz.replace(/_/g, " ").replace("/", " / ");
  return `(${offset}) ${name}`;
}

// ─── Preferences card ─────────────────────────────────────────────────────────

function PreferencesCard() {
  const STORAGE_KEY = "ultralink:timezone";
  const [timezone, setTimezone] = useState("");
  const [saved, setSaved] = useState(false);

  const timezones = [
    "Pacific/Midway", "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles",
    "America/Denver", "America/Chicago", "America/New_York", "America/Sao_Paulo",
    "Atlantic/Azores", "Europe/London", "Europe/Paris", "Europe/Berlin",
    "Europe/Helsinki", "Europe/Moscow", "Asia/Dubai", "Asia/Kolkata",
    "Asia/Bangkok", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney",
    "Pacific/Auckland",
  ];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTimezone(stored);
    } else {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(detected);
      } catch {
        setTimezone("UTC");
      }
    }
  }, []);

  const handleSave = () => {
    if (!timezone) return;
    localStorage.setItem(STORAGE_KEY, timezone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={card}>
      <div style={cardHeader}><SectionTitle>Preferences</SectionTitle></div>
      <div style={cardBody}>
        <FieldRow>
          <label style={label}>Timezone</label>
          <select
            value={timezone}
            onChange={(e) => { setTimezone(e.target.value); setSaved(false); }}
            style={{ ...input, appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%239A9A9A' stroke-width='1.5'%3E%3Cpath d='M4 6l4 4 4-4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: 16, paddingRight: 32, cursor: "pointer" }}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz} style={{ background: "#1A1A1A" }}>{getTzLabel(tz)}</option>
            ))}
            {timezone && !timezones.includes(timezone) && (
              <option value={timezone} style={{ background: "#1A1A1A" }}>{getTzLabel(timezone)}</option>
            )}
          </select>
          <p style={{ marginTop: 6, fontSize: 12, color: "#6B6B6B" }}>Used for analytics time displays. Saved locally.</p>
        </FieldRow>
        <div style={{ marginTop: 4 }}>
          <button type="button" onClick={handleSave} disabled={!timezone} style={saveBtn(!timezone)}>
            {saved ? "Saved!" : "Save preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Danger zone ──────────────────────────────────────────────────────────────

function DangerZoneCard({ username }: { username: string }) {
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
          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          <SectionTitle>Danger zone</SectionTitle>
          <svg viewBox="0 0 16 16" style={{ width: 16, height: 16, color: "#6B6B6B", transition: "transform 0.15s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div style={cardBody}>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "#9A9A9A" }}>
            Deleting your account is permanent and cannot be undone. All your pages, links, and data will be removed.
          </p>
          <FieldRow>
            <label style={label}>
              Type your username <span style={{ color: "#ef4444", fontFamily: "monospace" }}>{username}</span> to confirm
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(null); }}
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

interface AccountSettingsClientProps {
  email: string;
  username: string;
  linkCap: number;
  linksUsed: number;
  subscriptionStatus: SubscriptionStatus;
  planTier: number | null;
  planInterval: PlanInterval | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
  stripeCustomerId: string | null;
  isEditor: boolean;
  teamMembers: EnrichedMember[];
  pendingInvites: TeamInvite[];
}

export function AccountSettingsClient({
  email,
  username,
  linkCap,
  linksUsed,
  subscriptionStatus,
  planTier,
  planInterval,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  gracePeriodEndsAt,
  stripeCustomerId,
  isEditor,
  teamMembers,
  pendingInvites,
}: AccountSettingsClientProps) {
  return (
    <div style={{ minHeight: "100%", background: "#131313" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>
            Account settings
          </h1>
          <p style={{ fontSize: 14, color: "#6B6B6B", margin: 0 }}>
            Manage your account, security, and preferences.
          </p>
        </div>

        <PlanCard
          subscriptionStatus={subscriptionStatus}
          planTier={planTier}
          planInterval={planInterval}
          currentPeriodEnd={currentPeriodEnd}
          cancelAtPeriodEnd={cancelAtPeriodEnd}
          gracePeriodEndsAt={gracePeriodEndsAt}
          stripeCustomerId={stripeCustomerId}
          linksUsed={linksUsed}
          linkCap={linkCap}
          isEditor={isEditor}
        />
        <PreferencesCard />

        {!isEditor && (
          <TeamCard
            subscriptionStatus={subscriptionStatus}
            gracePeriodEndsAt={gracePeriodEndsAt}
            teamMembers={teamMembers}
            pendingInvites={pendingInvites}
            ownerUsername={username}
          />
        )}

        <ProfileCard initialUsername={username} />
        <EmailCard email={email} />
        <PasswordCard />
        <DangerZoneCard username={username} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
