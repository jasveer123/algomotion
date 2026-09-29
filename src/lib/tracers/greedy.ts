import { Rec, Tape, fill, fmtArr, paint } from "../trace";
import type { CellState, Tracer } from "../types";

export const heightsTracer: Tracer = ({ arr, k = 0 }) => {
  const r = new Rec();
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  let best = s[n - 1] - s[0];
  let bestSplit = 0;
  r.push({ rows: [{ label: "heights (sorted)", values: s, states: fill(n, "inactive") }], line: "sort", note: `sort the towers: ${fmtArr(s)}. in the best answer, some prefix goes up by ${k} and the rest goes down by ${k}.`, vars: { k } });
  r.push({ rows: [{ label: "heights (sorted)", values: s, states: fill(n, "pending") }], line: "init", note: `baseline: move everything the same way. the difference stays ${s[n - 1]} − ${s[0]} = ${best}.`, vars: { k, best } });
  for (let i = 1; i < n; i++) {
    const after = s.map((v, x) => (x < i ? v + k : v - k));
    if (s[i] - k < 0) {
      r.push({ rows: [{ label: "heights (sorted)", values: s, states: paint(n, (x) => (x === i ? "invalid" : "inactive")) }], line: "skip", note: `split before index ${i} would make ${s[i]} − ${k} negative — towers can't go below 0. skip.`, vars: { i, best } });
      continue;
    }
    const low = Math.min(s[0] + k, s[i] - k);
    const high = Math.max(s[i - 1] + k, s[n - 1] - k);
    const improved = high - low < best;
    if (improved) { best = high - low; bestSplit = i; }
    r.push({
      rows: [
        { label: "heights (sorted)", values: s, states: paint(n, (x) => (x < i ? "pending" : "comparing")) },
        { label: "after ±k", values: after, states: paint(n, (x) => (after[x] === low || after[x] === high ? "current" : x < i ? "pending" : "comparing")) },
      ],
      regions: [{ from: 0, to: i - 1, label: `+${k}`, tone: "pending" }, { from: i, to: n - 1, label: `−${k}`, tone: "comparing" }],
      line: improved ? "best" : "split",
      note: `raise [0..${i - 1}], lower [${i}..${n - 1}]. the shortest tower is min(${s[0]}+${k}, ${s[i]}−${k}) = ${low}, the tallest is max(${s[i - 1]}+${k}, ${s[n - 1]}−${k}) = ${high}. difference ${high - low}.${improved ? " new best!" : ""}`,
      vars: { i, low, high, best },
    });
  }
  const final = s.map((v, x) => (bestSplit && x < bestSplit ? v + k : bestSplit ? v - k : v + k));
  r.push({ rows: [{ label: "heights (sorted)", values: s, states: fill(n, "inactive") }, { label: "after ±k", values: final, states: fill(n, "confirmed") }], line: "done", note: `the smallest possible difference between the tallest and shortest tower is ${best}.`, vars: { best }, result: `min difference = ${best}` });
  return r.done();
};

