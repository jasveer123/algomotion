"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Card, IconBox, Tag } from "@/components/neo";
import { cx } from "@/components/neo/cx";
import { IconCheck, PATTERN_ICON } from "@/components/icons";
import { isMastered, useProgress } from "@/lib/progress";
import { PROBLEMS, patternById, problemsFor } from "@/content";
import type { Difficulty, Pattern, PatternId } from "@/lib/types";

/** Tiny looping demo of the pattern. Pure CSS; frozen under prefers-reduced-motion. */
export function MiniAnim({ kind }: { kind: Pattern["mini"] }) {
  const cells = Array.from({ length: 7 });
  const dur = "2.4s";
  if (kind === "pointers")
    return (
      <div className="am-mini" aria-hidden="true">
        {cells.map((_, i) => (
          <i key={i} style={{ animation: i === 0 || i === 6 ? `am-mini-l ${dur} infinite` : i === 1 || i === 5 ? `am-mini-l ${dur} ${0.8}s infinite` : i === 2 || i === 4 ? `am-mini-l ${dur} 1.6s infinite` : undefined }} />
        ))}
      </div>
    );
  if (kind === "window")
    return (
      <div className="am-mini" aria-hidden="true">
        {cells.map((_, i) => <i key={i} />)}
        <span style={{ position: "absolute", left: -3, bottom: -3, width: 87, height: 28, border: "2.5px solid var(--color-secondary)", borderRadius: 8, animation: `am-mini-win 3.2s ease-in-out infinite` }} />
      </div>
    );
  if (kind === "bars") {
    const hs = [[14, 38], [30, 14], [22, 30], [38, 22], [18, 34], [34, 18], [26, 26]];
    return (
      <div className="am-mini" aria-hidden="true">
        {hs.map(([a, b], i) => <i key={i} style={{ height: a, ["--h1" as string]: `${a}px`, ["--h2" as string]: `${b}px`, background: "var(--color-lavender)", animation: `am-mini-bar 2.8s ${i * 0.1}s ease-in-out infinite` } as CSSProperties} />)}
      </div>
    );
  }
  if (kind === "hash")
    return (
      <div className="am-mini" aria-hidden="true">
        {cells.map((_, i) => <i key={i} style={{ animation: `am-mini-pop 2.8s ${i * 0.4}s infinite` }} />)}
      </div>
    );
  return (
    <div className="am-mini" aria-hidden="true">
      {cells.map((_, i) => <i key={i} />)}
      <span style={{ position: "absolute", left: 4, bottom: 28, width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--border-color)", background: "var(--color-primary)", animation: "am-mini-hop 3s ease-in-out infinite" }} />
    </div>
  );
}

const DIFF_TONE: Record<Difficulty, "yellow" | "pink" | "lavender"> = { easy: "yellow", medium: "pink", hard: "lavender" };

export function DifficultyTag({ d }: { d: Difficulty }) {
  return <Tag tone={DIFF_TONE[d]} flat>{d}</Tag>;
}

export function PatternCard({ id }: { id: PatternId }) {
  const pattern = patternById(id);
  const problems = problemsFor(id);
  const { store } = useProgress();
  const Icon = PATTERN_ICON[pattern.id];
  const done = problems.filter((p) => isMastered(store, p.slug, p.checkpoints.length)).length;
  const pct = problems.length ? Math.round((done / problems.length) * 100) : 0;
  const counts = (["easy", "medium", "hard"] as Difficulty[]).map((d) => [d, problems.filter((p) => p.difficulty === d).length] as const).filter(([, c]) => c);
  const headId = `pattern-${pattern.id}`;
  return (
    <Card as="article" id={pattern.id} aria-labelledby={headId} className="am-stack" style={{ gap: 18, scrollMarginTop: 96 }}>
      <div className="am-row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <IconBox tone={pattern.tone === "coral" ? "coral" : pattern.tone}><Icon /></IconBox>
        <MiniAnim kind={pattern.mini} />
      </div>
      <div className="am-stack" style={{ gap: 6 }}>
        <h3 id={headId}>{pattern.name}</h3>
        <p className="am-small" style={{ fontSize: ".9rem" }}>{pattern.what}</p>
      </div>
      <div className="am-stack" style={{ gap: 8 }}>
        <span className="am-eyebrow">recognise it when…</span>
        <ul className="am-pros am-small" style={{ color: "var(--text-secondary)" }}>
          {pattern.clues.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
      <div className="am-row" style={{ gap: 8 }}>
        <Tag>{problems.length} problems</Tag>
        {counts.map(([d, c]) => <Tag key={d} tone={DIFF_TONE[d]} flat>{c} {d}</Tag>)}
      </div>
      <div className="am-stack" style={{ gap: 6 }}>
        <div className="am-progress" role="progressbar" aria-label={`${pattern.name} mastery`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <span className="am-small am-muted">{pct}% mastered · {done} of {problems.length} lessons</span>
      </div>
      <details>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: ".9rem", minHeight: 32 }}>see the {problems.length} problems</summary>
        <ul className="am-problem-list" style={{ marginTop: 12 }}>
          {problems.map((p) => {
            const m = isMastered(store, p.slug, p.checkpoints.length);
            return (
              <li key={p.slug}>
                <Link href={`/lessons/${p.slug}`} className="am-problem-link">
                  <span className="am-row" style={{ gap: 10, flexWrap: "nowrap" }}>
                    <span className={cx("am-check", m && "is-done")} aria-hidden="true">{m ? <IconCheck /> : null}</span>
                    <span>{p.title}{m ? <span className="sr-only"> (mastered)</span> : null}</span>
                  </span>
                  <DifficultyTag d={p.difficulty} />
                </Link>
              </li>
            );
          })}
        </ul>
      </details>
    </Card>
  );
}

export function TopicProgressCard() {
  const problems = PROBLEMS;
  const total = problems.length;
  const { store } = useProgress();
  const done = problems.filter((p) => isMastered(store, p.slug, p.checkpoints.length)).length;
  const pct = Math.round((done / total) * 100);
  return (
    <Card className="am-stack" style={{ gap: 14 }}>
      <div className="am-row" style={{ justifyContent: "space-between" }}>
        <Tag tone="yellow">arrays</Tag>
        <div className="am-ring" style={{ background: `conic-gradient(var(--color-secondary) 0% ${pct}%, var(--track) ${pct}% 100%)` }} role="img" aria-label={`${pct}% of array lessons mastered`}>
          <span>{pct}%</span>
        </div>
      </div>
      <h3>arrays</h3>
      <span className="am-small am-muted">{done} of {total} lessons mastered · 5 patterns · 36 sheet rows</span>
    </Card>
  );
}
