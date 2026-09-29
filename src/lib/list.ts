import type { Cell, CellState, ListNode, ListView } from "./types";

export interface Node {
  id: number;
  value: Cell;
  next: number | null;
  prev: number | null;
  random: number | null;
  down: number | null;
  tag?: string;
}

type Place = { row: number; col: number };
export type ViewOpts = {
  states?: Record<number, CellState>;
  edges?: Record<number, CellState>;
  pointers?: Record<string, number | null | undefined>;
  label?: string;
  rowLabels?: string[];
  /** Explicit positions; nodes left out are hidden. Default: follow `layoutFrom` chains. */
  place?: Map<number, Place>;
  /** Heads to lay out, one row each, following `next` (default: [head]). */
  layoutFrom?: (number | null)[];
  showNull?: boolean;
  /** Draw every node in its creation position instead of following links. */
  fixed?: boolean;
  /** Fall-back state for nodes without an explicit one. */
  base?: CellState;
};

/**
 * A mutable linked structure for tracers. Nodes keep stable ids so the canvas can animate them
 * sliding into new positions when links change.
 */
export class LinkedList {
  nodes = new Map<number, Node>();
  head: number | null = null;
  doubly: boolean;
  private seq = 0;
  /** Creation position of each node — used by `fixed` layouts (e.g. reversal keeps nodes in place). */
  home = new Map<number, Place>();

  constructor(values: Cell[] = [], opts: { doubly?: boolean; circular?: boolean; row?: number; idBase?: number } = {}) {
    this.doubly = !!opts.doubly;
    if (opts.idBase) this.seq = opts.idBase;
    this.head = this.chain(values, opts.row ?? 0);
    if (opts.circular && this.head !== null) this.node(this.tail()!).next = this.head;
  }

  /** Create a chain of fresh nodes and return its first id. */
  chain(values: Cell[], row = 0, col0 = 0): number | null {
    let first: number | null = null, last: number | null = null;
    values.forEach((v, i) => {
      const id = this.add(v, { row, col: col0 + i });
      if (last === null) first = id;
      else { this.node(last).next = id; if (this.doubly) this.node(id).prev = last; }
      last = id;
    });
    return first;
  }

  add(value: Cell, place: Place = { row: 0, col: this.nodes.size }, tag?: string): number {
    const id = ++this.seq;
    this.nodes.set(id, { id, value, next: null, prev: null, random: null, down: null, tag });
    this.home.set(id, place);
    return id;
  }

  node(id: number): Node {
    const n = this.nodes.get(id);
    if (!n) throw new Error(`no node ${id}`);
    return n;
  }

  val(id: number | null) {
    return id === null ? null : this.node(id).value;
  }

  /** Ids reachable from `from` via next, stopping at null or a repeat (cycles). */
  walk(from: number | null = this.head, max = 500): number[] {
    const out: number[] = [];
    const seen = new Set<number>();
    for (let c = from; c !== null && !seen.has(c) && out.length < max; c = this.node(c).next) {
      out.push(c);
      seen.add(c);
    }
    return out;
  }

  tail(from: number | null = this.head): number | null {
    const w = this.walk(from);
    return w.length ? w[w.length - 1] : null;
  }

  values(from: number | null = this.head): Cell[] {
    return this.walk(from).map((id) => this.node(id).value);
  }

  /** Human-readable chain: 1 → 2 → 3 → null (or ↺ 2 for a cycle). */
  text(from: number | null = this.head): string {
    const w = this.walk(from);
    if (!w.length) return "empty";
    const last = this.node(w[w.length - 1]).next;
    return `${w.map((id) => this.node(id).value).join(" → ")} → ${last === null ? "null" : `(back to ${this.node(last).value})`}`;
  }

  view(o: ViewOpts = {}): ListView {
    let place = o.place;
    if (!place) {
      place = new Map();
      if (o.fixed) {
        for (const [id, p] of this.home) if (this.nodes.has(id)) place.set(id, p);
      } else {
        (o.layoutFrom ?? [this.head]).forEach((h, row) => this.walk(h).forEach((id, col) => place!.set(id, { row, col })));
      }
    }
    const nodes: ListNode[] = [];
    for (const [id, p] of place) {
      const n = this.nodes.get(id);
      if (!n) continue;
      nodes.push({
        id, value: n.value, row: p.row, col: p.col,
        // -1 = points at a node that isn't drawn: no arrow and no null marker
        next: n.next === null ? null : place.has(n.next) ? n.next : -1,
        ...(this.doubly ? { prev: n.prev !== null && place.has(n.prev) ? n.prev : null } : {}),
        ...(n.random !== null && place.has(n.random) ? { random: n.random } : {}),
        ...(n.down !== null && place.has(n.down) ? { down: n.down } : {}),
        state: o.states?.[id] ?? o.base ?? "default",
        ...(o.edges?.[id] ? { edge: o.edges[id] } : {}),
        ...(n.tag ? { tag: n.tag } : {}),
      });
    }
    const pointers = Object.entries(o.pointers ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([label, v]) => ({ label, node: v === null ? null : place!.has(v as number) ? (v as number) : null }));
    return { label: o.label, nodes, pointers, rowLabels: o.rowLabels, doubly: this.doubly, showNull: o.showNull };
  }
}

/** States helper: mark a set of ids with one state. */
export function mark(ids: Iterable<number | null | undefined>, state: CellState, into: Record<number, CellState> = {}) {
  for (const id of ids) if (id !== null && id !== undefined) into[id] = state;
  return into;
}
