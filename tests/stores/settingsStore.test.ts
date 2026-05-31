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
  it("update() patches arbitrary settings and persists all fields", () => {
    useSettings.getState().update({ caretStyle: "block", fontSize: 40, clickSound: true });
    expect(useSettings.getState().caretStyle).toBe("block");
    const data = JSON.parse(localStorage.getItem("thaitype:settings")!).data;
    expect(data.caretStyle).toBe("block");
    expect(data.fontSize).toBe(40);
    expect(data.clickSound).toBe(true);
    // unrelated fields still persisted (full snapshot)
    expect(data.layoutId).toBeDefined();
    expect(data.showKeyboard).toBe(true);
  });
  it("reset() restores defaults", () => {
    useSettings.getState().update({ fontSize: 99 });
    useSettings.getState().reset();
    expect(useSettings.getState().fontSize).toBe(28);
  });
});
