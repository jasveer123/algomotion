"use client";
import { useEffect, useMemo, useRef } from "react";
import { cx } from "@/components/neo/cx";
import { parseCode, tokenize } from "@/lib/code";
import { LANGS, type Lang } from "@/lib/types";
import { Tabs } from "./Tabs";

/** Line-highlighted code with a language switcher. `activeKey` comes from the current animation frame. */
export function CodeViewer({ code, lang, onLang, activeKey, idBase, title }: { code: Partial<Record<Lang, string>>; lang: Lang; onLang: (l: Lang) => void; activeKey?: string; idBase: string; title: string }) {
  const available = LANGS.filter((l) => code[l.id]);
  const shown: Lang = code[lang] ? lang : available[0].id;
  const src = code[shown]!;
  const parsed = useMemo(() => parseCode(src), [src]);
  const box = useRef<HTMLPreElement | null>(null);
  const firstActive = parsed.keys.findIndex((k) => activeKey && k.includes(activeKey));

  // Keep the highlighted line in view inside the code box (never scrolls the page).
  useEffect(() => {
    const el = box.current;
    if (!el || firstActive < 0) return;
    const line = el.querySelectorAll<HTMLElement>(".am-code-line")[firstActive];
    if (!line) return;
    const top = line.offsetTop - el.clientHeight / 3;
    if (line.offsetTop < el.scrollTop || line.offsetTop > el.scrollTop + el.clientHeight - 30) el.scrollTo({ top, behavior: "auto" });
  }, [firstActive]);

  return (
    <div className="am-stack" style={{ gap: 12 }}>
      <Tabs label={`${title} language`} idBase={idBase} tabs={available.map((l) => ({ id: l.id, label: l.label }))} value={shown} onChange={onLang} />
      <div role="tabpanel" id={`${idBase}-panel-${shown}`} aria-labelledby={`${idBase}-tab-${shown}`}>
        <pre ref={box} className="am-code" style={{ maxHeight: 420 }} tabIndex={0} aria-label={`${title} in ${LANGS.find((l) => l.id === shown)!.label}`}>
          <code>
            {parsed.lines.map((line, i) => {
              const on = !!activeKey && parsed.keys[i].includes(activeKey);
              return (
                <span key={i} className={cx("am-code-line", on && "is-active")} aria-current={on ? "step" : undefined}>
                  <span className="am-code-ln" aria-hidden="true">{i + 1}</span>
                  <span className="am-code-text">
                    {tokenize(line, shown).map((t, k) => (t.t === "txt" ? <span key={k}>{t.v}</span> : <span key={k} className={`tk-${t.t}`}>{t.v}</span>))}
                    {"\n"}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>
      {available.length < 4 ? <p className="am-small am-muted">this approach is shown in {available.map((l) => l.label).join(" and ")}; all four languages are given for the optimal approach.</p> : null}
    </div>
  );
}
