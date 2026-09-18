// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resolveTheme } from "@/lib/config/theme";
import type { WinBack } from "@/lib/supabase/types";
import { WinBackControl } from "./win-back-control";

// Pulled in via the upgrade modal; talks to Supabase and Stripe
vi.mock("@/app/actions/billing", () => ({ startCheckout: vi.fn() }));

afterEach(cleanup);

function Harness({ initial }: { initial: WinBack }) {
  const [value, setValue] = useState(initial);
  return (
    <WinBackControl
      value={value}
      onChange={setValue}
      isPro
      theme={resolveTheme(null)}
      avatarUrl={null}
      title="Franek"
      firstLink={null}
    />
  );
}

async function openControl() {
  await userEvent.click(screen.getByRole("button", { name: /Win-Back/ }));
}

describe("WinBackControl preview", () => {
  it("disables the preview until the popup has a link", async () => {
    render(<Harness initial={{ enabled: true, headline: "Wait!", url: "" }} />);
    await openControl();

    expect(screen.getByRole("button", { name: "Preview popup" })).toBeDisabled();
    expect(screen.getByText("Add a valid link to preview the popup.")).toBeInTheDocument();
  });

  it("previews the real popup, adding https:// to bare domains like saving does", async () => {
    render(<Harness initial={{ enabled: true, headline: "Wait! Watch my new video.", url: "" }} />);
    await openControl();
    await userEvent.type(screen.getByPlaceholderText("https://…"), "youtube.com");
    await userEvent.click(screen.getByRole("button", { name: "Preview popup" }));

    const dialog = screen.getByRole("dialog", { name: "Before you go" });
    expect(dialog).toHaveTextContent("Wait! Watch my new video.");
    expect(screen.getByRole("link", { name: /Yes, show me/ })).toHaveAttribute("href", "https://youtube.com");
  });

  it("closes the preview with Escape", async () => {
    render(<Harness initial={{ enabled: true, headline: "Hi", url: "https://example.com" }} />);
    await openControl();
    await userEvent.click(screen.getByRole("button", { name: "Preview popup" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
