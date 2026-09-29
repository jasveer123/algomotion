import { Rec, fill, fmtArr, paint } from "../trace";
import type { AuxPanel, CellState, Tracer } from "../types";

const setAux = (title: string, values: Iterable<number | string>, hot?: number | string, hotState: CellState = "current"): AuxPanel => ({
  title,
  items: [...values].map((v) => ({ text: String(v), state: v === hot ? hotState : ("pending" as CellState) })),
  empty: "empty",
});

export const zeroSumTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  const seen = new Set<number>([0]);
  const at = new Map<number, number>([[0, -1]]);
  let prefix = 0;
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "init", note: "running (prefix) sums: if the same total shows up twice, everything added in between summed to 0. start the set with 0 (the empty prefix).", vars: { prefix }, aux: [setAux("prefix sums seen", seen)] });
  for (let i = 0; i < n; i++) {
    prefix += arr[i];
    r.push({ rows: [{ values: arr, states: paint(n, (x) => (x === i ? "current" : x < i ? "pending" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "prefix", note: `add ${arr[i]} → running sum = ${prefix}.`, vars: { i, prefix }, aux: [setAux("prefix sums seen", seen, prefix, "comparing")] });
    if (seen.has(prefix)) {
      const from = at.get(prefix)! + 1;
      r.push({ rows: [{ values: arr, states: paint(n, (x) => (x >= from && x <= i ? "confirmed" : "inactive")) }], regions: [{ from, to: i, label: "sums to 0", tone: "confirmed" }], line: "hit", note: `${prefix} was already seen after index ${from - 1}, so arr[${from}..${i}] sums to 0. answer: yes.`, vars: { i, prefix }, aux: [setAux("prefix sums seen", seen, prefix, "confirmed")], result: "yes — zero-sum subarray exists" });
      return r.done();
    }
    seen.add(prefix);
    at.set(prefix, i);
    r.push({ rows: [{ values: arr, states: paint(n, (x) => (x <= i ? "pending" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "store", note: `${prefix} is new — store it.`, vars: { i, prefix }, aux: [setAux("prefix sums seen", seen, prefix)] });
  }
  r.push({ rows: [{ values: arr, states: fill(n, "invalid") }], line: "done", note: "no running sum repeated, so no subarray sums to 0.", aux: [setAux("prefix sums seen", seen)], result: "no zero-sum subarray" });
  return r.done();
};

export const longestConsecTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  const set = new Set(arr);
  const uniq = [...set];
  let best = 0;
  let bestRun: number[] = [];
  const st = (hot: number[], s: CellState): CellState[] => paint(n, (x) => (hot.includes(arr[x]) ? s : "inactive"));
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "init", note: "drop everything into a set for O(1) lookups. a run only needs to be counted from its smallest member — a number x whose x − 1 is missing.", aux: [setAux("set", uniq)] });
  for (const x of uniq) {
    if (set.has(x - 1)) {
      r.push({ rows: [{ values: arr, states: st([x], "invalid") }], line: "skip", note: `${x - 1} is in the set, so ${x} is in the middle of some run. skip — we'll count it from the run's start.`, aux: [setAux("set", uniq, x - 1, "comparing")] });
      continue;
    }
    const run = [x];
    r.push({ rows: [{ values: arr, states: st(run, "current") }], line: "start", note: `${x - 1} is missing, so ${x} starts a run.`, aux: [setAux("set", uniq, x)] });
    while (set.has(x + run.length)) {
      run.push(x + run.length);
      r.push({ rows: [{ values: arr, states: st(run, "pending") }], line: "walk", note: `${run[run.length - 1]} is in the set → run length ${run.length}.`, aux: [setAux("set", uniq, run[run.length - 1], "pending")] });
    }
    if (run.length > best) { best = run.length; bestRun = run; }
    r.push({ rows: [{ values: arr, states: st(bestRun, "confirmed") }], line: "best", note: `${x + run.length} is missing, so this run stops at length ${run.length}. best = ${best}.`, vars: { best }, aux: [setAux("set", uniq)] });
  }
  r.push({ rows: [{ values: arr, states: st(bestRun, "confirmed") }], line: "done", note: `each number was walked at most once across all runs. longest run: ${fmtArr(bestRun)}.`, vars: { best }, result: `length = ${best}` });
  return r.done();
};

export const nByKTracer: Tracer = ({ arr, k = 2 }) => {
  const r = new Rec();
  const n = arr.length;
  const count = new Map<number, number>();
  const aux = (hot?: number, s: CellState = "current", limit?: number): AuxPanel[] => [{
    title: "count map",
    items: [...count.entries()].map(([v, c]) => ({ text: `${v} → ${c}`, state: limit !== undefined ? (c > limit ? "confirmed" : "invalid") : v === hot ? s : "pending" })),
    empty: "empty",
  }];
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "init", note: `count every value once, then keep the ones that appear more than n/k = ${n}/${k} times.`, aux: aux() });
  for (let i = 0; i < n; i++) {
    count.set(arr[i], (count.get(arr[i]) ?? 0) + 1);
    r.push({ rows: [{ values: arr, states: paint(n, (x) => (x === i ? "current" : x < i ? "pending" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "count", note: `${arr[i]} seen ${count.get(arr[i])} time${count.get(arr[i]) === 1 ? "" : "s"}.`, aux: aux(arr[i]) });
  }
  const limit = Math.floor(n / k);
  const out = [...count.entries()].filter(([, c]) => c > limit).map(([v]) => v);
  r.push({ rows: [{ values: arr, states: paint(n, (x) => (out.includes(arr[x]) ? "confirmed" : "inactive")) }], line: "filter", note: `the limit is ⌊${n}/${k}⌋ = ${limit}. values counted more than ${limit} times: ${out.length ? out.join(", ") : "none"}.`, vars: { limit }, aux: aux(undefined, "current", limit), result: out.length ? fmtArr(out) : "none" });
  return r.done();
};

export const subsetTracer: Tracer = ({ arr, arr2 = [] }) => {
  const r = new Rec();
  const freq = new Map<number, number>();
  const aux = (hot?: number, s: CellState = "current"): AuxPanel[] => [{ title: "a1 counts", items: [...freq.entries()].map(([v, c]) => ({ text: `${v} → ${c}`, state: v === hot ? s : c === 0 ? "inactive" : ("pending" as CellState) })), empty: "empty" }];
  const rows = (i: number, j: number, s: CellState = "current") => [
    { label: "a1", values: arr, states: paint(arr.length, (x) => (x === i ? "current" : x < i ? "pending" : "inactive")) },
    { label: "a2", values: arr2, states: paint(arr2.length, (x) => (x === j ? s : x < j ? "confirmed" : "inactive")) },
  ];
  r.push({ rows: rows(-1, -1), line: "init", note: "count how many times each value appears in a1. then every value of a2 must be able to 'spend' one of those counts.", aux: aux() });
  for (let i = 0; i < arr.length; i++) {
    freq.set(arr[i], (freq.get(arr[i]) ?? 0) + 1);
    r.push({ rows: rows(i, -1), pointers: [{ label: "i", index: i, row: 0 }], line: "build", note: `a1 has ${arr[i]} × ${freq.get(arr[i])} so far.`, aux: aux(arr[i]) });
  }
  for (let j = 0; j < arr2.length; j++) {
    const x = arr2[j];
    const c = freq.get(x) ?? 0;
    if (!c) {
      r.push({ rows: rows(arr.length, j, "invalid"), pointers: [{ label: "j", index: j, row: 1 }], line: "missing", note: `${x} isn't available in a1 (count 0) → a2 is not a subset.`, aux: aux(x, "invalid"), result: "not a subset" });
      return r.done();
    }
    freq.set(x, c - 1);
    r.push({ rows: rows(arr.length, j, "confirmed"), pointers: [{ label: "j", index: j, row: 1 }], line: "use", note: `${x} found in a1 → use one copy (${c - 1} left).`, aux: aux(x, "confirmed") });
  }
  r.push({ rows: rows(arr.length, arr2.length), line: "done", note: "every element of a2 was matched in a1.", aux: aux(), result: "a2 is a subset of a1" });
  return r.done();
};
