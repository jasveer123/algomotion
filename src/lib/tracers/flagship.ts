import { Rec, Tape, fill, fmtArr, paint } from "../trace";
import type { CellState, Frame, Tracer } from "../types";

/* ============================ Kadane's algorithm ============================ */

export const kadaneBrute: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  let best = -Infinity;
  let bestRange: [number, number] | null = null;
  let adds = 0;
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "init", note: "brute force: try every possible start i and end j, and add the numbers up from scratch each time.", vars: { best: "−∞" } });
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sum = 0;
      for (let k = i; k <= j; k++) { sum += arr[k]; adds++; }
      const improved = sum > best;
      if (improved) { best = sum; bestRange = [i, j]; }
      r.push({
        rows: [{ values: arr, states: paint(n, (x) => (x >= i && x <= j ? "comparing" : bestRange && x >= bestRange[0] && x <= bestRange[1] ? "confirmed" : "inactive")) }],
        pointers: [{ label: "i", index: i }, { label: "j", index: j }],
        regions: [{ from: i, to: j, label: `sum ${sum}`, tone: "comparing" }],
        line: improved ? "best" : "sum",
        note: `subarray ${i}..${j}: we re-add ${j - i + 1} number${j === i ? "" : "s"} to get ${sum}.${improved ? ` that beats the old best, so best = ${sum}.` : ` not better than best (${best}).`}`,
        vars: { i, j, sum, best, "additions so far": adds },
      });
    }
  }
  r.push({ rows: [{ values: arr, states: paint(n, (x) => (bestRange && x >= bestRange[0] && x <= bestRange[1] ? "confirmed" : "inactive")) }], regions: bestRange ? [{ from: bestRange[0], to: bestRange[1], label: "best", tone: "confirmed" }] : [], line: "done", note: `done. we checked every subarray and did ${adds} additions in total. the largest sum is ${best}.`, vars: { best, additions: adds }, result: `max sum = ${best}` });
  return r.done();
};

