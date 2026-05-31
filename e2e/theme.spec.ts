import { test, expect } from "@playwright/test";

test("switches to a preset theme and it applies", async ({ page }) => {
  await page.goto("/themes");
  await page.getByTestId("theme-card-terminal").click();
  const accent = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
  );
  expect(accent).toBe("#39ff8a");
});

test("creates a custom theme via the editor", async ({ page }) => {
  await page.goto("/themes");
  await page.getByRole("button", { name: "new theme" }).click();
  await page.getByLabel("name").fill("E2E Theme");
  await page.getByRole("button", { name: "save" }).click();
  await expect(page.getByText("E2E Theme")).toBeVisible();
});
