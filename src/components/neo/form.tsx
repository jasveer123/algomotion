"use client";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { useId } from "react";
import { cx } from "./cx";

export function Input({ label, hint, error, className, id, ...rest }: { label: string; hint?: string; error?: string | null } & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fid = id ?? auto;
  const hintId = hint ? `${fid}-hint` : undefined;
  const errId = error ? `${fid}-err` : undefined;
  return (
    <div className="nb-field">
      <label className="nb-label" htmlFor={fid}>{label}</label>
      <input
        id={fid}
        className={cx("nb-input", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
      {hint ? <span id={hintId} className="nb-hint">{hint}</span> : null}
      {error ? <span id={errId} className="nb-error" role="alert">{error}</span> : null}
    </div>
  );
}

export function Select({ label, className, id, children, hideLabel, ...rest }: { label: string; hideLabel?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className="nb-field">
      <label className={cx("nb-label", hideLabel && "sr-only")} htmlFor={fid}>{label}</label>
      <select id={fid} className={cx("nb-input", className)} {...rest}>{children}</select>
    </div>
  );
}

