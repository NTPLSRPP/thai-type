import type { Layout } from "./types";
import { kedmanee } from "./kedmanee";
import { pattachote } from "./pattachote";
import { manoonchai } from "./manoonchai";

export type LayoutId = "kedmanee" | "pattachote" | "manoonchai";

export const LAYOUTS: Record<LayoutId, Layout> = { kedmanee, pattachote, manoonchai };

export function getLayout(id: LayoutId): Layout {
  return LAYOUTS[id];
}

export function layoutList(): { id: LayoutId; name: string }[] {
  return (Object.keys(LAYOUTS) as LayoutId[]).map((id) => ({ id, name: LAYOUTS[id].name }));
}
