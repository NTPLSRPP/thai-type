import { Keyboard } from "./Keyboard";
import type { Layout } from "@/lib/layouts/types";
import type { KeyboardSize } from "@/lib/storage/schema";

// Wrapper kept as the single on-screen-keyboard mount point. The hand-posture
// guide was removed for now; re-add the overlay here when it returns.
interface Props {
  layout: Layout;
  nextChar: string | null;
  errorCounts: Map<string, number>;
  size?: KeyboardSize;
  showShiftLegend?: boolean;
  fingerColors?: boolean;
  nextKeyHint?: boolean;
  heatmap?: boolean;
  showKeyboard: boolean;
}

export function KeyboardWithHands({ showKeyboard, ...kb }: Props) {
  if (!showKeyboard) return null;
  return (
    <Keyboard
      layout={kb.layout}
      nextChar={kb.nextChar}
      errorCounts={kb.errorCounts}
      size={kb.size}
      showShiftLegend={kb.showShiftLegend}
      fingerColors={kb.fingerColors}
      nextKeyHint={kb.nextKeyHint}
      heatmap={kb.heatmap}
    />
  );
}
