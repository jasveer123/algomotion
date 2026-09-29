import type { Metadata } from "next";
import { LessonTable } from "@/components/lesson/LessonTable";

export const metadata: Metadata = { title: "all array lessons", description: "All 35 array lessons in Love Babbar 450 sheet order." };

export default function LessonsIndex() {
  return (
    <section className="am-section" aria-labelledby="all">
      <div className="am-section-head">
        <h1 id="all" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>all 35 array lessons</h1>
        <p className="am-lede">in the same order as the sheet. the sheet lists kadane&apos;s algorithm twice (rows 8 and 13) — here it&apos;s one lesson.</p>
      </div>
      <LessonTable />
    </section>
  );
}
