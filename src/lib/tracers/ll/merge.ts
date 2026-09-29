import { mark } from "../../list";
import type { CellState, Frame, Tracer } from "../../types";
import { chips, LinkedList, lf, Rec } from "./common";

type Place = Map<number, { row: number; col: number }>;
const rowPlace = (rows: number[][], gap = 0): Place => {
  const p: Place = new Map();
  rows.forEach((ids, row) => ids.forEach((id, i) => p.set(id, { row, col: i + (row > 0 ? gap : 0) })));
  return p;
};
/** Lay out segments left to right on one row, with an empty column between segments. */
const segPlace = (segs: number[][]): Place => {
  const p: Place = new Map();
  let col = 0;
  segs.filter((s) => s.length).forEach((s) => { s.forEach((id) => p.set(id, { row: 0, col: col++ })); col++; });
  return p;
};

/* ---------------- intersection of two sorted lists ---------------- */

export const llIntersectSorted: Tracer = ({ arr, arr2 = [] }) => {
  const r = new Rec();
  const ll = new LinkedList([]);
  const A = ll.chain(arr, 0), B = ll.chain(arr2, 1);
  const aIds = ll.walk(A), bIds = ll.walk(B);
  const out: number[] = [];
  let a: number | null = A, b: number | null = B;
  const layout = () => rowPlace([aIds, bIds, out]);
  const labels = ["a", "b", "result (new nodes)"];
  const view = (st: Record<number, CellState>, note: string, line: string): Frame => lf(ll, { place: layout(), rowLabels: labels, states: st, pointers: { a, b } }, note, line);
  r.push(view({}, "both lists are sorted: walk them together like a merge. equal values are copied into a new result list.", "init"));
  while (a !== null && b !== null) {
    const va = ll.node(a).value as number, vb = ll.node(b).value as number;
    if (va === vb) {
      const id = ll.add(va, { row: 2, col: out.length });
      if (out.length) ll.node(out[out.length - 1]).next = id;
      out.push(id);
      r.push(view({ [a]: "confirmed", [b]: "confirmed", [id]: "current" }, `${va} is in both → append a new ${va} to the result, move both.`, "match"));
      a = ll.node(a).next; b = ll.node(b).next;
    } else {
      r.push(view({ [a]: va < vb ? "invalid" : "comparing", [b]: vb < va ? "invalid" : "comparing" }, `${Math.min(va, vb)} is smaller — it can't be in the other list any more, move its pointer.`, "advance"));
      if (va < vb) a = ll.node(a).next; else b = ll.node(b).next;
    }
  }
  r.push(view(mark(out, "confirmed"), `one list ran out. intersection: ${out.length ? out.map((id) => ll.node(id).value).join(" → ") : "empty"}.`, "done"));
  r.frames[r.frames.length - 1].result = out.length ? out.map((id) => ll.node(id).value).join(" → ") : "empty";
  return r.done();
};

/* ---------------- sort a linked list (flagship: three approaches) ---------------- */

export const llSortArray: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const ids = ll.walk();
  const vals: number[] = [];
  r.push(lf(ll, { fixed: true, base: "inactive" }, "shortcut: copy the values into an array, sort the array, and write them back. the nodes and links never move.", "collect", { aux: [chips("array", [])] }));
  ids.forEach((id, i) => {
    vals.push(ll.node(id).value as number);
    r.push(lf(ll, { fixed: true, base: "inactive", states: mark(ids.slice(0, i + 1), "pending", { [id]: "current" }), pointers: { c: id } }, `copy ${ll.node(id).value}.`, "collect", { aux: [chips("array", vals)] }));
  });
  vals.sort((x, y) => x - y);
  r.push(lf(ll, { fixed: true, base: "pending" }, `sort the array: [${vals.join(", ")}].`, "sort", { aux: [chips("array", vals, "confirmed")] }));
  ids.forEach((id, i) => {
    ll.node(id).value = vals[i];
    r.push(lf(ll, { fixed: true, base: "pending", states: mark(ids.slice(0, i + 1), "confirmed", { [id]: "current" }), pointers: { c: id } }, `write ${vals[i]} back into node ${i + 1}.`, "write", { aux: [chips("array", vals, "confirmed")] }));
  });
  r.push(lf(ll, { fixed: true, base: "confirmed" }, `sorted: ${ll.text()} — O(n log n), but it needs an n-slot array.`, "done", { result: ll.text() }));
  return r.done();
};

