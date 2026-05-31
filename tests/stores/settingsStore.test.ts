import { describe, it, expect, beforeEach } from "vitest";
import { useSettings } from "@/stores/settingsStore";

beforeEach(() => localStorage.clear());

describe("settingsStore", () => {
  it("exposes defaults and updates persist", () => {
    useSettings.getState().setMode("words");
    expect(useSettings.getState().mode).toBe("words");
    const raw = JSON.parse(localStorage.getItem("thaitype:settings")!);
    expect(raw.data.mode).toBe("words");
  });
  it("setLayout and setInputMode persist", () => {
    useSettings.getState().setLayout("pattachote");
    useSettings.getState().setInputMode("os-native");
    expect(useSettings.getState().layoutId).toBe("pattachote");
    expect(useSettings.getState().inputMode).toBe("os-native");
    const raw = JSON.parse(localStorage.getItem("thaitype:settings")!);
    expect(raw.data.layoutId).toBe("pattachote");
    expect(raw.data.inputMode).toBe("os-native");
  });
});
