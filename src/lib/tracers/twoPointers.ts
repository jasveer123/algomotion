import { Rec, Tape, fill, fmtArr, paint } from "../trace";
import type { AuxPanel, CellState, Region, Row, Tracer } from "../types";

const chips = (title: string, list: (number | string)[], state: CellState = "confirmed", empty = "empty"): AuxPanel => ({ title, items: list.map((v) => ({ text: String(v), state })), empty });

export const reverseTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const t = new Tape(arr);
  const n = t.n;
  let l = 0, h = n - 1;
  const st = () => paint(n, (x) => (x < l || x > h ? "confirmed" : x === l || x === h ? "current" : "inactive"));
  r.push({ rows: [t.row(st())], pointers: [{ label: "l", index: l }, { label: "r", index: Math.max(h, 0) }], line: "init", note: "put one pointer at each end. they swap and walk toward the middle.", vars: { l, r: h }, stats: t.snap() });
  while (l < h) {
    const a = t.vals[l], b = t.vals[h];
    t.swap(l, h);
    r.push({ rows: [t.row(paint(n, (x) => (x === l || x === h ? "comparing" : x < l || x > h ? "confirmed" : "inactive")))], pointers: [{ label: "l", index: l }, { label: "r", index: h }], line: "swap", note: `swap ${a} and ${b}. both ends are now final.`, vars: { l, r: h }, stats: t.snap() });
    l++; h--;
    r.push({ rows: [t.row(st())], pointers: [{ label: "l", index: Math.min(l, n - 1) }, { label: "r", index: Math.max(h, 0) }], line: "move", note: l < h ? `move inward: l = ${l}, r = ${h}.` : "the pointers met — nothing left to swap.", vars: { l, r: h }, stats: t.snap() });
  }
  r.push({ rows: [t.row(fill(n, "confirmed"))], line: "done", note: `reversed in ${t.stats.swaps} swaps: ${fmtArr(t.vals)}.`, stats: t.snap(), result: fmtArr(t.vals) });
  return r.done();
};

/** Shared Dutch-national-flag style partition: zone test returns 0 (left), 1 (middle), 2 (right). */
function dnf(arr: number[], zoneOf: (v: number) => 0 | 1 | 2, names: [string, string, string], intro: string, why: [string, string, string]) {
  const r = new Rec();
  const t = new Tape(arr);
  const n = t.n;
  let low = 0, mid = 0, high = n - 1;
  const st = (): CellState[] => paint(n, (x) => (x === mid && mid <= high ? "current" : x < low ? "confirmed" : x < mid ? "pending" : x > high ? "confirmed" : "inactive"));
  const regs = (): Region[] => [
    ...(low > 0 ? [{ from: 0, to: low - 1, label: names[0], tone: "confirmed" as CellState }] : []),
    ...(mid > low ? [{ from: low, to: mid - 1, label: names[1], tone: "pending" as CellState }] : []),
    ...(high < n - 1 ? [{ from: high + 1, to: n - 1, label: names[2], tone: "confirmed" as CellState }] : []),
  ];
  const ptrs = () => [{ label: "low", index: Math.min(low, n - 1) }, { label: "mid", index: Math.min(mid, n - 1) }, { label: "high", index: Math.max(high, 0) }];
  r.push({ rows: [t.row(st())], pointers: ptrs(), regions: regs(), line: "init", note: intro, vars: { low, mid, high }, stats: t.snap() });
  while (mid <= high) {
    const v = t.vals[mid];
    const z = zoneOf(v);
    t.cmp(z === 0 ? 1 : 2);
    if (z === 0) {
      const other = t.vals[low];
      t.swap(low, mid);
      low++; mid++;
      r.push({ rows: [t.row(st())], pointers: ptrs(), regions: regs(), line: "zero", note: `${v} ${why[0]} → swap it with ${other} at low, then move low and mid forward.`, vars: { low, mid, high }, stats: t.snap() });
    } else if (z === 1) {
      mid++;
      r.push({ rows: [t.row(st())], pointers: ptrs(), regions: regs(), line: "one", note: `${v} ${why[1]} → it's already in the right zone. just move mid.`, vars: { low, mid, high }, stats: t.snap() });
    } else {
      const other = t.vals[high];
      t.swap(mid, high);
      high--;
      r.push({ rows: [t.row(st())], pointers: ptrs(), regions: regs(), line: "two", note: `${v} ${why[2]} → swap it with ${other} at high and shrink high. mid stays, because ${other} hasn't been checked yet.`, vars: { low, mid, high }, stats: t.snap() });
    }
  }
  r.push({ rows: [t.row(fill(n, "confirmed"))], regions: regs(), line: "done", note: `mid passed high — every element is in its zone after one pass: ${fmtArr(t.vals)}.`, stats: t.snap(), result: fmtArr(t.vals) });
  return r.done();
}

