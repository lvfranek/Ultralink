"use client";

import { useState } from "react";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";

export function AnalyticsUpgradeCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-10 px-6 rounded-full text-sm font-semibold transition-opacity hover:opacity-85"
        style={{ background: "#ffffff", color: "#000000" }}
      >
        Upgrade to Pro →
      </button>

      <UpgradeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
