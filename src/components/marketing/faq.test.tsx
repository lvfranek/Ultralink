// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQ } from "./faq";

afterEach(cleanup);

// jsdom doesn't implement `inert`, so check the attribute directly: in real
// browsers it hides a collapsed answer from screen readers and the Tab key.
const openAnswers = (container: HTMLElement) =>
  [...container.querySelectorAll("dd")].filter((dd) => !dd.hasAttribute("inert"));

describe("FAQ", () => {
  it("starts with every answer closed and hidden from screen readers", () => {
    const { container } = render(<FAQ />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-expanded", "false");
    }
    expect(container.querySelectorAll("dd").length).toBeGreaterThan(0);
    expect(openAnswers(container)).toHaveLength(0);
  });

  it("opens an answer on click and links it to its question", async () => {
    const { container } = render(<FAQ />);
    const question = screen.getByRole("button", { name: "What is Win-Back?" });
    await userEvent.click(question);

    expect(question).toHaveAttribute("aria-expanded", "true");
    const answer = document.getElementById(question.getAttribute("aria-controls")!);
    expect(answer).toHaveAccessibleName("What is Win-Back?");
    expect(answer).toHaveTextContent(/second chance/);
    expect(openAnswers(container)).toEqual([answer!.closest("dd")]);
  });

  it("keeps only one answer open at a time, and closes it again on a second click", async () => {
    const { container } = render(<FAQ />);
    const first = screen.getByRole("button", { name: "What is Ultralink?" });
    const second = screen.getByRole("button", { name: "How do I cancel?" });

    await userEvent.click(first);
    await userEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(openAnswers(container)).toHaveLength(1);

    await userEvent.click(second);
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(openAnswers(container)).toHaveLength(0);
  });
});
