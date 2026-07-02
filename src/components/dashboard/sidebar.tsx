"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { setActiveOwner } from "@/app/actions/team";
import { Link2, BarChart3, Wallet, PlayCircle, MessageSquareWarning, Sparkles, Crown } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { TeamEntry } from "@/lib/team";
import type { SubscriptionStatus } from "@/lib/supabase/types";
import { useWelcomeModal } from "@/components/dashboard/welcome-modal-context";
import { useFeedbackModal } from "@/components/dashboard/feedback-modal-context";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";

interface SidebarProps {
  user: User;
  displayName?: string | null;
  username?: string | null;
  activeOwnerId: string;
  selfUsername: string;
  teamMemberships: TeamEntry[];
  activeOwnerSubscriptionStatus: SubscriptionStatus;
}

function NavItem({
  href,
  icon,
  label,
  active,
  disabled,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const cls = [
    "flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-sm font-medium transition-all duration-150",
    active
      ? "text-white"
      : disabled
      ? "text-[#9A9A9A] cursor-not-allowed opacity-50"
      : "text-[#9A9A9A] hover:text-white cursor-pointer",
  ].join(" ");

  const activeStyle = active ? { background: "rgba(255,255,255,.10)" } : undefined;
  const hoverCls = !active && !disabled ? "hover:bg-[rgba(255,255,255,0.06)]" : "";

  if (disabled) {
    return (
      <span className={`${cls} ${hoverCls}`} style={activeStyle}>
        {icon}
        <span>{label}</span>
        <span
          className="ml-auto text-[10px] font-medium tracking-wide"
          style={{ color: "#9A9A9A", border: "1px solid rgba(255,255,255,.08)", borderRadius: 4, padding: "1px 5px" }}
        >
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link href={href} className={`${cls} ${hoverCls}`} style={activeStyle} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-bold text-bg shrink-0 bg-text"
      style={{ width: size, height: size }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: "Owner" | "Editor" }) {
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{
        color: role === "Owner" ? "#C9A86A" : "#9A9A9A",
        border: role === "Owner" ? "1px solid rgba(201,168,106,0.3)" : "1px solid rgba(255,255,255,.08)",
        background: role === "Owner" ? "rgba(201,168,106,0.08)" : "rgba(255,255,255,0.04)",
      }}
    >
      {role}
    </span>
  );
}

function AccountMenu({
  user,
  displayName,
  username,
  activeOwnerId,
  selfUsername,
  teamMemberships,
}: {
  user: User;
  displayName?: string | null;
  username?: string | null;
  activeOwnerId: string;
  selfUsername: string;
  teamMemberships: TeamEntry[];
}) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const router = useRouter();
  const { openWelcomeModal } = useWelcomeModal();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSwitchOwner = async (ownerId: string) => {
    if (ownerId === activeOwnerId) { setOpen(false); return; }
    setSwitching(ownerId);
    await setActiveOwner(ownerId);
    setSwitching(null);
    setOpen(false);
    router.refresh();
  };

  const selfName = displayName || username || user.email?.split("@")[0] || "Account";
  const email = user.email ?? "";

  const isEditor = activeOwnerId !== user.id;
  const activeTeam = teamMemberships.find((m) => m.ownerId === activeOwnerId);
  const activeName = isEditor
    ? (activeTeam?.ownerDisplayName || activeTeam?.ownerUsername || selfName)
    : selfName;

  const hasMemberships = teamMemberships.length > 0;

  // Build full account list for switcher: own account first, then memberships
  const accounts = [
    { id: user.id, name: selfName, role: "Owner" as const },
    ...teamMemberships.map((m) => ({
      id: m.ownerId,
      name: m.ownerDisplayName || m.ownerUsername,
      role: "Editor" as const,
    })),
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius)] hover:bg-surface-2 transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <Avatar name={activeName} />
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-text truncate">{activeName}</p>
          <p className="text-xs text-text-subtle truncate">{email}</p>
        </div>
        <svg
          viewBox="0 0 16 16"
          className={`w-4 h-4 text-text-subtle transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-full left-0 right-0 mb-1 z-20 bg-surface-2 border border-border-strong rounded-[var(--radius)] py-1 px-1 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">

            {hasMemberships && (
              <>
                {/* Switching as header */}
                <div className="px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#6B6B6B" }}>
                    Switching as
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar name={activeName} size={20} />
                    <span className="text-xs font-medium text-text truncate">{activeName}</span>
                    <RoleBadge role={isEditor ? "Editor" : "Owner"} />
                  </div>
                </div>
                <div className="border-t border-border mx-1 my-1" />

                {/* Account list */}
                {accounts.map((acct) => {
                  const isActive = acct.id === activeOwnerId;
                  const isLoading = switching === acct.id;
                  return (
                    <button
                      key={acct.id}
                      type="button"
                      onClick={() => handleSwitchOwner(acct.id)}
                      disabled={isLoading}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] transition-colors cursor-pointer hover:bg-surface disabled:opacity-50"
                      style={{ textAlign: "left" }}
                    >
                      <Avatar name={acct.name} size={24} />
                      <span className="flex-1 text-xs font-medium text-text truncate">{acct.name}</span>
                      <RoleBadge role={acct.role} />
                      {isActive && (
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="#C9A86A" strokeWidth="2" aria-hidden="true">
                          <path d="M3 8l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
                <div className="border-t border-border mx-1 my-1" />
              </>
            )}

            <button
              type="button"
              onClick={() => { setOpen(false); openWelcomeModal(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            >
              <PlayCircle size={16} strokeWidth={1.5} aria-hidden="true" />
              Watch intro
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); router.push("/dashboard/account"); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="8" cy="5" r="2.5" strokeLinecap="round" />
                <path d="M2.5 13.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Account settings
            </button>
            <div className="border-t border-border mx-1 my-1" />
            <button
              type="button"
              onClick={() => { setOpen(false); handleSignOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-surface rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" strokeLinecap="round" />
                <path d="M10 11l3-3-3-3M13 8H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Sidebar({
  user,
  displayName,
  username,
  activeOwnerId,
  selfUsername,
  teamMemberships,
  activeOwnerSubscriptionStatus,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { openWelcomeModal } = useWelcomeModal();
  const { openFeedbackModal } = useFeedbackModal();

  const isOwnerSelf = activeOwnerId === user.id;
  const needsAttention =
    activeOwnerSubscriptionStatus === "grace" ||
    activeOwnerSubscriptionStatus === "canceled" ||
    activeOwnerSubscriptionStatus === "past_due";

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navItems = [
    {
      href: "/dashboard",
      label: "Links",
      disabled: false,
      icon: <Link2 size={18} strokeWidth={1.75} aria-hidden="true" />,
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      disabled: false,
      icon: <BarChart3 size={18} strokeWidth={1.75} aria-hidden="true" />,
    },
    {
      href: "/dashboard/revenue",
      label: "Revenue",
      disabled: true,
      icon: <Wallet size={18} strokeWidth={1.75} aria-hidden="true" />,
    },
    {
      href: "/dashboard/domains",
      label: "Domains",
      disabled: true,
      icon: (
        <svg viewBox="0 0 16 16" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 2c-1.5 2-2 3.5-2 6s.5 4 2 6M8 2c1.5 2 2 3.5 2 6s-.5 4-2 6M2 8h12" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const bottomItems = [
    { href: "/help", label: "Help" },
    { href: "https://t.me/ultralink", label: "Latest Updates" },
  ];

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center px-6 shrink-0">
        <Logo href="/dashboard" iconSize={18} onDark />
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={!item.disabled && (
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/dashboard/links")
                : pathname.startsWith(item.href)
            )}
            disabled={item.disabled}
            onClick={onClose}
          />
        ))}
      </nav>

      <div className="p-3 space-y-0.5 mt-3">
        <button
          type="button"
          onClick={() => { openWelcomeModal(); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-sm transition-colors cursor-pointer"
          style={{ color: "#9A9A9A" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9A9A9A"; e.currentTarget.style.background = ""; }}
        >
          <PlayCircle size={18} strokeWidth={1.75} aria-hidden="true" />
          Watch intro
        </button>
        <button
          type="button"
          onClick={() => { openFeedbackModal(); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-sm transition-colors cursor-pointer"
          style={{ color: "#9A9A9A" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9A9A9A"; e.currentTarget.style.background = ""; }}
        >
          <MessageSquareWarning size={18} strokeWidth={1.75} aria-hidden="true" />
          Report a bug
        </button>
        {bottomItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-sm transition-colors"
            style={{ color: "#9A9A9A" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9A9A9A"; e.currentTarget.style.background = ""; }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {isOwnerSelf && (
        <div className="px-3 pb-1">
          {needsAttention ? (
            <button
              type="button"
              onClick={() => { router.push("/dashboard/account"); onClose?.(); }}
              className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-sm font-medium transition-colors cursor-pointer"
              style={{ color: "#F87171", background: "rgba(248,113,113,0.08)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.14)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
            >
              <Crown size={18} strokeWidth={1.75} aria-hidden="true" />
              Manage plan
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setUpgradeOpen(true); onClose?.(); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-sm font-semibold transition-all cursor-pointer hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(255,255,255,0.15)]"
              style={{ background: "#FFFFFF", color: "#0A0A0A" }}
            >
              <Sparkles size={18} strokeWidth={2} aria-hidden="true" />
              {activeOwnerSubscriptionStatus === "active" || activeOwnerSubscriptionStatus === "trialing"
                ? "Upgrade plan"
                : "Upgrade to Pro"}
            </button>
          )}
        </div>
      )}

      <div className="p-3 mt-2">
        <AccountMenu
          user={user}
          displayName={displayName}
          username={username}
          activeOwnerId={activeOwnerId}
          selfUsername={selfUsername}
          teamMemberships={teamMemberships}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-full" style={{ background: "#131313" }}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-bg border-b border-border flex items-center justify-between px-4">
        <Logo href="/dashboard" iconSize={22} onDark />
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-[var(--radius-sm)] text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span className="flex flex-col gap-[5px] w-5" aria-hidden="true">
            <span className={`block h-0.5 bg-current rounded-full transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block h-0.5 bg-current rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block h-0.5 bg-current rounded-full transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 overflow-y-auto" style={{ background: "#131313" }}>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
