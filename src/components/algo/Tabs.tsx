"use client";
import type { KeyboardEvent, ReactNode } from "react";
import { useId, useRef } from "react";
import { cx } from "@/components/neo/cx";

export interface TabDef<T extends string> {
  id: T;
  label: ReactNode;
}

/** WAI-ARIA tabs: arrow keys move between tabs, Home/End jump to the ends. */
export function Tabs<T extends string>({ tabs, value, onChange, label, className, idBase }: { tabs: TabDef<T>[]; value: T; onChange: (v: T) => void; label: string; className?: string; idBase?: string }) {
  const auto = useId();
  const base = idBase ?? auto;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let j = -1;
    if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") j = 0;
    if (e.key === "End") j = tabs.length - 1;
    if (j >= 0) {
      e.preventDefault();
      onChange(tabs[j].id);
      refs.current[j]?.focus();
    }
  };
  return (
    <div role="tablist" aria-label={label} className={cx("am-tabs", className)}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="tab"
          id={`${base}-tab-${t.id}`}
          aria-selected={value === t.id}
          aria-controls={`${base}-panel-${t.id}`}
          tabIndex={value === t.id ? 0 : -1}
          className="am-tab"
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ idBase, id, active, children, className }: { idBase: string; id: string; active: boolean; children: ReactNode; className?: string }) {
  return (
    <div role="tabpanel" id={`${idBase}-panel-${id}`} aria-labelledby={`${idBase}-tab-${id}`} hidden={!active} tabIndex={0} className={cx("am-tab-panel", className)}>
      {active ? children : null}
    </div>
  );
}
