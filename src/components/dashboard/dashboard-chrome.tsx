"use client";

import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { WelcomeModal } from "@/components/dashboard/welcome-modal";
import { WelcomeModalContext } from "@/components/dashboard/welcome-modal-context";
import { FeedbackModal } from "@/components/dashboard/feedback-modal";
import { FeedbackModalContext } from "@/components/dashboard/feedback-modal-context";
import { NavigationLoadingProvider } from "@/components/dashboard/navigation-loading";
import { markWelcomeSeen } from "@/app/actions/welcome";
import type { User } from "@supabase/supabase-js";
import type { TeamEntry } from "@/lib/team";
import type { SubscriptionStatus } from "@/lib/supabase/types";

interface DashboardChromeProps {
  user: User;
  displayName?: string | null;
  username?: string | null;
  activeOwnerId: string;
  teamMemberships: TeamEntry[];
  hasSeenWelcome: boolean;
  activeOwnerSubscriptionStatus: SubscriptionStatus;
  pagesUsed: number;
  linkCap: number;
  children: React.ReactNode;
}

export function DashboardChrome({
  user,
  displayName,
  username,
  activeOwnerId,
  teamMemberships,
  hasSeenWelcome,
  activeOwnerSubscriptionStatus,
  pagesUsed,
  linkCap,
  children,
}: DashboardChromeProps) {
  // Auto-open on first mount based on the server-loaded welcome state.
  const [open, setOpen] = useState(() => !hasSeenWelcome);
  const [markOnClose, setMarkOnClose] = useState(() => !hasSeenWelcome);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const openWelcomeModal = () => {
    setMarkOnClose(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (markOnClose) {
      setMarkOnClose(false);
      markWelcomeSeen();
    }
  };

  const openFeedbackModal = () => setFeedbackOpen(true);

  return (
    <NavigationLoadingProvider>
      <WelcomeModalContext.Provider value={{ openWelcomeModal }}>
        <FeedbackModalContext.Provider value={{ openFeedbackModal }}>
          <AppShell
            user={user}
            displayName={displayName}
            username={username}
            activeOwnerId={activeOwnerId}
            teamMemberships={teamMemberships}
            activeOwnerSubscriptionStatus={activeOwnerSubscriptionStatus}
            pagesUsed={pagesUsed}
            linkCap={linkCap}
          >
            {children}
          </AppShell>
          <WelcomeModal open={open} onClose={handleClose} displayName={displayName} />
          <FeedbackModal
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            defaultName={displayName || username || ""}
            defaultEmail={user.email ?? ""}
          />
        </FeedbackModalContext.Provider>
      </WelcomeModalContext.Provider>
    </NavigationLoadingProvider>
  );
}
