import type { ArrayField, InputSpec, TracerInput } from "./types";

export function parseList(text: string): number[] | null {
  const parts = text.split(/[\s,]+/).filter(Boolean);
  if (!parts.length) return [];
  const nums = parts.map((p) => Number(p));
  return nums.every((n) => Number.isInteger(n)) ? nums : null;
}

/** Letters a–z separated by commas or spaces ("a, a, b" or "aab"), stored as char codes. */
export function parseLetters(text: string): number[] | null {
  const compact = text.replace(/[\s,]+/g, "");
  if (!/^[a-z]*$/.test(compact)) return null;
  return [...compact].map((c) => c.charCodeAt(0));
}

export const formatField = (f: ArrayField, v?: number[]) => (v ?? []).map((x) => (f.letters ? String.fromCharCode(x) : String(x))).join(", ");

export function checkArray(f: ArrayField, v: number[] | null): string | null {
  if (v === null) return f.letters ? "use lowercase letters a–z, e.g. a, a, b, c." : "use whole numbers separated by commas, e.g. 3, -1, 4.";
  const minLen = f.minLen ?? 1, maxLen = f.maxLen ?? 12;
  if (v.length < minLen) return `enter at least ${minLen} number${minLen === 1 ? "" : "s"}.`;
  if (v.length > maxLen) return `keep it to ${maxLen} numbers so every step fits on screen.`;
  if (f.allowed && v.some((x) => !f.allowed!.includes(x))) return `only ${f.allowed.join(", ")} are allowed here.`;
  if (f.min !== undefined && v.some((x) => x < f.min!)) return `values must be ≥ ${f.min}.`;
  if (f.max !== undefined && v.some((x) => x > f.max!)) return `values must be ≤ ${f.max}.`;
  if (f.sorted && v.some((x, i) => i > 0 && x < v[i - 1])) return "this array must be sorted (smallest to largest).";
  return f.check ? f.check(v) : null;
}

export function randomFor(spec: InputSpec, current: TracerInput): TracerInput {
  const out: TracerInput = { ...current };
  for (const f of spec.arrays) {
    if (f.gen) { out[f.key] = f.gen(); continue; }
    for (let attempt = 0; attempt < 200; attempt++) {
      const len = Math.max(f.minLen ?? 1, Math.min(f.maxLen ?? 12, 5 + Math.floor(Math.random() * 4)));
      const lo = f.min ?? -20, hi = f.max ?? 20;
      const span = Math.min(hi, lo + 40) - lo;
      let v = f.letters
        ? Array.from({ length: len }, () => 97 + Math.floor(Math.random() * 4))
        : f.allowed
        ? Array.from({ length: len }, () => f.allowed![Math.floor(Math.random() * f.allowed!.length)])
        : Array.from({ length: len }, () => lo + Math.floor(Math.random() * (span + 1)));
      if (f.sorted) v = v.sort((a, b) => a - b);
      if (!checkArray(f, v)) { out[f.key] = v; break; }
    }
  }
  if (spec.arrays.some((f) => f.key === "arr2") && spec.check?.(out)) {
    // e.g. equal-size medians: trim the longer array to match
    const a = out.arr, b = out.arr2 ?? [];
    const m = Math.min(a.length, b.length);
    out.arr = a.slice(0, m);
    out.arr2 = b.slice(0, m);
  }
  if (out.k !== undefined && spec.scalars?.some((s) => s.key === "k")) {
    const kf = spec.scalars.find((s) => s.key === "k")!;
    if (spec.check?.(out)) out.k = Math.max(kf.min ?? 1, Math.min(out.k, out.arr.length));
  }
  return out;
}
