const seg = new Intl.Segmenter("th", { granularity: "grapheme" });

export function toGraphemes(text: string): string[] {
  return Array.from(seg.segment(text), (s) => s.segment);
}
