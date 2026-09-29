"use client";
import Link from "next/link";
import { useState } from "react";
import { Annotation, ButtonLink, Card, IconBox, Tag } from "@/components/neo";
import { cx } from "@/components/neo/cx";
import { IconArrowRight, PATTERN_ICON } from "@/components/icons";
import { AlgorithmCanvas } from "@/components/algo/AlgorithmCanvas";
import { CheckpointQuestion } from "@/components/algo/CheckpointQuestion";
import { CodeViewer } from "@/components/algo/CodeViewer";
import { ComplexityCard } from "@/components/algo/ComplexityCard";
import { InputEditor } from "@/components/algo/InputEditor";
import { DifficultyTag } from "@/components/algo/PatternCard";
import { PlaybackControls } from "@/components/algo/PlaybackControls";
import { StateLegend } from "@/components/algo/StateLegend";
import { TabPanel, Tabs } from "@/components/algo/Tabs";
import { patternById, problemBySlug, problemsFor, problemsIn, topicById } from "@/content";
import { isMastered, useProgress } from "@/lib/progress";
import { TRACERS } from "@/lib/tracers";
import type { ApproachLevel, Lang, TracerInput } from "@/lib/types";
import { usePlayback } from "@/lib/usePlayback";

const LEVEL_LABEL: Record<ApproachLevel, string> = { brute: "brute force", improved: "improved", optimal: "optimal" };
type MobilePane = "explain" | "code" | "try";

