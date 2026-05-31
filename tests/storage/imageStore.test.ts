import { describe, it, expect, vi, beforeEach } from "vitest";

const mem = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: vi.fn(async (k: string) => mem.get(k)),
  set: vi.fn(async (k: string, v: unknown) => void mem.set(k, v)),
  del: vi.fn(async (k: string) => void mem.delete(k)),
}));

import { putImage, getImage, deleteImage } from "@/lib/storage/imageStore";

beforeEach(() => mem.clear());

describe("imageStore", () => {
  it("stores and retrieves a blob under an image key", async () => {
    const blob = new Blob(["x"], { type: "image/png" });
    await putImage("abc", blob);
    expect(await getImage("abc")).toBe(blob);
  });
  it("returns undefined for a missing key", async () => {
    expect(await getImage("missing")).toBeUndefined();
  });
  it("deletes a stored blob", async () => {
    await putImage("abc", new Blob(["x"]));
    await deleteImage("abc");
    expect(await getImage("abc")).toBeUndefined();
  });
});
