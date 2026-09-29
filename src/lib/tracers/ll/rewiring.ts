import { mark } from "../../list";
import type { CellState, Tracer } from "../../types";
import { chips, LinkedList, lf, Rec } from "./common";

/* ---------------- reverse a linked list (flagship: three approaches) ---------------- */

export const llReverseStack: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const ids = ll.walk();
  const stack: number[] = [];
  r.push(lf(ll, { fixed: true, base: "inactive", pointers: { head: ll.head } }, "copy approach: read every value into an array, then walk the list again writing the values back in reverse order. the links never change.", "init", { aux: [chips("values (a stack)", [])] }));
  ids.forEach((id, i) => {
    stack.push(ll.node(id).value as number);
    r.push(lf(ll, { fixed: true, states: mark(ids.slice(0, i + 1), "pending", { [id]: "current" }), base: "inactive", pointers: { c: id } }, `pass 1: push ${ll.node(id).value} onto the stack.`, "collect", { aux: [chips("values (a stack)", stack)] }));
  });
  ids.forEach((id, i) => {
    const v = stack.pop()!;
    ll.node(id).value = v;
    r.push(lf(ll, { fixed: true, states: mark(ids.slice(0, i + 1), "confirmed", { [id]: "current" }), base: "inactive", pointers: { c: id } }, `pass 2: pop ${v} and write it into this node.`, "write", { aux: [chips("values (a stack)", stack)] }));
  });
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { head: ll.head } }, `reversed values: ${ll.text()}. two passes and n extra slots — the nodes themselves never moved.`, "done", { result: ll.text() }));
  return r.done();
};

export const llReverseRecursive: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const ids = ll.walk();
  const n = ids.length;
  const calls = (depth: number) => chips("call stack", ids.slice(0, depth).map((id) => `reverse(${ll.node(id).value})`), "pending", "empty");
  r.push(lf(ll, { fixed: true, base: "inactive", pointers: { head: ll.head } }, "recursive idea: reverse everything after the head first, then hook the head onto the end of that reversed part.", "base", { aux: [calls(0)] }));
  for (let d = 0; d < n - 1; d++) {
    r.push(lf(ll, { fixed: true, states: mark(ids.slice(0, d), "pending", { [ids[d]]: "current" }), base: "inactive", pointers: { head: ids[d] } }, `reverse(${ll.node(ids[d]).value}) can't finish yet — it first calls reverse on the rest of the list.`, "recurse", { aux: [calls(d + 1)] }));
  }
  const newHead = ids[n - 1];
  r.push(lf(ll, { fixed: true, states: mark(ids.slice(0, n - 1), "pending", { [newHead]: "confirmed" }), base: "inactive", pointers: { head: newHead } }, `base case: ${ll.node(newHead).value} is the last node — a one-node list is already reversed. it becomes the new head.`, "base", { aux: [calls(n)] }));
  for (let d = n - 2; d >= 0; d--) {
    const h = ids[d], nx = ids[d + 1];
    ll.node(nx).next = h;
    r.push(lf(ll, { fixed: true, states: mark(ids.slice(d + 1), "confirmed", mark(ids.slice(0, d), "pending", { [h]: "current" })), edges: { [nx]: "current" }, pointers: { head: h, newHead } }, `back in reverse(${ll.node(h).value}): make the next node point back at it (${ll.node(nx).value} → ${ll.node(h).value}).`, "flip", { aux: [calls(d + 1)] }));
    ll.node(h).next = null;
    r.push(lf(ll, { fixed: true, states: mark(ids.slice(d), "confirmed", mark(ids.slice(0, d), "pending")), edges: { [h]: "invalid" }, pointers: { newHead } }, `and cut ${ll.node(h).value}'s old forward link — it's now the tail of the reversed part.`, "cut", { aux: [calls(d)] }));
  }
  ll.head = newHead;
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { head: newHead } }, `every call has returned: ${ll.text()}. O(n) time, but also O(n) stack frames.`, "done", { aux: [calls(0)], result: ll.text() }));
  return r.done();
};

