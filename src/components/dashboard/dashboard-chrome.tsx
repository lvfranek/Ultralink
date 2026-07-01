"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { WelcomeModal } from "@/components/dashboard/welcome-modal";
import { WelcomeModalContext } from "@/components/dashboard/welcome-modal-context";
import { FeedbackModal } from "@/components/dashboard/feedback-modal";
import { FeedbackModalContext } from "@/components/dashboard/feedback-modal-context";
import { markWelcomeSeen } from "@/app/actions/welcome";
import type { User } from "@supabase/supabase-js";
import type { TeamEntry } from "@/lib/team";

interface DashboardChromeProps {
  user: User;
  displayName?: string | null;
  username?: string | null;
  activeOwnerId: string;
  selfUsername: string;
  teamMemberships: TeamEntry[];
  hasSeenWelcome: boolean;
  children: React.ReactNode;
}

export function DashboardChrome({
  user,
  displayName,
  username,
  activeOwnerId,
  selfUsername,
  teamMemberships,
  hasSeenWelcome,
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
    <WelcomeModalContext.Provider value={{ openWelcomeModal }}>
      <FeedbackModalContext.Provider value={{ openFeedbackModal }}>
        <Sidebar
          user={user}
          displayName={displayName}
          username={username}
          activeOwnerId={activeOwnerId}
          selfUsername={selfUsername}
          teamMemberships={teamMemberships}
        />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
        <WelcomeModal open={open} onClose={handleClose} displayName={displayName} />
        <FeedbackModal
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          defaultName={displayName || username || ""}
          defaultEmail={user.email ?? ""}
        />
      </FeedbackModalContext.Provider>
    </WelcomeModalContext.Provider>
  );
}
