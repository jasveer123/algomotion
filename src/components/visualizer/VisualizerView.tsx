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

/** The in-place rearrangement and partitioning algorithms from the array set. */
const ALGOS = [
  { id: "negatives-optimal", label: "partition: negatives to the left (two pointers)", slug: "move-negatives", plain: true, stable: false },
  { id: "negatives-brute", label: "stable partition: bubble negatives left", slug: "move-negatives", plain: true, stable: true },
  { id: "dnf012", label: "dutch national flag: sort 0s, 1s, 2s", slug: "sort-012", plain: false, stable: false },
  { id: "threeWay", label: "three-way partition around [a, b]", slug: "three-way-partition", plain: false, stable: false },
  { id: "alternating", label: "alternate negatives & positives (rotations)", slug: "alternate-positive-negative", plain: true, stable: true },
  { id: "reverse", label: "reverse in place (two pointers)", slug: "reverse-array", plain: true, stable: false },
  { id: "rotateOne", label: "cyclic rotate by one", slug: "rotate-by-one", plain: true, stable: true },
  { id: "nextPerm", label: "next permutation (pivot, swap, reverse)", slug: "next-permutation", plain: false, stable: false },
] as const;
type AlgoId = (typeof ALGOS)[number]["id"];

function Stats({ frame, label }: { frame: Frame; label: string }) {
  const s = frame.stats ?? { comparisons: 0, swaps: 0, writes: 0 };
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
            {ALGOS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </Select>
          <Select label="compare side by side with" value={other ?? "none"} onChange={(e) => setCompare(e.target.value as AlgoId | "none")} disabled={!compareOptions.length}>
            <option value="none">{compareOptions.length ? "nothing" : "not available for this input type"}</option>
            {compareOptions.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
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
