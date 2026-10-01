// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  it("switches between annual and monthly prices", async () => {
    render(<Pricing />);
    const monthly = screen.getByRole("button", { name: "Monthly" });
    const annual = screen.getByRole("button", { name: /Annual/ });
    expect(annual).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("$6")).toBeInTheDocument();
    expect(screen.getByText(/billed \$72\/yr/)).toBeInTheDocument();

    await userEvent.click(monthly);
    expect(monthly).toHaveAttribute("aria-pressed", "true");
    expect(annual).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("$8")).toBeInTheDocument();
    expect(screen.queryByText(/billed \$72\/yr/)).not.toBeInTheDocument();
  });

  it("updates the price when more link pages are picked", () => {
    render(<Pricing />);
    const slider = screen.getByRole("slider", { name: /Link pages/ });
    fireEvent.change(slider, { target: { value: "2" } });
    expect(slider).toHaveAttribute("aria-valuetext", "10 link pages");
    expect(screen.getByText("$22")).toBeInTheDocument();
  });

  it("marks custom domains as coming soon", () => {
    render(<Pricing />);
    expect(screen.getByText("Custom domains").closest("li")).toHaveTextContent("Coming soon");
  });

  it("starts checkout for the chosen plan and shows errors", async () => {
    vi.mocked(startCheckout).mockResolvedValue({ error: "Invalid plan selection." });
    render(<Pricing />);

    await userEvent.click(screen.getByRole("button", { name: "Monthly" }));
    fireEvent.change(screen.getByRole("slider", { name: /Link pages/ }), { target: { value: "2" } });
    await userEvent.click(screen.getByRole("button", { name: "Get Pro" }));

    expect(startCheckout).toHaveBeenCalledWith({ tier: 10, interval: "monthly" });
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid plan selection.");
  });
});
