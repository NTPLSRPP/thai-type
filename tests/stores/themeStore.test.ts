import { describe, it, expect, beforeEach } from "vitest";
import { useTheme } from "@/stores/themeStore";
import type { Theme } from "@/lib/theme/types";

beforeEach(() => {
  localStorage.clear();
  useTheme.getState().reload();
});

const draft: Theme = {
  id: "tmp",
  name: "Mine",
  caretStyle: "block",
  sound: "off",
  background: null,
  vars: {
    "--bg": "#000",
    "--text": "#777",
    "--text-typed": "#fff",
    "--accent": "#0f0",
    "--caret": "#0f0",
    "--font": "monospace",
  },
};

describe("themeStore", () => {
  it("defaults active to minimal-dark and lists presets", () => {
    expect(useTheme.getState().activeId).toBe("minimal-dark");
    expect(useTheme.getState().allThemes().length).toBeGreaterThanOrEqual(12);
  });
  it("setActive persists", () => {
    useTheme.getState().setActive("ocean");
    expect(useTheme.getState().activeId).toBe("ocean");
    expect(localStorage.getItem("thaitype:activetheme")).toBe("ocean");
  });
  it("addCustom stores a theme with a fresh id and returns it", () => {
    const created = useTheme.getState().addCustom(draft);
    expect(created.id).not.toBe("tmp");
    expect(useTheme.getState().customs.some((t) => t.id === created.id)).toBe(true);
  });
  it("deleteCustom removes it", () => {
    const created = useTheme.getState().addCustom(draft);
    useTheme.getState().deleteCustom(created.id);
    expect(useTheme.getState().customs.some((t) => t.id === created.id)).toBe(false);
  });
  it("activeTheme() resolves preset or custom", () => {
    useTheme.getState().setActive("terminal");
    expect(useTheme.getState().activeTheme()?.id).toBe("terminal");
  });
});
