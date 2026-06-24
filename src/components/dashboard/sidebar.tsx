"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  user: User;
  displayName?: string | null;
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
    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-all duration-150",
    active
      ? "bg-gold text-bg"
      : disabled
      ? "text-text-subtle cursor-not-allowed opacity-60"
      : "text-text-muted hover:text-text hover:bg-surface-2 cursor-pointer",
  ].join(" ");

  if (disabled) {
    return (
      <span className={cls}>
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-[10px] text-text-subtle font-normal tracking-wide uppercase">Soon</span>
      </span>
    );
  }

  return (
    <Link href={href} className={cls} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function AccountMenu({ user, displayName }: { user: User; displayName?: string | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const name = displayName || user.email?.split("@")[0] || "Account";
  const email = user.email ?? "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius)] hover:bg-surface-2 transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-bg shrink-0 bg-text"
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-text truncate">{name}</p>
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
          <div className="absolute bottom-full left-0 right-0 mb-1 z-20 bg-white border border-border-strong rounded-[var(--radius)] py-1 shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
            <button
              type="button"
              onClick={() => { setOpen(false); router.push("/login"); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M10 8H2m0 0l3-3M2 8l3 3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 4V3a1 1 0 011-1h6a1 1 0 011 1v10a1 1 0 01-1 1H7a1 1 0 01-1-1v-1" strokeLinecap="round" />
              </svg>
              Switch account
            </button>
            <div className="border-t border-border mx-2 my-1" />
            <button
              type="button"
              onClick={() => { setOpen(false); handleSignOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-surface transition-colors cursor-pointer"
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

export function Sidebar({ user, displayName }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      icon: (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M9 3.5H13.5M9 8H13.5M9 12.5H13.5M2.5 3.5h3v3h-3zM2.5 10h3v3h-3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      disabled: true,
      icon: (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M2 12l3.5-5 3 3 3-6 2.5 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/dashboard/revenue",
      label: "Revenue",
      disabled: true,
      icon: (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M8 2v12M5.5 4.5C5.5 3.4 6.6 3 8 3s2.5.5 2.5 1.5S9.4 6 8 6 5.5 6.6 5.5 7.5 6.6 9 8 9s2.5.4 2.5 1.5S9.4 13 8 13s-2.5-.5-2.5-1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/dashboard/domains",
      label: "Domains",
      disabled: true,
      icon: (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 2c-1.5 2-2 3.5-2 6s.5 4 2 6M8 2c1.5 2 2 3.5 2 6s-.5 4-2 6M2 8h12" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const bottomItems = [
    { href: "mailto:support@ultralink.bio", label: "Help" },
    { href: "mailto:support@ultralink.bio?subject=Feedback", label: "Feedback" },
    { href: "https://t.me/ultralink", label: "Join Telegram" },
  ];

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Logo href="/dashboard" iconSize={24} />
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
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            )}
            disabled={item.disabled}
            onClick={onClose}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-0.5">
        {bottomItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm text-text-subtle hover:text-text-muted hover:bg-surface-2 transition-colors"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <AccountMenu user={user} displayName={displayName} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-surface border-r border-border min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-border flex items-center justify-between px-4">
        <Logo href="/dashboard" iconSize={22} />
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
          <div className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-border overflow-y-auto">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
