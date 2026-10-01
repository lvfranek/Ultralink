"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  CreditCard,
  ExternalLink,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateEmail, updatePassword, updateUsername } from "@/app/actions/account";
import { createPortalSession } from "@/app/actions/billing";
import { inviteEditor, removeEditor, resendInvite, revokeInvite } from "@/app/actions/team";
import { getMonthlyEquivalentPrice, type BillingInterval } from "@/lib/config/pricing";
import type { SubscriptionStatus } from "@/lib/supabase/types";
import { useUpgradeModal } from "@/components/app/upgrade-context";
import { useToast } from "@/components/app/toast";
import { Avatar, cx, Dialog, prefersReducedMotion, RainbowBorder, spotlight } from "@/components/app/ui";
import s from "@/components/app/app.module.css";

export interface AccountMember {
  editorId: string;
  name: string;
  username: string;
}

export interface AccountInvite {
  id: string;
  email: string;
  expiresAt: string;
}

export interface AccountViewProps {
  userId: string;
  email: string;
  emailConfirmed: boolean;
  username: string;
  linkCap: number;
  linksUsed: number;
  subscriptionStatus: SubscriptionStatus;
  planTier: number | null;
  planInterval: BillingInterval | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
  stripeCustomerId: string | null;
  /** Viewing someone else's account as a team editor */
  isEditor: boolean;
  members: AccountMember[];
  invites: AccountInvite[];
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export function AccountView(props: AccountViewProps) {
  const sections = [
    { id: "plan", label: "Plan & usage", icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: Globe },
    ...(props.isEditor ? [] : [{ id: "team", label: "Team", icon: Users }]),
    { id: "profile", label: "Profile", icon: User },
    { id: "email", label: "Email", icon: Mail },
    { id: "password", label: "Password", icon: KeyRound },
    { id: "danger", label: "Danger zone", icon: AlertTriangle },
  ];
  const [active, setActive] = useState("plan");

  // Scroll spy: the section nearest the top of the viewport is the active one
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-40px 0px -60% 0px" },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // The section list only changes with isEditor, which is fixed for the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={cx(s.pageHead, s.enter)}>
        <h1 className={s.h1}>
          Your <span className={s.serif}>account.</span>
        </h1>
      </div>

      <div className={s.settings}>
        <nav className={s.subnav} aria-label="Settings sections">
          {sections.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cx(s.subnavItem, active === id && s.subnavActive, id === "danger" && s.subnavDanger)}
              aria-current={active === id ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(id)
                  ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
                history.replaceState(null, "", `#${id}`);
              }}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </a>
          ))}
        </nav>

        <div className={cx(s.sections, s.enter)} style={{ animationDelay: "80ms" }}>
          <PlanSection {...props} />
          <PreferencesSection />
          {!props.isEditor && <TeamSection {...props} />}
          <ProfileSection userId={props.userId} username={props.username} />
          <EmailSection email={props.email} confirmed={props.emailConfirmed} />
          <PasswordSection />
          <DangerSection username={props.username} />
        </div>
      </div>
    </>
  );
}

function Section({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cx(s.card, s.section, className)} onPointerMove={spotlight} aria-labelledby={`${id}-t`}>
      <div className={s.sectionHead}>
        <h2 id={`${id}-t`} className={s.sectionTitle}>
          {title}
        </h2>
        <p className={s.sectionDesc}>{description}</p>
      </div>
      {children}
    </section>
  );
}

function Notice({ status }: { status: { ok: boolean; msg: string } | null }) {
  if (!status) return null;
  return (
    <p className={cx(s.hint, status.ok ? s.ok : s.err)} role={status.ok ? "status" : "alert"}>
      {status.ok ? (
        <Check size={13} strokeWidth={3} aria-hidden="true" />
      ) : (
        <X size={13} strokeWidth={3} aria-hidden="true" />
      )}
      {status.msg}
    </p>
  );
}

// ─── Plan ────────────────────────────────────────────────────────────────────

const FEATURES = [
  ["Analytics", true],
  ["Win-Back", true],
  ["Country blocking", true],
  ["Active badge", true],
  ["Team access", true],
  ["Deep linking", false],
  ["18+ age gate", false],
] as const;

