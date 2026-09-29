import { mark } from "../../list";
import type { CellState, Tracer } from "../../types";
import { LinkedList, lf, Rec } from "./common";

/* ---------------- add 1 to a number stored as a list ---------------- */

export const llAddOne: Tracer = ({ arr }) => {
  const r = new Rec();
  const ll = new LinkedList(arr);
  const num = () => ll.values().join("");
  let lastNotNine: number | null = null;
  r.push(lf(ll, { pointers: { head: ll.head } }, `the list holds the number ${num()}, most significant digit first. adding 1 only changes the digits after the last non-9.`, "init"));
  for (let c: number | null = ll.head; c !== null; c = ll.node(c).next) {
    if (ll.node(c).value !== 9) lastNotNine = c;
    r.push(lf(ll, { states: { [c]: "current", ...(lastNotNine !== null && lastNotNine !== c ? { [lastNotNine]: "pending" } : {}) }, pointers: { c, lastNotNine } }, ll.node(c).value !== 9 ? `${ll.node(c).value} isn't 9 → remember it as the last non-9 so far.` : "a 9 — it would overflow, keep looking.", "scan"));
  }
  if (lastNotNine === null) {
    const nh = ll.add(1, { row: 0, col: -1 }, "new");
    ll.node(nh).next = ll.head;
    for (let c: number | null = ll.head; c !== null; c = ll.node(c).next) ll.node(c).value = 0;
    ll.head = nh;
    r.push(lf(ll, { states: { [nh]: "confirmed" }, base: "pending", pointers: { head: nh } }, `every digit was 9: they all become 0 and a new 1 goes in front → ${num()}.`, "allNine", { result: num() }));
    return r.done();
  }
  ll.node(lastNotNine).value = (ll.node(lastNotNine).value as number) + 1;
  r.push(lf(ll, { states: { [lastNotNine]: "confirmed" }, pointers: { lastNotNine } }, `bump ${ll.node(lastNotNine).value as number - 1} → ${ll.node(lastNotNine).value}.`, "bump"));
  const zeroed: number[] = [];
  for (let c = ll.node(lastNotNine).next; c !== null; c = ll.node(c).next) {
    ll.node(c).value = 0;
    zeroed.push(c);
    r.push(lf(ll, { states: mark(zeroed, "pending", { [lastNotNine]: "confirmed", [c]: "current" }), pointers: { c } }, "every 9 after it rolls over to 0.", "zero"));
  }
  r.push(lf(ll, { base: "confirmed", pointers: { head: ll.head } }, `result: ${num()}. one pass to find the digit, one short pass to zero the tail.`, "done", { result: num() }));
  return r.done();
};

/* ---------------- add two numbers stored as lists ---------------- */

export const llAddTwo: Tracer = ({ arr, arr2 = [] }) => {
  const r = new Rec();
  const ll = new LinkedList([]);
  let a = ll.chain(arr, 0), b = ll.chain(arr2, 1);
  const rev = (h: number | null) => { let p: number | null = null, c = h; while (c !== null) { const n: number | null = ll.node(c).next; ll.node(c).next = p; p = c; c = n; } return p; };
  const numA = arr.join(""), numB = arr2.join("");
  let result: number | null = null;
  const view = (st: Record<number, CellState>, note: string, line: string, pa: number | null = a, pb: number | null = b, extra = {}) =>
    r.push(lf(ll, { layoutFrom: [a0, b0, result], rowLabels: ["a", "b", "sum"], states: st, pointers: { a: pa, b: pb } }, note, line, extra));
  let a0 = a, b0 = b;
  view({}, `add ${numA} + ${numB}. digits are stored most significant first, but addition starts from the ones digit.`, "reverse");
  a = rev(a); b = rev(b); a0 = a; b0 = b;
  view({}, "reverse both lists so the ones digits come first.", "reverse");
  let carry = 0;
  let pa: number | null = a, pb: number | null = b;
  while (pa !== null || pb !== null || carry) {
    const da = pa !== null ? (ll.node(pa).value as number) : 0, db = pb !== null ? (ll.node(pb).value as number) : 0;
    const sum = da + db + carry;
    const oldCarry = carry;
    carry = Math.floor(sum / 10);
    const id = ll.add(sum % 10, { row: 2, col: 0 });
    ll.node(id).next = result;
    result = id;
    view({ ...(pa !== null ? { [pa]: "comparing" } : {}), ...(pb !== null ? { [pb]: "comparing" } : {}), [id]: "confirmed" }, `${da} + ${db}${oldCarry ? ` + carry ${oldCarry}` : ""} = ${sum}: write ${sum % 10} at the FRONT of the result, carry ${carry}.`, "prepend", pa, pb, { vars: { carry } });
    if (pa !== null) pa = ll.node(pa).next;
    if (pb !== null) pb = ll.node(pb).next;
  }
  const text = ll.values(result).join("");
  view({ ...mark(ll.walk(result), "confirmed") }, `prepending kept the result in the right order: ${numA} + ${numB} = ${text}.`, "done", null, null, { result: text });
  return r.done();
};

/* ---------------- multiply two numbers stored as lists ---------------- */

export const llMultiply: Tracer = ({ arr, arr2 = [] }) => {
  const r = new Rec();
  const ll = new LinkedList([]);
  const a = ll.chain(arr, 0), b = ll.chain(arr2, 1);
  const MOD = BigInt(1_000_000_007);
  const TEN = BigInt(10);
  let x = BigInt(0), y = BigInt(0);
  const view = (st: Record<number, CellState>, note: string, line: string, ptr: Record<string, number | null> = {}, extra = {}) =>
    r.push(lf(ll, { layoutFrom: [a, b], rowLabels: ["a", "b"], states: st, pointers: ptr }, note, line, { vars: { x: String(x), y: String(y) }, ...extra }));
  view({}, "read each list into a number, digit by digit (x = x·10 + digit), keeping it modulo 10⁹ + 7 so it never overflows. then multiply.", "init");
  for (let c = a; c !== null; c = ll.node(c).next) {
    x = (x * TEN + BigInt(ll.node(c).value as number)) % MOD;
    view({ [c]: "current" }, `x = x · 10 + ${ll.node(c).value} = ${x}.`, "readA", { c });
  }
  for (let c = b; c !== null; c = ll.node(c).next) {
    y = (y * TEN + BigInt(ll.node(c).value as number)) % MOD;
    view({ [c]: "current" }, `y = y · 10 + ${ll.node(c).value} = ${y}.`, "readB", { c });
  }
  const p = (x * y) % MOD;
  view({ ...mark(ll.walk(a), "confirmed"), ...mark(ll.walk(b), "confirmed") }, `(x · y) mod 10⁹ + 7 = ${p}.`, "done", {}, { result: String(p) });
  return r.done();
};