export const jumpsTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  if (n <= 1) {
    r.push({ rows: [{ values: arr, states: fill(n, "confirmed") }], line: "init", note: "we're already at the end.", result: "jumps = 0" });
    return r.done();
  }
  if (arr[0] === 0) {
    r.push({ rows: [{ values: arr, states: paint(n, (x) => (x === 0 ? "invalid" : "inactive")) }], line: "init", note: "the first step is 0 — we can't move at all.", result: "unreachable (−1)" });
    return r.done();
  }
  let jumps = 1, end = arr[0], far = arr[0];
  const st = (i: number): CellState[] => paint(n, (x) => (x === i ? "current" : x <= end && x < i ? "confirmed" : x <= end ? "pending" : x <= far ? "comparing" : "inactive"));
  r.push({ rows: [{ values: arr, states: st(0) }], regions: [{ from: 1, to: Math.min(end, n - 1), label: "reachable with 1 jump", tone: "pending" }], line: "init", note: `first jump from index 0 reaches up to index ${end}. inside that range, look for the spot that lets the next jump go furthest.`, vars: { jumps, end, far } });
  for (let i = 1; i < n; i++) {
    if (i === n - 1) {
      r.push({ rows: [{ values: arr, states: paint(n, (x) => (x === i ? "confirmed" : "inactive")) }], line: "reach", note: `the last index is inside the current jump's range — done in ${jumps} jump${jumps === 1 ? "" : "s"}.`, vars: { jumps }, result: `jumps = ${jumps}` });
      return r.done();
    }
    const nf = Math.max(far, i + arr[i]);
    const grew = nf > far;
    far = nf;
    r.push({ rows: [{ values: arr, states: st(i) }], pointers: [{ label: "i", index: i }], regions: [{ from: i, to: Math.min(end, n - 1), label: `jump ${jumps}`, tone: "pending" }], line: "far", note: `from index ${i} we could reach ${i + arr[i]}. ${grew ? `that's the furthest so far → far = ${far}.` : `far stays ${far}.`}`, vars: { i, jumps, end, far } });
    if (i === end) {
      if (far <= i) {
        r.push({ rows: [{ values: arr, states: paint(n, (x) => (x > i ? "invalid" : "inactive")) }], line: "stuck", note: `we used up this jump's range and nothing reaches past index ${i}. the end is unreachable.`, result: "unreachable (−1)" });
        return r.done();
      }
      jumps++; end = far;
      r.push({ rows: [{ values: arr, states: st(i) }], pointers: [{ label: "i", index: i }], regions: [{ from: i + 1, to: Math.min(end, n - 1), label: `jump ${jumps}`, tone: "comparing" }], line: "jump", note: `end of this jump's range. we must jump again — the best landing spot lets us reach index ${end}. jumps = ${jumps}.`, vars: { i, jumps, end, far } });
    }
  }
  return r.done();
};

export const intervalsTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const iv: [number, number][] = [];
  for (let i = 0; i + 1 < arr.length; i += 2) iv.push([arr[i], arr[i + 1]]);
  iv.sort((a, b) => a[0] - b[0]);
  const n = iv.length;
  const show = (x: [number, number]) => `${x[0]}–${x[1]}`;
  const out: [number, number][] = [[...iv[0]] as [number, number]];
  const rows = (i: number, s: CellState, hotOut: boolean) => [
    { label: "intervals (sorted by start)", values: iv.map(show), states: paint(n, (x) => (x === i ? s : x < i ? "confirmed" : "inactive")) },
    { label: "merged", values: out.map(show), states: paint(out.length, (x) => (x === out.length - 1 && hotOut ? "current" : "confirmed")) },
  ];
  r.push({ rows: rows(-1, "current", false), line: "sort", note: "sort by start time. now overlapping intervals are always neighbours.", vars: { intervals: n } });
  r.push({ rows: rows(0, "confirmed", true), line: "init", note: `start the answer with ${show(iv[0])}.` });
  for (let i = 1; i < n; i++) {
    const last = out[out.length - 1];
    if (iv[i][0] <= last[1]) {
      const was = show(last);
      last[1] = Math.max(last[1], iv[i][1]);
      r.push({ rows: rows(i, "comparing", true), line: "overlap", note: `${show(iv[i])} starts at ${iv[i][0]}, before ${was} ends → they overlap. stretch it to ${show(last)}.` });
    } else {
      out.push([...iv[i]] as [number, number]);
      r.push({ rows: rows(i, "pending", true), line: "push", note: `${show(iv[i])} starts after ${show(last)} ends → no overlap. start a new merged interval.` });
    }
  }
  r.push({ rows: [{ label: "merged", values: out.map(show), states: fill(out.length, "confirmed") }], line: "done", note: `${n} intervals collapse into ${out.length}.`, result: out.map((x) => `[${x[0]}, ${x[1]}]`).join(" ") });
  return r.done();
};

export const nextPermTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const t = new Tape(arr);
  const n = t.n;
  let i = n - 2;
  r.push({ rows: [t.row(fill(n, "inactive"))], line: "pivot", note: "from the right, find the first number that is smaller than the one after it. everything to its right is already in its biggest (descending) order.", stats: t.snap() });
  while (i >= 0 && t.vals[i] >= t.vals[i + 1]) {
    t.cmp();
    r.push({ rows: [t.row(paint(n, (x) => (x === i || x === i + 1 ? "comparing" : x > i + 1 ? "pending" : "inactive")))], pointers: [{ label: "i", index: i }], line: "pivot", note: `${t.vals[i]} ≥ ${t.vals[i + 1]} — still descending, keep moving left.`, stats: t.snap() });
    i--;
  }
  if (i >= 0) {
    t.cmp();
    r.push({ rows: [t.row(paint(n, (x) => (x === i ? "current" : x > i ? "pending" : "inactive")))], pointers: [{ label: "i", index: i }], regions: [{ from: i + 1, to: n - 1, label: "descending suffix", tone: "pending" }], line: "pivot", note: `${t.vals[i]} < ${t.vals[i + 1]} → pivot at index ${i}. this is the digit we must bump up.`, stats: t.snap() });
    let j = n - 1;
    while (t.vals[j] <= t.vals[i]) { t.cmp(); j--; }
    r.push({ rows: [t.row(paint(n, (x) => (x === i ? "current" : x === j ? "comparing" : x > i ? "pending" : "inactive")))], pointers: [{ label: "i", index: i }, { label: "j", index: j }], line: "successor", note: `from the right, the first value bigger than ${t.vals[i]} is ${t.vals[j]} — the smallest possible bump.`, stats: t.snap() });
    t.swap(i, j);
    r.push({ rows: [t.row(paint(n, (x) => (x === i ? "confirmed" : x > i ? "pending" : "inactive")))], pointers: [{ label: "i", index: i }], line: "swap", note: `swap them. the prefix is now just a little bigger.`, stats: t.snap() });
  } else {
    r.push({ rows: [t.row(fill(n, "pending"))], line: "pivot", note: "the whole array is descending — it's the largest permutation, so wrap around to the smallest.", stats: t.snap() });
  }
  let l = i + 1, h = n - 1;
  while (l < h) {
    t.swap(l, h);
    r.push({ rows: [t.row(paint(n, (x) => (x === l || x === h ? "comparing" : x <= i ? "confirmed" : "pending")))], pointers: [{ label: "l", index: l }, { label: "r", index: h }], line: "reverse", note: "reverse the suffix so it becomes ascending — its smallest arrangement.", stats: t.snap() });
    l++; h--;
  }
  r.push({ rows: [t.row(fill(n, "confirmed"))], line: "done", note: `next permutation: ${fmtArr(t.vals)}.`, stats: t.snap(), result: fmtArr(t.vals) });
  return r.done();
};

