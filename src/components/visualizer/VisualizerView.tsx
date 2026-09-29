"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, Select, Tag } from "@/components/neo";
import { AlgorithmCanvas } from "@/components/algo/AlgorithmCanvas";
import { InputEditor } from "@/components/algo/InputEditor";
import { PlaybackControls } from "@/components/algo/PlaybackControls";
import { StateLegend } from "@/components/algo/StateLegend";
import { problemBySlug } from "@/content";
import { TRACERS } from "@/lib/tracers";
import type { Frame, TracerInput } from "@/lib/types";
import { usePlayback } from "@/lib/usePlayback";

/** In-place rearrangement and partitioning algorithms from the array and linked-list sets. */
const ALGOS = [
  { id: "negatives-optimal", group: "arrays", label: "partition: negatives to the left (two pointers)", slug: "move-negatives", plain: true, stable: false },
  { id: "negatives-brute", group: "arrays", label: "stable partition: bubble negatives left", slug: "move-negatives", plain: true, stable: true },
  { id: "dnf012", group: "arrays", label: "dutch national flag: sort 0s, 1s, 2s", slug: "sort-012", plain: false, stable: false },
  { id: "threeWay", group: "arrays", label: "three-way partition around [a, b]", slug: "three-way-partition", plain: false, stable: false },
  { id: "alternating", group: "arrays", label: "alternate negatives & positives (rotations)", slug: "alternate-positive-negative", plain: true, stable: true },
  { id: "reverse", group: "arrays", label: "reverse in place (two pointers)", slug: "reverse-array", plain: true, stable: false },
  { id: "rotateOne", group: "arrays", label: "cyclic rotate by one", slug: "rotate-by-one", plain: true, stable: true },
  { id: "nextPerm", group: "arrays", label: "next permutation (pivot, swap, reverse)", slug: "next-permutation", plain: false, stable: false },
  { id: "ll-reverse", group: "linked lists", label: "reverse a linked list (prev, curr, next)", slug: "reverse-linked-list", plain: true, stable: false },
  { id: "ll-reverse-k", group: "linked lists", label: "reverse a linked list in groups of k", slug: "reverse-k-group", plain: false, stable: false },
  { id: "ll-reverse-dll", group: "linked lists", label: "reverse a doubly linked list (swap prev/next)", slug: "reverse-doubly-linked-list", plain: true, stable: false },
  { id: "ll-even-odd", group: "linked lists", label: "segregate even and odd nodes (two lists)", slug: "segregate-even-odd", plain: true, stable: true },
  { id: "ll-sort-012", group: "linked lists", label: "sort 0s, 1s, 2s by relinking (three lists)", slug: "sort-012-linked-list", plain: false, stable: true },
  { id: "ll-move-last", group: "linked lists", label: "move the last node to the front", slug: "move-last-to-front", plain: true, stable: true },
  { id: "ll-rotate-dll", group: "linked lists", label: "rotate a doubly linked list by n", slug: "rotate-doubly-linked-list", plain: false, stable: true },
] as const;
type AlgoId = (typeof ALGOS)[number]["id"];

function Stats({ frame, label }: { frame: Frame; label: string }) {
  if (!frame.stats) return null;
  const s = frame.stats;
  return (
    <div className="am-row" style={{ gap: 10 }} aria-label={`${label} counters`}>
      <Tag tone="teal" flat>comparisons <b className="am-mono" style={{ marginLeft: 4 }}>{s.comparisons}</b></Tag>
      <Tag tone="lavender" flat>swaps <b className="am-mono" style={{ marginLeft: 4 }}>{s.swaps}</b></Tag>
    </div>
  );
}

function Lane({ algo, input, title }: { algo: AlgoId; input: TracerInput; title: string }) {
  const frames = useMemo(() => TRACERS[algo](input), [algo, input]);
  const pb = usePlayback(frames);
  const meta = ALGOS.find((a) => a.id === algo)!;
  return (
    <section className="am-stack" style={{ gap: 12 }} aria-label={title}>
      <div className="am-row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ textTransform: "none" }}>{meta.label}</h3>
        <Tag flat tone={meta.stable ? "green" : "yellow"}>{meta.stable ? "keeps order" : "may reorder"}</Tag>
      </div>
      <Stats frame={pb.frame} label={meta.label} />
      <AlgorithmCanvas frame={pb.frame} index={pb.index} total={pb.total} title={meta.label} />
      <PlaybackControls pb={pb} label={meta.label} />
      <Link href={`/lessons/${meta.slug}`} className="am-small">full lesson: {problemBySlug(meta.slug)!.title} →</Link>
    </section>
  );
}

export function VisualizerView() {
  const [algo, setAlgo] = useState<AlgoId>("negatives-optimal");
  const [compare, setCompare] = useState<AlgoId | "none">("negatives-brute");
  const meta = ALGOS.find((a) => a.id === algo)!;
  const spec = problemBySlug(meta.slug)!.input;
  const [inputs, setInputs] = useState<Record<string, TracerInput>>({});
  const input = inputs[meta.slug] ?? spec.defaults;
  const compareOptions = meta.plain ? ALGOS.filter((a) => a.plain && a.id !== algo) : [];
  const other = compare !== "none" && compareOptions.some((a) => a.id === compare) ? compare : null;

  return (
    <div className="am-stack" style={{ gap: "var(--space-md)" }}>
      <Card className="am-stack" style={{ gap: 14 }}>
        <div className="am-grid-2" style={{ gap: 12 }}>
          <Select label="algorithm" value={algo} onChange={(e) => setAlgo(e.target.value as AlgoId)}>
            {["arrays", "linked lists"].map((g) => (
              <optgroup key={g} label={g}>
                {ALGOS.filter((a) => a.group === g).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </optgroup>
            ))}
          </Select>
          <Select label="compare side by side with" value={other ?? "none"} onChange={(e) => setCompare(e.target.value as AlgoId | "none")} disabled={!compareOptions.length}>
            <option value="none">{compareOptions.length ? "nothing" : "not available for this input type"}</option>
            {compareOptions.map((a) => <option key={a.id} value={a.id}>{a.group}: {a.label}</option>)}
          </Select>
        </div>
        <InputEditor key={meta.slug} spec={spec} value={input} onApply={(v) => setInputs((m) => ({ ...m, [meta.slug]: v }))} />
        <StateLegend />
      </Card>
      <div className={other ? "am-grid-2" : undefined} style={{ alignItems: "start" }}>
        <Lane algo={algo} input={input} title="main lane" />
        {other ? <Lane algo={other} input={input} title="comparison lane" /> : null}
      </div>
    </div>
  );
}
