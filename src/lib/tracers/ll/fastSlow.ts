import { mark } from "../../list";
import type { Tracer } from "../../types";
import { chips, LinkedList, lf, Rec, withLoop } from "./common";

const loopNote = (pos: number) => (pos >= 0 ? `the tail links back to index ${pos}, making a loop.` : "no loop: the tail points to null.");

/* ---------------- detect a loop (flagship: three approaches) ---------------- */

export const llLoopHash: Tracer = ({ arr, k = -1 }) => {
  const r = new Rec();
  const { ll } = withLoop(arr, k);
  const seen: number[] = [];
  r.push(lf(ll, { fixed: true, pointers: { curr: ll.head } }, `hash-set approach: remember every node we've stood on. ${loopNote(k)}`, "init", { aux: [chips("visited nodes", [])] }));
  for (let c: number | null = ll.head; c !== null; c = ll.node(c).next) {
    if (seen.includes(c)) {
      r.push(lf(ll, { fixed: true, states: mark(seen, "pending", { [c]: "invalid" }), pointers: { curr: c } }, `${ll.node(c).value} is already in the set — we've been here before, so there's a loop.`, "hit", { aux: [chips("visited nodes", seen.map((id) => ll.node(id).value as number))], result: "loop found" }));
      return r.done();
    }
    seen.push(c);
    r.push(lf(ll, { fixed: true, states: mark(seen, "pending", { [c]: "current" }), pointers: { curr: c } }, `${ll.node(c).value} is new — add it to the set.`, "store", { aux: [chips("visited nodes", seen.map((id) => ll.node(id).value as number))] }));
  }
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { curr: null } }, "we reached null, so the list ends — no loop.", "done", { aux: [chips("visited nodes", seen.map((id) => ll.node(id).value as number))], result: "no loop" }));
  return r.done();
};

export const llLoopMark: Tracer = ({ arr, k = -1 }) => {
  const r = new Rec();
  const { ll } = withLoop(arr, k);
  const visited = new Set<number>();
  r.push(lf(ll, { fixed: true, pointers: { curr: ll.head } }, `marking approach: give every node a "visited" flag and set it as we go. ${loopNote(k)}`, "init"));
  for (let c: number | null = ll.head; c !== null; c = ll.node(c).next) {
    if (visited.has(c)) {
      r.push(lf(ll, { fixed: true, states: mark(visited, "pending", { [c]: "invalid" }), pointers: { curr: c } }, `${ll.node(c).value} is already flagged — loop!`, "hit", { result: "loop found" }));
      return r.done();
    }
    visited.add(c);
    ll.node(c).tag = "✓";
    r.push(lf(ll, { fixed: true, states: mark(visited, "pending", { [c]: "current" }), pointers: { curr: c } }, `flag ${ll.node(c).value} as visited.`, "store"));
  }
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { curr: null } }, "reached null — no loop. (every node now carries an extra flag we'd have to clear.)", "done", { result: "no loop" }));
  return r.done();
};

export const llLoopFloyd: Tracer = ({ arr, k = -1 }) => {
  const r = new Rec();
  const { ll } = withLoop(arr, k);
  let slow: number | null = ll.head, fast: number | null = ll.head;
  r.push(lf(ll, { fixed: true, states: slow !== null ? { [slow]: "current" } : {}, pointers: { slow, fast } }, `floyd's tortoise and hare: slow moves 1 step, fast moves 2. ${loopNote(k)}`, "init"));
  while (fast !== null && ll.node(fast).next !== null) {
    slow = ll.node(slow!).next;
    fast = ll.node(ll.node(fast).next!).next;
    const meet = slow === fast;
    r.push(lf(ll, { fixed: true, states: { ...(slow !== null ? { [slow]: meet ? "confirmed" : "current" } : {}), ...(fast !== null && !meet ? { [fast]: "comparing" } : {}) }, pointers: { slow, fast } }, meet ? `slow and fast meet at ${ll.node(slow!).value} — the fast runner lapped the slow one, so there's a loop.` : `slow → ${slow === null ? "null" : ll.node(slow).value}, fast → ${fast === null ? "null" : ll.node(fast).value}.`, meet ? "meet" : "move"));
    if (meet) {
      r.push(lf(ll, { fixed: true, states: { [slow!]: "confirmed" }, pointers: { slow, fast } }, "loop detected with two pointers and no extra memory.", "meet", { result: "loop found" }));
      return r.done();
    }
  }
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { slow, fast } }, "fast reached the end — a list with an end can't have a loop.", "done", { result: "no loop" }));
  return r.done();
};

