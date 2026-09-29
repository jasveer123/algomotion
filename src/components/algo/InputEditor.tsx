"use client";
import { useState } from "react";
import { Button, Input } from "@/components/neo";
import { IconShuffle } from "@/components/icons";
import { checkArray, formatField, parseLetters, parseList, randomFor } from "@/lib/validate";
import type { InputSpec, TracerInput } from "@/lib/types";


/** Lets learners replay the animation on their own numbers. Invalid input never reaches the tracer. */
export function InputEditor({ spec, value, onApply }: { spec: InputSpec; value: TracerInput; onApply: (v: TracerInput) => void }) {
  const [text, setText] = useState<Record<string, string>>(() => Object.fromEntries(spec.arrays.map((f) => [f.key, formatField(f, value[f.key])])));
  const [nums, setNums] = useState<Record<string, string>>(() => Object.fromEntries((spec.scalars ?? []).map((s) => [s.key, String(value[s.key] ?? "")])));
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const load = (v: TracerInput) => {
    setText(Object.fromEntries(spec.arrays.map((f) => [f.key, formatField(f, v[f.key])])));
    setNums(Object.fromEntries((spec.scalars ?? []).map((s) => [s.key, String(v[s.key] ?? "")])));
    setErrors({});
    setFormError(null);
    onApply(v);
  };

  const submit = () => {
    const next: TracerInput = { arr: [] };
    const errs: Record<string, string | null> = {};
    for (const f of spec.arrays) {
      const v = f.letters ? parseLetters(text[f.key] ?? "") : parseList(text[f.key] ?? "");
      errs[f.key] = checkArray(f, v);
      if (v) next[f.key] = v;
    }
    for (const s of spec.scalars ?? []) {
      const raw = (nums[s.key] ?? "").trim();
      const v = Number(raw);
      if (raw === "" || !Number.isInteger(v)) errs[s.key] = "enter a whole number.";
      else if (s.min !== undefined && v < s.min) errs[s.key] = `must be ≥ ${s.min}.`;
      else if (s.max !== undefined && v > s.max) errs[s.key] = `must be ≤ ${s.max}.`;
      else { errs[s.key] = null; next[s.key] = v; }
    }
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) { setFormError(null); return; }
    const cross = spec.check?.(next) ?? null;
    setFormError(cross);
    if (!cross) onApply(next);
  };

  return (
    <form
      className="am-stack"
      style={{ gap: 12 }}
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      aria-label="your own input"
      noValidate
    >
      <div className="am-grid-2" style={{ gap: 12 }}>
        {spec.arrays.map((f) => (
          <Input
            key={f.key}
            label={f.label}
            value={text[f.key] ?? ""}
            onChange={(e) => setText((t) => ({ ...t, [f.key]: e.target.value }))}
            hint={f.letters ? `letters a–z · ${f.minLen ?? 1}–${f.maxLen ?? 12} characters` : `comma-separated · ${f.minLen ?? 1}–${f.maxLen ?? 12} values${f.min !== undefined && f.max !== undefined ? ` · ${f.min} to ${f.max}` : ""}`}
            error={errors[f.key]}
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
          />
        ))}
        {(spec.scalars ?? []).map((s) => (
          <Input
            key={s.key}
            label={s.label}
            type="number"
            inputMode="numeric"
            value={nums[s.key] ?? ""}
            min={s.min}
            max={s.max}
            onChange={(e) => setNums((t) => ({ ...t, [s.key]: e.target.value }))}
            error={errors[s.key]}
          />
        ))}
      </div>
      {formError ? <p className="nb-error" role="alert">{formError}</p> : null}
      <div className="am-row" style={{ gap: 10 }}>
        <Button type="submit" variant="secondary" size="sm">replay with my input</Button>
        <Button variant="teal" size="sm" onClick={() => load(randomFor(spec, value))}><IconShuffle /> random</Button>
        <Button variant="ghost" size="sm" onClick={() => load(spec.defaults)}>reset example</Button>
      </div>
    </form>
  );
}
