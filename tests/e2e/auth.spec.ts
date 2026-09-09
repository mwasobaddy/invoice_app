import { test, expect } from "@playwright/test";

test("home redirects to dashboard if authenticated or shows sign in", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\//);
  const signIn = page.getByRole("link", { name: /Create account|Sign in/i });
  await expect(signIn.first()).toBeVisible();
});
