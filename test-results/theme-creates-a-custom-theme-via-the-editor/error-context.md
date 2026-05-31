# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: theme.spec.ts >> creates a custom theme via the editor
- Location: e2e/theme.spec.ts:12:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('E2E Theme')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('E2E Theme')

```

```yaml
- main:
  - link "thai-type home":
    - /url: /
    - text: thai type
  - navigation "Primary":
    - link "test":
      - /url: /
    - link "lessons":
      - /url: /lessons
    - link "themes":
      - /url: /themes
    - link "stats":
      - /url: /stats
    - link "settings":
      - /url: /settings
  - heading "themes" [level=1]
  - button "new theme"
  - textbox "import code":
    - /placeholder: paste theme code
  - button "import"
  - heading "Built-in" [level=2]
  - button "Use Minimal Dark theme" [pressed]: สวัสดี 78 wpm · 96% Minimal Dark
  - button "Use Minimal Light theme": สวัสดี 78 wpm · 96% Minimal Light
  - button "Use Terminal theme": สวัสดี 78 wpm · 96% Terminal
  - button "Use Editorial theme": สวัสดี 78 wpm · 96% Editorial
  - button "Use Vaporwave theme": สวัสดี 78 wpm · 96% Vaporwave
  - button "Use Pastel theme": สวัสดี 78 wpm · 96% Pastel
  - button "Use Sunset theme": สวัสดี 78 wpm · 96% Sunset
  - button "Use Neon theme": สวัสดี 78 wpm · 96% Neon
  - button "Use Forest theme": สวัสดี 78 wpm · 96% Forest
  - button "Use Ocean theme": สวัสดี 78 wpm · 96% Ocean
  - button "Use Mocha theme": สวัสดี 78 wpm · 96% Mocha
  - button "Use Paper theme": สวัสดี 78 wpm · 96% Paper
  - button "Use Hatsune Miku theme": สวัสดี 78 wpm · 96% Hatsune Miku
  - button "Use Chisa theme": สวัสดี 78 wpm · 96% Chisa
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("switches to a preset theme and it applies", async ({ page }) => {
  4  |   await page.goto("/themes");
  5  |   await page.getByTestId("theme-card-terminal").click();
  6  |   const accent = await page.evaluate(() =>
  7  |     getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
  8  |   );
  9  |   expect(accent).toBe("#39ff8a");
  10 | });
  11 | 
  12 | test("creates a custom theme via the editor", async ({ page }) => {
  13 |   await page.goto("/themes");
  14 |   await page.getByRole("button", { name: "new theme" }).click();
  15 |   await page.getByLabel("name").fill("E2E Theme");
  16 |   await page.getByRole("button", { name: "save" }).click();
> 17 |   await expect(page.getByText("E2E Theme")).toBeVisible();
     |                                             ^ Error: expect(locator).toBeVisible() failed
  18 | });
  19 | 
```