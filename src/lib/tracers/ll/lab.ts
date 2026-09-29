import { mark } from "../../list";
import type { Frame } from "../../types";
import { LinkedList, lf } from "./common";

export const LIST_CAPACITY = 9;

export type ListOp =
  | { op: "insertHead"; value: number }
  | { op: "insertTail"; value: number }
  | { op: "insertAt"; index: number; value: number }
  | { op: "deleteValue"; value: number }
  | { op: "search"; value: number }
  | { op: "reverse" }
  | { op: "middle" };

export interface ListLabResult {
  frames: Frame[];
  next: number[];
  error?: string;
}

export function runListLab(values: number[], op: ListOp): ListLabResult {
  const ll = new LinkedList(values);
  const f: Frame[] = [];
  const push = (fr: Frame) => f.push(fr);
  const fail = (error: string): ListLabResult => ({ frames: [lf(ll, { pointers: { head: ll.head } }, error, "error")], next: values, error });
  const finish = (note: string, extra: Partial<Frame> = {}): ListLabResult => {
    push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, note, "done", extra));
    return { frames: f, next: ll.values() as number[] };
  };
  const full = values.length >= LIST_CAPACITY;

  switch (op.op) {
    case "insertHead": {
      if (full) return fail(`the lab keeps at most ${LIST_CAPACITY} nodes — delete one first.`);
      const id = ll.add(op.value, { row: 1, col: 0 }, "new");
      push(lf(ll, { layoutFrom: [ll.head, id], rowLabels: ["list", "new node"], states: { [id]: "current" }, pointers: { head: ll.head } }, `create a node for ${op.value}.`, "create"));
      ll.node(id).next = ll.head;
      push(lf(ll, { fixed: false, layoutFrom: [ll.head, id], rowLabels: ["list", "new node"], states: { [id]: "current" }, edges: { [id]: "current" }, pointers: { head: ll.head } }, "point it at the current head.", "link"));
      ll.head = id;
      return finish(`move head to the new node. O(1): no walking, whatever the length.`);
    }
    case "insertTail": {
      if (full) return fail(`the lab keeps at most ${LIST_CAPACITY} nodes — delete one first.`);
      const id = ll.add(op.value, { row: 1, col: 0 }, "new");
      if (ll.head === null) { ll.head = id; return finish(`the list was empty — ${op.value} becomes the head.`); }
      let c = ll.head;
      push(lf(ll, { layoutFrom: [ll.head, id], rowLabels: ["list", "new node"], states: { [c]: "current", [id]: "pending" }, pointers: { c } }, "without a tail pointer we have to walk to the last node.", "walk"));
      while (ll.node(c).next !== null) {
        c = ll.node(c).next!;
        push(lf(ll, { layoutFrom: [ll.head, id], rowLabels: ["list", "new node"], states: { [c]: "current", [id]: "pending" }, pointers: { c } }, `step to ${ll.node(c).value}.`, "walk"));
      }
      ll.node(c).next = id;
      return finish(`link the old tail to ${op.value}. O(n) because of the walk — keeping a tail pointer makes it O(1).`);
    }
    case "insertAt": {
      if (full) return fail(`the lab keeps at most ${LIST_CAPACITY} nodes — delete one first.`);
      if (op.index < 0 || op.index > values.length) return fail(`position must be between 0 and ${values.length}.`);
      if (op.index === 0) return runListLab(values, { op: "insertHead", value: op.value });
      const id = ll.add(op.value, { row: 1, col: 0 }, "new");
      let c = ll.head!;
      for (let i = 1; i < op.index; i++) {
        push(lf(ll, { layoutFrom: [ll.head, id], rowLabels: ["list", "new node"], states: { [c]: "current", [id]: "pending" }, pointers: { c } }, `walk to position ${op.index - 1} (the node before the gap).`, "walk"));
        c = ll.node(c).next!;
      }
      push(lf(ll, { layoutFrom: [ll.head, id], rowLabels: ["list", "new node"], states: { [c]: "current", [id]: "pending" }, pointers: { c } }, `${ll.node(c).value} is the node before position ${op.index}.`, "walk"));
      ll.node(id).next = ll.node(c).next;
      push(lf(ll, { layoutFrom: [ll.head, id], rowLabels: ["list", "new node"], states: { [c]: "current", [id]: "current" }, edges: { [id]: "current" }, pointers: { c } }, "first, the new node points at c's successor (so nothing is lost)…", "link"));
      ll.node(c).next = id;
      return finish(`…then c points at the new node. two link changes after an O(n) walk.`);
    }
    case "deleteValue": {
      let prev: number | null = null, c = ll.head;
      while (c !== null && ll.node(c).value !== op.value) {
        push(lf(ll, { states: { [c]: "comparing" }, pointers: { prev, c } }, `${ll.node(c).value} ≠ ${op.value}.`, "search"));
        prev = c;
        c = ll.node(c).next;
      }
      if (c === null) return finish(`${op.value} isn't in the list — nothing to delete.`, { result: "not found" });
      push(lf(ll, { states: { [c]: "invalid" }, pointers: { prev, c } }, `found ${op.value}.`, "search"));
      if (prev === null) ll.head = ll.node(c).next;
      else ll.node(prev).next = ll.node(c).next;
      ll.nodes.delete(c);
      return finish(prev === null ? `it was the head: head moves to the next node. O(1) once found.` : `${ll.node(prev).value} now skips it. the unlink is O(1); finding it was O(n).`);
    }
    case "search": {
      let i = 0;
      for (let c = ll.head; c !== null; c = ll.node(c).next, i++) {
        const hit = ll.node(c).value === op.value;
        push(lf(ll, { states: { [c]: hit ? "confirmed" : "comparing" }, pointers: { c } }, hit ? `found ${op.value} at position ${i}.` : `${ll.node(c).value} ≠ ${op.value}, follow next.`, "search", hit ? { result: `position ${i}` } : {}));
        if (hit) return { frames: f, next: values };
      }
      push(lf(ll, { base: "invalid", pointers: { c: null } }, `reached null: ${op.value} isn't in the list. lists have no index access, so search is always a walk: O(n).`, "search", { result: "not found" }));
      return { frames: f, next: values };
    }
    case "reverse": {
      let prev: number | null = null, curr = ll.head;
      const done = new Set<number>();
      while (curr !== null) {
        const nx: number | null = ll.node(curr).next;
        ll.node(curr).next = prev;
        done.add(curr);
        push(lf(ll, { fixed: true, base: "inactive", states: mark(done, "confirmed"), edges: { [curr]: "current" }, pointers: { prev: curr, curr: nx } }, `flip ${ll.node(curr).value}'s link.`, "flip"));
        prev = curr;
        curr = nx;
      }
      ll.head = prev;
      return finish(`reversed in one pass with three pointers.`);
    }
    case "middle": {
      let slow = ll.head, fast = ll.head;
      while (fast !== null && ll.node(fast).next !== null) {
        slow = ll.node(slow!).next;
        fast = ll.node(ll.node(fast).next!).next;
        push(lf(ll, { states: { ...(slow !== null ? { [slow]: "current" } : {}), ...(fast !== null ? { [fast]: "comparing" } : {}) }, pointers: { slow, fast } }, "slow moves 1, fast moves 2.", "move"));
      }
      push(lf(ll, { states: slow !== null ? { [slow]: "confirmed" } : {}, pointers: { middle: slow } }, slow !== null ? `fast is done, so slow (${ll.node(slow).value}) is the middle.` : "the list is empty.", "done", { result: slow !== null ? `middle = ${ll.node(slow).value}` : "empty" }));
      return { frames: f, next: values };
    }
  }
}
