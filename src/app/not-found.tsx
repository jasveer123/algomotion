import { ButtonLink } from "@/components/neo";

export default function NotFound() {
  return (
    <section className="am-section" aria-labelledby="nf">
      <h1 id="nf" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>that page isn&apos;t in the array</h1>
      <p className="am-lede">index out of bounds. the lesson you&apos;re looking for may have moved.</p>
      <ButtonLink href="/lessons" variant="primary" style={{ alignSelf: "flex-start" }}>see all lessons</ButtonLink>
    </section>
  );
}
