import type { Metadata } from "next";
import { VisualizerView } from "@/components/visualizer/VisualizerView";

export const metadata: Metadata = { title: "array visualizer", description: "Watch in-place rearrangement and partitioning algorithms compare and swap, side by side." };

export default function VisualizerPage() {
  return (
    <section className="am-section" aria-labelledby="viz">
      <div className="am-section-head">
        <h1 id="viz" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>array visualizer</h1>
        <p className="am-lede">the in-place rearrangement and partitioning algorithms from this set. watch every comparison and swap, see the confirmed and eliminated zones grow — and race two algorithms on the same input.</p>
      </div>
      <VisualizerView />
    </section>
  );
}
