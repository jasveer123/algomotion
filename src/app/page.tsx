import Link from "next/link";
import { ButtonLink, Card, IconBox, Tag } from "@/components/neo";
import { IconArrowRight, IconLayers, PATTERN_ICON } from "@/components/icons";
import { PatternCard, TopicProgressCard } from "@/components/algo/PatternCard";
import { StateLegend } from "@/components/algo/StateLegend";
import { FLAGSHIP, PATTERNS, patternById } from "@/content";

export default function Home() {
  return (
    <>
      <section className="am-section" aria-labelledby="hero" style={{ gap: "var(--space-md)", paddingTop: "var(--space-md)" }}>
        <Tag tone="yellow" style={{ alignSelf: "flex-start" }}>arrays module · 35 lessons</Tag>
        <h1 id="hero">watch arrays think.</h1>
        <p className="am-lede" style={{ fontSize: "1.15rem" }}>
          every array problem from the love babbar 450 sheet, taught the way you&apos;d explain it on a whiteboard: spot the pattern, see the brute force, then watch it get faster — one animated step at a time.
        </p>
        <div className="am-row">
          <ButtonLink href="/lessons/kadane" variant="primary" pill>start with kadane&apos;s algorithm <IconArrowRight /></ButtonLink>
          <ButtonLink href="/visualizer" variant="ghost">open the visualizer</ButtonLink>
        </div>
      </section>

      <section className="am-section" aria-labelledby="start">
        <div className="am-section-head">
          <h2 id="start">start here</h2>
          <p className="am-lede">three fully worked reference lessons — every approach animated, in four languages.</p>
        </div>
        <div className="am-grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <TopicProgressCard />
          {FLAGSHIP.map((p) => {
            const pat = patternById(p.pattern);
            const Icon = PATTERN_ICON[pat.id];
            return (
              <Card key={p.slug} as="article" className="am-stack" style={{ gap: 12 }}>
                <div className="am-row" style={{ justifyContent: "space-between" }}>
                  <IconBox tone={pat.tone}><Icon /></IconBox>
                  <Tag flat>{pat.name}</Tag>
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
            <p className="am-lede">five patterns cover all 35 array problems. learn to recognise the pattern and the problem mostly solves itself.</p>
          </div>
          <span className="am-hand am-desktop-only" aria-hidden="true">spot it, then solve it ↘</span>
        </div>
        <div className="am-grid-2" style={{ alignItems: "start" }}>
          {PATTERNS.map((p) => <PatternCard key={p.id} id={p.id} />)}
          <Card flat className="am-stack" style={{ gap: 14, background: "var(--color-lavender)", color: "var(--text-on-pastel)" }}>
            <IconBox tone="yellow"><IconLayers /></IconBox>
            <h3>how the colours work</h3>
            <p style={{ color: "var(--text-on-pastel)" }}>every animation uses the same six states, so a colour means the same thing in every lesson.</p>
            <div style={{ color: "var(--text-on-pastel)" }}><StateLegend /></div>
            <Link href="/lab" className="nb-btn nb-btn-ghost nb-btn-sm" style={{ alignSelf: "flex-start" }}>try them in the array lab</Link>
          </Card>
        </div>
      </section>
    </>
  );
}
