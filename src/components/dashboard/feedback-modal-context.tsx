"use client";

import { createContext, useContext } from "react";

interface FeedbackModalContextValue {
  openFeedbackModal: () => void;
}

export const FeedbackModalContext = createContext<FeedbackModalContextValue | null>(null);

export function useFeedbackModal(): FeedbackModalContextValue {
  const ctx = useContext(FeedbackModalContext);
  if (!ctx) throw new Error("useFeedbackModal must be used within DashboardChrome");
  return ctx;
}
