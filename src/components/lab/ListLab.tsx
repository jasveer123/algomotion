"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, Card, Input, Select, Tag } from "@/components/neo";
import { AlgorithmCanvas } from "@/components/algo/AlgorithmCanvas";
import { PlaybackControls } from "@/components/algo/PlaybackControls";
import { StateLegend } from "@/components/algo/StateLegend";
import { problemBySlug } from "@/content";
import { LinkedList } from "@/lib/list";
import { LIST_CAPACITY, runListLab, type ListOp } from "@/lib/tracers/ll/lab";
import type { Frame } from "@/lib/types";
import { usePlayback, useReducedMotion } from "@/lib/usePlayback";

type OpName = ListOp["op"];

const OPS: { id: OpName; label: string; cost: string; why: string; related: string[]; fields: ("value" | "index")[] }[] = [
  { id: "insertHead", label: "insert at head", cost: "O(1)", why: "one new node and one pointer change — no shifting, unlike an array.", related: ["add-one-to-list", "move-last-to-front"], fields: ["value"] },
  { id: "insertTail", label: "insert at tail", cost: "O(n)", why: "we must walk to the last node (O(1) if the list also stores a tail pointer).", related: ["segregate-even-odd", "merge-k-sorted-lists"], fields: ["value"] },
  { id: "insertAt", label: "insert at position", cost: "O(n)", why: "walking to the position is O(n); the insert itself is two link changes.", related: ["merge-sort-linked-list", "sort-012-linked-list"], fields: ["index", "value"] },
  { id: "deleteValue", label: "delete a value", cost: "O(n)", why: "finding the node is a walk; unlinking it is O(1).", related: ["remove-duplicates-sorted-list", "delete-circular-list"], fields: ["value"] },
  { id: "search", label: "search", cost: "O(n)", why: "no index access — you can only follow next pointers.", related: ["intersection-point", "nth-from-end"], fields: ["value"] },
  { id: "reverse", label: "reverse", cost: "O(n)", why: "every next pointer flips once, with three pointers.", related: ["reverse-linked-list", "reverse-k-group"], fields: [] },
  { id: "middle", label: "find the middle", cost: "O(n)", why: "slow and fast pointers find it in a single pass.", related: ["middle-of-linked-list", "palindrome-linked-list"], fields: [] },
];

const START = [12, 7, 3, 25, 8];

const idle = (values: number[]): Frame[] => {
  const ll = new LinkedList(values);
  return [{ rows: [], lists: [ll.view({ pointers: { head: ll.head } })], note: "pick an operation and press run. each node only knows the next one." }];
};

export function ListLab() {
  const [values, setValues] = useState<number[]>(START);
  const [frames, setFrames] = useState<Frame[]>(() => idle(START));
  const pb = usePlayback(frames);
  const reduced = useReducedMotion();
  const [op, setOp] = useState<OpName>("insertHead");
  const [index, setIndex] = useState("2");
  const [value, setValue] = useState("42");
  const [error, setError] = useState<string | null>(null);
  const meta = OPS.find((o) => o.id === op)!;

  const run = () => {
    const num = (s: string) => (s.trim() !== "" && Number.isInteger(Number(s)) ? Number(s) : NaN);
    const v = num(value), i = num(index);
    if ((meta.fields.includes("value") && Number.isNaN(v)) || (meta.fields.includes("index") && Number.isNaN(i))) { setError("fill in every field with a whole number."); return; }
    if (meta.fields.includes("value") && Math.abs(v) > 999) { setError("keep values between −999 and 999."); return; }
    const spec = (op === "insertAt" ? { op, index: i, value: v } : meta.fields.includes("value") ? { op, value: v } : { op }) as ListOp;
    const res = runListLab(values, spec);
    setError(res.error ?? null);
    setFrames(res.frames);
    if (!res.error) setValues(res.next);
    if (!reduced && !res.error) requestAnimationFrame(() => pb.play());
  };

  return (
    <div className="am-lesson-grid">
      <div className="am-stack" style={{ gap: 12 }}>
        <AlgorithmCanvas frame={pb.frame} index={pb.index} total={pb.total} title={`${meta.label} animation`} />
        <PlaybackControls pb={pb} label={meta.label} />
        <StateLegend />
      </div>
      <div className="am-stack" style={{ gap: "var(--space-md)" }}>
        <Card className="am-stack" style={{ gap: 14 }}>
          <form className="am-stack" style={{ gap: 12 }} onSubmit={(e) => { e.preventDefault(); run(); }} aria-label="linked list operation" noValidate>
            <Select label="operation" value={op} onChange={(e) => { setOp(e.target.value as OpName); setError(null); }}>
              {OPS.map((o) => <option key={o.id} value={o.id}>{o.label} — {o.cost}</option>)}
            </Select>
            <div className="am-grid-2" style={{ gap: 12 }}>
              {meta.fields.includes("index") && <Input label="position" type="number" inputMode="numeric" value={index} onChange={(e) => setIndex(e.target.value)} hint={`0 to ${values.length}`} />}
              {meta.fields.includes("value") && <Input label="value" type="number" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} />}
            </div>
            {error ? <p className="nb-error" role="alert">{error}</p> : null}
            <div className="am-row" style={{ gap: 10 }}>
              <Button type="submit" variant="primary">run {meta.label}</Button>
              <Button variant="ghost" size="sm" onClick={() => { setValues(START); setFrames(idle(START)); setError(null); }}>reset list</Button>
            </div>
            <span className="am-small am-muted">{values.length} / {LIST_CAPACITY} nodes</span>
          </form>
        </Card>
        <Card flat className="am-stack" style={{ gap: 10 }}>
          <div className="am-row" style={{ justifyContent: "space-between" }}>
            <h3>{meta.label}</h3>
            <Tag tone={meta.cost === "O(1)" ? "green" : "pink"} flat>{meta.cost}</Tag>
          </div>
          <p>{meta.why}</p>
          <span className="am-eyebrow">shows up in</span>
          <ul className="am-problem-list">
            {meta.related.map((s) => <li key={s}><Link className="am-problem-link" href={`/lessons/${s}`}>{problemBySlug(s)!.title}</Link></li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
}