export const dnf012Tracer: Tracer = ({ arr }) =>
  dnf(arr, (v) => (v === 0 ? 0 : v === 1 ? 1 : 2), ["0s", "1s", "2s"], "three pointers: [0, low) holds 0s, [low, mid) holds 1s, (high, end] holds 2s. mid scans the unknown middle.", ["is a 0", "is a 1", "is a 2"]);

export const threeWayTracer: Tracer = ({ arr, target = 0, k = 0 }) =>
  dnf(arr, (v) => (v < target ? 0 : v <= k ? 1 : 2), [`< ${target}`, `${target}..${k}`, `> ${k}`], `partition around the range [${target}, ${k}]: smaller values go left, bigger go right, in-range values stay in the middle.`, [`is smaller than ${target}`, `is inside [${target}, ${k}]`, `is bigger than ${k}`]);

export const alternatingTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const t = new Tape(arr);
  const n = t.n;
  let wrong = -1;
  const wants = (i: number) => (i % 2 === 0 ? "negative" : "non-negative");
  const st = (i: number): CellState[] => paint(n, (x) => (x === wrong ? "invalid" : x === i ? "current" : x < i ? "confirmed" : "inactive"));
  r.push({ rows: [t.row(fill(n, "inactive"))], line: "init", note: "goal: negative at even indexes, non-negative at odd ones, keeping the original order. we remember the first out-of-place index and fix it by rotating.", vars: { wrong }, stats: t.snap() });
  for (let i = 0; i < n; i++) {
    if (wrong >= 0 && (t.vals[i] < 0) !== (t.vals[wrong] < 0)) {
      r.push({ rows: [t.row(st(i))], pointers: [{ label: "wrong", index: wrong }, { label: "i", index: i }], regions: [{ from: wrong, to: i, label: "rotate", tone: "comparing" }], line: "found", note: `${t.vals[i]} has the opposite sign to the misplaced ${t.vals[wrong]} — it's the one index ${wrong} needs.`, vars: { i, wrong }, stats: t.snap() });
      for (let k = i; k > wrong; k--) t.swap(k, k - 1);
      const w = wrong;
      wrong = i - wrong >= 2 ? wrong + 2 : -1;
      r.push({ rows: [t.row(paint(n, (x) => (x === wrong ? "invalid" : x >= w && x <= i ? "comparing" : x < i ? "confirmed" : "inactive")))], pointers: wrong >= 0 ? [{ label: "wrong", index: wrong }, { label: "i", index: i }] : [{ label: "i", index: i }], regions: [{ from: w, to: i, label: "rotated right", tone: "comparing" }], line: "rotate", note: `rotate [${w}..${i}] right by one: ${t.vals[w]} drops into index ${w}, the rest slide right keeping their order. ${wrong >= 0 ? `index ${wrong} is now the first misplaced one.` : "nothing is misplaced now."}`, vars: { i, wrong }, stats: t.snap() });
    }
    if (wrong === -1) {
      const bad = (t.vals[i] >= 0) === (i % 2 === 0);
      if (bad) wrong = i;
      r.push({ rows: [t.row(st(i))], pointers: [{ label: "i", index: i }], line: "mark", note: bad ? `index ${i} wants a ${wants(i)} number but holds ${t.vals[i]} → remember it as out of place.` : `index ${i} wants a ${wants(i)} number and has ${t.vals[i]} ✓.`, vars: { i, wrong }, stats: t.snap() });
    }
  }
  r.push({ rows: [t.row(fill(n, "confirmed"))], line: "done", note: `done with O(1) extra space: ${fmtArr(t.vals)}. leftovers of one sign stay at the end in order.`, stats: t.snap(), result: fmtArr(t.vals) });
  return r.done();
};

