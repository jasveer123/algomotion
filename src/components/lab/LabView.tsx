"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button, Card, Input, Select, Tag } from "@/components/neo";
import { AlgorithmCanvas } from "@/components/algo/AlgorithmCanvas";
import { PlaybackControls } from "@/components/algo/PlaybackControls";
import { StateLegend } from "@/components/algo/StateLegend";
import { problemBySlug } from "@/content";
import { CAPACITY, runLab, type LabOp } from "@/lib/tracers/lab";
import type { Frame } from "@/lib/types";
import { usePlayback, useReducedMotion } from "@/lib/usePlayback";

type OpName = LabOp["op"];

const OPS: { id: OpName; label: string; cost: string; why: string; related: string[] }[] = [
  { id: "insert", label: "insert", cost: "O(n)", why: "every element after the insert position shifts right by one.", related: ["rotate-by-one", "alternate-positive-negative"] },
  { id: "delete", label: "delete", cost: "O(n)", why: "closing the gap shifts every later element left by one.", related: ["move-negatives", "min-ops-palindrome"] },
  { id: "search", label: "search", cost: "O(n)", why: "an unsorted array gives no hints — check each slot until found.", related: ["max-and-min", "pair-sum", "subset-check"] },
  { id: "update", label: "update", cost: "O(1)", why: "the address of slot i is computed directly, no scanning.", related: ["factorial-large", "sort-012"] },
  { id: "reverse", label: "reverse", cost: "O(n)", why: "n/2 swaps with two pointers moving inward.", related: ["reverse-array", "next-permutation"] },
  { id: "rotate", label: "rotate", cost: "O(n)", why: "three reversals move every element once or twice, with no extra array.", related: ["rotate-by-one", "reverse-array"] },
];

const START = [12, 7, 3, 25, 8, 19];

function idle(arr: number[], ids: number[]): Frame[] {
  return [{
    rows: [{ label: `array (size ${arr.length} / capacity ${CAPACITY})`, values: [...arr, ...Array(CAPACITY - arr.length).fill(null)], ids: [...ids, ...Array.from({ length: CAPACITY - arr.length }, (_, i) => 10_000 + i)], states: Array(CAPACITY).fill("default") }],
    note: "pick an operation and press run. dashed slots are allocated but empty.",
  }];
}

export function LabView() {
  const counter = useRef(100);
  const nextId = () => ++counter.current;
  const [arr, setArr] = useState<number[]>(START);
  const [ids, setIds] = useState<number[]>(START.map((_, i) => i));
  const [frames, setFrames] = useState<Frame[]>(() => idle(START, START.map((_, i) => i)));
  const pb = usePlayback(frames);
  const reduced = useReducedMotion();
  const [op, setOp] = useState<OpName>("insert");
  const [index, setIndex] = useState("2");
  const [value, setValue] = useState("42");
  const [k, setK] = useState("2");
  const [dir, setDir] = useState<"left" | "right">("right");
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const meta = OPS.find((o) => o.id === op)!;

  const run = () => {
    const num = (s: string) => (s.trim() !== "" && Number.isInteger(Number(s)) ? Number(s) : NaN);
    let spec: LabOp;
    if (op === "insert" || op === "update") spec = { op, index: num(index), value: num(value) };
    else if (op === "delete") spec = { op, index: num(index) };
    else if (op === "search") spec = { op, value: num(value) };
    else if (op === "rotate") spec = { op, k: num(k), dir };
    else spec = { op };
    if (Object.values(spec).some((v) => typeof v === "number" && Number.isNaN(v))) {
      setError("fill in every field with a whole number.");
      return;
    }
    if ("value" in spec && Math.abs(spec.value) > 999) { setError("keep values between −999 and 999."); return; }
    const res = runLab(arr, ids, spec, nextId);
    setError(res.error ?? null);
    setFrames(res.frames);
    if (!res.error) {
      setArr(res.next);
      setIds(res.ids);
      setLog((l) => [`${op}${"index" in spec ? ` @${spec.index}` : ""}${"value" in spec ? ` ${spec.value}` : ""}${"k" in spec ? ` ${spec.dir} ${spec.k}` : ""}`, ...l].slice(0, 6));
    }
    // auto-play the new operation, unless the learner asked for reduced motion
    if (!reduced && !res.error) requestAnimationFrame(() => pb.play());
  };

  const reset = () => {
    const i = START.map((_, x) => x);
    setArr(START); setIds(i); setFrames(idle(START, i)); setError(null); setLog([]);
  };

  return (
    <div className="am-lesson-grid">
      <div className="am-stack" style={{ gap: 12 }}>
        <AlgorithmCanvas frame={pb.frame} index={pb.index} total={pb.total} title={`${op} animation`} />
        <PlaybackControls pb={pb} label={op} />
        <StateLegend only={["current", "comparing", "confirmed", "pending", "invalid", "inactive"]} />
      </div>
      <div className="am-stack" style={{ gap: "var(--space-md)" }}>
        <Card className="am-stack" style={{ gap: 14 }}>
          <form className="am-stack" style={{ gap: 12 }} onSubmit={(e) => { e.preventDefault(); run(); }} aria-label="array operation" noValidate>
            <Select label="operation" value={op} onChange={(e) => { setOp(e.target.value as OpName); setError(null); }}>
              {OPS.map((o) => <option key={o.id} value={o.id}>{o.label} — {o.cost}</option>)}
            </Select>
            <div className="am-grid-2" style={{ gap: 12 }}>
              {(op === "insert" || op === "delete" || op === "update") && <Input label="index" type="number" inputMode="numeric" value={index} onChange={(e) => setIndex(e.target.value)} hint={`0 to ${op === "insert" ? arr.length : Math.max(0, arr.length - 1)}`} />}
              {(op === "insert" || op === "update" || op === "search") && <Input label="value" type="number" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} />}
              {op === "rotate" && (
                <>
                  <Input label="by k positions" type="number" inputMode="numeric" value={k} onChange={(e) => setK(e.target.value)} />
                  <Select label="direction" value={dir} onChange={(e) => setDir(e.target.value as "left" | "right")}>
                    <option value="right">right</option>
                    <option value="left">left</option>
                  </Select>
                </>
              )}
            </div>
            {error ? <p className="nb-error" role="alert">{error}</p> : null}
            <div className="am-row" style={{ gap: 10 }}>
              <Button type="submit" variant="primary">run {op}</Button>
              <Button variant="ghost" size="sm" onClick={reset}>reset array</Button>
            </div>
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
            {meta.related.map((s) => {
              const p = problemBySlug(s)!;
              return <li key={s}><Link className="am-problem-link" href={`/lessons/${s}`}>{p.title}</Link></li>;
            })}
          </ul>
        </Card>
        {log.length ? (
          <Card flat className="am-stack" style={{ gap: 6 }}>
            <span className="am-eyebrow">history</span>
            <ol className="am-small am-mono" style={{ margin: 0, paddingLeft: "1.3em" }} aria-label="recent operations">
              {log.map((l, i) => <li key={i}>{l}</li>)}
            </ol>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
