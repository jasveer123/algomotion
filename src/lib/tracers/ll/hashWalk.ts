import { mark } from "../../list";
import type { CellState, Tracer } from "../../types";
import { ch, chips, LinkedList, lf, Rec } from "./common";

/* ---------------- remove duplicates from an unsorted list ---------------- */

export const llDedupNested: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  let comps = 0;
  r.push(lf(ll, { pointers: { outer: ll.head } }, "for every node, scan everything after it and unlink any later copy of its value.", "init"));
  for (let o: number | null = ll.head; o !== null; o = ll.node(o).next) {
    let p = o;
    while (ll.node(p).next !== null) {
      const q = ll.node(p).next!;
      comps++;
      if (ll.node(q).value === ll.node(o).value) {
        r.push(lf(ll, { states: { [o]: "current", [q]: "invalid" }, pointers: { outer: o, inner: q } }, `${ll.node(q).value} repeats ${ll.node(o).value} — unlink it.`, "drop", { vars: { comparisons: comps } }));
        ll.node(p).next = ll.node(q).next;
        ll.nodes.delete(q);
      } else {
        r.push(lf(ll, { states: { [o]: "current", [q]: "comparing" }, pointers: { outer: o, inner: q } }, `${ll.node(q).value} ≠ ${ll.node(o).value}.`, "scan", { vars: { comparisons: comps } }));
        p = q;
      }
    }
  }
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, `${ll.text()} after ${comps} comparisons.`, "done", { vars: { comparisons: comps }, result: ll.text() }));
  return r.done();
};

export const llDedupHash: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const seen: number[] = [];
  let prev: number | null = null, curr: number | null = ll.head;
  r.push(lf(ll, { pointers: { prev, curr } }, "walk once; a hash set remembers values already kept. a value seen before is unlinked.", "init", { aux: [chips("seen values", [])] }));
  while (curr !== null) {
    const v = ll.node(curr).value as number;
    const next: number | null = ll.node(curr).next;
    if (seen.includes(v)) {
      r.push(lf(ll, { states: { [curr]: "invalid" }, pointers: { prev, curr } }, `${v} is already in the set → unlink this copy.`, "drop", { aux: [chips("seen values", seen)] }));
      ll.node(prev!).next = next;
      ll.nodes.delete(curr);
      r.push(lf(ll, { edges: { [prev!]: "current" }, pointers: { prev, curr: next } }, `${ll.node(prev!).value} now skips it.`, "drop", { aux: [chips("seen values", seen)] }));
    } else {
      seen.push(v);
      prev = curr;
      r.push(lf(ll, { states: { [curr]: "confirmed" }, pointers: { prev, curr } }, `${v} is new — keep it and add it to the set.`, "keep", { aux: [chips("seen values", seen)] }));
    }
    curr = next;
  }
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, `one pass: ${ll.text()}. first occurrences keep their order.`, "done", { aux: [chips("seen values", seen)], result: ll.text() }));
  return r.done();
};

/* ---------------- intersection point of two lists (Y shape) ---------------- */

export const llIntersectionPoint: Tracer = ({ arr, arr2 = [], arr3 = [] }) => {
  const r = new Rec();
  const ll = new LinkedList([]);
  const offset = Math.max(arr.length, arr2.length);
  const aOwn = arr.map((v, i) => ll.add(v, { row: 0, col: offset - arr.length + i }));
  const bOwn = arr2.map((v, i) => ll.add(v, { row: 2, col: offset - arr2.length + i }));
  const shared = arr3.map((v, i) => ll.add(v, { row: 1, col: offset + i }));
  const link = (ids: number[]) => ids.forEach((id, i) => { if (i + 1 < ids.length) ll.node(id).next = ids[i + 1]; });
  link([...aOwn, ...shared]);
  link([...bOwn, ...shared]);
  const A = aOwn[0] ?? shared[0] ?? null, B = bOwn[0] ?? shared[0] ?? null;
  let p: number | null = A, q: number | null = B;
  let steps = 0;
  const labels = ["list a", "shared tail", "list b"];
  const st = (): Record<number, CellState> => ({ ...(p !== null ? { [p]: "current" } : {}), ...(q !== null ? { [q]: p === q ? "confirmed" : "comparing" } : {}) });
  r.push(lf(ll, { fixed: true, rowLabels: labels, states: st(), pointers: { p, q } }, "two pointers start at the two heads. when one runs off the end, it restarts at the OTHER head. both then travel a + b + shared steps, so they reach the join together.", "init"));
  while (p !== q && steps < 100) {
    const pNull = p === null, qNull = q === null;
    p = p === null ? B : ll.node(p).next;
    q = q === null ? A : ll.node(q).next;
    steps++;
    r.push(lf(ll, { fixed: true, rowLabels: labels, states: st(), pointers: { p, q } }, `${pNull ? "p hit the end → jump to b's head" : "p steps forward"}; ${qNull ? "q hit the end → jump to a's head" : "q steps forward"}.${p === q ? " they're on the same node!" : ""}`, "step"));
  }
  const found = p;
  r.push(lf(ll, { fixed: true, rowLabels: labels, states: found !== null ? mark(shared.slice(shared.indexOf(found)), "confirmed") : {}, pointers: { p, q } }, found !== null ? `the lists meet at ${ll.node(found).value}.` : "both reached null together — the lists never meet.", "done", { result: found !== null ? `intersection at ${ll.node(found).value}` : "no intersection" }));
  return r.done();
};