export const mergeGapTracer: Tracer = ({ arr, arr2 = [] }) => {
  const r = new Rec();
  const a = [...arr], b = [...arr2];
  const n = a.length, m = b.length;
  const total = n + m;
  const get = (i: number) => (i < n ? a[i] : b[i - n]);
  const put = (i: number, v: number) => { if (i < n) a[i] = v; else b[i - n] = v; };
  const rows = (i: number, j: number, hit: boolean, s: CellState = "comparing"): Row[] => [
    { label: "a", values: [...a], states: paint(n, (x) => (x === i || x === j ? (hit ? "current" : s) : "inactive")) },
    { label: "b", values: [...b], states: paint(m, (x) => (x + n === i || x + n === j ? (hit ? "current" : s) : "inactive")) },
  ];
  const ptr = (label: string, g: number) => (g < n ? { label, index: g, row: 0 } : { label, index: g - n, row: 1 });
  let gap = Math.ceil(total / 2);
  let swaps = 0, comps = 0;
  r.push({ rows: rows(-1, -1, false), line: "init", note: `think of a and b as one list of ${total} slots. compare elements that are gap = ${gap} apart and swap if they're out of order, then halve the gap.`, vars: { gap } });
  while (gap > 0) {
    r.push({ rows: rows(-1, -1, false), line: "gap", note: `new pass with gap = ${gap}.`, vars: { gap }, stats: { comparisons: comps, swaps, writes: 0 } });
    for (let i = 0; i + gap < total; i++) {
      const j = i + gap;
      comps++;
      const out = get(i) > get(j);
      if (out) {
        const tmp = get(i);
        put(i, get(j)); put(j, tmp);
        swaps++;
      }
      r.push({ rows: rows(i, j, out), pointers: [ptr("i", i), ptr("j", j)], line: out ? "swap" : "compare", note: out ? `${get(j)} > ${get(i)} were out of order → swapped.` : `${get(i)} ≤ ${get(j)} — already in order.`, vars: { gap, i, j }, stats: { comparisons: comps, swaps, writes: 0 } });
    }
    gap = gap === 1 ? 0 : Math.ceil(gap / 2);
    r.push({ rows: rows(-1, -1, false), line: "shrink", note: gap ? `pass done. shrink the gap to ${gap}.` : "the gap-1 pass is finished, so both arrays are sorted.", vars: { gap }, stats: { comparisons: comps, swaps, writes: 0 } });
  }
  r.push({ rows: [{ label: "a", values: a, states: fill(n, "confirmed") }, { label: "b", values: b, states: fill(m, "confirmed") }], line: "done", note: `merged in place with ${swaps} swaps: a = ${fmtArr(a)}, b = ${fmtArr(b)}.`, stats: { comparisons: comps, swaps, writes: 0 }, result: `${fmtArr(a)} ${fmtArr(b)}` });
  return r.done();
};

export const rotateOneTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const t = new Tape(arr);
  const n = t.n;
  const last = t.vals[n - 1];
  r.push({ rows: [t.row(paint(n, (x) => (x === n - 1 ? "pending" : "inactive")))], line: "save", note: `save the last element (${last}) — it's the one that wraps around to the front.`, aux: [chips("saved", [last], "pending")], stats: t.snap() });
  for (let i = n - 1; i > 0; i--) {
    t.swap(i, i - 1);
    r.push({ rows: [t.row(paint(n, (x) => (x === i ? "confirmed" : x === i - 1 ? "pending" : x > i ? "confirmed" : "inactive")))], pointers: [{ label: "i", index: i }], line: "shift", note: `${t.vals[i]} shifts one step right into index ${i}.`, aux: [chips("saved", [last], "pending")], stats: t.snap() });
  }
  r.push({ rows: [t.row(fill(n, "confirmed"))], line: "place", note: `drop the saved ${last} into index 0: ${fmtArr(t.vals)}.`, stats: t.snap(), result: fmtArr(t.vals) });
  return r.done();
};

