"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

/* ─── Context ─────────────────────────────────────────────────────────────── */

interface NavigationLoadingContextValue {
  /** Call this right before triggering a client-side navigation */
  startLoading: () => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextValue>({
  startLoading: () => {},
});

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}

/* ─── Provider + bar ──────────────────────────────────────────────────────── */

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startLoading = useCallback(() => {
    clear();
    setProgress(0);
    setLoading(true);
    setVisible(true);

    // Increment progress quickly to ~80%, then slow way down
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += p < 70 ? 8 : p < 85 ? 2 : 0.5;
      if (p > 90) p = 90;
      setProgress(p);
    }, 120);
  }, [clear]);

  // When the pathname changes — the new page has rendered — finish the bar
  useEffect(() => {
    if (!loading) return;
    if (pathname === prevPathname.current) return;

    prevPathname.current = pathname;
    clear();
    setProgress(100);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setLoading(false);
      setProgress(0);
    }, 350);
  }, [pathname, loading, clear]);

  // Safety net: if 8 s pass with no route change, hide the bar anyway
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      clear();
      setProgress(100);
      setTimeout(() => { setVisible(false); setLoading(false); setProgress(0); }, 350);
    }, 8000);
    return () => clearTimeout(t);
  }, [loading, clear]);

  return (
    <NavigationLoadingContext.Provider value={{ startLoading }}>
      {/* Top progress bar */}
      {visible && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 2,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, rgba(255,255,255,0.6) 0%, #ffffff 100%)",
              transition: progress === 100 ? "width 200ms ease-out" : "width 120ms linear",
              boxShadow: "0 0 8px rgba(255,255,255,0.5), 0 0 2px rgba(255,255,255,0.8)",
              borderRadius: "0 2px 2px 0",
            }}
          />
        </div>
      )}

      {children}
    </NavigationLoadingContext.Provider>
  );
}

/* ─── Reusable spinner ring ───────────────────────────────────────────────── */

export function SpinnerRing({
  size = 20,
  color = "rgba(255,255,255,0.7)",
  strokeWidth = 2,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ animation: "ul-spin 0.75s linear infinite", display: "block", flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
