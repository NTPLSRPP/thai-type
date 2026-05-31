import { test, expect } from "@playwright/test";

test("navigates to lessons and completes the first unit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "lessons" }).click();
  await expect(page).toHaveURL(/\/lessons$/);
  await page.getByText("Home Row — Left").click();
  await expect(page).toHaveURL(/\/lessons\/home-left$/);

  const codes = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"];
  for (let i = 0; i < 600; i++) {
    await page.keyboard.press(codes[i % codes.length]);
    if (await page.getByText(/lesson complete/i).isVisible().catch(() => false)) break;
  }
  await expect(page.getByText(/lesson complete/i)).toBeVisible();
});

test("first unit unlocks the second after completion", async ({ page }) => {
  await page.goto("/lessons");
  await page.getByText("Home Row — Left").click();
  const codes = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"];
  for (let i = 0; i < 600; i++) {
    await page.keyboard.press(codes[i % codes.length]);
    if (await page.getByText(/lesson complete/i).isVisible().catch(() => false)) break;
  }
  await page.getByRole("link", { name: "all lessons" }).click();
  await expect(page.getByTestId("unit-home-right")).toHaveAttribute("data-locked", "false");
});
