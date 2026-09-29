import Link from "next/link";
import { ButtonLink, Card, IconBox, Tag } from "@/components/neo";
import { IconArrowRight, IconLayers, PATTERN_ICON } from "@/components/icons";
import { PatternCard, TopicCard } from "@/components/algo/PatternCard";
import { StateLegend } from "@/components/algo/StateLegend";
import { FLAGSHIP, PROBLEMS, TOPICS, patternById, patternsIn, topicById } from "@/content";

/** Sheet sections that come after the topics already built, in sheet order. */
const NEXT_UP = ["matrix", "strings", "searching & sorting", "binary trees", "binary search trees", "greedy", "backtracking", "stacks & queues", "heaps", "graphs", "tries", "dynamic programming", "bit manipulation"];

export default function Home() {
  return (
    <>
      <section className="am-section" aria-labelledby="hero" style={{ gap: "var(--space-md)", paddingTop: "var(--space-md)" }}>
        <Tag tone="yellow" style={{ alignSelf: "flex-start" }}>{`${TOPICS.length} topics · ${PROBLEMS.length} lessons`}</Tag>
        <h1 id="hero">watch data structures think.</h1>
        <p className="am-lede" style={{ fontSize: "1.15rem" }}>
          every problem from the love babbar 450 sheet, taught the way you&apos;d explain it on a whiteboard: spot the pattern, see the brute force, then watch it get faster — one animated step at a time.
        </p>
        <div className="am-row">
          {TOPICS.map((t, i) => (
            <ButtonLink key={t.id} href={`/lessons/${t.start}`} variant={i === 0 ? "primary" : "secondary"} pill={i === 0}>
              start {t.name} <IconArrowRight />
            </ButtonLink>
          ))}
          <ButtonLink href="/visualizer" variant="ghost">open the visualizer</ButtonLink>
        </div>
      </section>

      <section className="am-section" aria-labelledby="topics">
        <div className="am-section-head">
          <h2 id="topics">topics</h2>
          <p className="am-lede">each topic follows the sheet row by row, grouped into the patterns that solve them.</p>
        </div>
        <div className="am-grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", alignItems: "stretch" }}>
          {TOPICS.map((t) => <TopicCard key={t.id} id={t.id} />)}
          <Card flat className="am-stack" style={{ gap: 12 }}>
            <IconBox tone="lavender"><IconLayers /></IconBox>
            <h3>coming next</h3>
            <p style={{ fontSize: ".92rem" }}>the rest of the sheet, in order:</p>
            <ul className="am-row" style={{ gap: 6, margin: 0, padding: 0, listStyle: "none" }}>
              {NEXT_UP.map((n) => <li key={n}><Tag flat>{n}</Tag></li>)}
            </ul>
          </Card>
        </div>
      </section>

      <section className="am-section" aria-labelledby="start">
        <div className="am-section-head">
          <h2 id="start">start here</h2>
          <p className="am-lede">fully worked reference lessons — every approach animated, in four languages.</p>
        </div>
        <div className="am-grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {FLAGSHIP.map((p) => {
            const pat = patternById(p.pattern);
            const Icon = PATTERN_ICON[pat.id];
            return (
              <Card key={p.slug} as="article" className="am-stack" style={{ gap: 12 }}>
                <div className="am-row" style={{ justifyContent: "space-between" }}>
                  <IconBox tone={pat.tone}><Icon /></IconBox>
                  <Tag flat>{topicById(p.topic).name}</Tag>
                </div>
                <h3>{p.title}</h3>
                <p className="am-small" style={{ fontSize: ".9rem" }}>{p.summary}</p>
                <Link href={`/lessons/${p.slug}`} className="nb-btn nb-btn-teal nb-btn-sm" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
                  open lesson <span className="sr-only">: {p.title}</span><IconArrowRight />
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="am-section" aria-labelledby="library">
        <div className="am-row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
          <div className="am-section-head">
            <h2 id="library">pattern library</h2>
            <p className="am-lede">learn to recognise the pattern and the problem mostly solves itself.</p>
          </div>
          <span className="am-hand am-desktop-only" aria-hidden="true">spot it, then solve it ↘</span>
        </div>
        {TOPICS.map((t) => (
          <div key={t.id} id={t.id} className="am-stack" style={{ gap: "var(--space-md)", scrollMarginTop: 96 }}>
            <div className="am-row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={{ fontSize: "1.5rem" }}>{t.name}</h3>
              <Link href={`/lessons?topic=${t.id}`} className="am-small">all {PROBLEMS.filter((p) => p.topic === t.id).length} {t.name} lessons →</Link>
            </div>
            <div className="am-grid-2" style={{ alignItems: "start" }}>
              {patternsIn(t.id).map((p) => <PatternCard key={p.id} id={p.id} />)}
            </div>
          </div>
        ))}
        <Card flat className="am-stack" style={{ gap: 14, background: "var(--color-lavender)", color: "var(--text-on-pastel)" }}>
          <div className="am-row" style={{ gap: 14 }}>
            <IconBox tone="yellow"><IconLayers /></IconBox>
            <h3>how the colours work</h3>
          </div>
          <p style={{ color: "var(--text-on-pastel)" }}>every animation — arrays and linked lists — uses the same six states, so a colour means the same thing in every lesson. arrows that just changed are drawn in the same colours.</p>
          <div style={{ color: "var(--text-on-pastel)" }}><StateLegend /></div>
          <Link href="/lab" className="nb-btn nb-btn-ghost nb-btn-sm" style={{ alignSelf: "flex-start" }}>try them in the lab</Link>
        </Card>
      </section>
    </>
  );
}
