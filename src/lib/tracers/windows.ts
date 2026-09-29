import { Rec, fill, paint } from "../trace";
import type { CellState, Tracer } from "../types";

export const smallestSubTracer: Tracer = ({ arr, target = 0 }) => {
  const r = new Rec();
  const n = arr.length;
  let best = Infinity, sum = 0, start = 0;
  let bestRange: [number, number] | null = null;
  const st = (end: number): CellState[] => paint(n, (x) => (x === end ? "current" : x >= start && x < end ? "pending" : bestRange && x >= bestRange[0] && x <= bestRange[1] ? "confirmed" : x < start ? "invalid" : "inactive"));
  r.push({ rows: [{ values: arr, states: fill(n, "inactive") }], line: "init", note: `grow a window to the right until its sum is more than ${target}, then shrink from the left as long as it stays more than ${target}. every shrink is a shorter answer.`, vars: { x: target, sum, best: "∞" } });
  for (let end = 0; end < n; end++) {
    sum += arr[end];
    r.push({ rows: [{ values: arr, states: st(end) }], pointers: [{ label: "start", index: start }, { label: "end", index: end }], regions: [{ from: start, to: end, label: `sum ${sum}`, tone: "pending" }], line: "grow", note: `add ${arr[end]}: window sum = ${sum}${sum > target ? ` > ${target}!` : ` (not more than ${target} yet).`}`, vars: { start, end, sum, best: best === Infinity ? "∞" : best } });
    while (sum > target && start <= end) {
      const len = end - start + 1;
      if (len < best) { best = len; bestRange = [start, end]; }
      r.push({ rows: [{ values: arr, states: paint(n, (x) => (x >= start && x <= end ? "confirmed" : x < start ? "invalid" : "inactive")) }], pointers: [{ label: "start", index: start }, { label: "end", index: end }], regions: [{ from: start, to: end, label: `len ${len}`, tone: "confirmed" }], line: "record", note: `valid window of length ${len}. best = ${best}.`, vars: { start, end, sum, best } });
      sum -= arr[start];
      start++;
      r.push({ rows: [{ values: arr, states: st(end) }], pointers: [{ label: "start", index: Math.min(start, n - 1) }, { label: "end", index: end }], regions: start <= end ? [{ from: start, to: end, label: `sum ${sum}`, tone: "pending" }] : [], line: "shrink", note: `drop ${arr[start - 1]} from the left to try a shorter window. sum = ${sum}.`, vars: { start, end, sum, best } });
    }
  }
  const ans = best === Infinity ? 0 : best;
  r.push({ rows: [{ values: arr, states: paint(n, (x) => (bestRange && x >= bestRange[0] && x <= bestRange[1] ? "confirmed" : "inactive")) }], regions: bestRange ? [{ from: bestRange[0], to: bestRange[1], label: "smallest", tone: "confirmed" }] : [], line: "done", note: ans ? `each element entered and left the window at most once. the smallest length is ${ans}.` : `no subarray has a sum more than ${target}, so the answer is 0.`, vars: { best: ans }, result: `length = ${ans}` });
  return r.done();
};

