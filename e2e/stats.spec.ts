import { test, expect } from "@playwright/test";

test("a finished test shows a wpm graph and lands on the stats dashboard", async ({ page }) => {
  await page.goto("/");
  await page.getByText("words", { exact: true }).click();
  await page.getByText("10", { exact: true }).click();
  for (let i = 0; i < 400; i++) {
    await page.keyboard.press("KeyD");
    if (await page.getByText("next test").isVisible().catch(() => false)) break;
  }
  await expect(page.getByText("next test")).toBeVisible();
  await expect(page.getByTestId("wpm-graph")).toBeVisible();

  await page.getByRole("link", { name: "stats" }).click();
  await expect(page).toHaveURL(/\/stats$/);
  await expect(page.getByTestId("agg-totalTests")).toContainText("1");
  await expect(page.getByTestId("key-KeyD")).toBeVisible();
});
