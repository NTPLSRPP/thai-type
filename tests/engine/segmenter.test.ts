import { describe, it, expect } from "vitest";
import { toGraphemes } from "@/lib/engine/segmenter";

describe("toGraphemes", () => {
  it("keeps a base consonant and its tone mark as one cluster", () => {
    // กา + ้ (mai tho) on the อ -> "ก้า" is ก + ้ + า = clusters: ["ก้","า"]
    expect(toGraphemes("ก้า")).toEqual(["ก้", "า"]);
  });
  it("splits plain ascii into single chars", () => {
    expect(toGraphemes("abc")).toEqual(["a", "b", "c"]);
  });
  it("treats base + above vowel + tone as one cluster", () => {
    // หนัง: ห น ั ง -> the ั attaches to น
    expect(toGraphemes("นั")).toEqual(["นั"]);
  });
});
