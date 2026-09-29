"use client";
import { useId } from "react";
import { cx } from "@/components/neo/cx";
import type { CellState, ListNode, ListView } from "@/lib/types";

const TOP = 46; // room above a row for back-arcs and labels
const ROW_GAP = 104; // vertical distance between rows (pointer labels + down links)
const BOTTOM = 64; // room under the last row for pointer labels and random arcs
const EDGE_STATES: CellState[] = ["default", "current", "comparing", "confirmed", "pending", "invalid", "inactive"];

type Box = { x: number; y: number };

/** Where a line from a box centre towards (tx, ty) leaves the box outline. */
function exitPoint(cx0: number, cy0: number, tx: number, ty: number, half: number) {
  const dx = tx - cx0, dy = ty - cy0;
  const s = half / Math.max(Math.abs(dx), Math.abs(dy), 1e-6);
  return { x: cx0 + dx * s, y: cy0 + dy * s };
}

export function ListCanvas({ view, width }: { view: ListView; width: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cols = Math.max(1, ...view.nodes.map((n) => n.col + 1));
  const rows = Math.max(1, ...view.nodes.map((n) => n.row + 1));
  const pitch = Math.max(62, Math.min(92, Math.floor(width / (cols + 1))));
  const size = Math.min(50, pitch - 26);
  const half = size / 2;
  const byId = new Map(view.nodes.map((n) => [n.id, n]));
  const pos = (n: ListNode): Box => ({ x: 4 + n.col * pitch, y: TOP + n.row * (size + ROW_GAP) });
  const occupied = new Set(view.nodes.map((n) => `${n.row}:${n.col}`));
  const totalW = Math.max(width, (cols + 1) * pitch + 8);
  const totalH = TOP + rows * size + (rows - 1) * ROW_GAP + BOTTOM;
  const doubly = !!view.doubly;
  const off = doubly ? 7 : 0;
  const font = size >= 46 ? "1.1rem" : size >= 40 ? "1rem" : "0.85rem";

  const edges: React.ReactNode[] = [];
  const nulls: { x: number; y: number; key: string; top: number; w: number }[] = [];
  const marker = (s: CellState = "default") => `url(#${uid}-a-${s})`;

  for (const n of view.nodes) {
    const a = pos(n);
    const acx = a.x + half, acy = a.y + half;
    if (n.next === null && view.showNull !== false) {
      if (!occupied.has(`${n.row}:${n.col + 1}`)) {
        const x1 = a.x + size, x2 = a.x + pitch - 6;
        edges.push(<line key={`n${n.id}`} x1={x1} y1={acy - off} x2={x2 - 12} y2={acy - off} className={cx("ll-edge", `e-${n.edge ?? "default"}`)} markerEnd={marker(n.edge)} />);
        nulls.push({ x: x2 - 10, y: acy - off, key: `z${n.id}`, top: a.y, w: 16 });
      } else {
        nulls.push({ x: a.x + size - 2, y: a.y - 8, key: `z${n.id}`, top: a.y, w: 16 });
      }
    }
    const b = n.next !== null ? byId.get(n.next) : undefined;
    if (b) {
      const p = pos(b);
      const cls = cx("ll-edge", `e-${n.edge ?? "default"}`);
      if (b.row === n.row && b.col === n.col + 1) {
        edges.push(<line key={`e${n.id}`} x1={a.x + size} y1={acy - off} x2={p.x - 3} y2={p.y + half - off} className={cls} markerEnd={marker(n.edge)} />);
      } else if (b.row === n.row) {
        const span = Math.abs(b.col - n.col);
        const lift = 16 + Math.min(span, 6) * 5 + (b.col < n.col ? 6 : 0);
        const x1 = acx + (b.col < n.col ? -6 : 6), x2 = p.x + half + (b.col < n.col ? 6 : -6);
        edges.push(<path key={`e${n.id}`} d={`M ${x1} ${a.y} C ${x1} ${a.y - lift}, ${x2} ${p.y - lift}, ${x2} ${p.y - 3}`} className={cls} markerEnd={marker(n.edge)} fill="none" />);
      } else {
        const s = exitPoint(acx, acy, p.x + half, p.y + half, half);
        const e = exitPoint(p.x + half, p.y + half, acx, acy, half + 3);
        edges.push(<line key={`e${n.id}`} x1={s.x} y1={s.y} x2={e.x} y2={e.y} className={cls} markerEnd={marker(n.edge)} />);
      }
    }
    const pv = n.prev !== undefined && n.prev !== null ? byId.get(n.prev) : undefined;
    if (pv) {
      const p = pos(pv);
      if (pv.row === n.row && pv.col === n.col - 1) {
        edges.push(<line key={`p${n.id}`} x1={a.x} y1={acy + off} x2={p.x + size + 3} y2={p.y + half + off} className="ll-edge ll-prev" markerEnd={marker("inactive")} />);
      } else {
        const s = exitPoint(acx, acy + off, p.x + half, p.y + half + off, half);
        const e = exitPoint(p.x + half, p.y + half + off, acx, acy + off, half + 3);
        edges.push(<line key={`p${n.id}`} x1={s.x} y1={s.y} x2={e.x} y2={e.y} className="ll-edge ll-prev" markerEnd={marker("inactive")} />);
      }
    }
    const dn = n.down !== undefined && n.down !== null ? byId.get(n.down) : undefined;
    if (dn) {
      const p = pos(dn);
      edges.push(<line key={`d${n.id}`} x1={acx} y1={a.y + size} x2={p.x + half} y2={p.y - 3} className={cx("ll-edge", "ll-down")} markerEnd={marker("default")} />);
    }
    const rn = n.random !== undefined && n.random !== null ? byId.get(n.random) : undefined;
    if (rn) {
      const p = pos(rn);
      const drop = 30 + Math.min(Math.abs(rn.col - n.col), 6) * 5;
      edges.push(<path key={`r${n.id}`} d={`M ${acx - 5} ${a.y + size} C ${acx - 5} ${a.y + size + drop}, ${p.x + half + 5} ${p.y + size + drop}, ${p.x + half + 5} ${p.y + size + 3}`} className="ll-edge ll-random" markerEnd={marker("current")} fill="none" />);
    }
  }

  // pointer labels, stacked under their node (or under the null marker)
  const stack = new Map<string, number>();
  const firstNull = nulls[0];
  const labels = (view.pointers ?? []).map((p) => {
    const n = p.node !== null ? byId.get(p.node) : undefined;
    const base = n ? pos(n) : firstNull ? { x: firstNull.x - 6, y: firstNull.top } : { x: 4, y: TOP };
    const k = `${base.x}:${base.y}`;
    const i = stack.get(k) ?? 0;
    stack.set(k, i + 1);
    return { ...p, x: base.x, y: base.y + size + 6 + i * 17, w: n ? size : 28 };
  });

  return (
    <div className="ll-wrap" style={{ overflowX: totalW > width + 1 ? "auto" : "visible" }}>
      <div className="ll-stage" style={{ width: totalW, height: totalH }}>
        <svg className="ll-svg" width={totalW} height={totalH} aria-hidden="true" focusable="false">
          <defs>
            {EDGE_STATES.map((s) => (
              <marker key={s} id={`${uid}-a-${s}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className={`ll-head e-${s}`} />
              </marker>
            ))}
          </defs>
          {edges}
          {nulls.map((z) => (
            <text key={z.key} x={z.x} y={z.y + 5} className="ll-null">∅</text>
          ))}
        </svg>
        {view.rowLabels?.map((l, r) => (
          <span key={`rl${r}`} className="am-arr-label ll-rowlabel" style={{ top: TOP + r * (size + ROW_GAP) - 40 }}>{l}</span>
        ))}
        {view.nodes.map((n) => {
          const p = pos(n);
          return (
            <span key={n.id} className={cx("am-cell ll-node", `st-${n.state ?? "default"}`)} style={{ left: p.x, top: p.y, width: size, height: size, fontSize: String(n.value ?? "").length > 3 ? `calc(${font} * 0.72)` : font }} aria-hidden="true">
              {n.value ?? ""}
              {n.tag ? <span className="ll-tag">{n.tag}</span> : null}
            </span>
          );
        })}
        {labels.map((l) => (
          <span key={`ptr-${l.label}`} className="am-ptr" style={{ left: l.x, top: l.y, width: l.w }} aria-hidden="true">{l.label}</span>
        ))}
      </div>
    </div>
  );
}

/** Text alternative: each row read from its left-most node along `next`, plus pointers. */
export function describeList(view: ListView): string {
  const byId = new Map(view.nodes.map((n) => [n.id, n]));
  const heads = new Map<number, ListNode>();
  for (const n of view.nodes) if (!heads.has(n.row) || heads.get(n.row)!.col > n.col) heads.set(n.row, n);
  const parts = [...heads.entries()].sort((a, b) => a[0] - b[0]).map(([r, h]) => {
    const seen = new Set<number>();
    const out: string[] = [];
    let c: ListNode | undefined = h;
    while (c && !seen.has(c.id) && out.length < 60) {
      seen.add(c.id);
      out.push(`${c.value}${c.state && c.state !== "default" ? ` (${c.state})` : ""}`);
      c = c.next !== null ? byId.get(c.next) : undefined;
    }
    const end = c ? `back to ${c.value}` : "null";
    return `${view.rowLabels?.[r] ? view.rowLabels[r] + ": " : ""}${out.join(" → ")} → ${end}`;
  });
  const ptrs = (view.pointers ?? []).map((p) => `${p.label} at ${p.node === null ? "null" : byId.get(p.node)?.value ?? "?"}`);
  return `${view.label ? view.label + ". " : ""}${parts.join("; ")}${ptrs.length ? `. pointers: ${ptrs.join(", ")}` : ""}`;
}