/* ---------------- floyd phase 1 + 2 helpers ---------------- */

function meetPoint(ll: LinkedList, r: Rec, pos: number) {
  let slow: number | null = ll.head, fast: number | null = ll.head;
  r.push(lf(ll, { fixed: true, pointers: { slow, fast } }, `phase 1 — find out if there's a loop: slow moves 1, fast moves 2. ${loopNote(pos)}`, "init"));
  while (fast !== null && ll.node(fast).next !== null) {
    slow = ll.node(slow!).next;
    fast = ll.node(ll.node(fast).next!).next;
    const meet = slow === fast;
    r.push(lf(ll, { fixed: true, states: { ...(slow !== null ? { [slow]: meet ? "confirmed" : "current" } : {}), ...(fast !== null && !meet ? { [fast]: "comparing" } : {}) }, pointers: { slow, fast } }, meet ? `they meet at ${ll.node(slow!).value}: there is a loop.` : `slow → ${slow === null ? "null" : ll.node(slow).value}, fast → ${fast === null ? "null" : ll.node(fast).value}.`, meet ? "meet" : "move"));
    if (meet) return slow!;
  }
  return null;
}

export const llLoopStart: Tracer = ({ arr, k = -1 }) => {
  const r = new Rec();
  const { ll } = withLoop(arr, k);
  const m = meetPoint(ll, r, k);
  if (m === null) {
    r.push(lf(ll, { fixed: true, base: "confirmed" }, "fast hit null — no loop, so there's no starting point.", "done", { result: "no loop" }));
    return r.done();
  }
  let slow = ll.head!, fast = m;
  r.push(lf(ll, { fixed: true, states: { [slow]: "current", [fast]: "comparing" }, pointers: { slow, fast } }, "phase 2: put slow back at the head, leave fast at the meeting point, and move both one step at a time.", "reset"));
  while (slow !== fast) {
    slow = ll.node(slow).next!;
    fast = ll.node(fast).next!;
    r.push(lf(ll, { fixed: true, states: slow === fast ? { [slow]: "confirmed" } : { [slow]: "current", [fast]: "comparing" }, pointers: { slow, fast } }, slow === fast ? `they meet at ${ll.node(slow).value}.` : `slow → ${ll.node(slow).value}, fast → ${ll.node(fast).value}.`, "walk"));
  }
  r.push(lf(ll, { fixed: true, states: { [slow]: "confirmed" }, pointers: { start: slow } }, `the loop starts at ${ll.node(slow).value}. (the head-to-start distance equals the meeting-point-to-start distance, so they must arrive together.)`, "found", { result: `loop starts at ${ll.node(slow).value}` }));
  return r.done();
};

export const llRemoveLoop: Tracer = ({ arr, k = -1 }) => {
  const r = new Rec();
  const { ll } = withLoop(arr, k);
  const m = meetPoint(ll, r, k);
  if (m === null) {
    r.push(lf(ll, { fixed: true, base: "confirmed" }, "no loop — nothing to remove.", "none", { result: ll.text() }));
    return r.done();
  }
  let slow = ll.head!, fast = m;
  r.push(lf(ll, { fixed: true, states: { [slow]: "current", [fast]: "comparing" }, pointers: { slow, fast } }, "phase 2: slow goes back to the head. now find the last node inside the loop.", "reset"));
  if (slow === fast) {
    while (ll.node(fast).next !== slow) {
      fast = ll.node(fast).next!;
      r.push(lf(ll, { fixed: true, states: { [fast]: "comparing" }, pointers: { slow, fast } }, `the loop starts at the head itself — walk fast round to the node before it (${ll.node(fast).value}).`, "tail"));
    }
  } else {
    while (ll.node(slow).next !== ll.node(fast).next) {
      slow = ll.node(slow).next!;
      fast = ll.node(fast).next!;
      r.push(lf(ll, { fixed: true, states: { [slow]: "current", [fast]: "comparing" }, pointers: { slow, fast } }, `slow → ${ll.node(slow).value}, fast → ${ll.node(fast).value}. we stop when both next pointers point at the same node — the loop's start.`, "tail"));
    }
  }
  r.push(lf(ll, { fixed: true, states: { [fast]: "invalid", [ll.node(fast).next!]: "confirmed" }, edges: { [fast]: "invalid" }, pointers: { last: fast } }, `${ll.node(fast).value} is the last node of the loop — its link back to ${ll.node(ll.node(fast).next!).value} is the one to cut.`, "tail"));
  ll.node(fast).next = null;
  r.push(lf(ll, { fixed: true, base: "confirmed", pointers: { head: ll.head } }, `cut it: ${ll.text()}. the list is straight again.`, "cut", { result: ll.text() }));
  return r.done();
};

