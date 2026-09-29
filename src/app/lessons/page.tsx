import type { Metadata } from "next";
import { Suspense } from "react";
import { LessonTable } from "@/components/lesson/LessonTable";
import { PROBLEMS, TOPICS } from "@/content";

export const metadata: Metadata = { title: "all lessons", description: "Every lesson, topic by topic, in Love Babbar 450 sheet order." };

export default function LessonsIndex() {
  return (
    <section className="am-section" aria-labelledby="all">
      <div className="am-section-head">
        <h1 id="all" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>all {PROBLEMS.length} lessons</h1>
        <p className="am-lede">{TOPICS.map((t) => t.name).join(" and ")}, in the same order as the sheet. the array sheet lists kadane&apos;s algorithm twice (rows 8 and 13) — here it&apos;s one lesson.</p>
      </div>
      <Suspense fallback={null}>
        <LessonTable />
      </Suspense>
    </section>
  );
}
