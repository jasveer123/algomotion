import { Rec, Tape, fill, fmtArr, paint } from "../trace";
import type { CellState, Region, Row, Tracer } from "../types";

export const maxMinTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  let comps = 0;
  let mn: number, mx: number, i: number, mnAt: number, mxAt: number;
  const st = (a: number, b: number): CellState[] => paint(n, (x) => (x === mnAt || x === mxAt ? "confirmed" : x === a || x === b ? "comparing" : x < Math.max(a, b) ? "invalid" : "inactive"));
  if (n % 2 === 0) {
    comps++;
    if (arr[0] < arr[1]) { mn = arr[0]; mx = arr[1]; mnAt = 0; mxAt = 1; } else { mn = arr[1]; mx = arr[0]; mnAt = 1; mxAt = 0; }
    i = 2;
    r.push({ rows: [{ values: arr, states: st(0, 1) }], line: "init", note: `even length: compare the first two (${arr[0]} vs ${arr[1]}) to seed min = ${mn}, max = ${mx}.`, vars: { min: mn, max: mx }, stats: { comparisons: comps, swaps: 0, writes: 0 } });
  } else {
    mn = mx = arr[0]; mnAt = mxAt = 0; i = 1;
    r.push({ rows: [{ values: arr, states: st(0, 0) }], line: "init", note: `odd length: the first element (${arr[0]}) seeds both min and max.`, vars: { min: mn, max: mx }, stats: { comparisons: comps, swaps: 0, writes: 0 } });
  }
  for (; i + 1 < n; i += 2) {
    comps++;
    const [sAt, bAt] = arr[i] < arr[i + 1] ? [i, i + 1] : [i + 1, i];
    r.push({ rows: [{ values: arr, states: st(i, i + 1) }], pointers: [{ label: "i", index: i }], line: "pair", note: `compare the pair ${arr[i]} and ${arr[i + 1]} with each other first: ${arr[sAt]} is the smaller one.`, vars: { min: mn, max: mx }, stats: { comparisons: comps, swaps: 0, writes: 0 } });
    comps += 2;
    const nm = arr[sAt] < mn, nx = arr[bAt] > mx;
    if (nm) { mn = arr[sAt]; mnAt = sAt; }
    if (nx) { mx = arr[bAt]; mxAt = bAt; }
    r.push({ rows: [{ values: arr, states: st(-1, -1) }], pointers: [{ label: "i", index: i }], line: "update", note: `only the smaller one can be a new min (${nm ? `yes → ${mn}` : "no"}), only the bigger one can be a new max (${nx ? `yes → ${mx}` : "no"}). 3 comparisons for 2 elements.`, vars: { min: mn, max: mx }, stats: { comparisons: comps, swaps: 0, writes: 0 } });
  }
  r.push({ rows: [{ values: arr, states: paint(n, (x) => (x === mnAt || x === mxAt ? "confirmed" : "inactive")) }], line: "done", note: `min = ${mn}, max = ${mx}, using ${comps} comparisons (a naive scan uses ${2 * (n - 1)}).`, vars: { min: mn, max: mx }, stats: { comparisons: comps, swaps: 0, writes: 0 }, result: `min ${mn} · max ${mx}` });
  return r.done();
};