export const llInsertionSort: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const sorted: number[] = [];
  let curr: number | null = ll.head;
  let comps = 0;
  const layout = (): Place => rowPlace([sorted, curr !== null ? ll.walk(curr) : []]);
  const labels = ["sorted", "still to insert"];
  r.push(lf(ll, { place: layout(), rowLabels: labels, pointers: { curr } }, "insertion sort by relinking: take nodes one by one and splice each into the right place of a growing sorted list.", "init"));
  while (curr !== null) {
    const next: number | null = ll.node(curr).next;
    const v = ll.node(curr).value as number;
    let pos = 0;
    while (pos < sorted.length && (ll.node(sorted[pos]).value as number) < v) { pos++; comps++; }
    r.push(lf(ll, { place: layout(), rowLabels: labels, states: { [curr]: "current", ...(pos < sorted.length ? { [sorted[pos]]: "comparing" } : {}) }, pointers: { curr } }, `take ${v}. scan the sorted list: it goes ${pos === 0 ? "at the front" : `after ${ll.node(sorted[pos - 1]).value}`}.`, "scan", { vars: { comparisons: comps } }));
    sorted.splice(pos, 0, curr);
    sorted.forEach((id, i) => { ll.node(id).next = i + 1 < sorted.length ? sorted[i + 1] : null; });
    curr = next;
    r.push(lf(ll, { place: layout(), rowLabels: labels, states: mark(sorted, "confirmed", { [sorted[pos]]: "current" }), edges: pos > 0 ? { [sorted[pos - 1]]: "current" } : {}, pointers: { curr }, showNull: false }, `splice ${v} in by changing two links.`, "insert", { vars: { comparisons: comps } }));
  }
  ll.head = sorted[0] ?? null;
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, `sorted: ${ll.text()} after ${comps} comparisons — O(n²) in the worst case, but O(1) memory.`, "done", { vars: { comparisons: comps }, result: ll.text() }));
  return r.done();
};

export const llMergeSort: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const segs: number[][] = [ll.walk()];
  let comps = 0;
  const frame = (st: Record<number, CellState>, note: string, line: string, pointers: Record<string, number | null> = {}) => {
    segs.forEach((s) => s.forEach((id, i) => { ll.node(id).next = i + 1 < s.length ? s[i + 1] : null; }));
    r.push(lf(ll, { place: segPlace(segs), states: st, pointers, showNull: false }, note, line, { vars: { comparisons: comps, pieces: segs.length } }));
  };
  frame({}, "merge sort: split the list in half (slow/fast pointers), sort each half, then merge the two sorted halves by relinking.", "base");
  const sort = (si: number): void => {
    const seg = segs[si];
    if (seg.length <= 1) return;
    const mid = Math.floor((seg.length - 1) / 2);
    frame(mark(seg, "pending", { [seg[mid]]: "current" }), `split [${seg.map((id) => ll.node(id).value).join(", ")}]: slow stops at ${ll.node(seg[mid]).value}, the end of the left half.`, "split", { slow: seg[mid] });
    segs.splice(si, 1, seg.slice(0, mid + 1), seg.slice(mid + 1));
    frame(mark(segs[si], "pending", mark(segs[si + 1], "comparing")), `cut after ${ll.node(seg[mid]).value}: two independent lists.`, "cut");
    sort(si + 1);
    sort(si);
    // merge: segs[si] and segs[si + 1] become [merged, rest of a, rest of b]
    const a = [...segs[si]], b = [...segs[si + 1]];
    const merged: number[] = [];
    segs.splice(si, 2, merged, a, b);
    frame(mark(a, "pending", mark(b, "comparing")), `merge [${a.map((id) => ll.node(id).value).join(", ")}] and [${b.map((id) => ll.node(id).value).join(", ")}].`, "merge");
    while (a.length && b.length) {
      comps++;
      const x = (ll.node(a[0]).value as number) <= (ll.node(b[0]).value as number) ? a.shift()! : b.shift()!;
      merged.push(x);
      frame(mark(merged, "confirmed", mark(a, "pending", mark(b, "comparing", { [x]: "current" }))), `${ll.node(x).value} is the smaller front → link it next.`, "take");
    }
    merged.push(...a.splice(0), ...b.splice(0));
    segs.splice(si, 3, merged);
    frame(mark(merged, "confirmed"), `one side is empty — attach the rest. merged: [${merged.map((id) => ll.node(id).value).join(", ")}].`, "rest");
  };
  sort(0);
  ll.head = segs[0][0] ?? null;
  frame(mark(segs[0], "confirmed"), `sorted: ${segs[0].map((id) => ll.node(id).value).join(" → ")} — O(n log n) time, no array, only O(log n) recursion.`, "done", { head: ll.head });
  r.frames[r.frames.length - 1].result = segs[0].map((id) => ll.node(id).value).join(" → ");
  return r.done();
};