export const llReverseIterative: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const ids = ll.walk();
  let prev: number | null = null, curr: number | null = ll.head;
  const done = new Set<number>();
  const st = (): Record<number, CellState> => mark(done, "confirmed", curr !== null ? { [curr]: "current" } : {});
  r.push(lf(ll, { fixed: true, base: "inactive", states: st(), pointers: { prev, curr } }, "three pointers: prev (the reversed part, empty so far), curr (the node we're fixing) and next (so we don't lose the rest).", "init"));
  while (curr !== null) {
    const next: number | null = ll.node(curr).next;
    r.push(lf(ll, { fixed: true, base: "inactive", states: st(), pointers: { prev, curr, next } }, `save next = ${next === null ? "null" : ll.node(next).value} before we touch curr's link.`, "save"));
    ll.node(curr).next = prev;
    done.add(curr);
    r.push(lf(ll, { fixed: true, base: "inactive", states: st(), edges: { [curr]: "current" }, pointers: { prev, curr, next } }, `flip: ${ll.node(curr).value} now points back to ${prev === null ? "null" : ll.node(prev).value}.`, "flip"));
    prev = curr;
    curr = next;
    r.push(lf(ll, { fixed: true, base: "inactive", states: st(), pointers: { prev, curr } }, curr === null ? "curr fell off the end — every link is flipped." : `move both pointers one step: prev = ${ll.node(prev).value}, curr = ${ll.node(curr).value}.`, "advance"));
  }
  ll.head = prev;
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { head: prev } }, `prev is the new head: ${ll.text()}. one pass, three pointers, no extra memory.`, "done", { result: ll.text() }));
  void ids;
  return r.done();
};

/* ---------------- reverse in groups of k ---------------- */

export const llReverseK: Tracer = ({ arr, k = 2 }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  let newHead: number | null = null, prevTail: number | null = null, curr: number | null = ll.head;
  const done = new Set<number>();
  let g = 0;
  r.push(lf(ll, { fixed: true, base: "inactive", pointers: { curr } }, `reverse the list k = ${k} nodes at a time, then stitch each reversed group to the one before it.`, "init"));
  while (curr !== null) {
    g++;
    const groupHead: number = curr;
    const group: number[] = [];
    let prev: number | null = null, count = 0;
    r.push(lf(ll, { fixed: true, base: "inactive", states: mark(done, "confirmed", { [curr]: "current" }), pointers: { curr } }, `group ${g} starts at ${ll.node(curr).value}.`, "group"));
    while (curr !== null && count < k) {
      const next: number | null = ll.node(curr).next;
      ll.node(curr).next = prev;
      group.push(curr);
      prev = curr;
      curr = next;
      count++;
      r.push(lf(ll, { fixed: true, base: "inactive", states: mark(done, "confirmed", mark(group, "pending")), edges: { [prev]: "current" }, pointers: { prev, curr } }, `flip ${ll.node(prev).value} inside group ${g} (${count}/${k}).`, "flip"));
    }
    if (newHead === null) newHead = prev;
    if (prevTail !== null) ll.node(prevTail).next = prev;
    group.forEach((id) => done.add(id));
    r.push(lf(ll, { fixed: true, base: "inactive", states: mark(done, "confirmed"), edges: prevTail !== null ? { [prevTail]: "current" } : {}, pointers: { head: newHead, curr } }, prevTail === null ? `group ${g} reversed; its new first node ${ll.node(prev!).value} is the answer's head.` : `link the previous group's tail to ${ll.node(prev!).value}, this group's new front.`, "link"));
    prevTail = groupHead;
  }
  ll.head = newHead;
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { head: newHead } }, `all groups reversed: ${ll.text()}.`, "done", { result: ll.text() }));
  return r.done();
};

/* ---------------- move last element to front ---------------- */