export function LessonView({ slug }: { slug: string }) {
  const problem = problemBySlug(slug)!;
  const pattern = patternById(problem.pattern);
  const PatternIcon = PATTERN_ICON[pattern.id];
  const { store, markCorrect } = useProgress();

  const optimalIdx = problem.approaches.findIndex((a) => a.level === "optimal");
  const [level, setLevel] = useState<ApproachLevel>(problem.approaches[optimalIdx].level);
  const approach = problem.approaches.find((a) => a.level === level)!;
  const [input, setInput] = useState<TracerInput>(problem.input.defaults);
  const [lang, setLang] = useState<Lang>("js");
  const [pane, setPane] = useState<MobilePane>("explain");

  // Approaches without their own animation borrow the optimal one's, and say so.
  const animated = approach.tracer ? approach : problem.approaches[optimalIdx];
  const tracerId = animated.tracer!;
  // Recompute frames only when the tracer or the input changes (state adjusted during render).
  const key = `${tracerId}|${JSON.stringify(input)}`;
  const [run, setRun] = useState(() => ({ key, frames: TRACERS[tracerId](input) }));
  if (run.key !== key) setRun({ key, frames: TRACERS[tracerId](input) });
  const frames = run.frames;
  const pb = usePlayback(frames);
  const n = Math.max(input.arr.length + (input.arr2?.length ?? 0) + (input.arr3?.length ?? 0), input.k && !input.arr.length ? input.k : 0, 2);

  const topic = topicById(problem.topic);
  const siblings = problemsFor(problem.pattern);
  const inTopic = problemsIn(problem.topic);
  const at = inTopic.indexOf(problem);
  const nextLesson = inTopic[(at + 1) % inTopic.length];
  const prevLesson = inTopic[(at - 1 + inTopic.length) % inTopic.length];
  const solved = store[problem.slug] ?? [];
  const mastered = isMastered(store, problem.slug, problem.checkpoints.length);

  return (
    <article className="am-stack" style={{ gap: "var(--space-xl)" }} aria-labelledby="lesson-title">
      {/* ---------- header ---------- */}
      <header className="am-stack" style={{ gap: 16 }}>
        <nav aria-label="breadcrumb" className="am-small">
          <Link href={`/#${topic.id}`}>{topic.name}</Link> <span aria-hidden="true">/</span> <Link href={`/#${pattern.id}`}>{pattern.name}</Link> <span aria-hidden="true">/</span> <span aria-current="page">{problem.title}</span>
        </nav>
        <div className="am-row" style={{ gap: 16, alignItems: "flex-start", flexWrap: "nowrap" }}>
          <IconBox tone={pattern.tone}><PatternIcon /></IconBox>
          <div className="am-stack" style={{ gap: 10 }}>
            <h1 id="lesson-title" style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)" }}>{problem.title}</h1>
            <p className="am-lede" style={{ fontSize: "1.05rem" }}>{problem.summary}</p>
          </div>
        </div>
        <div className="am-row" style={{ gap: 8 }}>
          <DifficultyTag d={problem.difficulty} />
          <Tag tone="teal" flat>{pattern.name}</Tag>
          {problem.also?.map((a) => <Tag key={a} flat>{a}</Tag>)}
          {problem.flagship ? <Tag tone="lavender" flat>fully worked reference</Tag> : null}
          {mastered ? <Tag tone="green" flat>mastered</Tag> : null}
        </div>
        <p className="am-small am-muted">450 sheet · {topic.sheetName} row{problem.sheet.length > 1 ? "s" : ""} {problem.sheet.join(" & ")}: “{problem.sheetTitle}”</p>
      </header>

      {/* ---------- 1. problem ---------- */}
      <section className="am-section" aria-labelledby="s-problem">
        <h2 id="s-problem">the problem, in plain words</h2>
        <div className="am-lesson-grid">
          <p style={{ fontSize: "1.05rem", maxWidth: "62ch" }}>{problem.intro}</p>
          <Card className="am-stack" style={{ gap: 10, background: "var(--bg-surface)" }}>
            <span className="am-eyebrow">example</span>
            <dl className="am-kv">
              <dt>input</dt><dd className="am-mono" style={{ color: "var(--text-primary)" }}>{problem.example.input}</dd>
              <dt>output</dt><dd className="am-mono" style={{ color: "var(--text-primary)", fontWeight: 700 }}>{problem.example.output}</dd>
            </dl>
            <p className="am-small">{problem.example.why}</p>
          </Card>
        </div>
      </section>

      {/* ---------- 2. recognition ---------- */}
      <section className="am-section" aria-labelledby="s-clues">
        <div className="am-row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
          <h2 id="s-clues">how do i recognise this next time?</h2>
          <Annotation className="am-desktop-only">{pattern.name}, again!</Annotation>
        </div>
        <Card flat>
          <ul className="am-clues">
            {problem.clues.map((c, i) => (
              <li key={c}><span className="am-clue-mark" aria-hidden="true">{i + 1}</span><span>{c}</span></li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ---------- 3. approaches ---------- */}
      <section className="am-section" aria-labelledby="s-approach">
        <div className="am-stack" style={{ gap: 12 }}>
          <h2 id="s-approach">from brute force to optimal</h2>
          <Tabs
            label="approach"
            idBase="approach"
            tabs={problem.approaches.map((a) => ({ id: a.level, label: <>{LEVEL_LABEL[a.level]} <span className="am-mono am-small" style={{ fontWeight: 500 }}>{a.complexity.time}</span></> }))}
            value={level}
            onChange={setLevel}
          />
        </div>

        <TabPanel idBase="approach" id={level} active>
          <div className="am-stack" style={{ gap: "var(--space-md)" }}>
            <Card flat style={{ background: "var(--color-lavender)", color: "var(--text-on-pastel)" }}>
              <span className="am-eyebrow" style={{ color: "var(--text-on-pastel)" }}>{approach.name} — the one-line idea</span>
              <p style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 4, color: "var(--text-on-pastel)" }}>{approach.idea}</p>
            </Card>

            <div className="am-lesson-grid">
              {/* left: animation */}
              <div className="am-stack am-canvas-sticky" style={{ gap: 12 }}>
                {animated !== approach ? (
                  <p className="am-small" role="note" style={{ background: "var(--color-yellow)", color: "var(--text-on-pastel)", border: "2px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "8px 12px" }}>
                    the animation shows the <b>optimal</b> approach — follow the numbered walkthrough for this one, and compare the step counts below.
                  </p>
                ) : null}
                <AlgorithmCanvas frame={pb.frame} index={pb.index} total={pb.total} title={`${animated.name} animation`} />
                <PlaybackControls pb={pb} label={animated.name} />
                <StateLegend />
              </div>

              {/* right: explain / code / try — tabs on phones, stacked on larger screens */}
              <div className="am-stack" style={{ gap: "var(--space-md)" }}>
                <Tabs<MobilePane>
                  className="am-mobile-tabs"
                  label="lesson panel"
                  idBase="pane"
                  tabs={[{ id: "explain", label: "explain" }, { id: "code", label: "code" }, { id: "try", label: "your input" }]}
                  value={pane}
                  onChange={setPane}
                />
                <div className={cx("am-stack", pane !== "code" && "am-m-hide")} style={{ gap: 10 }}>
                  <h3 className="am-desktop-only">code — the highlighted line is running now</h3>
                  <CodeViewer code={approach.code} lang={lang} onLang={setLang} activeKey={animated === approach ? pb.frame.line : undefined} idBase={`code-${level}`} title={approach.name} />
                </div>
                <div className={cx("am-stack", pane !== "try" && "am-m-hide")} style={{ gap: 10 }}>
                  <h3>replay with your own numbers</h3>
                  <InputEditor key={problem.slug} spec={problem.input} value={input} onApply={setInput} />
                </div>
                <div className={cx("am-stack", pane !== "explain" && "am-m-hide")} style={{ gap: "var(--space-md)" }}>
                  <div className="am-stack" style={{ gap: 8 }}>
                    <h3>visual walkthrough</h3>
                    <ol className="am-steps-list">{approach.walkthrough.map((w) => <li key={w}>{w}</li>)}</ol>
                  </div>
                  <div className="am-stack" style={{ gap: 8 }}>
                    <h3>pseudocode</h3>
                    <pre className="am-pseudo">{approach.pseudocode}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className={cx("am-grid-2", pane !== "explain" && "am-m-hide")}>
              <div className="am-stack" style={{ gap: 10 }}>
                <h3>time &amp; space, in plain words</h3>
                <ComplexityCard approach={approach} all={problem.approaches} n={n} />
              </div>
              <div className="am-stack" style={{ gap: 10 }}>
                <h3>trade-offs</h3>
                <Card flat className="am-stack" style={{ gap: 12 }}>
                  <div>
                    <span className="am-eyebrow">good</span>
                    <ul className="am-pros">{approach.pros.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                  <div>
                    <span className="am-eyebrow">watch out</span>
                    <ul className="am-pros">{approach.cons.map((c) => <li key={c}>{c}</li>)}</ul>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </TabPanel>
      </section>

      {/* ---------- 4. checkpoints ---------- */}
      <section className="am-section" aria-labelledby="s-check">
        <div className="am-section-head">
          <h2 id="s-check">checkpoint</h2>
          <p className="am-lede">answer all {problem.checkpoints.length} to mark this lesson mastered. wrong answers are free — they&apos;re how the idea sticks.</p>
        </div>
        <div className="am-grid-2">
          {problem.checkpoints.map((cp, i) => (
            <CheckpointQuestion key={`${problem.slug}-${i}`} cp={cp} index={i} solved={solved.includes(i)} onCorrect={() => markCorrect(problem.slug, i)} />
          ))}
        </div>
        {mastered ? (
          <div className="am-callout am-row" role="status" style={{ justifyContent: "space-between" }}>
            <p style={{ fontWeight: 700 }}>lesson mastered — nice work. {pattern.name} is {siblings.filter((p) => isMastered(store, p.slug, p.checkpoints.length)).length}/{siblings.length} done.</p>
            <ButtonLink href={`/lessons/${nextLesson.slug}`} variant="primary">next lesson <IconArrowRight /></ButtonLink>
          </div>
        ) : null}
      </section>

      {/* ---------- more in this pattern ---------- */}
      <nav aria-label="more lessons" className="am-stack" style={{ gap: 12 }}>
        <h2 style={{ fontSize: "1.4rem" }}>more {pattern.name}</h2>
        <ul className="am-problem-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
          {siblings.filter((p) => p.slug !== problem.slug).map((p) => (
            <li key={p.slug}>
              <Link href={`/lessons/${p.slug}`} className="am-problem-link"><span>{p.title}</span><DifficultyTag d={p.difficulty} /></Link>
            </li>
          ))}
        </ul>
        <div className="am-row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          <Link href={`/lessons/${prevLesson.slug}`} className="nb-btn nb-btn-ghost nb-btn-sm">← {prevLesson.title}</Link>
          <Link href={`/lessons/${nextLesson.slug}`} className="nb-btn nb-btn-ghost nb-btn-sm">{nextLesson.title} →</Link>
        </div>
      </nav>
    </article>
  );
}
