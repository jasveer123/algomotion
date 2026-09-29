"use client";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/neo";
import { cx } from "@/components/neo/cx";
import { IconCheck } from "@/components/icons";
import { DifficultyTag } from "@/components/algo/PatternCard";
import { Tabs } from "@/components/algo/Tabs";
import { PATTERNS, PROBLEMS, patternById } from "@/content";
import { isMastered, useProgress } from "@/lib/progress";
import type { PatternId } from "@/lib/types";

type Filter = "all" | PatternId;

export function LessonTable() {
  const { store } = useProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const rows = PROBLEMS.filter((p) => filter === "all" || p.pattern === filter);
  return (
    <div className="am-stack" style={{ gap: 16 }}>
      <Tabs<Filter>
        label="filter by pattern"
        idBase="filter"
        tabs={[{ id: "all", label: `all (${PROBLEMS.length})` }, ...PATTERNS.map((p) => ({ id: p.id as Filter, label: `${p.name} (${PROBLEMS.filter((q) => q.pattern === p.id).length})` }))]}
        value={filter}
        onChange={setFilter}
      />
      <Card flat style={{ padding: 0, overflow: "hidden" }} role="tabpanel" id={`filter-panel-${filter}`} aria-labelledby={`filter-tab-${filter}`}>
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
                    <span className="am-small am-muted">{patternById(p.pattern).name}</span>
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
