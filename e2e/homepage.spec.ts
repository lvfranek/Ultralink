import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("keyboard users can skip straight to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("FAQ answers open and close", async ({ page }) => {
    await page.goto("/");
    const question = page.getByRole("button", { name: "What is Win-Back?" });
    await question.click();
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("region", { name: "What is Win-Back?" })).toBeVisible();

    await question.click();
    await expect(question).toHaveAttribute("aria-expanded", "false");
  });

  test("the imprint is reachable from the footer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Imprint" }).click();
    await expect(page).toHaveURL(/\/imprint$/);
    await expect(page.getByRole("heading", { level: 1, name: "Imprint" })).toBeVisible();
  });

  test("the mobile menu opens and closes after picking a section", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menuLink = page.getByRole("navigation").getByRole("link", { name: "Pricing" }).last();
    await expect(menuLink).toBeVisible();

    await menuLink.click();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page).toHaveURL(/#pricing$/);
  });
});
