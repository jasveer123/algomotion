import { Card } from "@/components/neo";
import type { Approach, ApproachLevel } from "@/lib/types";

const TONE: Record<ApproachLevel, string> = { brute: "var(--state-invalid)", improved: "var(--state-pending)", optimal: "var(--state-confirmed)" };

export function ComplexityCard({ approach, all, n }: { approach: Approach; all: Approach[]; n: number }) {
  const ops = all.map((a) => ({ a, v: Math.max(1, Math.round(a.complexity.ops(n))) }));
  const max = Math.max(...ops.map((o) => o.v));
  return (
    <Card className="am-stack" style={{ gap: 14 }}>
      <div className="am-grid-2" style={{ gap: 16 }}>
        <div className="am-stack" style={{ gap: 4 }}>
          <span className="am-eyebrow">time</span>
          <span className="am-bigO">{approach.complexity.time}</span>
          <p className="am-small">{approach.complexity.timeWhy}</p>
        </div>
        <div className="am-stack" style={{ gap: 4 }}>
          <span className="am-eyebrow">extra space</span>
          <span className="am-bigO">{approach.complexity.space}</span>
          <p className="am-small">{approach.complexity.spaceWhy}</p>
        </div>
      </div>
      {all.length > 1 ? (
        <div className="am-bars" role="img" aria-label={`rough operation counts for n = ${n}: ${ops.map((o) => `${o.a.level} ${o.v}`).join(", ")}`}>
          {ops.map(({ a, v }) => (
            <div key={a.level} className="am-bar-row" aria-hidden="true">
              <span style={{ fontWeight: a === approach ? 700 : 400 }}>{a.level}</span>
              <span className="am-bar" style={{ width: `${Math.max(2, (v / max) * 100)}%`, background: TONE[a.level] }} />
              <span className="am-mono am-small">{v.toLocaleString()} ops</span>
            </div>
          ))}
          <span className="am-small am-muted">rough operation counts for n = {n} (your current input size).</span>
        </div>
      ) : null}
    </Card>
  );
}
