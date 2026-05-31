import { test, expect } from "@playwright/test";

test("runs a words test and shows results", async ({ page }) => {
  await page.goto("/");
  await page.getByText("words", { exact: true }).click();
  await page.getByText("10", { exact: true }).click();
  for (let i = 0; i < 400; i++) {
    await page.keyboard.press("KeyD"); // -> ก
    if (await page.getByText("next test").isVisible().catch(() => false)) break;
  }
  await expect(page.getByText("next test")).toBeVisible();
});
