import { paint } from "../trace";
import type { CellState, Frame, Row } from "../types";

export const CAPACITY = 10;

export type LabOp =
  | { op: "insert"; index: number; value: number }
  | { op: "delete"; index: number }
  | { op: "search"; value: number }
  | { op: "update"; index: number; value: number }
  | { op: "reverse" }
  | { op: "rotate"; k: number; dir: "left" | "right" };

export interface LabResult {
  frames: Frame[];
  next: number[];
  ids: number[];
  error?: string;
}

/** A fixed-capacity array: `size` used slots followed by empty ones. Ids keep movement animated. */
class Slots {
  vals: (number | null)[];
  ids: number[];
  size: number;
  comparisons = 0;
  moves = 0;
  constructor(arr: number[], ids: number[], private nextId: () => number) {
    this.vals = [...arr, ...Array(CAPACITY - arr.length).fill(null)];
    this.ids = [...ids, ...Array.from({ length: CAPACITY - arr.length }, () => nextId())];
    this.size = arr.length;
  }
  swap(i: number, j: number) {
    [this.vals[i], this.vals[j]] = [this.vals[j], this.vals[i]];
    [this.ids[i], this.ids[j]] = [this.ids[j], this.ids[i]];
    this.moves++;
  }
  row(fn: (i: number) => CellState): Row {
    return { label: `array (size ${this.size} / capacity ${CAPACITY})`, values: [...this.vals], ids: [...this.ids], states: paint(CAPACITY, (i) => (i >= this.size ? "default" : fn(i))) };
  }
  stats() {
    return { comparisons: this.comparisons, swaps: this.moves, writes: 0 };
  }
  used() {
    return this.vals.slice(0, this.size) as number[];
  }
  fresh() {
    return this.nextId();
  }
}