export const quickselectTracer: Tracer = ({ arr, k = 1 }) => {
  const r = new Rec();
  const t = new Tape(arr);
  const n = t.n;
  const fixed = new Map<number, string>();
  const select = (want: number, label: string) => {
    let lo = 0, hi = n - 1;
    r.push({ rows: [t.row(fill(n, "inactive"))], line: "init", note: `find the ${label}: that's the value that would sit at index ${want} if the array were sorted. partition, then keep only the side that contains index ${want}.`, vars: { lo, hi, target: want }, stats: t.snap() });
    while (lo <= hi) {
      const pivot = t.vals[hi];
      let i = lo;
      const base = (hot: number[], s: CellState): CellState[] => paint(n, (x) => (x < lo || x > hi ? "invalid" : x === hi ? "current" : hot.includes(x) ? s : x < i ? "pending" : "inactive"));
      r.push({ rows: [t.row(base([], "comparing"))], pointers: [{ label: "lo", index: lo }, { label: "hi", index: hi }], regions: [{ from: lo, to: hi, label: "search range", tone: "comparing" }], line: "pivot", note: `pivot = ${pivot} (the last element of the range). smaller values will move to its left.`, vars: { lo, hi, pivot }, stats: t.snap() });
      for (let j = lo; j < hi; j++) {
        t.cmp();
        if (t.vals[j] < pivot) {
          t.swap(i, j);
          i++;
          r.push({ rows: [t.row(base([j], "comparing"))], pointers: [{ label: "i", index: i }, { label: "j", index: j }], line: "swap", note: `${t.vals[i - 1]} < ${pivot} → move it into the "smaller" zone.`, vars: { lo, hi, pivot }, stats: t.snap() });
        } else {
          r.push({ rows: [t.row(base([j], "comparing"))], pointers: [{ label: "i", index: i }, { label: "j", index: j }], line: "scan", note: `${t.vals[j]} ≥ ${pivot} → leave it.`, vars: { lo, hi, pivot }, stats: t.snap() });
        }
      }
      t.swap(i, hi);
      r.push({ rows: [t.row(paint(n, (x) => (x === i ? "confirmed" : x < lo || x > hi ? "invalid" : x < i ? "pending" : "inactive")))], pointers: [{ label: "p", index: i }], line: "place", note: `pivot ${pivot} lands at index ${i} — its final sorted position.`, vars: { lo, hi, p: i }, stats: t.snap() });
      if (i === want) { fixed.set(i, label); return t.vals[i]; }
      if (i < want) lo = i + 1; else hi = i - 1;
      r.push({ rows: [t.row(paint(n, (x) => (x < lo || x > hi ? "invalid" : "inactive")))], pointers: [{ label: "lo", index: Math.min(lo, n - 1) }, { label: "hi", index: Math.max(hi, 0) }], line: "narrow", note: `index ${want} is to the ${i < want ? "right" : "left"} of ${i}, so throw away the other side.`, vars: { lo, hi }, stats: t.snap() });
    }
    return t.vals[want];
  };
  const small = select(k - 1, `${k}${ord(k)} smallest`);
  r.push({ rows: [t.row(paint(n, (x) => (x === k - 1 ? "confirmed" : "inactive")))], line: "found", note: `${k}${ord(k)} smallest = ${small}.`, stats: t.snap() });
  const large = select(n - k, `${k}${ord(k)} largest`);
  r.push({ rows: [t.row(paint(n, (x) => (x === k - 1 || x === n - k ? "confirmed" : "inactive")))], line: "found", note: `${k}${ord(k)} largest = ${large}. average work is about 2n comparisons per search — no full sort needed.`, stats: t.snap(), result: `kth min ${small} · kth max ${large}` });
  return r.done();
};
const ord = (k: number) => (k % 100 >= 11 && k % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][k % 10] ?? "th");

export const inversionsTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const a = [...arr];
  const n = a.length;
  let count = 0;
  const sortRange = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sortRange(lo, mid);
    sortRange(mid + 1, hi);
    const merged: number[] = [];
    let i = lo, j = mid + 1;
    const regs = (): Region[] => [{ from: lo, to: mid, label: "left", tone: "pending" }, { from: mid + 1, to: hi, label: "right", tone: "comparing" }];
    const rows = (hot: number[], s: CellState): Row[] => [
      { label: "array", values: [...a], states: paint(n, (x) => (hot.includes(x) ? s : x >= lo && x <= hi ? (x < i && x <= mid) || (x < j && x > mid) ? "invalid" : "default" : "inactive")) },
      { label: "merged", values: [...merged, ...Array(hi - lo + 1 - merged.length).fill(null)], states: paint(hi - lo + 1, (x) => (x < merged.length ? "confirmed" : "inactive")) },
    ];
    r.push({ rows: rows([], "default"), regions: regs(), line: "split", note: `merge the sorted halves [${a.slice(lo, mid + 1).join(", ")}] and [${a.slice(mid + 1, hi + 1).join(", ")}].`, vars: { inversions: count } });
    while (i <= mid && j <= hi) {
      if (a[i] <= a[j]) {
        merged.push(a[i]);
        r.push({ rows: rows([i, j], "comparing"), regions: regs(), line: "takeLeft", note: `${a[i]} ≤ ${a[j]} → take ${a[i]} from the left. no inversion.`, vars: { inversions: count } });
        i++;
      } else {
        const add = mid - i + 1;
        count += add;
        merged.push(a[j]);
        r.push({ rows: rows([j], "current"), regions: regs(), line: "takeRight", note: `${a[j]} < ${a[i]} → take ${a[j]} from the right. it was smaller than all ${add} remaining left value${add === 1 ? "" : "s"}, so that's ${add} inversion${add === 1 ? "" : "s"} at once. total = ${count}.`, vars: { inversions: count } });
        j++;
      }
    }
    while (i <= mid) merged.push(a[i++]);
    while (j <= hi) merged.push(a[j++]);
    for (let t = 0; t < merged.length; t++) a[lo + t] = merged[t];
    r.push({ rows: [{ label: "array", values: [...a], states: paint(n, (x) => (x >= lo && x <= hi ? "confirmed" : "inactive")) }], regions: [{ from: lo, to: hi, label: "sorted", tone: "confirmed" }], line: "copy", note: `copy the merged run back: [${merged.join(", ")}].`, vars: { inversions: count } });
  };
  r.push({ rows: [{ label: "array", values: [...a], states: fill(n, "inactive") }], line: "base", note: "an inversion is a pair i < j with arr[i] > arr[j]. merge sort counts them in bulk while merging.", vars: { inversions: 0 } });
  sortRange(0, n - 1);
  r.push({ rows: [{ label: "array", values: [...a], states: fill(n, "confirmed") }], line: "done", note: `sorted, and we counted ${count} inversion${count === 1 ? "" : "s"} along the way in O(n log n).`, vars: { inversions: count }, result: `inversions = ${count}` });
  return r.done();
};