/* ---------------- quicksort on a linked list (swapping values) ---------------- */

export const llQuickSort: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const ids = ll.walk();
  let comps = 0, swaps = 0;
  const fixedDone = new Set<number>();
  const frame = (st: Record<number, CellState>, note: string, line: string, pointers: Record<string, number | null> = {}) =>
    r.push(lf(ll, { fixed: true, base: "inactive", states: mark(fixedDone, "confirmed", st), pointers }, note, line, { vars: { comparisons: comps, "value swaps": swaps } }));
  const swapVals = (x: number, y: number) => { if (x === y) return; const t = ll.node(x).value; ll.node(x).value = ll.node(y).value; ll.node(y).value = t; swaps++; };
  frame({}, "quicksort on a list: pick the last node's value as the pivot, move smaller values to the front of the range by swapping values, then recurse on both sides.", "base");
  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) { fixedDone.add(ids[lo]); frame({}, `a range of one node (${ll.node(ids[lo]).value}) is already in place.`, "base"); return; }
    const pivot = ll.node(ids[hi]).value as number;
    const range = ids.slice(lo, hi + 1);
    frame(mark(range, "pending", { [ids[hi]]: "current" }), `range ${ll.node(ids[lo]).value}…${ll.node(ids[hi]).value}: pivot = ${pivot}.`, "pivot", { pivot: ids[hi] });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      comps++;
      const small = (ll.node(ids[j]).value as number) < pivot;
      if (small) swapVals(ids[i], ids[j]);
      frame(mark(range, "pending", { [ids[hi]]: "current", [ids[j]]: "comparing" }), small ? `${ll.node(ids[i]).value} < ${pivot} → swap it into the "small" part.` : `${ll.node(ids[j]).value} ≥ ${pivot} → leave it.`, small ? "swap" : "scan", { i: ids[i], j: ids[j] });
      if (small) i++;
    }
    swapVals(ids[i], ids[hi]);
    fixedDone.add(ids[i]);
    frame({ [ids[i]]: "confirmed" }, `put the pivot ${pivot} right after the small values — it's now in its final place.`, "place", { pivot: ids[i] });
    sort(lo, i - 1);
    sort(i + 1, hi);
  };
  sort(0, ids.length - 1);
  frame(mark(ids, "confirmed"), `sorted: ${ll.text()}. note how we kept walking the list to find ranges — no random access.`, "done");
  r.frames[r.frames.length - 1].result = ll.text();
  return r.done();
};

/* ---------------- sort a k-sorted doubly linked list with a min-heap ---------------- */