export function runLab(arr: number[], ids: number[], op: LabOp, nextId: () => number): LabResult {
  const s = new Slots(arr, ids, nextId);
  const f: Frame[] = [];
  const push = (fr: Omit<Frame, "stats">) => f.push({ ...fr, stats: s.stats() });
  const done = (note: string, extra: Partial<Frame> = {}): LabResult => {
    push({ rows: [s.row(() => "confirmed")], note, line: "done", ...extra });
    return { frames: f, next: s.used(), ids: s.ids.slice(0, s.size) };
  };
  const fail = (error: string): LabResult => ({ frames: [{ rows: [s.row(() => "inactive")], note: error }], next: arr, ids, error });

  switch (op.op) {
    case "insert": {
      const { index, value } = op;
      if (s.size >= CAPACITY) return fail(`the array is full (capacity ${CAPACITY}). delete something first — a real dynamic array would now copy everything into a bigger block.`);
      if (index < 0 || index > s.size) return fail(`insert position must be between 0 and ${s.size}.`);
      push({ rows: [s.row((i) => (i >= index ? "pending" : "inactive"))], regions: index < s.size ? [{ from: index, to: s.size - 1, label: "must shift right", tone: "pending" }] : [], note: `insert ${value} at index ${index}. everything from ${index} to ${s.size - 1} has to move one slot right to make room.` });
      for (let k = s.size; k > index; k--) {
        s.swap(k, k - 1);
        push({ rows: [s.row((i) => (i === k ? "current" : i > k ? "confirmed" : i >= index && i < k ? "pending" : "inactive"))], pointers: [{ label: "k", index: k }], note: `move ${s.vals[k]} from ${k - 1} to ${k} (working from the back so nothing is overwritten).` });
      }
      s.vals[index] = value;
      s.ids[index] = s.fresh();
      s.size++;
      return done(`${value} written into index ${index}. that took ${s.moves} move${s.moves === 1 ? "" : "s"} — inserting near the front is O(n).`);
    }
    case "delete": {
      const { index } = op;
      if (!s.size) return fail("the array is empty — nothing to delete.");
      if (index < 0 || index >= s.size) return fail(`delete position must be between 0 and ${s.size - 1}.`);
      const gone = s.vals[index];
      push({ rows: [s.row((i) => (i === index ? "invalid" : i > index ? "pending" : "inactive"))], note: `delete ${gone} at index ${index}. the gap it leaves must be closed by shifting the rest left.` });
      s.vals[index] = null;
      for (let k = index; k < s.size - 1; k++) {
        s.swap(k, k + 1);
        push({ rows: [s.row((i) => (i === k ? "current" : i < k && i >= index ? "confirmed" : i > k + 1 ? "pending" : "inactive"))], pointers: [{ label: "k", index: k }], note: `move ${s.vals[k]} from ${k + 1} to ${k}.` });
      }
      s.size--;
      return done(`${gone} removed with ${s.moves} move${s.moves === 1 ? "" : "s"}. deleting from the front of an array is O(n); from the end it's O(1).`);
    }
    case "search": {
      const { value } = op;
      for (let i = 0; i < s.size; i++) {
        s.comparisons++;
        const hit = s.vals[i] === value;
        push({ rows: [s.row((x) => (x === i ? (hit ? "confirmed" : "comparing") : x < i ? "invalid" : "inactive"))], pointers: [{ label: "i", index: i }], note: hit ? `${s.vals[i]} = ${value} — found at index ${i}.` : `${s.vals[i]} ≠ ${value}, rule it out.` });
        if (hit) {
          f.push({ rows: [s.row((x) => (x === i ? "confirmed" : "inactive"))], note: `found ${value} at index ${i} after ${s.comparisons} comparison${s.comparisons === 1 ? "" : "s"}. unsorted arrays need a linear scan: O(n).`, result: `index ${i}`, stats: s.stats() });
          return { frames: f, next: s.used(), ids: s.ids.slice(0, s.size) };
        }
      }
      f.push({ rows: [s.row(() => "invalid")], note: `${value} isn't in the array — we had to check all ${s.size} values to be sure.`, result: "not found", stats: s.stats() });
      return { frames: f, next: s.used(), ids: s.ids.slice(0, s.size) };
    }
    case "update": {
      const { index, value } = op;
      if (index < 0 || index >= s.size) return fail(`update position must be between 0 and ${s.size - 1}.`);
      push({ rows: [s.row((i) => (i === index ? "current" : "inactive"))], pointers: [{ label: "i", index }], note: `jump straight to index ${index}: address = start + ${index} × slot size. no scanning — O(1).` });
      const old = s.vals[index];
      s.vals[index] = value;
      return done(`overwrote ${old} with ${value}. random access is the array's superpower.`);
    }
    case "reverse": {
      let l = 0, r = s.size - 1;
      push({ rows: [s.row((i) => (i === l || i === r ? "current" : "inactive"))], pointers: s.size ? [{ label: "l", index: l }, { label: "r", index: Math.max(r, 0) }] : [], note: "two pointers at the ends, swapping inward." });
      while (l < r) {
        s.swap(l, r);
        push({ rows: [s.row((i) => (i === l || i === r ? "comparing" : i < l || i > r ? "confirmed" : "inactive"))], pointers: [{ label: "l", index: l }, { label: "r", index: r }], note: `swap ${s.vals[r]} and ${s.vals[l]}.` });
        l++; r--;
      }
      return done(`reversed with ${s.moves} swaps — n/2, in place.`);
    }
    case "rotate": {
      const n = s.size;
      if (!n) return fail("the array is empty — nothing to rotate.");
      const k = ((op.k % n) + n) % n;
      const right = op.dir === "right" ? k : (n - k) % n;
      const rev = (a: number, b: number, why: string) => {
        push({ rows: [s.row((i) => (i >= a && i <= b ? "pending" : "inactive"))], regions: b > a ? [{ from: a, to: b, label: why, tone: "pending" }] : [], note: `${why}: reverse indexes ${a}..${b}.` });
        while (a < b) {
          s.swap(a, b);
          push({ rows: [s.row((i) => (i === a || i === b ? "comparing" : "inactive"))], pointers: [{ label: "l", index: a }, { label: "r", index: b }], note: `swap ${s.vals[b]} ↔ ${s.vals[a]}.` });
          a++; b--;
        }
      };
      if (right === 0) return done(`rotating by ${op.k} on ${n} elements lands where it started.`);
      rev(0, n - 1, "step 1 · whole array");
      rev(0, right - 1, `step 2 · first ${right}`);
      rev(right, n - 1, `step 3 · last ${n - right}`);
      return done(`rotated ${op.dir} by ${op.k} with three reversals — O(n) time, O(1) space.`);
    }
  }
}
