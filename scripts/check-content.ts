/**
 * Validates all lesson content. Run: npm run check:content
 * - unique slugs; every sheet row of every topic is covered
 * - optimal approaches have all four languages; tracers exist
 * - every animation step's line key appears as an @marker in that approach's code
 * - each lesson's default input passes its own input rules
 */
import { PATTERNS, PROBLEMS, TOPICS } from "../src/content";
import { parseCode } from "../src/lib/code";
import { TRACERS } from "../src/lib/tracers";
import { checkArray } from "../src/lib/validate";

const errors: string[] = [];
const slugs = new Set<string>();
for (const p of PROBLEMS) {
  const where = `${p.topic}/${p.slug}`;
  if (slugs.has(p.slug)) errors.push(`${where}: duplicate slug`);
  slugs.add(p.slug);
  if (!PATTERNS.some((x) => x.id === p.pattern && x.topic === p.topic)) errors.push(`${where}: pattern ${p.pattern} doesn't belong to topic ${p.topic}`);
  const opt = p.approaches.find((a) => a.level === "optimal");
  if (!opt) errors.push(`${where}: no optimal approach`);
  else if (Object.keys(opt.code).length !== 4) errors.push(`${where}: optimal needs js, py, java and cpp`);
  if (p.flagship) for (const a of p.approaches) {
    if (Object.keys(a.code).length !== 4) errors.push(`${where}: flagship approach ${a.level} needs 4 languages`);
    if (!a.tracer) errors.push(`${where}: flagship approach ${a.level} needs an animation`);
  }
  if (p.checkpoints.length < 2) errors.push(`${where}: needs at least 2 checkpoints`);
  for (const c of p.checkpoints) if (c.answer < 0 || c.answer >= c.options.length) errors.push(`${where}: checkpoint answer out of range: ${c.q}`);
  for (const f of p.input.arrays) {
    const err = checkArray(f, p.input.defaults[f.key] ?? null);
    if (err) errors.push(`${where}: default "${f.key}" fails its own rules — ${err}`);
  }
  const cross = p.input.check?.(p.input.defaults);
  if (cross) errors.push(`${where}: default input fails the cross-field check — ${cross}`);
  for (const a of p.approaches) {
    if (!a.tracer) continue;
    const t = TRACERS[a.tracer];
    if (!t) { errors.push(`${where}: unknown tracer ${a.tracer}`); continue; }
    const frames = t(p.input.defaults);
    const used = new Set(frames.map((f) => f.line).filter(Boolean) as string[]);
    for (const [lang, src] of Object.entries(a.code)) {
      const keys = new Set(parseCode(src!).keys.flat());
      const missing = [...used].filter((k) => !keys.has(k));
      if (missing.length) errors.push(`${where} ${a.level}.${lang}: animation uses @${missing.join(", @")} but the code has no such marker`);
    }
    if (!frames[frames.length - 1].result) errors.push(`${where} ${a.level}: last animation frame has no result`);
  }
}
for (const t of TOPICS) {
  const lessons = PROBLEMS.filter((p) => p.topic === t.id);
  const rows = new Set(lessons.flatMap((p) => p.sheet));
  const missing = Array.from({ length: t.sheetRows }, (_, i) => i + 1).filter((r) => !rows.has(r));
  const counts = PATTERNS.filter((x) => x.topic === t.id).map((x) => `${x.id}=${lessons.filter((p) => p.pattern === x.id).length}`).join(" ");
  console.log(`${t.id}: ${lessons.length} lessons · ${counts}${missing.length ? ` · MISSING sheet rows ${missing.join(", ")}` : " · all sheet rows covered"}`);
  if (missing.length) errors.push(`${t.id}: sheet rows not covered: ${missing.join(", ")}`);
  if (!lessons.some((p) => p.slug === t.start)) errors.push(`${t.id}: start lesson ${t.start} not found`);
}
if (errors.length) { console.error(`\n${errors.length} problem(s):\n- ${errors.join("\n- ")}`); process.exit(1); }
console.log("content OK");