export const kadaneImproved: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  let best = -Infinity;
  let bestRange: [number, number] | null = null;
  let adds = 0;
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "init", note: "improved: fix a start i, then stretch j to the right while keeping a running sum — no re-adding.", vars: { best: "−∞" } });
  for (let i = 0; i < n; i++) {
    let sum = 0;
    r.push({ rows: [{ values: arr, states: paint(n, (x) => (x === i ? "current" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "outer", note: `new start at index ${i}. the running sum resets to 0.`, vars: { i, sum, best: best === -Infinity ? "−∞" : best } });
    for (let j = i; j < n; j++) {
      sum += arr[j];
      adds++;
      const improved = sum > best;
      if (improved) { best = sum; bestRange = [i, j]; }
      r.push({
        rows: [{ values: arr, states: paint(n, (x) => (x === j ? "current" : x >= i && x < j ? "comparing" : bestRange && x >= bestRange[0] && x <= bestRange[1] ? "confirmed" : "inactive")) }],
        pointers: [{ label: "i", index: i }, { label: "j", index: j }],
        regions: [{ from: i, to: j, label: `sum ${sum}`, tone: "comparing" }],
        line: improved ? "best" : "add",
        note: `add ${arr[j]} to the running sum → ${sum}.${improved ? ` new best!` : ""}`,
        vars: { i, j, sum, best, "additions so far": adds },
      });
    }
  }
  r.push({ rows: [{ values: arr, states: paint(n, (x) => (bestRange && x >= bestRange[0] && x <= bestRange[1] ? "confirmed" : "inactive")) }], regions: bestRange ? [{ from: bestRange[0], to: bestRange[1], label: "best", tone: "confirmed" }] : [], line: "done", note: `done with ${adds} additions — about n²/2. the largest sum is ${best}.`, vars: { best, additions: adds }, result: `max sum = ${best}` });
  return r.done();
};

export const kadaneOptimal: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  let best = arr[0];
  let cur = 0;
  let start = 0;
  let bestRange: [number, number] = [0, 0];
  const st = (i: number, runFrom: number, runTo: number): CellState[] =>
    paint(n, (x) => {
      if (x === i) return "current";
      if (x >= runFrom && x <= runTo) return "pending";
      if (x >= bestRange[0] && x <= bestRange[1] && x < i) return "confirmed";
      if (x < i) return "invalid";
      return "inactive";
    });
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "init", note: `kadane: walk once, carrying the best sum of a run that ends right here. start with best = ${best}.`, vars: { current: cur, best } });
  for (let i = 0; i < n; i++) {
    const x = arr[i];
    const extend = cur + x;
    const fresh = extend < x;
    cur = fresh ? x : extend;
    if (fresh) start = i;
    r.push({
      rows: [{ values: arr, states: st(i, start, i - 1) }],
      pointers: [{ label: "i", index: i }],
      regions: [{ from: start, to: i, label: "current run", tone: "pending" }],
      line: "extend",
      note: fresh
        ? `at ${x}: carrying the old run gives ${extend}, but starting fresh gives ${x} — so we drop everything before and start a new run here.`
        : `at ${x}: extending the run gives ${extend}, which beats starting over at ${x}, so we keep going. current = ${cur}.`,
      vars: { i, x, current: cur, best },
    });
    if (cur > best) {
      best = cur;
      bestRange = [start, i];
      r.push({ rows: [{ values: arr, states: paint(n, (y) => (y === i ? "current" : y >= start && y <= i ? "confirmed" : y < i ? "invalid" : "inactive")) }], pointers: [{ label: "i", index: i }], regions: [{ from: start, to: i, label: `best ${best}`, tone: "confirmed" }], line: "best", note: `current (${cur}) beats best, so best = ${best}. this run is our new champion.`, vars: { i, current: cur, best } });
    } else {
      r.push({ rows: [{ values: arr, states: st(i, start, i - 1) }], pointers: [{ label: "i", index: i }], regions: [{ from: start, to: i, label: "current run", tone: "pending" }, { from: bestRange[0], to: bestRange[1], label: `best ${best}`, tone: "confirmed" }], line: "best", note: `current (${cur}) doesn't beat best (${best}), so best stays.`, vars: { i, current: cur, best } });
    }
  }
  r.push({ rows: [{ values: arr, states: paint(n, (x) => (x >= bestRange[0] && x <= bestRange[1] ? "confirmed" : "inactive")) }], regions: [{ from: bestRange[0], to: bestRange[1], label: "best subarray", tone: "confirmed" }], line: "done", note: `one pass, ${n} steps. the largest sum is ${best}, from index ${bestRange[0]} to ${bestRange[1]}.`, vars: { best }, result: `max sum = ${best}` });
  return r.done();
};

/* ======================= Move negatives to one side ======================= */

export const negativesBrute: Tracer = ({ arr }) => {
  const r = new Rec();
  const t = new Tape(arr);
  const n = t.n;
  let placed = 0;
  r.push({ rows: [t.row(fill(n, "inactive"))], line: "init", note: "brute force: every time we meet a negative, bubble it left one swap at a time until it joins the other negatives. order is kept.", vars: { placed } });
  for (let i = 0; i < n; i++) {
    t.cmp();
    const neg = t.vals[i] < 0;
    r.push({ rows: [t.row(paint(n, (x) => (x === i ? "current" : x < placed ? "confirmed" : x < i ? "pending" : "inactive")))], pointers: [{ label: "i", index: i }], line: "check", note: neg ? `${t.vals[i]} is negative — it has to travel left past ${i - placed} non-negative number${i - placed === 1 ? "" : "s"}.` : `${t.vals[i]} is not negative, leave it.`, vars: { i, placed }, stats: t.snap() });
    if (neg) {
      for (let k = i; k > placed; k--) {
        t.swap(k, k - 1);
        r.push({ rows: [t.row(paint(n, (x) => (x === k - 1 ? "current" : x === k ? "comparing" : x < placed ? "confirmed" : x <= i ? "pending" : "inactive")))], pointers: [{ label: "k", index: k - 1 }], line: "shift", note: `swap it one step left (with ${t.vals[k]}).`, vars: { i, placed, k: k - 1 }, stats: t.snap() });
      }
      placed++;
      r.push({ rows: [t.row(paint(n, (x) => (x < placed ? "confirmed" : x <= i ? "pending" : "inactive")))], regions: [{ from: 0, to: placed - 1, label: "negatives", tone: "confirmed" }], line: "place", note: `it now sits with the negatives. ${placed} negative${placed === 1 ? "" : "s"} placed.`, vars: { i, placed }, stats: t.snap() });
    }
  }
  r.push({ rows: [t.row(paint(n, (x) => (x < placed ? "confirmed" : "pending")))], regions: placed ? [{ from: 0, to: placed - 1, label: "negatives", tone: "confirmed" }] : [], line: "done", note: `done: ${fmtArr(t.vals)}. original order is kept, but it took ${t.stats.swaps} swaps.`, stats: t.snap(), result: fmtArr(t.vals) });
  return r.done();
};

