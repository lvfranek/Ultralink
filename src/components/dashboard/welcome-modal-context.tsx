"use client";

import { createContext, useContext } from "react";

interface WelcomeModalContextValue {
  openWelcomeModal: () => void;
}

export const WelcomeModalContext = createContext<WelcomeModalContextValue | null>(null);

export function useWelcomeModal(): WelcomeModalContextValue {
  const ctx = useContext(WelcomeModalContext);
  if (!ctx) throw new Error("useWelcomeModal must be used within DashboardChrome");
  return ctx;
}
