"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/neo";
import { cx } from "@/components/neo/cx";
import { IconCheck } from "@/components/icons";
import { DifficultyTag } from "@/components/algo/PatternCard";
import { Tabs } from "@/components/algo/Tabs";
import { PATTERNS, PROBLEMS, TOPICS, patternById, topicById } from "@/content";
import { isMastered, useProgress } from "@/lib/progress";
import type { PatternId, TopicId } from "@/lib/types";

type TopicFilter = "all" | TopicId;
type PatternFilter = "all" | PatternId;

export function LessonTable() {
  const { store } = useProgress();
  const params = useSearchParams();
  const router = useRouter();
  const fromUrl = params.get("topic");
  const [topic, setTopicState] = useState<TopicFilter>(TOPICS.some((t) => t.id === fromUrl) ? (fromUrl as TopicId) : "all");
  const [pattern, setPattern] = useState<PatternFilter>("all");
  const setTopic = (t: TopicFilter) => {
    setTopicState(t);
    setPattern("all");
    router.replace(t === "all" ? "/lessons" : `/lessons?topic=${t}`, { scroll: false });
  };
  const inTopic = PROBLEMS.filter((p) => topic === "all" || p.topic === topic);
  const rows = inTopic.filter((p) => pattern === "all" || p.pattern === pattern);
  const patterns = PATTERNS.filter((p) => topic !== "all" && p.topic === topic);
  return (
    <div className="am-stack" style={{ gap: 16 }}>
      <Tabs<TopicFilter>
        label="filter by topic"
        idBase="topic"
        tabs={[{ id: "all", label: `all topics (${PROBLEMS.length})` }, ...TOPICS.map((t) => ({ id: t.id as TopicFilter, label: `${t.name} (${PROBLEMS.filter((p) => p.topic === t.id).length})` }))]}
        value={topic}
        onChange={setTopic}
      />
      {patterns.length ? (
        <Tabs<PatternFilter>
          label="filter by pattern"
          idBase="filter"
          tabs={[{ id: "all", label: "every pattern" }, ...patterns.map((p) => ({ id: p.id as PatternFilter, label: `${p.name} (${inTopic.filter((q) => q.pattern === p.id).length})` }))]}
          value={pattern}
          onChange={setPattern}
        />
      ) : null}
      <Card flat style={{ padding: 0, overflow: "hidden" }} role="region" aria-live="polite" aria-label={`${rows.length} lessons`}>
        <ol className="am-problem-list" style={{ padding: 12 }}>
          {rows.map((p) => {
            const m = isMastered(store, p.slug, p.checkpoints.length);
            return (
              <li key={p.slug}>
                <Link href={`/lessons/${p.slug}`} className="am-problem-link" style={{ flexWrap: "wrap" }}>
                  <span className="am-row" style={{ gap: 12, flexWrap: "nowrap", minWidth: 0 }}>
                    <span className="am-mono am-small am-muted" style={{ width: 42, flexShrink: 0 }}>#{p.sheet.join("·")}</span>
                    <span className={cx("am-check", m && "is-done")} aria-hidden="true">{m ? <IconCheck /> : null}</span>
                    <span>{p.title}{m ? <span className="sr-only"> (mastered)</span> : null}</span>
                  </span>
                  <span className="am-row" style={{ gap: 8 }}>
                    <span className="am-small am-muted">{topic === "all" ? `${topicById(p.topic).name} · ` : ""}{patternById(p.pattern).name}</span>
                    <DifficultyTag d={p.difficulty} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