export const llMoveLast: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  if (!ll.head || ll.node(ll.head).next === null) {
    r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, "zero or one node — nothing to move.", "init", { result: ll.text() }));
    return r.done();
  }
  let secLast: number | null = null, last = ll.head;
  r.push(lf(ll, { pointers: { head: ll.head, last } }, "walk to the last node, remembering the one before it.", "init"));
  while (ll.node(last).next !== null) {
    secLast = last;
    last = ll.node(last).next!;
    r.push(lf(ll, { states: { [secLast]: "pending", [last]: "current" }, pointers: { secLast, last } }, `secLast = ${ll.node(secLast).value}, last = ${ll.node(last).value}.`, "walk"));
  }
  ll.node(secLast!).next = null;
  r.push(lf(ll, { layoutFrom: [ll.head, last], rowLabels: ["list", "detached"], states: { [secLast!]: "pending", [last]: "current" }, edges: { [secLast!]: "invalid" }, pointers: { secLast, last } }, `cut: ${ll.node(secLast!).value} becomes the new tail.`, "cut"));
  ll.node(last).next = ll.head;
  ll.head = last;
  r.push(lf(ll, { states: { [last]: "confirmed" }, edges: { [last]: "current" }, pointers: { head: last } }, `link ${ll.node(last).value} in front of the old head — it's the new head: ${ll.text()}.`, "link"));
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, "done in one pass and two pointer changes.", "done", { result: ll.text() }));
  return r.done();
};

/* ---------------- delete from a circular linked list ---------------- */

export const llCircularDelete: Tracer = ({ arr, target = 0 }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { circular: true });
  let head = ll.head!;
  let curr = head, prev: number | null = null;
  r.push(lf(ll, { pointers: { head, curr } }, `circular list: the tail links back to the head. find ${target} and unlink it.`, "init"));
  while (ll.node(curr).value !== target) {
    r.push(lf(ll, { states: { [curr]: "comparing" }, pointers: { head, prev, curr } }, `${ll.node(curr).value} isn't ${target}.`, "search"));
    if (ll.node(curr).next === head) {
      r.push(lf(ll, { base: "inactive", pointers: { head } }, `we're back at the head — ${target} isn't in the list. nothing changes.`, "missing", { result: "not found" }));
      return r.done();
    }
    prev = curr;
    curr = ll.node(curr).next!;
  }
  r.push(lf(ll, { states: { [curr]: "invalid" }, pointers: { head, prev, curr } }, `found ${target}.`, "search"));
  if (curr === head && ll.node(curr).next === head) {
    ll.nodes.delete(curr);
    ll.head = null;
    r.push(lf(ll, {}, "it was the only node — the list is now empty.", "only", { result: "empty list" }));
    return r.done();
  }
  if (curr === head) {
    let t = head;
    while (ll.node(t).next !== head) t = ll.node(t).next!;
    r.push(lf(ll, { states: { [curr]: "invalid", [t]: "pending" }, pointers: { head, tail: t } }, "deleting the head: walk to the tail, since the tail's link must move too.", "head"));
    head = ll.node(curr).next!;
    ll.node(t).next = head;
    ll.head = head;
    ll.nodes.delete(curr);
    r.push(lf(ll, { states: { [head]: "confirmed" }, edges: { [t]: "current" }, pointers: { head } }, `the tail now points to ${ll.node(head).value}, the new head.`, "head"));
  } else {
    ll.node(prev!).next = ll.node(curr).next;
    r.push(lf(ll, { layoutFrom: [head], states: { [curr]: "invalid" }, edges: { [prev!]: "current" }, pointers: { head, prev }, place: undefined }, `${ll.node(prev!).value} now skips over ${target}.`, "unlink"));
    ll.nodes.delete(curr);
  }
  r.push(lf(ll, { base: "confirmed", pointers: { head } }, `done: ${ll.text()}.`, "done", { result: ll.text() }));
  return r.done();
};

/* ---------------- reverse a doubly linked list ---------------- */

export const llReverseDLL: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { doubly: true });
  let curr: number | null = ll.head, last: number | null = null;
  const done = new Set<number>();
  r.push(lf(ll, { fixed: true, base: "inactive", pointers: { head: ll.head, curr } }, "every node already knows both neighbours. reversing = swapping each node's prev and next.", "init"));
  while (curr !== null) {
    const n = ll.node(curr);
    [n.prev, n.next] = [n.next, n.prev];
    done.add(curr);
    r.push(lf(ll, { fixed: true, base: "inactive", states: mark(done, "confirmed", { [curr]: "current" }), edges: { [curr]: "current" }, pointers: { curr } }, `swap prev and next of ${n.value}. its "next" now points ${n.next === null ? "to null" : `back to ${ll.node(n.next).value}`}.`, "swap"));
    last = curr;
    curr = n.prev;
    r.push(lf(ll, { fixed: true, base: "inactive", states: mark(done, "confirmed", curr !== null ? { [curr]: "current" } : {}), pointers: { curr } }, curr === null ? "no more nodes." : `move on — the old next is now stored in prev, so follow prev to ${ll.node(curr).value}.`, "advance"));
  }
  ll.head = last;
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { head: last } }, `the last node visited is the new head: ${ll.text()}.`, "done", { result: ll.text() }));
  return r.done();
};