/* ---------------- pairs with a given sum in a sorted DLL ---------------- */

export const llPairsDLL: Tracer = ({ arr, target = 0 }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { doubly: true });
  let first: number | null = ll.head, second: number | null = ll.tail();
  const pairs: string[] = [];
  const aux = () => [chips("pairs", pairs, "confirmed", "none yet")];
  r.push(lf(ll, { pointers: { first, second }, states: { [first!]: "current", [second!]: "comparing" } }, `sorted and doubly linked: start at both ends. too small → move first forward; too big → move second back (using prev).`, "init", { aux: aux() }));
  while (first !== null && second !== null && first !== second && ll.node(second).next !== first) {
    const s = (ll.node(first).value as number) + (ll.node(second).value as number);
    if (s === target) {
      pairs.push(`(${ll.node(first).value}, ${ll.node(second).value})`);
      r.push(lf(ll, { states: { [first]: "confirmed", [second]: "confirmed" }, pointers: { first, second } }, `${ll.node(first).value} + ${ll.node(second).value} = ${target} ✓ record it, move both inward.`, "hit", { aux: aux() }));
      first = ll.node(first).next; second = ll.node(second).prev;
    } else if (s < target) {
      r.push(lf(ll, { states: { [first]: "invalid", [second]: "comparing" }, pointers: { first, second } }, `${s} < ${target} → first moves forward.`, "less", { aux: aux() }));
      first = ll.node(first).next;
    } else {
      r.push(lf(ll, { states: { [first]: "comparing", [second]: "invalid" }, pointers: { first, second } }, `${s} > ${target} → second moves back.`, "more", { aux: aux() }));
      second = ll.node(second).prev;
    }
  }
  r.push(lf(ll, { base: "inactive", pointers: { first, second } }, `the pointers crossed. ${pairs.length} pair${pairs.length === 1 ? "" : "s"} found.`, "done", { aux: aux(), result: pairs.length ? pairs.join(" ") : "no pairs" }));
  return r.done();
};

/* ---------------- count triplets in a sorted DLL ---------------- */

export const llTripletsDLL: Tracer = ({ arr, target = 0 }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { doubly: true });
  const last = ll.tail()!;
  let count = 0;
  r.push(lf(ll, { pointers: { head: ll.head, last } }, `fix one node, then find pairs after it that complete the sum ${target} — the same two-pointer squeeze as pair sum.`, "init", { vars: { count } }));
  for (let c: number | null = ll.head; c !== null; c = ll.node(c).next) {
    let l = ll.node(c).next, rt: number | null = last;
    r.push(lf(ll, { states: { [c]: "current" }, pointers: { fix: c, l, r: rt } }, `fix ${ll.node(c).value}: we need two later values adding to ${target - (ll.node(c).value as number)}.`, "fix", { vars: { count } }));
    while (l !== null && rt !== null && l !== rt && ll.node(rt).next !== l) {
      const s = (ll.node(c).value as number) + (ll.node(l).value as number) + (ll.node(rt).value as number);
      if (s === target) {
        count++;
        r.push(lf(ll, { states: { [c]: "current", [l]: "confirmed", [rt]: "confirmed" }, pointers: { fix: c, l, r: rt } }, `${ll.node(c).value} + ${ll.node(l).value} + ${ll.node(rt).value} = ${target} ✓ count = ${count}.`, "hit", { vars: { count } }));
        l = ll.node(l).next; rt = ll.node(rt).prev;
      } else if (s < target) {
        r.push(lf(ll, { states: { [c]: "current", [l]: "invalid", [rt]: "comparing" }, pointers: { fix: c, l, r: rt } }, `${s} is too small → l moves right.`, "less", { vars: { count } }));
        l = ll.node(l).next;
      } else {
        r.push(lf(ll, { states: { [c]: "current", [l]: "comparing", [rt]: "invalid" }, pointers: { fix: c, l, r: rt } }, `${s} is too big → r moves left.`, "more", { vars: { count } }));
        rt = ll.node(rt).prev;
      }
    }
  }
  r.push(lf(ll, { base: "confirmed" }, `every node was tried as the fixed one. ${count} triplet${count === 1 ? "" : "s"} sum to ${target}.`, "done", { vars: { count }, result: `count = ${count}` }));
  return r.done();
};

/* ---------------- clone a list with random pointers ---------------- */