export const llKSorted: Tracer = ({ arr, k = 2 }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { doubly: true });
  const input = ll.walk();
  const heap: number[] = [];
  const out: number[] = [];
  let idx = 0;
  const heapAux = () => [chips("min-heap (size ≤ k + 1)", [...heap].sort((a, b) => (ll.node(a).value as number) - (ll.node(b).value as number)).map((id) => ll.node(id).value as number))];
  const layout = (): Place => {
    const p: Place = new Map();
    out.forEach((id, i) => p.set(id, { row: 1, col: i }));
    input.forEach((id, i) => { if (!out.includes(id)) p.set(id, { row: 0, col: i }); });
    return p;
  };
  const view = (st: Record<number, CellState>, note: string, line: string) =>
    r.push(lf(ll, { place: layout(), rowLabels: ["input", "sorted output"], states: st, showNull: false }, note, line, { aux: heapAux() }));
  view({}, `every node is at most k = ${k} places from where it belongs, so the smallest remaining value is always among the next k + 1 nodes. keep those in a min-heap.`, "init");
  while (idx <= k && idx < input.length) { heap.push(input[idx]); idx++; }
  view(mark(heap, "pending"), `fill the heap with the first ${heap.length} nodes.`, "fill");
  while (heap.length) {
    heap.sort((a, b) => (ll.node(a).value as number) - (ll.node(b).value as number));
    const m = heap.shift()!;
    const tail = out[out.length - 1];
    out.push(m);
    ll.node(m).prev = tail ?? null;
    ll.node(m).next = null;
    if (tail !== undefined) ll.node(tail).next = m;
    view(mark(heap, "pending", mark(out, "confirmed", { [m]: "current" })), `pop the minimum (${ll.node(m).value}) and link it to the end of the output (both directions).`, "pop");
    if (idx < input.length) {
      heap.push(input[idx]);
      view(mark(heap, "pending", mark(out, "confirmed", { [input[idx]]: "comparing" })), `push the next input node (${ll.node(input[idx]).value}) into the heap.`, "push");
      idx++;
    }
  }
  ll.head = out[0] ?? null;
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, `sorted in O(n log k): ${ll.text()}.`, "done", { result: ll.text() }));
  return r.done();
};

/* ---------------- flatten a linked list (next + bottom) ---------------- */

export const llFlatten: Tracer = ({ arr, arr2 = [], arr3 = [] }) => {
  const r = new Rec();
  const ll = new LinkedList([]);
  const cols: number[][] = [];
  let at = 0;
  arr.forEach((h, c) => {
    const len = Math.max(0, (arr2[c] ?? 1) - 1);
    const colVals = [h, ...arr3.slice(at, at + len)];
    at += len;
    const colIds = colVals.map((v, rI) => ll.add(v, { row: rI, col: c }));
    colIds.forEach((id, i) => { if (i + 1 < colIds.length) ll.node(id).down = colIds[i + 1]; });
    cols.push(colIds);
  });
  cols.forEach((c, i) => { if (i + 1 < cols.length) ll.node(c[0]).next = cols[i + 1][0]; });
  const maxDepth = Math.max(...cols.map((c) => c.length));
  const R = maxDepth + 1;
  let result: number[] = [];
  let remainingCols = cols.map((c) => [...c]);
  const layout = (merged: number[], restA: number[], restB: number[], colIdx: number): Place => {
    const p: Place = new Map();
    remainingCols.forEach((c, ci) => { if (ci < colIdx) c.forEach((id, rI) => p.set(id, { row: rI, col: ci })); });
    if (colIdx >= 0 && colIdx < remainingCols.length) restA.forEach((id, i) => p.set(id, { row: i, col: colIdx }));
    let x = 0;
    merged.forEach((id) => p.set(id, { row: R, col: x++ }));
    if (restB.length) x++;
    restB.forEach((id) => p.set(id, { row: R, col: x++ }));
    return p;
  };
  const relink = (merged: number[], restA: number[], restB: number[]) => {
    for (const c of remainingCols) c.forEach((id) => { ll.node(id).next = null; });
    remainingCols.forEach((c, ci) => { if (c.length && ci + 1 < remainingCols.length && remainingCols[ci + 1].length) ll.node(c[0]).next = remainingCols[ci + 1][0]; });
    restA.forEach((id, i) => { ll.node(id).down = i + 1 < restA.length ? restA[i + 1] : null; ll.node(id).next = null; });
    [merged, restB].forEach((s) => s.forEach((id, i) => { ll.node(id).down = null; ll.node(id).next = i + 1 < s.length ? s[i + 1] : null; }));
  };
  const labels = [...Array(R).fill(""), "flattened (sorted)"];
  labels[0] = "main list → , sub-lists ↓";
  const show = (merged: number[], restA: number[], restB: number[], colIdx: number, st: Record<number, CellState>, note: string, line: string) => {
    relink(merged, restA, restB);
    r.push(lf(ll, { place: layout(merged, restA, restB, colIdx), rowLabels: labels, states: st, showNull: false }, note, line));
  };
  const last = remainingCols.length - 1;
  result = remainingCols[last];
  remainingCols = remainingCols.slice(0, last);
  show([], [], result, -1, mark(result, "confirmed"), "every sub-list is sorted. flatten from the right: the last column is already a sorted list — call it the result.", "recurse");
  for (let ci = remainingCols.length - 1; ci >= 0; ci--) {
    const a = [...remainingCols[ci]];
    const b = [...result];
    const merged: number[] = [];
    remainingCols = remainingCols.slice(0, ci + 1);
    show(merged, a, b, ci, mark(a, "pending", mark(b, "comparing")), `merge column ${ci + 1} (${a.map((id) => ll.node(id).value).join(", ")}) into the result.`, "merge");
    while (a.length && b.length) {
      const takeA = (ll.node(a[0]).value as number) < (ll.node(b[0]).value as number);
      const x = takeA ? a.shift()! : b.shift()!;
      merged.push(x);
      show(merged, a, b, ci, mark(merged, "confirmed", mark(a, "pending", mark(b, "comparing", { [x]: "current" }))), `${ll.node(x).value} is smaller → it goes next.`, "take");
    }
    result = [...merged, ...a, ...b];
    remainingCols = remainingCols.slice(0, ci);
    show([], [], result, -1, mark(result, "confirmed"), `column ${ci + 1} merged in. result: ${result.map((id) => ll.node(id).value).join(" → ")}.`, "rest");
  }
  const text = result.map((id) => ll.node(id).value).join(" → ");
  r.push({ ...r.frames[r.frames.length - 1], note: `flattened: ${text}.`, line: "done", result: text });
  return r.done();
};