export const negativesImproved: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  const out: (number | null)[] = fill(n, "inactive").map(() => null);
  let w = 0;
  const row2 = (hi?: number) => ({ label: "out (extra array)", values: [...out], states: paint(n, (x) => (x === hi ? "current" : out[x] === null ? "inactive" : "confirmed")) });
  r.push({ rows: [{ label: "arr", values: arr, states: fill(n, "inactive") }, row2()], line: "init", note: "improved: make an extra array. copy all negatives first, then everything else. two simple passes.", vars: { w } });
  for (let i = 0; i < n; i++) {
    const neg = arr[i] < 0;
    if (neg) out[w++] = arr[i];
    r.push({ rows: [{ label: "arr", values: arr, states: paint(n, (x) => (x === i ? "current" : x < i ? "pending" : "inactive")) }, row2(neg ? w - 1 : undefined)], pointers: [{ label: "i", index: i }], line: "negs", note: neg ? `pass 1: ${arr[i]} is negative → copy it to out[${w - 1}].` : `pass 1: ${arr[i]} isn't negative, skip it for now.`, vars: { i, w } });
  }
  for (let i = 0; i < n; i++) {
    const pos = arr[i] >= 0;
    if (pos) out[w++] = arr[i];
    r.push({ rows: [{ label: "arr", values: arr, states: paint(n, (x) => (x === i ? "current" : x < i ? "pending" : "inactive")) }, row2(pos ? w - 1 : undefined)], pointers: [{ label: "i", index: i }], line: "rest", note: pos ? `pass 2: ${arr[i]} is non-negative → copy it to out[${w - 1}].` : `pass 2: ${arr[i]} was already copied, skip.`, vars: { i, w } });
  }
  r.push({ rows: [{ label: "arr", values: out as number[], states: fill(n, "confirmed") }], line: "copy", note: `copy out back into arr: ${fmtArr(out as number[])}. order kept, but we paid for n extra slots.`, result: fmtArr(out as number[]) });
  return r.done();
};

export const negativesOptimal: Tracer = ({ arr }) => {
  const r = new Rec();
  const t = new Tape(arr);
  const n = t.n;
  let j = 0;
  const st = (i: number): CellState[] => paint(n, (x) => (x === i ? "current" : x < j ? "confirmed" : x < i ? "pending" : "inactive"));
  const regs = (i: number) => [
    ...(j > 0 ? [{ from: 0, to: j - 1, label: "negatives", tone: "confirmed" as CellState }] : []),
    ...(i > j ? [{ from: j, to: i - 1, label: "non-negatives", tone: "pending" as CellState }] : []),
  ];
  r.push({ rows: [t.row(fill(n, "inactive"))], pointers: [{ label: "j", index: 0 }], line: "init", note: "two pointers: j marks where the next negative should go. i scans every element once.", vars: { j }, stats: t.snap() });
  for (let i = 0; i < n; i++) {
    t.cmp();
    const neg = t.vals[i] < 0;
    r.push({ rows: [t.row(st(i))], pointers: [{ label: "i", index: i }, { label: "j", index: j }], regions: regs(i), line: "check", note: neg ? `${t.vals[i]} is negative — it belongs in the left zone at j = ${j}.` : `${t.vals[i]} is non-negative — it can stay where it is. move on.`, vars: { i, j }, stats: t.snap() });
    if (neg) {
      const a = t.vals[i], b = t.vals[j];
      t.swap(i, j);
      j++;
      r.push({ rows: [t.row(paint(n, (x) => (x === j - 1 ? "confirmed" : x === i && i !== j - 1 ? "comparing" : x < j ? "confirmed" : x < i ? "pending" : "inactive")))], pointers: [{ label: "i", index: i }, { label: "j", index: j }], regions: regs(i + 1), line: "swap", note: i === j - 1 ? `${a} is already in place (i = j). grow the negative zone: j = ${j}.` : `swap ${a} with ${b}. the negative zone grows by one: j = ${j}.`, vars: { i, j }, stats: t.snap() });
    }
  }
  r.push({ rows: [t.row(paint(n, (x) => (x < j ? "confirmed" : "pending")))], regions: regs(n), line: "done", note: `one pass, ${t.stats.swaps} swaps, no extra array: ${fmtArr(t.vals)}.`, stats: t.snap(), result: fmtArr(t.vals) });
  return r.done();
};