export const palindromeOpsTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const a = [...arr];
  const n = a.length;
  const gone = new Set<number>();
  let i = 0, j = n - 1, ops = 0;
  const st = (hot: CellState = "comparing"): CellState[] => paint(n, (x) => (gone.has(x) ? "invalid" : x === i || x === j ? hot : x < i || x > j ? "confirmed" : "inactive"));
  r.push({ rows: [{ values: [...a], states: st() }], pointers: [{ label: "i", index: 0 }, { label: "j", index: n - 1 }], line: "init", note: "compare the two ends. if they differ, merge the smaller end into its neighbour (one operation) and compare again.", vars: { ops } });
  while (i < j) {
    if (a[i] === a[j]) {
      r.push({ rows: [{ values: [...a], states: st("confirmed") }], pointers: [{ label: "i", index: i }, { label: "j", index: j }], line: "equal", note: `${a[i]} = ${a[j]} — the ends match. move both inward.`, vars: { i, j, ops } });
      i++; j--;
    } else if (a[i] < a[j]) {
      a[i + 1] += a[i]; gone.add(i); const was = a[i]; a[i] = NaN; i++; ops++;
      r.push({ rows: [{ values: a.map((v) => (Number.isNaN(v) ? "·" : v)), states: st("current") }], pointers: [{ label: "i", index: i }, { label: "j", index: j }], line: "mergeLeft", note: `left ${was} < right ${a[j]} → merge it into its neighbour, which becomes ${a[i]}. ops = ${ops}.`, vars: { i, j, ops } });
    } else {
      a[j - 1] += a[j]; gone.add(j); const was = a[j]; a[j] = NaN; j--; ops++;
      r.push({ rows: [{ values: a.map((v) => (Number.isNaN(v) ? "·" : v)), states: st("current") }], pointers: [{ label: "i", index: i }, { label: "j", index: j }], line: "mergeRight", note: `right ${was} < left ${a[i]} → merge it into its neighbour, which becomes ${a[j]}. ops = ${ops}.`, vars: { i, j, ops } });
    }
  }
  r.push({ rows: [{ values: a.map((v) => (Number.isNaN(v) ? "·" : v)), states: paint(n, (x) => (gone.has(x) ? "invalid" : "confirmed")) }], line: "done", note: `the pointers met. the array reads the same both ways after ${ops} merge${ops === 1 ? "" : "s"}.`, vars: { ops }, result: `operations = ${ops}` });
  return r.done();
};

export const trappingTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  const water: (number | null)[] = Array(n).fill(null);
  let l = 0, h = n - 1, lmax = 0, rmax = 0, total = 0;
  const rows = (hot: number): Row[] => [
    { label: "height", values: arr, states: paint(n, (x) => (x === hot ? "current" : x === l || x === h ? "comparing" : water[x] !== null ? "confirmed" : "inactive")) },
    { label: "water above", values: [...water], states: paint(n, (x) => (water[x] === null ? "inactive" : water[x]! > 0 ? "pending" : "default")) },
  ];
  r.push({ rows: rows(-1), pointers: [{ label: "l", index: l }, { label: "r", index: h }], line: "init", note: "water above a bar = min(tallest on its left, tallest on its right) − its height. two pointers let us always process the side whose limit we already know.", vars: { leftMax: lmax, rightMax: rmax, water: total } });
  while (l < h) {
    if (arr[l] < arr[h]) {
      lmax = Math.max(lmax, arr[l]);
      water[l] = lmax - arr[l];
      total += water[l]!;
      r.push({ rows: rows(l), pointers: [{ label: "l", index: l }, { label: "r", index: h }], line: "left", note: `left bar ${arr[l]} is shorter than right bar ${arr[h]}, so the right side is tall enough. water here = leftMax ${lmax} − ${arr[l]} = ${water[l]}.`, vars: { leftMax: lmax, rightMax: rmax, water: total } });
      l++;
    } else {
      rmax = Math.max(rmax, arr[h]);
      water[h] = rmax - arr[h];
      total += water[h]!;
      r.push({ rows: rows(h), pointers: [{ label: "l", index: l }, { label: "r", index: h }], line: "right", note: `right bar ${arr[h]} ≤ left bar ${arr[l]}, so the left side is tall enough. water here = rightMax ${rmax} − ${arr[h]} = ${water[h]}.`, vars: { leftMax: lmax, rightMax: rmax, water: total } });
      h--;
    }
  }
  if (water[l] === null) water[l] = 0;
  r.push({ rows: rows(-1), line: "done", note: `pointers met. total trapped water = ${total} units.`, vars: { water: total }, result: `water = ${total}` });
  return r.done();
};

