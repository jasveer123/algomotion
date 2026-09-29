import { LinkedList, type ViewOpts } from "../../list";
import { Rec } from "../../trace";
import type { AuxPanel, CellState, Frame } from "../../types";

export { LinkedList, Rec };
export type { ViewOpts };

/** One frame showing a single linked structure. */
export const lf = (ll: LinkedList, o: ViewOpts, note: string, line: string, extra: Partial<Frame> = {}): Frame => ({
  rows: [],
  lists: [ll.view(o)],
  note,
  line,
  ...extra,
});

export const chips = (title: string, list: (number | string)[], state: CellState = "pending", empty = "empty"): AuxPanel => ({
  title,
  items: list.map((v) => ({ text: String(v), state })),
  empty,
});

/** Builds a list whose tail links back to index `pos` (−1 = no loop). Returns the list and the loop-entry id. */
export function withLoop(values: number[], pos: number) {
  const ll = new LinkedList(values);
  const ids = ll.walk();
  const entry = pos >= 0 && pos < ids.length ? ids[pos] : null;
  if (entry !== null) ll.node(ids[ids.length - 1]).next = entry;
  return { ll, ids, entry };
}

export const ch = (code: number) => String.fromCharCode(code);
