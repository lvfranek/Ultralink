"use client";

import { createContext, useContext } from "react";

/** Provided by AppShell; opens the plan picker (Stripe checkout) */
export const UpgradeContext = createContext<() => void>(() => {});

/** Opens the plan picker from anywhere in the app */
export function useUpgradeModal() {
  return useContext(UpgradeContext);
}