/* ---------------- merge k sorted lists ---------------- */

export const llMergeK: Tracer = ({ arr, arr2 = [], arr3 = [] }) => {
  const r = new Rec();
  const ll = new LinkedList([]);
  const heads = [arr, arr2, arr3].filter((a) => a.length).map((a, i) => ll.chain(a, i));
  const lists = heads.map((h) => ll.walk(h));
  const out: number[] = [];
  const heap: number[] = [];
  const layout = (): Place => {
    const p: Place = new Map();
    lists.forEach((l, i) => l.forEach((id, c) => { if (!out.includes(id)) p.set(id, { row: i, col: c }); }));
    out.forEach((id, c) => p.set(id, { row: lists.length, col: c }));
    return p;
  };
  const labels = [...lists.map((_, i) => `list ${i + 1}`), "merged"];
  const heapAux = () => [chips("min-heap of list fronts", [...heap].sort((a, b) => (ll.node(a).value as number) - (ll.node(b).value as number)).map((id) => ll.node(id).value as number))];
  const view = (st: Record<number, CellState>, note: string, line: string) =>
    r.push(lf(ll, { place: layout(), rowLabels: labels, states: st, showNull: false }, note, line, { aux: heapAux() }));
  view({}, `${lists.length} sorted lists. the next smallest node is always one of the current fronts — keep the fronts in a min-heap.`, "init");
  heads.forEach((h) => { if (h !== null) heap.push(h); });
  view(mark(heap, "pending"), "push every list's first node into the heap.", "fill");
  while (heap.length) {
    heap.sort((a, b) => (ll.node(a).value as number) - (ll.node(b).value as number));
    const m = heap.shift()!;
    const nx = ll.node(m).next;
    const tail = out[out.length - 1];
    out.push(m);
    if (tail !== undefined) ll.node(tail).next = m;
    ll.node(m).next = null;
    view(mark(heap, "pending", mark(out, "confirmed", { [m]: "current" })), `pop the smallest front (${ll.node(m).value}) and link it onto the merged list.`, "pop");
    if (nx !== null) {
      heap.push(nx);
      view(mark(heap, "pending", mark(out, "confirmed", { [nx]: "comparing" })), `its list's next node (${ll.node(nx).value}) takes its place in the heap.`, "push");
    }
  }
  ll.head = out[0] ?? null;
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, `merged ${out.length} nodes in O(N log k): ${ll.text()}.`, "done", { result: ll.text() }));
  return r.done();
};
