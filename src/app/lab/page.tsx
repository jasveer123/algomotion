import type { Metadata } from "next";
import { LabView } from "@/components/lab/LabView";

export const metadata: Metadata = { title: "array lab", description: "Insert, delete, search, update, reverse and rotate a fixed-capacity array, step by step." };

export default function LabPage() {
  return (
    <section className="am-section" aria-labelledby="lab">
      <div className="am-section-head">
        <h1 id="lab" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>array data-structure lab</h1>
        <p className="am-lede">an array is a row of equal-sized slots in memory. try each basic operation and watch why some are instant and others have to move everything.</p>
      </div>
      <LabView />
    </section>
  );
}