export const maxProductTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  let hi = arr[0], lo = arr[0], best = arr[0];
  r.push({ rows: [{ values: arr, states: paint(n, (x) => (x === 0 ? "current" : "inactive")) }], pointers: [{ label: "i", index: 0 }], line: "init", note: `track two things for runs ending here: the biggest product (hi) and the smallest (lo). a negative number can flip the smallest into the biggest.`, vars: { hi, lo, best } });
  for (let i = 1; i < n; i++) {
    const x = arr[i];
    if (x < 0) {
      [hi, lo] = [lo, hi];
      r.push({ rows: [{ values: arr, states: paint(n, (y) => (y === i ? "current" : y < i ? "pending" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "flip", note: `${x} is negative: multiplying flips signs, so swap hi and lo first.`, vars: { i, x, hi, lo, best } });
    }
    const h2 = Math.max(x, hi * x), l2 = Math.min(x, lo * x);
    hi = h2; lo = l2;
    r.push({ rows: [{ values: arr, states: paint(n, (y) => (y === i ? "current" : y < i ? "pending" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "update", note: `hi = max(${x}, hi × ${x}) = ${hi}; lo = min(${x}, lo × ${x}) = ${lo}.${x === 0 ? " a zero resets both runs." : ""}`, vars: { i, x, hi, lo, best } });
    const improved = hi > best;
    best = Math.max(best, hi);
    r.push({ rows: [{ values: arr, states: paint(n, (y) => (y === i ? (improved ? "confirmed" : "current") : y < i ? "pending" : "inactive")) }], pointers: [{ label: "i", index: i }], line: "best", note: improved ? `hi (${hi}) is a new best product.` : `best stays ${best}.`, vars: { i, hi, lo, best } });
  }
  r.push({ rows: [{ values: arr, states: fill(n, "confirmed") }], line: "done", note: `one pass. the maximum product of any subarray is ${best}.`, vars: { best }, result: `max product = ${best}` });
  return r.done();
};

export const minSwapsKTracer: Tracer = ({ arr, k = 0 }) => {
  const r = new Rec();
  const n = arr.length;
  const good = arr.filter((x) => x <= k).length;
  const kind = (x: number): CellState => (arr[x] <= k ? "confirmed" : "invalid");
  r.push({ rows: [{ values: arr, states: paint(n, kind) }], line: "count", note: `${good} element${good === 1 ? " is" : "s are"} ≤ ${k} (green). they must end up side by side, so look at every window of length ${good} and count the bad ones (coral) inside — each bad one needs one swap.`, vars: { k, window: good } });
  if (good === 0) {
    r.push({ rows: [{ values: arr, states: paint(n, kind) }], line: "done", note: `nothing is ≤ ${k}, so no swaps are needed.`, result: "swaps = 0" });
    return r.done();
  }
  let bad = 0;
  for (let i = 0; i < good; i++) if (arr[i] > k) bad++;
  let best = bad, bestAt = 0;
  const st = (from: number): CellState[] => paint(n, (x) => (x >= from && x < from + good ? (arr[x] <= k ? "confirmed" : "invalid") : "inactive"));
  r.push({ rows: [{ values: arr, states: st(0) }], regions: [{ from: 0, to: good - 1, label: `${bad} bad`, tone: "comparing" }], line: "first", note: `first window [0..${good - 1}] has ${bad} bad element${bad === 1 ? "" : "s"}.`, vars: { bad, best } });
  for (let i = good; i < n; i++) {
    const from = i - good + 1;
    if (arr[i - good] > k) bad--;
    if (arr[i] > k) bad++;
    const improved = bad < best;
    if (improved) { best = bad; bestAt = from; }
    r.push({ rows: [{ values: arr, states: st(from) }], regions: [{ from, to: i, label: `${bad} bad`, tone: improved ? "confirmed" : "comparing" }], line: improved ? "best" : "slide", note: `slide: ${arr[i - good]} leaves, ${arr[i]} enters → ${bad} bad.${improved ? ` new best = ${best}.` : ""}`, vars: { bad, best } });
  }
  r.push({ rows: [{ values: arr, states: st(bestAt) }], regions: [{ from: bestAt, to: bestAt + good - 1, label: "gather here", tone: "confirmed" }], line: "done", note: `the best window needs ${best} swap${best === 1 ? "" : "s"}: swap each bad element in it with a good one outside.`, vars: { best }, result: `swaps = ${best}` });
  return r.done();
};

export const stockOnceTracer: Tracer = ({ arr }) => {
  const r = new Rec();
  const n = arr.length;
  let minP = Infinity, best = 0, minAt = -1;
  let buy = -1, sell = -1;
  r.push({ rows: [{ label: "price", values: arr, states: fill(n, "inactive") }], line: "init", note: "walk the days once. remember the cheapest price so far; selling today earns today − cheapest.", vars: { cheapest: "∞", profit: best } });
  for (let d = 0; d < n; d++) {
    const p = arr[d];
    const newMin = p < minP;
    if (newMin) { minP = p; minAt = d; }
    r.push({ rows: [{ label: "price", values: arr, states: paint(n, (x) => (x === d ? "current" : x === minAt ? "pending" : x === buy || x === sell ? "confirmed" : x < d ? "invalid" : "inactive")) }], pointers: [{ label: "day", index: d }], line: "min", note: newMin ? `${p} is the cheapest price yet → best day to have bought so far.` : `${p} isn't cheaper than ${minP}.`, vars: { day: d, cheapest: minP, profit: best } });
    const profit = p - minP;
    if (profit > best) { best = profit; buy = minAt; sell = d; }
    r.push({ rows: [{ label: "price", values: arr, states: paint(n, (x) => (x === buy || x === sell ? "confirmed" : x === d ? "current" : x === minAt ? "pending" : x < d ? "invalid" : "inactive")) }], pointers: [{ label: "day", index: d }], line: "profit", note: `selling today earns ${p} − ${minP} = ${profit}.${profit === best && profit > 0 && sell === d ? " new best!" : ` best stays ${best}.`}`, vars: { day: d, cheapest: minP, profit: best } });
  }
  r.push({ rows: [{ label: "price", values: arr, states: paint(n, (x) => (x === buy || x === sell ? "confirmed" : "inactive")) }], line: "done", note: best > 0 ? `buy on day ${buy} at ${arr[buy]}, sell on day ${sell} at ${arr[sell]}: profit ${best}.` : "prices only fall — the best move is not to trade (profit 0).", vars: { profit: best }, result: `max profit = ${best}` });
  return r.done();
};
