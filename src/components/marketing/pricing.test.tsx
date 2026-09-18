// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { startCheckout } from "@/app/actions/billing";
import { Pricing } from "./pricing";

// The real server action talks to Supabase and Stripe
vi.mock("@/app/actions/billing", () => ({ startCheckout: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.mocked(startCheckout).mockReset();
});

describe("Pricing", () => {
  it("switches between monthly and annual prices", async () => {
    render(<Pricing />);
    const monthly = screen.getByRole("button", { name: "Monthly" });
    const annual = screen.getByRole("button", { name: /Annual/ });
    expect(monthly).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Billed monthly")).toBeInTheDocument();

    await userEvent.click(annual);
    expect(annual).toHaveAttribute("aria-pressed", "true");
    expect(monthly).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Billed $72/yr")).toBeInTheDocument();
  });

  it("tells screen reader users which free-plan features are not included", () => {
    render(<Pricing />);
    expect(screen.getAllByText("Not included:").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Included:").length).toBeGreaterThan(0);
  });

  it("starts checkout for the chosen plan and shows errors", async () => {
    vi.mocked(startCheckout).mockResolvedValue({ error: "Invalid plan selection." });
    render(<Pricing />);

    await userEvent.click(screen.getByRole("button", { name: /Annual/ }));
    await userEvent.selectOptions(screen.getByRole("combobox"), screen.getByRole("option", { name: /10 link pages/ }));
    await userEvent.click(screen.getByRole("button", { name: "Get Pro" }));

    expect(startCheckout).toHaveBeenCalledWith({ tier: 10, interval: "annual" });
    expect(await screen.findByText("Invalid plan selection.")).toBeInTheDocument();
  });
});
