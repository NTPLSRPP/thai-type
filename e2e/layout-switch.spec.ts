import { test, expect } from "@playwright/test";

test("switches layout and shows on-screen keyboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("key-KeyD")).toBeVisible();
  const kedChar = await page.getByTestId("key-KeyD").textContent();
  await page.getByText("Pattachote", { exact: true }).click();
  // KeyD shows a different character under Pattachote (ก -> ง)
  await expect(page.getByTestId("key-KeyD")).not.toHaveText(kedChar ?? "");
});

test("runs a words test in app-remap mode", async ({ page }) => {
  await page.goto("/");
  await page.getByText("words", { exact: true }).click();
  await page.getByText("10", { exact: true }).click();
  for (let i = 0; i < 400; i++) {
    await page.keyboard.press("KeyD");
    if (await page.getByText("next test").isVisible().catch(() => false)) break;
  }
  await expect(page.getByText("next test")).toBeVisible();
});
