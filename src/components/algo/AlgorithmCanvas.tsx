"use client";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/components/neo/cx";
import type { CellState, Frame, Row } from "@/lib/types";
import { ListCanvas, describeList } from "./ListCanvas";

const MAX_CELL = 56;
const MIN_CELL = 26;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const STATE_WORD: Record<CellState, string> = {
  default: "",
  inactive: "not visited",
  current: "current",
  comparing: "comparing",
  confirmed: "confirmed",
  pending: "stored",
  invalid: "eliminated",
};

function ArrayRow({ row, rowIndex, frame, width, longest }: { row: Row; rowIndex: number; frame: Frame; width: number; longest: number }) {
  const n = row.values.length;
  const GAP = width < 420 ? 5 : 8;
  const cell = Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor((width - GAP * (longest - 1)) / Math.max(1, longest))));
  const pitch = cell + GAP;
  const ids = row.ids ?? row.values.map((_, i) => i);
  const order = ids.map((id, pos) => ({ id, pos })).sort((a, b) => a.id - b.id);
  const pointers = (frame.pointers ?? []).filter((p) => (p.row ?? 0) === rowIndex && p.index >= 0 && p.index < n);
  const regions = (frame.regions ?? []).filter((r) => (r.row ?? 0) === rowIndex && r.to >= r.from);
  const ptrStack = new Map<number, number>();
  const trackH = 22 + cell + 8 + (pointers.length ? 18 * Math.max(...pointers.map((p) => { const k = (ptrStack.get(p.index) ?? 0) + 1; ptrStack.set(p.index, k); return k; })) : 0) + regions.length * 30;
  ptrStack.clear();
  const font = cell >= 48 ? "1.25rem" : cell >= 38 ? "1.05rem" : "0.85rem";
  const overflow = n * pitch - GAP > width + 1;

  return (
    <div className="am-arr-row">
      {row.label ? <span className="am-arr-label">{row.label}</span> : null}
      <div style={{ overflowX: overflow ? "auto" : "visible", paddingBottom: overflow ? 6 : 0 }}>
        <div className="am-arr-track" style={{ height: trackH, width: overflow ? n * pitch : "100%" }}>
          {row.values.map((_, pos) => (
            <span key={`i${pos}`} className="am-idx" style={{ left: pos * pitch, width: cell }} aria-hidden="true">{pos}</span>
          ))}
          {order.map(({ id, pos }) => {
            const v = row.values[pos];
            const st = row.states?.[pos] ?? "default";
            return (
              <span
                key={id}
                className={cx("am-cell", `st-${st}`, v === null && "am-cell-empty")}
                style={{ left: pos * pitch, width: cell, height: cell, fontSize: String(v ?? "").length > 3 ? `calc(${font} * 0.72)` : font }}
                aria-hidden="true"
              >
                {v ?? ""}
              </span>
            );
          })}
          {pointers.map((p) => {
            const k = ptrStack.get(p.index) ?? 0;
            ptrStack.set(p.index, k + 1);
            return (
              <span key={`p-${p.label}`} className="am-ptr" style={{ left: p.index * pitch, width: cell, top: 22 + cell + 6 + k * 18 }} aria-hidden="true">
                {p.label}
              </span>
            );
          })}
          {regions.map((r, k) => (
            <span
              key={`r${k}`}
              className={cx("am-region", `st-${r.tone}`)}
              style={{ left: r.from * pitch, width: (r.to - r.from) * pitch + cell, top: trackH - regions.length * 30 + k * 30, borderColor: "var(--border-color)", background: "transparent" }}
              aria-hidden="true"
            >
              <span className="am-region-label">
                <span className={cx("am-dot", `st-${r.tone}`)} style={{ display: "inline-block", width: 9, height: 9, marginRight: 4, verticalAlign: "middle" }} />
                {r.label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Text alternative for one row, read by screen readers instead of the drawn cells. */
function describeRow(row: Row, frame: Frame, rowIndex: number) {
  const ptrs = (frame.pointers ?? []).filter((p) => (p.row ?? 0) === rowIndex);
  const cells = row.values.map((v, i) => {
    const st = row.states?.[i] ?? "default";
    const word = STATE_WORD[st];
    const here = ptrs.filter((p) => p.index === i).map((p) => p.label);
    return `${v ?? "empty"}${word ? ` (${word})` : ""}${here.length ? ` ← ${here.join(", ")}` : ""}`;
  });
  return `${row.label ? row.label + ": " : ""}${cells.join(", ")}`;
}

export function AlgorithmCanvas({ frame, index, total, title }: { frame: Frame; index: number; total: number; title?: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const longest = Math.max(1, ...frame.rows.map((r) => r.values.length));
  return (
    <figure className="am-canvas" style={{ margin: 0 }} aria-label={title ?? "algorithm animation"}>
      <div ref={ref} className="am-canvas-rows">
        {width > 0 && frame.rows.map((row, i) => <ArrayRow key={i} row={row} rowIndex={i} frame={frame} width={width} longest={longest} />)}
        {width > 0 && frame.lists?.map((l, i) => (
          <div key={`list${i}`} className="am-arr-row">
            {l.label ? <span className="am-arr-label">{l.label}</span> : null}
            <ListCanvas view={l} width={width} />
          </div>
        ))}
      </div>
      <ul className="sr-only">
        {frame.rows.map((row, i) => <li key={i}>{describeRow(row, frame, i)}</li>)}
        {frame.lists?.map((l, i) => <li key={`l${i}`}>{describeList(l)}</li>)}
      </ul>

      {frame.aux?.length ? (
        <div className="am-aux">
          {frame.aux.map((a) => (
            <div key={a.title} className="am-aux-block">
              <span className="am-arr-label">{a.title}</span>
              <div className="am-aux-items">
                {a.items.length ? a.items.map((it, k) => (
                  <span key={k} className={cx("am-chip", it.state && `st-${it.state}`)}>{it.text}</span>
                )) : <span className="am-small am-muted">{a.empty ?? "empty"}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {(frame.vars && Object.keys(frame.vars).length) || frame.stats ? (
        <div className="am-vars" aria-label="variables">
          {Object.entries(frame.vars ?? {}).map(([k, v]) => (
            <span key={k} className="am-var">{k} = <b>{String(v)}</b></span>
          ))}
          {frame.stats ? (
            <>
              <span className="am-var">comparisons = <b>{frame.stats.comparisons}</b></span>
              <span className="am-var">swaps = <b>{frame.stats.swaps}</b></span>
            </>
          ) : null}
        </div>
      ) : null}

      <figcaption className="am-narration" aria-live="polite">
        <span className="am-narration-step">{index + 1}/{total}</span>
        <span>{frame.note}</span>
      </figcaption>
      {frame.result && index === total - 1 ? <div className="am-result" role="status">{frame.result}</div> : null}
    </figure>
  );
}