export const floydTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  let slow = arr[0], fast = arr[0];
  const st = (a: number, b: number, s: CellState = "current"): CellState[] => paint(n, (x) => (x === a && x === b ? "confirmed" : x === a ? s : x === b ? "comparing" : "inactive"));
  r.push({ rows: [{ values: arr, states: st(0, 0) }], pointers: [{ label: "slow", index: slow }, { label: "fast", index: fast }], line: "init", note: "treat each value as a pointer to an index: i → arr[i]. a duplicate value means two arrows point at the same index, so the path must loop. both walkers start at arr[0].", vars: { slow, fast } });
  let guard = 0;
  do {
    slow = arr[slow];
    fast = arr[arr[fast]];
    r.push({ rows: [{ values: arr, states: st(slow, fast) }], pointers: [{ label: "slow", index: slow }, { label: "fast", index: fast }], line: "phase1", note: `slow takes 1 hop → index ${slow}; fast takes 2 hops → index ${fast}.`, vars: { slow, fast } });
  } while (slow !== fast && ++guard < 4 * n);
  r.push({ rows: [{ values: arr, states: st(slow, fast) }], pointers: [{ label: "slow", index: slow }, { label: "fast", index: fast }], line: "meet", note: `they met at index ${slow} — we're inside the loop. now find where the loop starts.`, vars: { slow, fast } });
  slow = arr[0];
  r.push({ rows: [{ values: arr, states: st(slow, fast) }], pointers: [{ label: "slow", index: slow }, { label: "fast", index: fast }], line: "reset", note: "move slow back to the start. now both walk one hop at a time.", vars: { slow, fast } });
  guard = 0;
  while (slow !== fast && ++guard < 4 * n) {
    slow = arr[slow];
    fast = arr[fast];
    r.push({ rows: [{ values: arr, states: st(slow, fast) }], pointers: [{ label: "slow", index: slow }, { label: "fast", index: fast }], line: "phase2", note: slow === fast ? `both reach index ${slow} together.` : `slow → ${slow}, fast → ${fast}.`, vars: { slow, fast } });
  }
  r.push({ rows: [{ values: arr, states: paint(n, (x) => (arr[x] === slow ? "confirmed" : "inactive")) }], line: "done", note: `the loop starts at index ${slow}, so ${slow} is the value two cells point to — the duplicate. no extra memory, array untouched.`, result: `duplicate = ${slow}` });
  return r.done();
};

export const unionInterTracer: Tracer = ({ arr, arr2 = [] }) => {
  const r = new Rec();
  const a = arr, b = arr2;
  const U: number[] = [], I: number[] = [];
  const add = (list: number[], x: number) => { if (list[list.length - 1] !== x) list.push(x); };
  let i = 0, j = 0;
  const rows = (hot: CellState = "comparing"): Row[] => [
    { label: "a", values: a, states: paint(a.length, (x) => (x < i ? "confirmed" : x === i ? hot : "inactive")) },
    { label: "b", values: b, states: paint(b.length, (x) => (x < j ? "confirmed" : x === j ? hot : "inactive")) },
  ];
  const ptr = () => [{ label: "i", index: Math.min(i, a.length - 1), row: 0 }, { label: "j", index: Math.min(j, b.length - 1), row: 1 }];
  const aux = () => [chips("union", U), chips("intersection", I, "pending")];
  r.push({ rows: rows(), pointers: ptr(), line: "init", note: "both arrays are sorted, so walk them together like a merge. the smaller value goes to the union; equal values go to both lists.", aux: aux() });
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) { const v = a[i]; add(U, v); r.push({ rows: rows(), pointers: ptr(), line: "less", note: `${v} < ${b[j]} → ${v} can't be in b. add it to the union, move i.`, aux: aux() }); i++; }
    else if (a[i] > b[j]) { const v = b[j]; add(U, v); r.push({ rows: rows(), pointers: ptr(), line: "more", note: `${v} < ${a[i]} → ${v} can't be in a. add it to the union, move j.`, aux: aux() }); j++; }
    else { const v = a[i]; add(U, v); add(I, v); r.push({ rows: rows("confirmed"), pointers: ptr(), line: "equal", note: `${v} is in both → add to union and intersection, move both.`, aux: aux() }); i++; j++; }
  }
  while (i < a.length) { add(U, a[i]); i++; }
  while (j < b.length) { add(U, b[j]); j++; }
  r.push({ rows: rows(), line: "rest", note: "one array ran out. whatever is left in the other can only go to the union.", aux: aux(), result: `union ${fmtArr(U)} · intersection ${fmtArr(I)}` });
  return r.done();
};