/* ---------------- middle of the list ---------------- */

export const llMiddle: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  let slow: number | null = ll.head, fast: number | null = ll.head;
  r.push(lf(ll, { states: slow !== null ? { [slow]: "current" } : {}, pointers: { slow, fast } }, "fast moves two steps for every one step of slow. when fast runs out, slow is halfway.", "init"));
  while (fast !== null && ll.node(fast).next !== null) {
    slow = ll.node(slow!).next;
    fast = ll.node(ll.node(fast).next!).next;
    r.push(lf(ll, { states: { ...(slow !== null ? { [slow]: "current" } : {}), ...(fast !== null ? { [fast]: "comparing" } : {}) }, pointers: { slow, fast } }, `slow → ${ll.node(slow!).value}, fast → ${fast === null ? "null" : ll.node(fast).value}.`, "move"));
  }
  r.push(lf(ll, { states: { [slow!]: "confirmed" }, pointers: { middle: slow } }, `fast can't take two more steps, so slow (${ll.node(slow!).value}) is the middle${ll.walk().length % 2 === 0 ? " — for an even length, the second of the two middles" : ""}.`, "done", { result: `middle = ${ll.node(slow!).value}` }));
  return r.done();
};

/* ---------------- is it circular? ---------------- */

export const llIsCircular: Tracer = ({ arr, k = 1 }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { circular: k === 1 });
  const head = ll.head!;
  let c: number | null = ll.node(head).next;
  r.push(lf(ll, { states: { [head]: "pending" }, pointers: { head, c } }, `start one step after the head and walk until we see null (not circular) or the head again (circular).`, "init"));
  while (c !== null && c !== head) {
    r.push(lf(ll, { states: { [head]: "pending", [c]: "current" }, pointers: { head, c } }, `${ll.node(c).value} is neither null nor the head — keep walking.`, "walk"));
    c = ll.node(c).next;
  }
  const circ = c === head;
  r.push(lf(ll, { base: circ ? "confirmed" : "inactive", states: { [head]: circ ? "confirmed" : "pending" }, pointers: { head, c } }, circ ? "we're back at the head — the list is circular." : "we hit null — the list is not circular.", "done", { result: circ ? "circular" : "not circular" }));
  return r.done();
};

/* ---------------- split a circular list into two halves ---------------- */

export const llSplitCircular: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr, { circular: true });
  const head = ll.head!;
  let slow = head, fast = head;
  r.push(lf(ll, { pointers: { slow, fast } }, "use slow/fast pointers to find the middle of the circle, then close each half into its own circle.", "init"));
  while (ll.node(fast).next !== head && ll.node(ll.node(fast).next!).next !== head) {
    slow = ll.node(slow).next!;
    fast = ll.node(ll.node(fast).next!).next!;
    r.push(lf(ll, { states: { [slow]: "current", [fast]: "comparing" }, pointers: { slow, fast } }, `slow → ${ll.node(slow).value}, fast → ${ll.node(fast).value}.`, "move"));
  }
  if (ll.node(ll.node(fast).next!).next === head) {
    fast = ll.node(fast).next!;
    r.push(lf(ll, { states: { [slow]: "current", [fast]: "comparing" }, pointers: { slow, fast } }, "even number of nodes: nudge fast onto the real last node.", "even"));
  }
  const head2 = ll.node(slow).next!;
  r.push(lf(ll, { states: { [slow]: "pending", [head2]: "pending" }, pointers: { head1: head, head2 } }, `the first half ends at ${ll.node(slow).value}; the second half starts at ${ll.node(head2).value}.`, "split"));
  ll.node(fast).next = head2;
  ll.node(slow).next = head;
  r.push(lf(ll, { layoutFrom: [head, head2], rowLabels: ["half 1", "half 2"], base: "confirmed", edges: { [fast]: "current", [slow]: "current" }, pointers: { head1: head, head2 } }, `close both circles: ${ll.node(slow).value} → ${ll.node(head).value} and ${ll.node(fast).value} → ${ll.node(head2).value}.`, "close"));
  r.push(lf(ll, { layoutFrom: [head, head2], rowLabels: ["half 1", "half 2"], base: "confirmed", pointers: { head1: head, head2 } }, `two circular lists: ${ll.values(head).join(", ")} and ${ll.values(head2).join(", ")}.`, "done", { result: `${ll.values(head).join(" → ")}  |  ${ll.values(head2).join(" → ")}` }));
  return r.done();
};