export const profitTwiceTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  let b1 = -Infinity, s1 = 0, b2 = -Infinity, s2 = 0;
  const f = (v: number) => (v === -Infinity ? "−∞" : v);
  r.push({ rows: [{ label: "price", values: arr, states: fill(n, "inactive") }], line: "init", note: "track four running bests: after 1st buy, after 1st sell, after 2nd buy, after 2nd sell. each day, every state either stays or makes its move.", vars: { buy1: "−∞", sell1: 0, buy2: "−∞", sell2: 0 } });
  for (let d = 0; d < n; d++) {
    const p = arr[d];
    b1 = Math.max(b1, -p);
    s1 = Math.max(s1, b1 + p);
    b2 = Math.max(b2, s1 - p);
    s2 = Math.max(s2, b2 + p);
    r.push({ rows: [{ label: "price", values: arr, states: paint(n, (x) => (x === d ? "current" : x < d ? "pending" : "inactive")) }], pointers: [{ label: "day", index: d }], line: "update", note: `price ${p}: buy1 = ${f(b1)} (cheapest first buy), sell1 = ${s1}, buy2 = ${f(b2)} (profit so far minus a second buy), sell2 = ${s2}.`, vars: { buy1: f(b1), sell1: s1, buy2: f(b2), sell2: s2 } });
  }
  r.push({ rows: [{ label: "price", values: arr, states: fill(n, "confirmed") }], line: "done", note: `with at most two transactions, the best total profit is ${s2}.`, vars: { sell2: s2 }, result: `max profit = ${s2}` });
  return r.done();
};

export const factorialTracer: Tracer = ({ k = 1 }) => {
  const r = new Rec();
  const n = k;
  const digits = [1];
  r.push({ rows: [{ label: "digits (least significant first)", values: [...digits], states: ["confirmed"] }], line: "init", note: `the answer will be too big for any number type, so store it as an array of digits, lowest digit first. start with 1.`, vars: { n } });
  for (let x = 2; x <= n; x++) {
    let carry = 0;
    const before = [...digits].reverse().join("");
    for (let i = 0; i < digits.length; i++) {
      const prod = digits[i] * x + carry;
      digits[i] = prod % 10;
      carry = Math.floor(prod / 10);
    }
    const grew = digits.length;
    r.push({ rows: [{ label: "digits (least significant first)", values: [...digits], states: paint(digits.length, () => "comparing") }], line: "digit", note: `multiply every digit by ${x}, keeping only the last digit and passing the rest on as carry (like long multiplication by hand).`, vars: { x, carry } });
    while (carry > 0) {
      digits.push(carry % 10);
      carry = Math.floor(carry / 10);
    }
    r.push({ rows: [{ label: "digits (least significant first)", values: [...digits], states: paint(digits.length, (i) => (i >= grew ? "pending" : "confirmed")) }], line: digits.length > grew ? "carry" : "loop", note: `${before} × ${x} = ${[...digits].reverse().join("")}.${digits.length > grew ? ` the leftover carry added ${digits.length - grew} new digit${digits.length - grew === 1 ? "" : "s"}.` : ""}`, vars: { x, digits: digits.length } });
  }
  const s = [...digits].reverse().join("");
  r.push({ rows: [{ label: "digits (least significant first)", values: [...digits], states: fill(digits.length, "confirmed") }], line: "done", note: `read the array backwards: ${n}! = ${s} (${s.length} digits).`, result: `${n}! = ${s}` });
  return r.done();
};