/* ---------------- rotate a doubly linked list by N ---------------- */

export const llRotateDLL: Tracer = ({ arr, k = 1 }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { doubly: true });
  let head = ll.head!;
  if (k === 0) {
    r.push(lf(ll, { base: "confirmed", pointers: { head } }, "rotating by 0 changes nothing.", "init", { result: ll.text() }));
    return r.done();
  }
  let curr: number | null = head;
  r.push(lf(ll, { pointers: { head, curr } }, `rotate left by ${k}: the first ${k} nodes move to the end, in order.`, "init"));
  for (let i = 1; i < k && curr !== null; i++) {
    curr = ll.node(curr).next;
    r.push(lf(ll, { states: curr !== null ? { [curr]: "current" } : {}, pointers: { head, curr } }, `walk to node ${i + 1}.`, "walk"));
  }
  if (curr === null || ll.node(curr).next === null) {
    r.push(lf(ll, { base: "confirmed", pointers: { head } }, `N is at least the length — rotating by the full length changes nothing.`, "walk", { result: ll.text() }));
    return r.done();
  }
  const nth: number = curr;
  let tail = nth;
  while (ll.node(tail).next !== null) tail = ll.node(tail).next!;
  r.push(lf(ll, { states: { [nth]: "pending", [tail]: "comparing" }, pointers: { nth, tail } }, `the ${k}th node (${ll.node(nth).value}) will become the new tail; find the current tail (${ll.node(tail).value}).`, "tail"));
  ll.node(tail).next = head;
  ll.node(head).prev = tail;
  r.push(lf(ll, { fixed: true, states: { [nth]: "pending", [tail]: "comparing" }, edges: { [tail]: "current" }, pointers: { head, nth, tail } }, `join the tail to the old head — for a moment the list is a circle.`, "join"));
  head = ll.node(nth).next!;
  ll.node(head).prev = null;
  ll.node(nth).next = null;
  ll.head = head;
  r.push(lf(ll, { states: { [head]: "confirmed", [nth]: "pending" }, pointers: { head } }, `break the circle after ${ll.node(nth).value}: ${ll.node(head).value} is the new head.`, "cut"));
  r.push(lf(ll, { base: "confirmed", pointers: { head } }, `rotated: ${ll.text()}.`, "done", { result: ll.text() }));
  return r.done();
};

/* ---------------- reverse a doubly linked list in groups of k ---------------- */

export const llReverseDLLGroups: Tracer = ({ arr, k = 2 }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { doubly: true });
  let newHead: number | null = null, prevTail: number | null = null, curr: number | null = ll.head;
  const done = new Set<number>();
  let g = 0;
  r.push(lf(ll, { fixed: true, base: "inactive", pointers: { curr } }, `reverse every group of k = ${k} nodes; both prev and next links must be fixed.`, "init"));
  while (curr !== null) {
    g++;
    const groupHead: number = curr;
    const group: number[] = [];
    let prev: number | null = null, count = 0;
    while (curr !== null && count < k) {
      const n = ll.node(curr);
      const next: number | null = n.next;
      n.next = prev;
      n.prev = next;
      group.push(curr);
      prev = curr;
      curr = next;
      count++;
      r.push(lf(ll, { fixed: true, base: "inactive", states: mark(done, "confirmed", mark(group, "pending")), edges: { [prev]: "current" }, pointers: { prev, curr } }, `group ${g}: swap the links of ${n.value}.`, "flip"));
    }
    ll.node(prev!).prev = prevTail;
    if (newHead === null) newHead = prev;
    if (prevTail !== null) ll.node(prevTail).next = prev;
    group.forEach((id) => done.add(id));
    r.push(lf(ll, { fixed: true, base: "inactive", states: mark(done, "confirmed"), edges: prevTail !== null ? { [prevTail]: "current" } : {}, pointers: { head: newHead, curr } }, prevTail === null ? `group ${g} done — ${ll.node(prev!).value} is the new head.` : `stitch group ${g} after the previous group (both directions).`, "link"));
    prevTail = groupHead;
  }
  ll.head = newHead;
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { head: newHead } }, `done: ${ll.text()}.`, "done", { result: ll.text() }));
  return r.done();
};