/* ---------------- palindrome ---------------- */

export const llPalindrome: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  let slow: number | null = ll.head, fast: number | null = ll.head;
  r.push(lf(ll, { fixed: true, pointers: { slow, fast } }, "plan: find the middle, reverse the second half in place, then compare the two halves from their fronts.", "middle"));
  while (fast !== null && ll.node(fast).next !== null) {
    slow = ll.node(slow!).next;
    fast = ll.node(ll.node(fast).next!).next;
    r.push(lf(ll, { fixed: true, states: { ...(slow !== null ? { [slow]: "current" } : {}), ...(fast !== null ? { [fast]: "comparing" } : {}) }, pointers: { slow, fast } }, `slow → ${ll.node(slow!).value}, fast → ${fast === null ? "null" : ll.node(fast).value}.`, "middle"));
  }
  let prev: number | null = null, curr: number | null = slow;
  const second = new Set<number>();
  while (curr !== null) {
    const nx: number | null = ll.node(curr).next;
    ll.node(curr).next = prev;
    second.add(curr);
    r.push(lf(ll, { fixed: true, states: mark(second, "pending"), edges: { [curr]: "current" }, pointers: { prev: curr, curr: nx } }, `reverse the second half: ${ll.node(curr).value} now points back.`, "reverse"));
    prev = curr;
    curr = nx;
  }
  let a: number | null = ll.head, b: number | null = prev, ok = true;
  const matched = new Set<number>();
  while (b !== null) {
    const same = ll.node(a!).value === ll.node(b).value;
    if (same) { matched.add(a!); matched.add(b); }
    r.push(lf(ll, { fixed: true, states: mark(matched, "confirmed", same ? {} : { [a!]: "invalid", [b]: "invalid" }), pointers: { a, b } }, same ? `${ll.node(a!).value} = ${ll.node(b).value} ✓` : `${ll.node(a!).value} ≠ ${ll.node(b).value} — not a palindrome.`, "compare"));
    if (!same) { ok = false; break; }
    a = ll.node(a!).next;
    b = ll.node(b).next;
  }
  r.push(lf(ll, { fixed: true, states: mark(matched, "confirmed"), base: ok ? "confirmed" : "inactive" }, ok ? "every pair matched — it reads the same both ways. (in production, reverse the second half back to leave the list untouched.)" : "a mismatch means it's not a palindrome. (reverse the second half back before returning.)", "done", { result: ok ? "palindrome" : "not a palindrome" }));
  return r.done();
};

/* ---------------- nth node from the end ---------------- */

export const llNthFromEnd: Tracer = ({ arr, k = 1 }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  let lead: number | null = ll.head, trail: number | null = ll.head;
  r.push(lf(ll, { pointers: { lead, trail } }, `give lead a head start of n = ${k} nodes. when lead falls off the end, trail is exactly n from the end.`, "init"));
  for (let i = 0; i < k; i++) {
    if (lead === null) {
      r.push(lf(ll, { base: "inactive", pointers: { lead, trail } }, `the list has fewer than ${k} nodes — there's no ${k}th node from the end.`, "short", { result: "−1" }));
      return r.done();
    }
    lead = ll.node(lead).next;
    r.push(lf(ll, { states: lead !== null ? { [lead]: "comparing" } : {}, pointers: { lead, trail } }, `lead steps ahead (${i + 1}/${k}).`, "gap"));
  }
  while (lead !== null) {
    lead = ll.node(lead).next;
    trail = ll.node(trail!).next;
    r.push(lf(ll, { states: { ...(lead !== null ? { [lead]: "comparing" } : {}), [trail!]: "current" }, pointers: { lead, trail } }, "move both one step — the gap stays n.", "move"));
  }
  r.push(lf(ll, { states: { [trail!]: "confirmed" }, pointers: { lead, trail } }, `lead is null, so trail (${ll.node(trail!).value}) is the ${k}th node from the end.`, "done", { result: String(ll.node(trail!).value) }));
  return r.done();
};
