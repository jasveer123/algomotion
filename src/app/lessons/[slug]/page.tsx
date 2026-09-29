import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/lesson/LessonView";
import { PROBLEMS, problemBySlug } from "@/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROBLEMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/lessons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = problemBySlug(slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function LessonPage({ params }: PageProps<"/lessons/[slug]">) {
  const { slug } = await params;
  if (!problemBySlug(slug)) notFound();
  return <LessonView slug={slug} />;
}