export const medianTracer: Tracer = ({ arr, arr2 = [] }) => {
  const r = new Rec();
  let a = arr, b = arr2, swapped = false;
  if (a.length > b.length) { [a, b] = [b, a]; swapped = true; }
  const n = a.length, m = b.length, half = (n + m + 1) >> 1;
  let lo = 0, hi = n;
  const rows = (i: number, j: number, ok?: boolean): Row[] => [
    { label: swapped ? "shorter (b)" : "shorter (a)", values: a, states: paint(n, (x) => (x === i - 1 || x === i ? (ok ? "confirmed" : "comparing") : x < i ? "pending" : "inactive")) },
    { label: swapped ? "longer (a)" : "longer (b)", values: b, states: paint(m, (x) => (x === j - 1 || x === j ? (ok ? "confirmed" : "comparing") : x < j ? "pending" : "inactive")) },
  ];
  const regs = (i: number, j: number): Region[] => [
    ...(i > 0 ? [{ row: 0, from: 0, to: i - 1, label: "left part", tone: "pending" as CellState }] : []),
    ...(j > 0 ? [{ row: 1, from: 0, to: j - 1, label: "left part", tone: "pending" as CellState }] : []),
  ];
  r.push({ rows: rows(-1, -1), line: "init", note: `cut both arrays so the left parts hold ${half} of the ${n + m} numbers together. binary-search the cut in the shorter array; the other cut follows.`, vars: { lo, hi, half } });
  const fmt = (v: number) => (v === Infinity ? "+∞" : v === -Infinity ? "−∞" : String(v));
  let guard = 0;
  while (lo <= hi && guard++ < 64) {
    const i = (lo + hi) >> 1, j = half - i;
    const aL = i > 0 ? a[i - 1] : -Infinity, aR = i < n ? a[i] : Infinity;
    const bL = j > 0 ? b[j - 1] : -Infinity, bR = j < m ? b[j] : Infinity;
    r.push({ rows: rows(i, j), regions: regs(i, j), line: "cut", note: `try taking ${i} from the shorter and ${j} from the longer array. borders: ${fmt(aL)} | ${fmt(aR)} and ${fmt(bL)} | ${fmt(bR)}.`, vars: { lo, hi, i, j } });
    if (aL <= bR && bL <= aR) {
      const left = Math.max(aL, bL);
      const med = (n + m) % 2 ? left : (left + Math.min(aR, bR)) / 2;
      r.push({ rows: rows(i, j, true), regions: regs(i, j), line: "found", note: `${fmt(aL)} ≤ ${fmt(bR)} and ${fmt(bL)} ≤ ${fmt(aR)}: every left value ≤ every right value. ${(n + m) % 2 ? `odd total → median = max of the left = ${med}.` : `even total → median = (${left} + ${Math.min(aR, bR)}) / 2 = ${med}.`}`, vars: { i, j, median: med }, result: `median = ${med}` });
      return r.done();
    }
    if (aL > bR) { hi = i - 1; r.push({ rows: rows(i, j), regions: regs(i, j), line: "move", note: `${fmt(aL)} > ${fmt(bR)}: we took too many from the shorter array → move its cut left.`, vars: { lo, hi } }); }
    else { lo = i + 1; r.push({ rows: rows(i, j), regions: regs(i, j), line: "move", note: `${fmt(bL)} > ${fmt(aR)}: we took too few from the shorter array → move its cut right.`, vars: { lo, hi } }); }
  }
  return r.done();
};

export const chocolateTracer: Tracer = ({ arr, k = 1 }) => {
  const r = new Rec();
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length, m = k;
  let best = Infinity, at = 0;
  r.push({ rows: [{ label: "packets (sorted)", values: s, states: fill(n, "inactive") }], line: "sort", note: `sort the packets: ${fmtArr(s)}. the fairest ${m} packets are always next to each other in sorted order.`, vars: { m } });
  for (let i = 0; i + m - 1 < n; i++) {
    const diff = s[i + m - 1] - s[i];
    const improved = diff < best;
    if (improved) { best = diff; at = i; }
    r.push({ rows: [{ label: "packets (sorted)", values: s, states: paint(n, (x) => (x === i || x === i + m - 1 ? (improved ? "confirmed" : "comparing") : x > i && x < i + m - 1 ? "pending" : "inactive")) }], regions: [{ from: i, to: i + m - 1, label: `gap ${diff}`, tone: improved ? "confirmed" : "comparing" }], line: "window", note: `packets ${i}..${i + m - 1}: biggest − smallest = ${s[i + m - 1]} − ${s[i]} = ${diff}.${improved ? " new best!" : ""}`, vars: { i, diff, best } });
  }
  r.push({ rows: [{ label: "packets (sorted)", values: s, states: paint(n, (x) => (x >= at && x < at + m ? "confirmed" : "inactive")) }], regions: [{ from: at, to: at + m - 1, label: "give these out", tone: "confirmed" }], line: "done", note: `hand out packets ${fmtArr(s.slice(at, at + m))}: the difference between the most and least chocolates is ${best}.`, vars: { best }, result: `min difference = ${best}` });
  return r.done();
};
