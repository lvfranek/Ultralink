// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Faq } from "./faq";

afterEach(cleanup);

// Native <details>/<summary>: the browser handles open/close, keyboard and
// screen-reader state, so these tests only check the wiring.
describe("FAQ", () => {
  it("starts with every answer closed", () => {
    const { container } = render(<Faq />);
    const items = container.querySelectorAll("details");
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) expect(item).not.toHaveAttribute("open");
  });

  it("opens an answer when its question is clicked, and closes it again", async () => {
    render(<Faq />);
    const question = screen.getByText("What is Win-Back?");
    const item = question.closest("details")!;

    await userEvent.click(question);
    expect(item).toHaveAttribute("open");
    expect(item).toHaveTextContent(/about to leave/);

    await userEvent.click(question);
    expect(item).not.toHaveAttribute("open");
  });
});
