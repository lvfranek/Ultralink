import { expect, test } from "@playwright/test";

test.describe("Sign-in and access control", () => {
  test("signed-out visitors are sent from the dashboard to the login page", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("switching to sign-up shows the extra fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Username")).toHaveCount(0);

    await page.getByRole("tab", { name: "Create account" }).click();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
  });

  test("an empty sign-in shows validation errors instead of submitting", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });

  test("a failed Google sign-up explains what went wrong", async ({ page }) => {
    await page.goto("/login?error=unexpected_failure&error_description=Database+error+saving+new+user");
    await expect(page.getByText("We couldn't sign you in.")).toBeVisible();
    await expect(page.getByText("Details: Database error saving new user (unexpected_failure)")).toBeVisible();
  });
});
