import { test, expect } from "@playwright/test";

// Chapter 1, sub-lesson 1 is all ด (KeyF in Kedmanee) + spaces — typeable deterministically.
const LINE_1 = "ดดด ดดด ดดด ดดด ดดด ดดด ดดด ดดด";

test("open a chapter, run a sub-lesson, finish 3 reps to complete", async ({ page }) => {
  await page.goto("/lessons");
  await expect(page.getByText(/แป้นเหย้า/)).toBeVisible(); // chapter 1 header
  await page.getByTestId("sub-1").click();
  await expect(page).toHaveURL(/\/lessons\/1$/);
  await expect(page.getByTestId("rep-indicator")).toContainText("/ 3");

  async function typeLine() {
    for (const ch of LINE_1) {
      await page.keyboard.press(ch === " " ? "Space" : "KeyF");
    }
  }
  // 3 reps required
  await typeLine();
  await typeLine();
  await typeLine();
  await expect(page.getByText(/lesson complete/i)).toBeVisible();

  // sub-lesson now shows complete on the map
  await page.getByRole("link", { name: "all lessons" }).click();
  await expect(page.getByTestId("sub-1")).toHaveAttribute("data-complete", "true");
});

test("can skip directly to any sub-lesson", async ({ page }) => {
  await page.goto("/lessons/40"); // deep link, no prerequisite
  await expect(page.getByTestId("rep-indicator")).toBeVisible();
  await expect(page.getByTestId("key-KeyD")).toBeVisible();
});
