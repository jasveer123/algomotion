import type { CellState } from "@/lib/types";

const ITEMS: { s: CellState; label: string }[] = [
  { s: "current", label: "current step" },
  { s: "comparing", label: "comparing" },
  { s: "confirmed", label: "confirmed" },
  { s: "pending", label: "pending / stored" },
  { s: "invalid", label: "eliminated" },
  { s: "inactive", label: "not visited" },
];

export function StateLegend({ only }: { only?: CellState[] }) {
  return (
    <ul className="am-legend" aria-label="color legend">
      {ITEMS.filter((i) => !only || only.includes(i.s)).map((i) => (
        <li key={i.s}>
          <span className={`am-dot st-${i.s}`} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
