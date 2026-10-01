"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronsUpDown,
  CirclePlay,
  Globe,
  LifeBuoy,
  Link2,
  Loader2,
  LogOut,
  Menu,
  MessageSquareWarning,
  Settings,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { setActiveOwner } from "@/app/actions/team";
import { useWelcomeModal } from "@/components/dashboard/welcome-modal-context";
import { useFeedbackModal } from "@/components/dashboard/feedback-modal-context";
import { useNavigationLoading } from "@/components/dashboard/navigation-loading";
import type { TeamEntry } from "@/lib/team";
import type { SubscriptionStatus } from "@/lib/supabase/types";
import { PlanDialog } from "./plan-dialog";
import { UpgradeContext } from "./upgrade-context";
import { ToastProvider } from "./toast";
import { Avatar, cx, RainbowBorder, usePopover } from "./ui";
import s from "./app.module.css";

export interface AppShellProps {
  user: User;
  displayName?: string | null;
  username?: string | null;
  activeOwnerId: string;
  teamMemberships: TeamEntry[];
  activeOwnerSubscriptionStatus: SubscriptionStatus;
  /** Link pages the active account has, and how many its plan allows */
  pagesUsed: number;
  linkCap: number;
  children: ReactNode;
}

const NAV = [
  { href: "/dashboard", label: "Links", icon: Link2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];
const SOON = [
  { label: "Revenue", icon: Wallet },
  { label: "Domains", icon: Globe },
];

export function AppShell({
  user,
  displayName,
  username,
  activeOwnerId,
  teamMemberships,
  activeOwnerSubscriptionStatus: status,
  pagesUsed,
  linkCap,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const { openWelcomeModal } = useWelcomeModal();
  const { openFeedbackModal } = useFeedbackModal();
  const { startLoading } = useNavigationLoading();
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isOwnerSelf = activeOwnerId === user.id;
  const pro = status === "active" || status === "trialing";
  const needsAttention = status === "grace" || status === "canceled" || status === "past_due";

  // Close the drawer after navigating
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setDrawer(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  // The editor belongs to Links
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard" || pathname.startsWith("/dashboard/links")
      : pathname.startsWith(href);

  const navLink = (href: string, label: string, icon: ReactNode) => (
    <Link
      key={href}
      href={href}
      className={cx(s.navItem, isActive(href) && s.navActive)}
      aria-current={isActive(href) ? "page" : undefined}
      onClick={() => {
        if (!isActive(href)) startLoading();
      }}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <UpgradeContext.Provider value={() => setUpgradeOpen(true)}>
      <ToastProvider>
        <div className={s.root}>
          <div className={s.noise} aria-hidden="true" />
          <div className={s.shell}>
            <aside className={cx(s.sidebar, drawer && s.sidebarOpen)} aria-label="Sidebar">
              <div className={s.sideTop}>
                <Logo href="/dashboard" onDark />
                <button
                  type="button"
                  className={cx(s.iconBtn, s.iconBtnBare, s.mobileOnly)}
                  onClick={() => setDrawer(false)}
                  aria-label="Close menu"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Main" style={{ display: "grid", gap: 2 }}>
                {NAV.map(({ href, label, icon: Icon }) =>
                  navLink(href, label, <Icon size={17} strokeWidth={1.8} aria-hidden="true" />),
                )}
                {SOON.map(({ label, icon: Icon }) => (
                  <span key={label} className={cx(s.navItem, s.navDisabled)} aria-disabled="true">
                    <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                    {label}
                    <span className={s.soon}>Soon</span>
                  </span>
                ))}
              </nav>

              <p className={s.navLabel}>Settings</p>
              {navLink("/dashboard/account", "Account", <Settings size={17} strokeWidth={1.8} aria-hidden="true" />)}

              <div className={s.sideSpacer} />

              <div style={{ display: "grid", gap: 2, marginBottom: 12 }}>
                <button
                  type="button"
                  className={s.navItem}
                  onClick={() => {
                    setDrawer(false);
                    openWelcomeModal();
                  }}
                >
                  <CirclePlay size={17} strokeWidth={1.8} aria-hidden="true" />
                  Watch intro
                </button>
                <button
                  type="button"
                  className={s.navItem}
                  onClick={() => {
                    setDrawer(false);
                    openFeedbackModal();
                  }}
                >
                  <MessageSquareWarning size={17} strokeWidth={1.8} aria-hidden="true" />
                  Report a bug
                </button>
                <Link href="/help" className={s.navItem}>
                  <LifeBuoy size={17} strokeWidth={1.8} aria-hidden="true" />
                  Help
                </Link>
              </div>

              {/* Editors of someone else's account don't manage that account's plan */}
              {isOwnerSelf &&
                (needsAttention ? (
                  <Link href="/dashboard/account" className={s.attentionCard} onClick={() => startLoading()}>
                    <AlertTriangle size={16} aria-hidden="true" />
                    <span>
                      <strong>Payment issue</strong>
                      Update your plan to keep your pages online.
                    </span>
                  </Link>
                ) : pro ? (
                  <div className={s.usageCard}>
                    <div className={s.usageRow}>
                      <span className={s.proBadge}>PRO</span>
                      <span>
                        <strong>{pagesUsed}</strong> / {linkCap} {linkCap === 1 ? "page" : "pages"}
                      </span>
                    </div>
                    <div
                      className={s.meter}
                      role="meter"
                      aria-label="Link pages used"
                      aria-valuenow={pagesUsed}
                      aria-valuemin={0}
                      aria-valuemax={linkCap}
                    >
                      <div
                        className={s.meterFill}
                        style={{ width: `${Math.min(100, (pagesUsed / linkCap) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <RainbowBorder>
                    <div className={s.upgradeInner}>
                      <p className={s.upgradeTitle}>
                        <Sparkles size={15} aria-hidden="true" style={{ color: "var(--pink)" }} />
                        Unlock Pro
                      </p>
                      <p className={s.upgradeBody}>Analytics, Win-Back, country blocking and more pages.</p>
                      <button
                        type="button"
                        className={cx(s.btnLight, s.btnSm, s.btnBlock)}
                        onClick={() => {
                          setDrawer(false);
                          setUpgradeOpen(true);
                        }}
                      >
                        Upgrade
                      </button>
                    </div>
                  </RainbowBorder>
                ))}

              <AccountMenu
                user={user}
                displayName={displayName}
                username={username}
                activeOwnerId={activeOwnerId}
                teamMemberships={teamMemberships}
              />
            </aside>
            <div className={cx(s.scrim, drawer && s.scrimOpen)} onClick={() => setDrawer(false)} aria-hidden="true" />

            <div className={s.main}>
              <div className={s.ambient} aria-hidden="true" />
              <header className={cx(s.topbar, scrolled && s.topbarScrolled)}>
                <button
                  type="button"
                  className={s.iconBtn}
                  onClick={() => setDrawer(true)}
                  aria-label="Open menu"
                  aria-expanded={drawer}
                >
                  <Menu size={17} aria-hidden="true" />
                </button>
                <Logo href="/dashboard" onDark />
              </header>
              <main id="main" className={cx(s.content, pathname.startsWith("/dashboard/links/") && s.contentFlush)}>
                {children}
              </main>
            </div>
          </div>
          {upgradeOpen && <PlanDialog minPages={pagesUsed} onClose={() => setUpgradeOpen(false)} />}
        </div>
      </ToastProvider>
    </UpgradeContext.Provider>
  );
}

// ─── Account menu ────────────────────────────────────────────────────────────

/** The user row at the bottom: switch between your own account and teams you edit for, settings, log out */
function AccountMenu({
  user,
  displayName,
  username,
  activeOwnerId,
  teamMemberships,
}: {
  user: User;
  displayName?: string | null;
  username?: string | null;
  activeOwnerId: string;
  teamMemberships: TeamEntry[];
}) {
  const router = useRouter();
  const { startLoading } = useNavigationLoading();
  const { open, setOpen, ref } = usePopover();
  const [switching, setSwitching] = useState<string | null>(null);

  const selfName = displayName || username || user.email?.split("@")[0] || "Account";
  const activeTeam = teamMemberships.find((m) => m.ownerId === activeOwnerId);
  const activeName =
    activeOwnerId !== user.id ? activeTeam?.ownerDisplayName || activeTeam?.ownerUsername || selfName : selfName;
  const accounts = [
    { id: user.id, name: selfName, role: "Owner" },
    ...teamMemberships.map((m) => ({ id: m.ownerId, name: m.ownerDisplayName || m.ownerUsername, role: "Editor" })),
  ];

  const switchTo = async (ownerId: string) => {
    if (ownerId === activeOwnerId) return setOpen(false);
    setSwitching(ownerId);
    await setActiveOwner(ownerId);
    setSwitching(null);
    setOpen(false);
    router.refresh();
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className={cx(s.popWrap, s.userMenu)} ref={ref}>
      <button
        type="button"
        className={s.userRow}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={activeName} size={30} round />
        <span className={s.userText}>
          <span className={s.userName}>{activeName}</span>
          <span className={s.userEmail}>{user.email}</span>
        </span>
        <ChevronsUpDown size={15} className={s.wsChevron} aria-hidden="true" />
      </button>
      {open && (
        <div className={cx(s.menu, s.menuUp)} role="menu">
          {teamMemberships.length > 0 && (
            <>
              <div className={s.menuHead}>Accounts</div>
              {accounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={a.id === activeOwnerId}
                  className={s.menuItem}
                  disabled={!!switching}
                  onClick={() => switchTo(a.id)}
                >
                  <Avatar name={a.name} size={22} round />
                  <span className={s.menuGrow}>{a.name}</span>
                  <span className={s.roleChip}>{a.role}</span>
                  {switching === a.id ? (
                    <Loader2 size={14} className={s.spin} aria-hidden="true" />
                  ) : (
                    a.id === activeOwnerId && <Check size={15} className={s.check} aria-hidden="true" />
                  )}
                </button>
              ))}
              <div className={s.menuSep} role="separator" />
            </>
          )}
          <Link
            href="/dashboard/account"
            role="menuitem"
            className={s.menuItem}
            onClick={() => {
              setOpen(false);
              startLoading();
            }}
          >
            <Settings size={15} aria-hidden="true" /> Account settings
          </Link>
          <button type="button" role="menuitem" className={cx(s.menuItem, s.menuDanger)} onClick={signOut}>
            <LogOut size={15} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
