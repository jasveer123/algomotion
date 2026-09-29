import type { Metadata } from "next";
import { Card } from "@/components/neo";
import { LabTabs } from "@/components/lab/LabTabs";

export const metadata: Metadata = { title: "data-structure lab", description: "Try the basic operations of arrays and linked lists, step by step, and see why their costs differ." };

const COMPARE = [
  ["read the i-th item", "O(1)", "O(n) — walk from the head"],
  ["insert / delete at the front", "O(n) — shift everything", "O(1) — change a pointer"],
  ["insert / delete in the middle", "O(n) — shift the rest", "O(n) to find it, O(1) to relink"],
  ["search an unsorted collection", "O(n)", "O(n)"],
  ["memory layout", "one contiguous block (cache friendly)", "scattered nodes + a pointer each"],
];

export default function LabPage() {
  return (
    <section className="am-section" aria-labelledby="lab">
      <div className="am-section-head">
        <h1 id="lab" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>data-structure lab</h1>
        <p className="am-lede">an array is a row of equal-sized slots; a linked list is a chain of nodes that each point to the next. run the same kinds of operations on both and watch why some are instant and others have to walk or shift everything.</p>
      </div>
      <LabTabs />
      <Card flat className="am-stack" style={{ gap: 10, overflowX: "auto" }}>
        <h2 style={{ fontSize: "1.4rem" }}>array vs linked list, side by side</h2>
        <table className="am-table">
          <caption className="sr-only">cost of common operations</caption>
          <thead><tr><th scope="col">operation</th><th scope="col">array</th><th scope="col">linked list</th></tr></thead>
          <tbody>{COMPARE.map(([op, a, l]) => <tr key={op}><th scope="row">{op}</th><td>{a}</td><td>{l}</td></tr>)}</tbody>
        </table>
      </Card>
    </section>
  );
}
