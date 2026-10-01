// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resolveTheme } from "@/lib/config/theme";
import type { Page } from "@/lib/supabase/types";
import { draftFromPage, type Draft } from "./draft";
import { SettingsCard } from "./style";

// Pulled in via the upgrade dialog; talks to Supabase and Stripe
vi.mock("@/app/actions/billing", () => ({ startCheckout: vi.fn() }));

afterEach(cleanup);

function Harness({ url }: { url: string }) {
  const [draft, setDraft] = useState<Draft>(() => ({
    ...draftFromPage({ title: "Franek", theme: null, win_back: null } as unknown as Page, [], []),
    winBack: { enabled: true, headline: "Wait! Watch my new video.", url, ageGate: false },
  }));
  return (
    <SettingsCard
      draft={draft}
      set={(p) => setDraft((d) => ({ ...d, ...p }))}
      pro
      preview={{ theme: resolveTheme(null), firstLink: null }}
    />
  );
}

describe("Win-Back preview", () => {
  it("stays disabled until the popup has a valid link", () => {
    render(<Harness url="" />);
    expect(screen.getByRole("button", { name: "Preview popup" })).toBeDisabled();
  });

  it("shows the real popup, with https:// added to bare domains like saving does", async () => {
    render(<Harness url="youtube.com" />);
    await userEvent.click(screen.getByRole("button", { name: "Preview popup" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Wait! Watch my new video.");
    expect(screen.getByRole("link", { name: /Yes, show me/ })).toHaveAttribute("href", "https://youtube.com");
  });

  it("closes with Escape", async () => {
    render(<Harness url="https://youtube.com" />);
    await userEvent.click(screen.getByRole("button", { name: "Preview popup" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