/* ============================= Count pairs with sum k ============================= */

export const pairsBrute: Tracer = ({ arr, target = 0 }) => {
  const r = new Rec();
  const n = arr.length;
  let count = 0;
  let checks = 0;
  const found: string[] = [];
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "init", note: `brute force: check every pair (i, j) with i < j and see if they add up to ${target}.`, vars: { k: target, count } });
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      checks++;
      const hit = arr[i] + arr[j] === target;
      if (hit) { count++; found.push(`${arr[i]} + ${arr[j]}`); }
      r.push({ rows: [{ values: arr, states: paint(n, (x) => (x === i ? "current" : x === j ? (hit ? "confirmed" : "comparing") : "inactive")) }], pointers: [{ label: "i", index: i }, { label: "j", index: j }], line: hit ? "hit" : "check", note: `${arr[i]} + ${arr[j]} = ${arr[i] + arr[j]}${hit ? ` ✓ a pair! count = ${count}.` : ` — not ${target}.`}`, vars: { i, j, count, "pairs checked": checks }, aux: [{ title: "pairs found", items: found.map((t) => ({ text: t, state: "confirmed" as CellState })), empty: "none yet" }] });
    }
  }
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "done", note: `we checked all ${checks} pairs. ${count} of them sum to ${target}.`, vars: { count }, aux: [{ title: "pairs found", items: found.map((t) => ({ text: t, state: "confirmed" as CellState })), empty: "none" }], result: `count = ${count}` });
  return r.done();
};

export const pairsImproved: Tracer = ({ arr, target = 0 }) => {
  const r = new Rec();
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  let count = 0;
  const found: string[] = [];
  let l = 0, h = n - 1;
  const aux = () => [{ title: "pairs counted", items: found.map((t) => ({ text: t, state: "confirmed" as CellState })), empty: "none yet" }];
  r.push({ rows: [{ label: "sorted", values: s, states: fill(n, "inactive") }], pointers: [{ label: "lo", index: l }, { label: "hi", index: h }], line: "sort", note: `sort first: ${fmtArr(s)}. now a small sum means move lo right, a big sum means move hi left.`, vars: { k: target, count }, aux: aux() });
  while (l < h) {
    const sum = s[l] + s[h];
    const st = paint(n, (x) => (x < l || x > h ? "invalid" : x === l || x === h ? "comparing" : "inactive"));
    if (sum < target) {
      r.push({ rows: [{ label: "sorted", values: s, states: st }], pointers: [{ label: "lo", index: l }, { label: "hi", index: h }], line: "less", note: `${s[l]} + ${s[h]} = ${sum} is too small → move lo right (${s[l]} can't pair with anything bigger than ${s[h]}).`, vars: { lo: l, hi: h, sum, count }, aux: aux() });
      l++;
    } else if (sum > target) {
      r.push({ rows: [{ label: "sorted", values: s, states: st }], pointers: [{ label: "lo", index: l }, { label: "hi", index: h }], line: "more", note: `${s[l]} + ${s[h]} = ${sum} is too big → move hi left.`, vars: { lo: l, hi: h, sum, count }, aux: aux() });
      h--;
    } else if (s[l] === s[h]) {
      const m = h - l + 1;
      const add = (m * (m - 1)) / 2;
      count += add;
      found.push(`${s[l]} + ${s[h]} ×${add}`);
      r.push({ rows: [{ label: "sorted", values: s, states: paint(n, (x) => (x >= l && x <= h ? "confirmed" : x < l || x > h ? "invalid" : "inactive")) }], pointers: [{ label: "lo", index: l }, { label: "hi", index: h }], line: "hit", note: `every value from lo to hi is ${s[l]}. any two of those ${m} copies make ${target}: that's ${add} pair${add === 1 ? "" : "s"}. count = ${count}.`, vars: { lo: l, hi: h, count }, aux: aux() });
      break;
    } else {
      let cl = 1, ch = 1;
      while (l + cl < h && s[l + cl] === s[l]) cl++;
      while (h - ch > l + cl - 1 && s[h - ch] === s[h]) ch++;
      count += cl * ch;
      found.push(`${s[l]} + ${s[h]}${cl * ch > 1 ? ` ×${cl * ch}` : ""}`);
      r.push({ rows: [{ label: "sorted", values: s, states: paint(n, (x) => ((x >= l && x < l + cl) || (x <= h && x > h - ch) ? "confirmed" : x < l || x > h ? "invalid" : "inactive")) }], pointers: [{ label: "lo", index: l }, { label: "hi", index: h }], line: "hit", note: `${s[l]} + ${s[h]} = ${target} ✓. there ${cl === 1 ? "is 1 copy" : `are ${cl} copies`} of ${s[l]} and ${ch} of ${s[h]}, so add ${cl * ch}. count = ${count}.`, vars: { lo: l, hi: h, count }, aux: aux() });
      l += cl; h -= ch;
    }
  }
  r.push({ rows: [{ label: "sorted", values: s, states: fill(n, "inactive") }], line: "done", note: `pointers met. ${count} pair${count === 1 ? "" : "s"} sum to ${target}.`, vars: { count }, aux: aux(), result: `count = ${count}` });
  return r.done();
};