function PlanSection(p: AccountViewProps) {
  const openUpgrade = useUpgradeModal();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (p.isEditor) {
    return (
      <section id="plan" className={cx(s.card, s.section)} aria-labelledby="plan-t">
        <div className={s.sectionHead}>
          <h2 id="plan-t" className={s.sectionTitle}>
            Plan &amp; usage
          </h2>
          <p className={s.sectionDesc}>
            You&apos;re working in someone else&apos;s account. Switch to your own account (bottom left) to manage its
            plan and team.
          </p>
        </div>
      </section>
    );
  }

  const status = p.subscriptionStatus;
  const pro =
    status === "active" ||
    status === "trialing" ||
    (status === "grace" && !!p.gracePeriodEndsAt && new Date(p.gracePeriodEndsAt) > new Date());
  const canceled = status === "canceled";
  const cancelPending = p.cancelAtPeriodEnd && !canceled;
  const tier = p.planTier ?? 1;
  const price = pro ? Math.round(getMonthlyEquivalentPrice(tier, p.planInterval)) : 0;
  const periodEnd =
    p.currentPeriodEnd && new Date(p.currentPeriodEnd) > new Date() ? fmtDate(p.currentPeriodEnd) : null;

  const meta = pro
    ? [
        p.planInterval === "annual" ? "Billed annually" : "Billed monthly",
        periodEnd &&
          (cancelPending
            ? `Access ends ${periodEnd}`
            : status === "grace"
              ? `Payment due by ${fmtDate(p.gracePeriodEndsAt!)}`
              : `Renews ${periodEnd}`),
      ]
        .filter(Boolean)
        .join(" · ")
    : canceled
      ? "Your Pro subscription has ended"
      : "One link page, free forever";

  const manageBilling = () =>
    startTransition(async () => {
      setError(null);
      const result = await createPortalSession();
      if ("url" in result) window.location.href = result.url;
      else setError(result.error);
    });

  return (
    <RainbowBorder id="plan" className={s.planWrap}>
      <div className={s.planGlow} aria-hidden="true" />
      <div className={s.planTop}>
        <div>
          <p className={s.eyebrow}>Current plan</p>
          <h2 className={s.planName}>
            {pro ? (
              <>
                Pro{" "}
                <span className={s.serif}>
                  · {tier} {tier === 1 ? "page" : "pages"}
                </span>
              </>
            ) : (
              "Free"
            )}
          </h2>
          <p className={s.planMeta}>
            {meta}
            {status === "grace" && <span className={cx(s.statusChip, s.statusBad)}>Payment failed</span>}
            {status === "past_due" && <span className={cx(s.statusChip, s.statusBad)}>Past due</span>}
            {cancelPending && <span className={s.statusChip}>Canceling</span>}
          </p>
        </div>
        <div className={s.planPrice}>
          <strong>${price}</strong> <span>/ month</span>
        </div>
      </div>

      <div className={s.planUsage}>
        <div className={s.usageRow}>
          <span>Link pages</span>
          <span>
            <strong>{p.linksUsed}</strong> of {p.linkCap} used
          </span>
        </div>
        <div
          className={s.meter}
          role="meter"
          aria-label="Link pages used"
          aria-valuenow={p.linksUsed}
          aria-valuemin={0}
          aria-valuemax={p.linkCap}
        >
          <div className={s.meterFill} style={{ width: `${Math.min(100, (p.linksUsed / p.linkCap) * 100)}%` }} />
        </div>
      </div>

      <div className={s.features}>
        {FEATURES.map(([label, proOnly]) => {
          const on = pro || !proOnly;
          return (
            <span key={label} className={cx(s.feature, !on && s.featureOff)}>
              {on ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
              {label}
            </span>
          );
        })}
        <span className={cx(s.feature, s.featureOff)}>
          Custom domains <span className={s.soon}>Soon</span>
        </span>
      </div>

      <div className={s.planActions}>
        {!pro && (
          <button type="button" className={s.btnLight} onClick={openUpgrade}>
            <Sparkles size={15} aria-hidden="true" /> Upgrade to Pro
          </button>
        )}
        {p.stripeCustomerId && (
          <button type="button" className={pro ? s.btnLight : s.btnGhost} disabled={pending} onClick={manageBilling}>
            {pending ? (
              <Loader2 size={14} className={s.spin} aria-hidden="true" />
            ) : (
              <CreditCard size={14} aria-hidden="true" />
            )}
            {pro ? "Manage plan & billing" : "Invoices & billing"}
            <ExternalLink size={13} aria-hidden="true" />
          </button>
        )}
      </div>
      {pro && (
        <p className={s.hint} style={{ position: "relative" }}>
          Change your plan size, update your card or cancel in the secure Stripe portal.
        </p>
      )}
      {error && <p className={cx(s.hint, s.err)}>{error}</p>}
    </RainbowBorder>
  );
}

// ─── Preferences ─────────────────────────────────────────────────────────────

const TZ_KEY = "ultralink:timezone";
const TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Istanbul",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function PreferencesSection() {
  const toast = useToast();
  // Lives in this browser only (as before); read after mount, when localStorage exists
  const [saved, setSaved] = useState<string | null>(null);
  const [tz, setTz] = useState("");
  useEffect(() => {
    let value = "UTC";
    try {
      value = localStorage.getItem(TZ_KEY) || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      // Storage blocked: fall back to UTC
    }
    const id = requestAnimationFrame(() => {
      setSaved(value);
      setTz(value);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const zones = tz && !TIMEZONES.includes(tz) ? [tz, ...TIMEZONES] : TIMEZONES;

  return (
    <Section id="preferences" title="Preferences" description="Saved in this browser.">
      <label className={s.label} htmlFor="acc-tz">
        Timezone
      </label>
      <div className={s.inline}>
        <select id="acc-tz" className={s.select} value={tz} onChange={(e) => setTz(e.target.value)}>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={s.btnGhost}
          onClick={() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone)}
        >
          Detect
        </button>
      </div>
      <div className={s.sectionFoot}>
        <p>{tz === saved ? "Up to date" : "Unsaved change"}</p>
        <button
          type="button"
          className={cx(s.btnLight, s.btnSm)}
          disabled={!tz || tz === saved}
          onClick={() => {
            try {
              localStorage.setItem(TZ_KEY, tz);
            } catch {
              return toast("Couldn't save: this browser blocks storage");
            }
            setSaved(tz);
            toast("Preferences saved");
          }}
        >
          Save
        </button>
      </div>
    </Section>
  );
}

// ─── Team ────────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function TeamSection(p: AccountViewProps) {
  const router = useRouter();
  const toast = useToast();
  const openUpgrade = useUpgradeModal();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [removing, setRemoving] = useState<AccountMember | null>(null);
  const [pending, startTransition] = useTransition();
  const pro =
    p.subscriptionStatus === "active" ||
    p.subscriptionStatus === "trialing" ||
    (p.subscriptionStatus === "grace" && !!p.gracePeriodEndsAt && new Date(p.gracePeriodEndsAt) > new Date());

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) return setError("Enter a valid email address.");
    setError(null);
    startTransition(async () => {
      const res = await inviteEditor(v);
      if (res.error) return setError(res.error);
      setEmail("");
      toast(`Invite sent to ${v}`);
      router.refresh();
    });
  };

  const run = async (key: string, fn: () => Promise<{ error?: string }>, done: string) => {
    setBusy(key);
    const res = await fn();
    setBusy(null);
    toast(res.error ?? done);
    router.refresh();
  };

  return (
    <Section
      id="team"
      title={<>Team {!pro && <span className={s.proBadge}>PRO</span>}</>}
      description="Editors can manage your pages and see analytics. Billing stays with you."
    >
      {!pro ? (
        <div className={s.lockedCard}>
          <Lock size={18} aria-hidden="true" />
          <span>Invite your assistant or agency with Pro.</span>
          <button type="button" className={cx(s.btnLight, s.btnSm)} onClick={openUpgrade}>
            Upgrade
          </button>
        </div>
      ) : (
        <>
          <div>
            <div className={s.member}>
              <Avatar name={p.username} size={36} round />
              <div style={{ minWidth: 0 }}>
                <div className={s.memberName}>
                  {p.username} <span className={s.youTag}>You</span>
                </div>
                <div className={s.memberEmail}>{p.email}</div>
              </div>
              <span className={s.role}>Owner</span>
              <span style={{ width: 28 }} />
            </div>
            {p.members.map((m) => (
              <div key={m.editorId} className={s.member}>
                <Avatar name={m.name} size={36} round />
                <div style={{ minWidth: 0 }}>
                  <div className={s.memberName}>{m.name}</div>
                  <div className={s.memberEmail}>@{m.username}</div>
                </div>
                <span className={s.role}>Editor</span>
                <button
                  type="button"
                  className={cx(s.iconBtn, s.iconBtnBare)}
                  aria-label={`Remove ${m.name}`}
                  onClick={() => setRemoving(m)}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
            {p.invites.map((v) => (
              <div key={v.id} className={s.member}>
                <span className={cx(s.avatar, s.avatarRound, s.pendingAvatar)} style={{ width: 36, height: 36 }}>
                  <Mail size={15} aria-hidden="true" />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className={s.memberName}>{v.email}</div>
                  <div className={s.memberEmail}>Invite pending · expires {fmtDate(v.expiresAt)}</div>
                </div>
                <button
                  type="button"
                  className={cx(s.btnGhost, s.btnSm)}
                  style={{ marginLeft: "auto" }}
                  disabled={busy === v.id}
                  onClick={() => run(v.id, () => resendInvite(v.id), `Invite resent to ${v.email}`)}
                >
                  {busy === v.id && <Loader2 size={13} className={s.spin} aria-hidden="true" />}
                  Resend
                </button>
                <button
                  type="button"
                  className={cx(s.iconBtn, s.iconBtnBare)}
                  aria-label={`Revoke invite for ${v.email}`}
                  disabled={busy === `x${v.id}`}
                  onClick={() => run(`x${v.id}`, () => revokeInvite(v.id), "Invite revoked")}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <form className={s.inviteRow} onSubmit={invite} noValidate>
            <label className={s.label} htmlFor="acc-invite">
              Invite by email
            </label>
            <div className={s.inline}>
              <input
                id="acc-invite"
                type="email"
                className={cx(s.input, error && s.inputError)}
                placeholder="editor@example.com"
                value={email}
                aria-invalid={!!error}
                aria-describedby="acc-invite-hint"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
              />
              <button type="submit" className={s.btnLight} disabled={!email.trim() || pending}>
                {pending && <Loader2 size={14} className={s.spin} aria-hidden="true" />}
                Send invite
              </button>
            </div>
            <p id="acc-invite-hint" className={cx(s.hint, error && s.err)} aria-live="polite">
              {error ?? "They get an email with a link to join."}
            </p>
          </form>
        </>
      )}

      {removing && (
        <Dialog
          title={`Remove ${removing.name}?`}
          description="They lose access to your pages and analytics right away. You can invite them again later."
          onClose={() => setRemoving(null)}
        >
          <div className={s.dialogActions}>
            <button type="button" className={s.btnGhost} onClick={() => setRemoving(null)}>
              Cancel
            </button>
            <button
              type="button"
              className={s.btnDanger}
              disabled={busy === removing.editorId}
              onClick={async () => {
                const m = removing;
                await run(m.editorId, () => removeEditor(m.editorId), `${m.name} removed`);
                setRemoving(null);
              }}
            >
              Remove
            </button>
          </div>
        </Dialog>
      )}
    </Section>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
type NameState = "unchanged" | "invalid" | "checking" | "available" | "taken";

function ProfileSection({ userId, username }: { userId: string; username: string }) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(username);
  const [state, setState] = useState<NameState>("unchanged");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const change = (raw: string) => {
    const v = raw.toLowerCase();
    setValue(v);
    setError(null);
    clearTimeout(timer.current);
    if (v === username) return setState("unchanged");
    if (!USERNAME_RE.test(v)) return setState("invalid");
    setState("checking");
    timer.current = setTimeout(async () => {
      const { data } = await createClient().from("profiles").select("id").eq("username", v).maybeSingle();
      setState(data && data.id !== userId ? "taken" : "available");
    }, 400);
  };

  const hint = {
    unchanged: "3–20 characters: lowercase letters, numbers and underscores.",
    invalid: "3–20 characters: lowercase letters, numbers and underscores.",
    checking: "Checking…",
    available: `${value} is available`,
    taken: "That username is already taken.",
  }[state];
  const bad = state === "invalid" || state === "taken";

  return (
    <Section id="profile" title="Profile" description="Your account name, shown to people you invite to your team.">
      <label className={s.label} htmlFor="acc-username">
        Username
      </label>
      <input
        id="acc-username"
        className={cx(s.input, bad && s.inputError)}
        value={value}
        maxLength={20}
        spellCheck={false}
        autoComplete="username"
        aria-invalid={bad}
        aria-describedby="acc-username-hint"
        onChange={(e) => change(e.target.value)}
      />
      <p id="acc-username-hint" className={cx(s.hint, state === "available" && s.ok, bad && s.err)} aria-live="polite">
        {state === "checking" && <Loader2 size={13} className={s.spin} aria-hidden="true" />}
        {error ?? hint}
      </p>
      <div className={s.sectionFoot}>
        <p>{state === "unchanged" ? "Up to date" : "Unsaved change"}</p>
        <button
          type="button"
          className={cx(s.btnLight, s.btnSm)}
          disabled={state !== "available" || saving}
          onClick={async () => {
            setSaving(true);
            const res = await updateUsername(value);
            setSaving(false);
            if (res.error) return setError(res.error);
            setState("unchanged");
            toast("Username saved");
            router.refresh();
          }}
        >
          {saving && <Loader2 size={13} className={s.spin} aria-hidden="true" />}
          Save
        </button>
      </div>
    </Section>
  );
}

// ─── Email ───────────────────────────────────────────────────────────────────

function EmailSection({ email, confirmed }: { email: string; confirmed: boolean }) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const valid = EMAIL_RE.test(next.trim()) && password.length > 0 && next.trim() !== email;

  return (
    <Section id="email" title="Email" description="Used to sign in and for receipts.">
      <div className={s.readRow}>
        <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {email}
          {confirmed && (
            <span className={s.verified}>
              <BadgeCheck size={14} aria-hidden="true" /> Verified
            </span>
          )}
        </span>
        <button
          type="button"
          className={cx(s.btnGhost, s.btnSm)}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="acc-email-form"
        >
          {open ? "Cancel" : "Change"}
        </button>
      </div>
      <Notice status={status} />
      <div className={cx(s.expand, open && s.expandOpen)} id="acc-email-form" inert={!open}>
        <div>
          <form
            className={s.expandInner}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!valid) return;
              setSaving(true);
              setStatus(null);
              const res = await updateEmail(next.trim(), password);
              setSaving(false);
              if (res.error) return setStatus({ ok: false, msg: res.error });
              setStatus({ ok: true, msg: res.message ?? "Email change requested." });
              setOpen(false);
              setNext("");
              setPassword("");
            }}
          >
            <div className={s.row2}>
              <div>
                <label className={s.label} htmlFor="acc-new-email">
                  New email
                </label>
                <input
                  id="acc-new-email"
                  type="email"
                  className={s.input}
                  placeholder="new@example.com"
                  autoComplete="email"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                />
              </div>
              <div>
                <label className={s.label} htmlFor="acc-email-pw">
                  Current password
                </label>
                <input
                  id="acc-email-pw"
                  type="password"
                  className={s.input}
                  placeholder="Verify it's you"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button type="submit" className={cx(s.btnLight, s.btnSm)} disabled={!valid || saving}>
                {saving && <Loader2 size={13} className={s.spin} aria-hidden="true" />}
                Send confirmation
              </button>
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
}

// ─── Password ────────────────────────────────────────────────────────────────

const STRENGTH = ["Too short", "Weak", "Okay", "Good", "Strong"];
const STRENGTH_COLORS = ["#fbc2a4", "#f7a8c4", "#c9a7f2", "#a7c7f7"];

function strength(pw: string) {
  if (pw.length < 8) return 0;
  return [true, /[a-z]/.test(pw) && /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw) || pw.length >= 14].filter(
    Boolean,
  ).length;
}

function PasswordSection() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const score = strength(next);
  const mismatch = confirm.length > 0 && confirm !== next;
  const ready = current.length > 0 && next.length >= 8 && confirm === next;

  return (
    <Section id="password" title="Password" description="At least 8 characters. Longer is stronger.">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!ready) return;
          setSaving(true);
          setError(null);
          const res = await updatePassword(current, next);
          setSaving(false);
          if (res.error) return setError(res.error);
          toast("Password updated");
          setCurrent("");
          setNext("");
          setConfirm("");
        }}
      >
        <div className={s.field}>
          <label className={s.label} htmlFor="acc-pw-current">
            Current password
          </label>
          <input
            id="acc-pw-current"
            type="password"
            className={cx(s.input, error && s.inputError)}
            autoComplete="current-password"
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value);
              setError(null);
            }}
          />
          {error && <p className={cx(s.hint, s.err)}>{error}</p>}
        </div>
        <div className={cx(s.field, s.row2)}>
          <div>
            <label className={s.label} htmlFor="acc-pw-new">
              New password
            </label>
            <input
              id="acc-pw-new"
              type="password"
              className={s.input}
              autoComplete="new-password"
              aria-describedby="acc-pw-strength"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <div className={s.strength} aria-hidden="true">
              {STRENGTH_COLORS.map((c, i) => (
                <span key={c} style={{ background: i < score ? c : undefined }} />
              ))}
            </div>
            <div className={s.strengthLabel} id="acc-pw-strength">
              <span>{next ? STRENGTH[score] : "Strength"}</span>
              <span>{next.length} / 8+</span>
            </div>
          </div>
          <div>
            <label className={s.label} htmlFor="acc-pw-confirm">
              Confirm new password
            </label>
            <input
              id="acc-pw-confirm"
              type="password"
              className={cx(s.input, mismatch && s.inputError)}
              autoComplete="new-password"
              aria-invalid={mismatch}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <p className={cx(s.hint, mismatch && s.err, !mismatch && confirm && s.ok)} aria-live="polite">
              {mismatch ? "Passwords don't match." : confirm ? "Passwords match." : ""}
            </p>
          </div>
        </div>
        <div className={s.sectionFoot}>
          <p>You stay signed in on this device.</p>
          <button type="submit" className={cx(s.btnLight, s.btnSm)} disabled={!ready || saving}>
            {saving && <Loader2 size={13} className={s.spin} aria-hidden="true" />}
            Update password
          </button>
        </div>
      </form>
    </Section>
  );
}

