import { PROBLEMS, PATTERNS } from "../src/content";
import { TRACERS } from "../src/lib/tracers";
import { parseCode } from "../src/lib/code";
let problems = 0, errors = 0;
const sheetRows = new Set<number>();
for (const p of PROBLEMS) {
  problems++;
  p.sheet.forEach((s) => sheetRows.add(s));
  const opt = p.approaches.find((a) => a.level === "optimal");
  if (!opt) { console.log("NO OPTIMAL", p.slug); errors++; }
  if (opt && Object.keys(opt.code).length !== 4) { console.log("optimal missing langs", p.slug, Object.keys(opt.code)); errors++; }
  if (p.flagship) for (const a of p.approaches) if (Object.keys(a.code).length !== 4) { console.log("flagship approach missing langs", p.slug, a.level); errors++; }
  if (p.checkpoints.length < 2) { console.log("few checkpoints", p.slug); errors++; }
  for (const c of p.checkpoints) if (c.answer >= c.options.length) { console.log("bad answer idx", p.slug, c.q); errors++; }
  for (const a of p.approaches) {
    if (!a.tracer) continue;
    const t = TRACERS[a.tracer];
    if (!t) { console.log("missing tracer", a.tracer); errors++; continue; }
    const frames = t(p.input.defaults);
    const used = new Set(frames.map((f) => f.line).filter(Boolean) as string[]);
    for (const [lang, src] of Object.entries(a.code)) {
      const keys = new Set(parseCode(src!).keys.flat());
      const missing = [...used].filter((k) => !keys.has(k));
      if (missing.length) { console.log(`${p.slug} ${a.level} ${lang}: tracer keys not in code:`, missing.join(",")); errors++; }
    }
    const last = frames[frames.length - 1];
    console.log(p.slug.padEnd(30), a.level.padEnd(9), String(frames.length).padStart(4), last.result ?? "(no result)");
  }
}
const missingRows = Array.from({ length: 36 }, (_, i) => i + 1).filter((r) => !sheetRows.has(r));
console.log(`\n${problems} problems, patterns: ${PATTERNS.map((p) => p.id + "=" + PROBLEMS.filter((q) => q.pattern === p.id).length).join(" ")}`);
console.log("sheet rows not covered:", missingRows.length ? missingRows : "none");
console.log("errors:", errors);