export const pairsOptimal: Tracer = ({ arr, target = 0 }) => {
  const r = new Rec();
  const n = arr.length;
  const seen = new Map<number, number>();
  let count = 0;
  const found: string[] = [];
  const mapAux = (hot?: number, stateHot: CellState = "current") => [
    { title: "hash map (value → times seen)", items: [...seen.entries()].map(([v, c]) => ({ text: `${v} → ${c}`, state: v === hot ? stateHot : ("pending" as CellState) })), empty: "empty" },
    { title: "pairs found", items: found.map((t) => ({ text: t, state: "confirmed" as CellState })), empty: "none yet" },
  ];
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "init", note: `hashing: walk once. for each number x, ask the map "how many times have I already seen ${target} − x?"`, vars: { k: target, count }, aux: mapAux() });
  for (let i = 0; i < n; i++) {
    const x = arr[i];
    const need = target - x;
    const have = seen.get(need) ?? 0;
    r.push({ rows: [{ values: arr, states: paint(n, (y) => (y === i ? "current" : y < i ? (arr[y] === need ? "comparing" : "pending") : "inactive")) }], pointers: [{ label: "i", index: i }], line: "need", note: `we're at ${x}. to reach ${target} it needs a partner of ${need}.`, vars: { i, x, need, count }, aux: mapAux(need, "comparing") });
    if (have > 0) {
      count += have;
      found.push(`${need} + ${x}${have > 1 ? ` ×${have}` : ""}`);
      r.push({ rows: [{ values: arr, states: paint(n, (y) => (y === i ? "confirmed" : y < i && arr[y] === need ? "confirmed" : y < i ? "pending" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "hit", note: `the map says we've seen ${need} ${have} time${have === 1 ? "" : "s"} — that's ${have} new pair${have === 1 ? "" : "s"}. count = ${count}.`, vars: { i, x, need, count }, aux: mapAux(need, "confirmed") });
    } else {
      r.push({ rows: [{ values: arr, states: paint(n, (y) => (y === i ? "current" : y < i ? "pending" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "hit", note: `${need} isn't in the map yet — no pair ends here.`, vars: { i, x, need, count }, aux: mapAux(need, "invalid") });
    }
    seen.set(x, (seen.get(x) ?? 0) + 1);
    r.push({ rows: [{ values: arr, states: paint(n, (y) => (y <= i ? "pending" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "store", note: `remember ${x} for later numbers: map[${x}] = ${seen.get(x)}.`, vars: { i, x, count }, aux: mapAux(x, "current") });
  }
  r.push({ rows: [{ values: arr, states: fill(n, "pending") }], line: "done", note: `one pass, ${n} lookups. ${count} pair${count === 1 ? "" : "s"} sum to ${target}.`, vars: { count }, aux: mapAux(), result: `count = ${count}` } as Frame);
  return r.done();
};
