import type { Pattern, PatternId, Problem, ProblemSummary, Topic, TopicId } from "@/lib/types";
import { ARRAY_PATTERNS, ARRAY_PROBLEMS } from "./arrays";
import { LL_PATTERNS, LL_PROBLEMS } from "./linked-list";

export const TOPICS: Topic[] = [
  { id: "arrays", name: "arrays", sheetName: "Array", tone: "teal", blurb: "the foundation: pointers from both ends, sliding windows, running sums, hashing and partitioning.", sheetRows: 36, start: "kadane" },
  { id: "linked-list", name: "linked lists", sheetName: "LinkedList", tone: "pink", blurb: "nodes and arrows: reverse links, chase with fast & slow pointers, merge sorted chains and treat lists as numbers.", sheetRows: 36, start: "reverse-linked-list" },
];

export const PATTERNS: Pattern[] = [...ARRAY_PATTERNS, ...LL_PATTERNS];
export const PROBLEMS: Problem[] = [...ARRAY_PROBLEMS, ...LL_PROBLEMS];

export const topicById = (id: TopicId) => TOPICS.find((t) => t.id === id)!;
export const problemBySlug = (slug: string) => PROBLEMS.find((p) => p.slug === slug);
export const problemsFor = (id: PatternId) => PROBLEMS.filter((p) => p.pattern === id);
export const patternById = (id: PatternId) => PATTERNS.find((p) => p.id === id)!;
export const problemsIn = (topic: TopicId) => PROBLEMS.filter((p) => p.topic === topic);
export const patternsIn = (topic: TopicId) => PATTERNS.filter((p) => p.topic === topic);
export const FLAGSHIP = PROBLEMS.filter((p) => p.flagship);

export const summarize = (p: Problem): ProblemSummary => ({
  slug: p.slug, topic: p.topic, title: p.title, summary: p.summary, pattern: p.pattern, difficulty: p.difficulty,
  sheet: p.sheet, checkpoints: p.checkpoints.length, flagship: !!p.flagship,
});