export const common3Tracer: Tracer = ({ arr, arr2 = [], arr3 = [] }) => {
  const r = new Rec();
  const A = [arr, arr2, arr3];
  const p = [0, 0, 0];
  const out: number[] = [];
  const rows = (hot: CellState = "comparing"): Row[] => A.map((a, ri) => ({ label: ["a", "b", "c"][ri], values: a, states: paint(a.length, (x) => (x < p[ri] ? "invalid" : x === p[ri] ? hot : "inactive")) }));
  const ptr = () => ["i", "j", "k"].map((label, ri) => ({ label, index: Math.min(p[ri], A[ri].length - 1), row: ri }));
  r.push({ rows: rows(), pointers: ptr(), line: "init", note: "three sorted arrays, three pointers. if all three values match, record it. otherwise the smallest value can never match — advance its pointer.", aux: [chips("common", out)] });
  while (p[0] < A[0].length && p[1] < A[1].length && p[2] < A[2].length) {
    const [x, y, z] = [A[0][p[0]], A[1][p[1]], A[2][p[2]]];
    if (x === y && y === z) {
      if (out[out.length - 1] !== x) out.push(x);
      r.push({ rows: rows("confirmed"), pointers: ptr(), line: "match", note: `${x} = ${y} = ${z} → it's common. record it and move all three.`, aux: [chips("common", out)] });
      p[0]++; p[1]++; p[2]++;
    } else {
      const which = x < y ? 0 : y < z ? 1 : 2;
      r.push({ rows: rows(), pointers: ptr(), line: "advance", note: `${x}, ${y}, ${z} don't all match. ${A[which][p[which]]} in ${["a", "b", "c"][which]} is too small to ever match → advance it.`, aux: [chips("common", out)] });
      p[which]++;
    }
  }
  r.push({ rows: rows(), line: "done", note: "one array is exhausted — nothing else can be common.", aux: [chips("common", out)], result: out.length ? fmtArr(out) : "no common elements" });
  return r.done();
};

export const tripletTracer: Tracer = ({ arr, target = 0 }) => {
  const r = new Rec();
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  r.push({ rows: [{ label: "sorted", values: s, states: fill(n, "inactive") }], line: "sort", note: `sort first: ${fmtArr(s)}. then fix one number and find the other two with two pointers.`, vars: { x: target } });
  for (let i = 0; i < n - 2; i++) {
    let l = i + 1, h = n - 1;
    r.push({ rows: [{ label: "sorted", values: s, states: paint(n, (x) => (x === i ? "current" : x < i ? "invalid" : "inactive")) }], pointers: [{ label: "i", index: i }, { label: "l", index: l }, { label: "r", index: h }], line: "fix", note: `fix ${s[i]}. now we need two numbers after it that add to ${target - s[i]}.`, vars: { i, x: target } });
    while (l < h) {
      const sum = s[i] + s[l] + s[h];
      const st = paint(n, (x) => (x === i ? "current" : x === l || x === h ? (sum === target ? "confirmed" : "comparing") : x < i ? "invalid" : "inactive"));
      if (sum === target) {
        r.push({ rows: [{ label: "sorted", values: s, states: st }], pointers: [{ label: "i", index: i }, { label: "l", index: l }, { label: "r", index: h }], line: "found", note: `${s[i]} + ${s[l]} + ${s[h]} = ${target} ✓ found a triplet!`, vars: { i, l, r: h, sum }, result: `${s[i]} + ${s[l]} + ${s[h]} = ${target}` });
        return r.done();
      }
      r.push({ rows: [{ label: "sorted", values: s, states: st }], pointers: [{ label: "i", index: i }, { label: "l", index: l }, { label: "r", index: h }], line: sum < target ? "less" : "more", note: `${s[i]} + ${s[l]} + ${s[h]} = ${sum}, ${sum < target ? `too small → move l right.` : `too big → move r left.`}`, vars: { i, l, r: h, sum } });
      if (sum < target) l++; else h--;
    }
  }
  r.push({ rows: [{ label: "sorted", values: s, states: fill(n, "invalid") }], line: "done", note: `every fixed number was tried — no three values sum to ${target}.`, result: "no triplet" });
  return r.done();
};