/* ---------------- reverse in less than O(n)? (direction flag on a DLL) ---------------- */

export const llReverseFlag: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { doubly: true });
  const ids = ll.walk();
  let head = ids[0], tail = ids[ids.length - 1];
  let reversed = false;
  r.push(lf(ll, { fixed: true, pointers: { head, tail } }, "a doubly linked list that also stores its tail. we'll 'reverse' it without touching a single node.", "init", { vars: { reversed } }));
  [head, tail] = [tail, head];
  reversed = true;
  r.push(lf(ll, { fixed: true, states: { [head]: "confirmed", [tail]: "pending" }, pointers: { head, tail } }, "reverse(): swap head and tail and flip one boolean. that's O(1) — no links changed.", "flip", { vars: { reversed } }));
  const seen: number[] = [];
  for (let c: number | null = head; c !== null; c = reversed ? ll.node(c).prev : ll.node(c).next) {
    seen.push(c);
    r.push(lf(ll, { fixed: true, states: mark(seen, "confirmed", { [c]: "current" }), pointers: { head, tail, walk: c } }, `walking from the new head follows prev links: ${seen.map((id) => ll.node(id).value).join(" → ")}.`, "walk", { vars: { reversed } }));
  }
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { head, tail } }, "readers see the reversed order immediately. the catch: every traversal must check the flag, and a plain singly linked list can't do this — it has no prev links.", "done", { vars: { reversed }, result: seen.map((id) => ll.node(id).value).join(" → ") }));
  return r.done();
};

/* ---------------- delete nodes that have a greater value on the right ---------------- */

export const llDeleteGreaterRight: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const rev = (from: number | null) => {
    let prev: number | null = null, c = from;
    while (c !== null) { const nx: number | null = ll.node(c).next; ll.node(c).next = prev; prev = c; c = nx; }
    return prev;
  };
  r.push(lf(ll, { pointers: { head: ll.head } }, "a node must go if anything to its right is bigger. scanning right-to-left makes that easy: reverse, keep a running max, reverse back.", "init"));
  ll.head = rev(ll.head);
  r.push(lf(ll, { base: "pending", pointers: { head: ll.head } }, `step 1: reverse the list → ${ll.text()}. now "to the right" means "already seen".`, "reverse"));
  let maxNode = ll.head!, curr: number | null = ll.head;
  const kept = new Set<number>([maxNode]);
  r.push(lf(ll, { base: "inactive", states: { [maxNode]: "confirmed" }, pointers: { max: maxNode, curr } }, `the first node always stays; max = ${ll.node(maxNode).value}.`, "init"));
  while (curr !== null && ll.node(curr).next !== null) {
    const nx = ll.node(curr).next!;
    if ((ll.node(nx).value as number) < (ll.node(maxNode).value as number)) {
      r.push(lf(ll, { base: "inactive", states: mark(kept, "confirmed", { [nx]: "invalid" }), pointers: { max: maxNode, curr } }, `${ll.node(nx).value} < max ${ll.node(maxNode).value} → a bigger value sits to its right in the original. delete it.`, "check"));
      ll.node(curr).next = ll.node(nx).next;
      ll.nodes.delete(nx);
      r.push(lf(ll, { base: "inactive", states: mark(kept, "confirmed"), edges: { [curr]: "current" }, pointers: { max: maxNode, curr } }, `${ll.node(curr).value} now skips it.`, "delete"));
    } else {
      curr = nx;
      maxNode = curr;
      kept.add(curr);
      r.push(lf(ll, { base: "inactive", states: mark(kept, "confirmed", { [curr]: "current" }), pointers: { max: maxNode, curr } }, `${ll.node(curr).value} ≥ max — keep it, and it's the new max.`, "keep"));
    }
  }
  ll.head = rev(ll.head);
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, `step 3: reverse back → ${ll.text()}. O(n) time, O(1) space.`, "restore", { result: ll.text() }));
  return r.done();
};

/* ---------------- split into lists by value (sort 0/1/2, segregate even/odd) ---------------- */