// ─── Danger zone ─────────────────────────────────────────────────────────────

function DangerSection({ username }: { username: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => {
    setOpen(false);
    setTyped("");
    setError(null);
  };

  return (
    <Section id="danger" title="Danger zone" description="This can't be undone." className={s.danger}>
      <div className={s.dangerRow}>
        <p>Deletes your account, every link page and all stats. An active subscription is canceled right away.</p>
        <button type="button" className={s.btnDanger} onClick={() => setOpen(true)}>
          <Trash2 size={15} aria-hidden="true" /> Delete account
        </button>
      </div>
      {open && (
        <Dialog
          title="Delete your account?"
          description={
            <>
              All your link pages stop working immediately. Type <strong style={{ color: "#fff" }}>{username}</strong>{" "}
              to confirm.
            </>
          }
          onClose={close}
        >
          <input
            className={s.input}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={username}
            aria-label={`Type ${username} to confirm`}
            autoComplete="off"
            spellCheck={false}
          />
          {error && <p className={cx(s.hint, s.err)}>{error}</p>}
          <div className={s.dialogActions}>
            <button type="button" className={s.btnGhost} onClick={close}>
              Cancel
            </button>
            <button
              type="button"
              className={s.btnDanger}
              disabled={typed !== username || deleting}
              onClick={async () => {
                setDeleting(true);
                setError(null);
                try {
                  const res = await fetch("/api/account/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ confirmUsername: typed }),
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
              }}
            >
              {deleting && <Loader2 size={14} className={s.spin} aria-hidden="true" />}
              Delete forever
            </button>
          </div>
        </Dialog>
      )}
    </Section>
  );
}
