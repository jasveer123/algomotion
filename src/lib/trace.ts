import type { CellState, Frame, Row, Stats } from "./types";

/** Hard cap so a learner's custom input can never produce a runaway animation. */
export const MAX_FRAMES = 700;

/** A mutable array that remembers each value's identity so swaps render as movement. */
export class Tape {
  vals: number[];
  ids: number[];
  stats: Stats = { comparisons: 0, swaps: 0, writes: 0 };

  constructor(arr: number[], idOffset = 0) {
    this.vals = [...arr];
    this.ids = arr.map((_, i) => i + idOffset);
  }

  get n() {
    return this.vals.length;
  }

  swap(i: number, j: number) {
    if (i === j) return;
    [this.vals[i], this.vals[j]] = [this.vals[j], this.vals[i]];
    [this.ids[i], this.ids[j]] = [this.ids[j], this.ids[i]];
    this.stats.swaps++;
  }

  set(i: number, v: number) {
    this.vals[i] = v;
    this.stats.writes++;
  }

  cmp(times = 1) {
    this.stats.comparisons += times;
  }

  row(states?: CellState[], label?: string): Row {
    return { label, values: [...this.vals], ids: [...this.ids], states: states ? [...states] : undefined };
  }

  snap(): Stats {
    return { ...this.stats };
  }
}

export const paint = (n: number, fn: (i: number) => CellState): CellState[] => Array.from({ length: n }, (_, i) => fn(i));
export const fill = (n: number, s: CellState): CellState[] => Array(n).fill(s);

export class Rec {
  frames: Frame[] = [];
  push(f: Frame) {
    if (this.frames.length < MAX_FRAMES) this.frames.push(f);
  }
  get full() {
    return this.frames.length >= MAX_FRAMES;
  }
  /** Finalise: if the cap was hit, say so on the last frame. */
  done(): Frame[] {
    if (this.full) {
      const last = this.frames[this.frames.length - 1];
      last.note += " (animation shortened — try a smaller input to see every step.)";
    }
    return this.frames;
  }
}

export const fmtArr = (a: ReadonlyArray<number | string>) => `[${a.join(", ")}]`;
export const plain = (row: number[], label?: string, states?: CellState[]): Row => ({ label, values: [...row], states });