function bucketTracer(arr: number[], buckets: { name: string; test: (v: number) => boolean; line: string; why: string }[], intro: string, joinLine: string) {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const order = ll.walk();
  const lists: number[][] = buckets.map(() => []);
  const layout = (remainingFrom: number) => {
    const place = new Map<number, { row: number; col: number }>();
    order.slice(remainingFrom).forEach((id, i) => place.set(id, { row: 0, col: i + remainingFrom }));
    lists.forEach((l, b) => l.forEach((id, i) => place.set(id, { row: b + 1, col: i })));
    return place;
  };
  const rowLabels = ["still to place", ...buckets.map((b) => b.name)];
  r.push(lf(ll, { place: layout(0), rowLabels, pointers: { curr: ll.head } }, intro, "init"));
  order.forEach((id, i) => {
    const v = ll.node(id).value as number;
    const b = buckets.findIndex((x) => x.test(v));
    const tailBefore = lists[b][lists[b].length - 1];
    if (tailBefore !== undefined) ll.node(tailBefore).next = id;
    lists[b].push(id);
    const next = i + 1 < order.length ? order[i + 1] : null;
    ll.node(id).next = null;
    r.push(lf(ll, { place: layout(i + 1), rowLabels, states: { [id]: "current" }, edges: tailBefore !== undefined ? { [tailBefore]: "current" } : {}, pointers: { curr: next }, showNull: false }, `${v} ${buckets[b].why} → append it to the ${buckets[b].name} list.`, buckets[b].line));
  });
  const nonEmpty = lists.filter((l) => l.length);
  for (let i = 0; i + 1 < nonEmpty.length; i++) ll.node(nonEmpty[i][nonEmpty[i].length - 1]).next = nonEmpty[i + 1][0];
  ll.head = nonEmpty.length ? nonEmpty[0][0] : null;
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, `join the lists end to end: ${ll.text()}. every node was moved once and no value was overwritten.`, joinLine, { result: ll.text() }));
  return r.done();
}

export const llSort012: Tracer = ({ arr }) =>
  bucketTracer(arr, [
    { name: "0s", test: (v) => v === 0, line: "zero", why: "is a 0" },
    { name: "1s", test: (v) => v === 1, line: "one", why: "is a 1" },
    { name: "2s", test: (v) => v === 2, line: "two", why: "is a 2" },
  ], "walk once and move every node into one of three lists — 0s, 1s, 2s — then join them.", "join");

export const llEvenOdd: Tracer = ({ arr }) =>
  bucketTracer(arr, [
    { name: "even", test: (v) => v % 2 === 0, line: "even", why: "is even" },
    { name: "odd", test: (v) => v % 2 !== 0, line: "odd", why: "is odd" },
  ], "walk once, moving each node to the end of an even list or an odd list (order is kept), then put the odd list after the even one.", "join");

/* ---------------- remove duplicates from a sorted list ---------------- */

export const llDedupSorted: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  let curr: number | null = ll.head;
  let removed = 0;
  r.push(lf(ll, { pointers: { curr } }, "sorted means equal values sit next to each other, so each node only needs to look at its neighbour.", "init"));
  while (curr !== null && ll.node(curr).next !== null) {
    const nx = ll.node(curr).next!;
    if (ll.node(nx).value === ll.node(curr).value) {
      r.push(lf(ll, { states: { [curr]: "current", [nx]: "invalid" }, pointers: { curr } }, `${ll.node(nx).value} repeats ${ll.node(curr).value} — skip it.`, "skip"));
      ll.node(curr).next = ll.node(nx).next;
      ll.nodes.delete(nx);
      removed++;
      r.push(lf(ll, { states: { [curr]: "current" }, edges: { [curr]: "current" }, pointers: { curr } }, `${ll.node(curr).value} now links past the duplicate. stay here — there may be more copies.`, "skip"));
    } else {
      r.push(lf(ll, { states: { [curr]: "confirmed", [nx]: "comparing" }, pointers: { curr } }, `${ll.node(nx).value} is different — move on.`, "move"));
      curr = nx;
    }
  }
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, `removed ${removed} duplicate${removed === 1 ? "" : "s"}: ${ll.text()}.`, "done", { result: ll.text() }));
  return r.done();
};