export const llCloneRandom: Tracer = ({ arr, arr2 = [] }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const orig = ll.walk();
  orig.forEach((id, i) => { const t = arr2[i] ?? -1; ll.node(id).random = t >= 0 && t < orig.length ? orig[t] : null; });
  const copies: number[] = [];
  const place = () => {
    const p = new Map<number, { row: number; col: number }>();
    orig.forEach((id, i) => p.set(id, { row: 0, col: i * 2 }));
    copies.forEach((id, i) => p.set(id, { row: 1, col: i * 2 + 1 }));
    return p;
  };
  const labels = ["original", "copies"];
  r.push(lf(ll, { place: place(), rowLabels: labels }, "each node has next and a random pointer (dashed). trick: weave a copy right after every original, so an original's random.next is its copy's random target.", "init"));
  orig.forEach((id) => {
    const cp = ll.add(ll.node(id).value, { row: 1, col: 0 }, "copy");
    ll.node(cp).next = ll.node(id).next;
    ll.node(id).next = cp;
    copies.push(cp);
    r.push(lf(ll, { place: place(), rowLabels: labels, states: mark(copies, "pending", { [cp]: "current" }), edges: { [id]: "current" } }, `pass 1: insert a copy of ${ll.node(id).value} right after it.`, "weave"));
  });
  orig.forEach((id, i) => {
    const rn = ll.node(id).random;
    const cp = copies[i];
    ll.node(cp).random = rn === null ? null : ll.node(rn).next;
    r.push(lf(ll, { place: place(), rowLabels: labels, states: mark(copies, "pending", { [cp]: "current", ...(rn !== null ? { [ll.node(rn).next!]: "comparing" } : {}) }) }, rn === null ? `pass 2: ${ll.node(id).value}'s random is null, so its copy's is too.` : `pass 2: copy of ${ll.node(id).value}.random = (original's random ${ll.node(rn).value}).next = the copy of ${ll.node(rn).value}.`, "random"));
  });
  orig.forEach((id, i) => {
    const cp = copies[i];
    ll.node(id).next = ll.node(cp).next;
    ll.node(cp).next = ll.node(cp).next === null ? null : ll.node(ll.node(cp).next!).next;
    r.push(lf(ll, { place: place(), rowLabels: labels, states: mark(copies.slice(0, i + 1), "confirmed"), edges: { [id]: "current", [cp]: "current" } }, `pass 3: unweave — ${ll.node(id).value} points to the next original, its copy to the next copy.`, "split"));
  });
  r.push(lf(ll, { place: place(), rowLabels: labels, states: mark(copies, "confirmed") }, `two independent lists: the copy has the same values and the same random structure, built with O(1) extra space.`, "done", { result: copies.map((id) => ll.node(id).value).join(" → ") }));
  return r.done();
};

/* ---------------- first non-repeating character in a stream ---------------- */

export const llFirstUnique: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList([], { doubly: true });
  const stream = arr.map(ch);
  const inList = new Map<string, number>();
  const repeated = new Set<string>();
  let out = "";
  const view = (i: number, st: Record<number, CellState>, note: string, line: string) =>
    r.push({
      rows: [{ label: "stream", values: stream, states: stream.map((_, x) => (x === i ? "current" : x < i ? "pending" : "inactive")) }],
      lists: [ll.view({ rowLabels: ["candidates (doubly linked, oldest first)"], states: st, pointers: { head: ll.head } })],
      pointers: i >= 0 ? [{ label: "i", index: i }] : [],
      note,
      line,
      aux: [chips("repeated", [...repeated], "invalid", "none"), chips("output so far", out ? [out] : [], "confirmed", "—")],
    });
  view(-1, {}, "keep every character seen exactly once in a doubly linked list, oldest first, plus a map from character to its node. the answer at each step is the list's head.", "init");
  stream.forEach((c, i) => {
    if (!repeated.has(c)) {
      if (!inList.has(c)) {
        const id = ll.add(c, { row: 0, col: 0 });
        const t = ll.tail();
        if (t === null) ll.head = id;
        else { ll.node(t).next = id; ll.node(id).prev = t; }
        inList.set(c, id);
        view(i, { [id]: "current" }, `'${c}' is new → append it to the list.`, "add");
      } else {
        const id = inList.get(c)!;
        const n = ll.node(id);
        if (n.prev !== null) ll.node(n.prev).next = n.next; else ll.head = n.next;
        if (n.next !== null) ll.node(n.next).prev = n.prev;
        view(i, { [id]: "invalid" }, `'${c}' is seen a second time → unlink its node in O(1) (the map gives us the node directly).`, "remove");
        ll.nodes.delete(id);
        inList.delete(c);
        repeated.add(c);
      }
    } else {
      view(i, {}, `'${c}' already repeated before — nothing to change.`, "remove");
    }
    const ans = ll.head !== null ? String(ll.node(ll.head).value) : "#";
    out += ans;
    view(i, ll.head !== null ? { [ll.head]: "confirmed" } : {}, ll.head !== null ? `first non-repeating so far: '${ans}' (the list's head).` : "no character is unique right now → output '#'.", "answer");
  });
  view(stream.length, {}, `output for every prefix: ${out}.`, "done");
  r.frames[r.frames.length - 1].result = out;
  return r.done();
};
