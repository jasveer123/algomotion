import type { Metadata } from "next";
import { VisualizerView } from "@/components/visualizer/VisualizerView";

export const metadata: Metadata = { title: "visualizer", description: "Watch in-place rearrangement algorithms on arrays and linked lists, side by side." };

export default function VisualizerPage() {
  return (
    <section className="am-section" aria-labelledby="viz">
      <div className="am-section-head">
        <h1 id="viz" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>visualizer</h1>
        <p className="am-lede">in-place rearrangement and partitioning algorithms for arrays and linked lists. watch every comparison, swap and relinked pointer — and race two algorithms on the same input (try reversing an array against reversing a linked list).</p>
      </div>
      <VisualizerView />
    </section>
  );
}
