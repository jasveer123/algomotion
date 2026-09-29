export type CellState = "default" | "inactive" | "current" | "comparing" | "confirmed" | "pending" | "invalid";

export type Lang = "js" | "py" | "java" | "cpp";
export const LANGS: { id: Lang; label: string }[] = [
  { id: "js", label: "javascript" },
  { id: "py", label: "python" },
  { id: "java", label: "java" },
  { id: "cpp", label: "c++" },
];

export type Cell = number | string | null;

export interface Row {
  label?: string;
  values: Cell[];
  /** Stable identity per slot so swaps animate as movement. Defaults to the index. */
  ids?: number[];
  states?: CellState[];
}

export interface Pointer {
  label: string;
  index: number;
  row?: number;
}

export interface Region {
  row?: number;
  from: number;
  to: number;
  label: string;
  tone: CellState;
}

export interface AuxItem {
  text: string;
  state?: CellState;
}

export interface AuxPanel {
  title: string;
  items: AuxItem[];
  empty?: string;
}

export interface Stats {
  comparisons: number;
  swaps: number;
  writes: number;
}

/** One node of a drawn linked structure. Nodes sit on a grid (row, col) so Y-shapes and 2-D lists work. */
export interface ListNode {
  id: number;
  value: Cell;
  row: number;
  col: number;
  next: number | null;
  prev?: number | null;
  random?: number | null;
  /** A second outgoing link drawn downwards (flatten: `bottom`). */
  down?: number | null;
  state?: CellState;
  /** Highlight for this node's `next` arrow (e.g. the link that was just rewired). */
  edge?: CellState;
  /** Small caption under the value, e.g. "×2" or "copy". */
  tag?: string;
}

export interface ListView {
  label?: string;
  nodes: ListNode[];
  /** Pointer labels under nodes; `node: null` points at the null marker. */
  pointers?: { label: string; node: number | null }[];
  rowLabels?: string[];
  doubly?: boolean;
  /** Draw a trailing null marker after the last node of row 0 when its next is null (default true). */
  showNull?: boolean;
}

export interface Frame {
  rows: Row[];
  /** Linked structures drawn under the array rows. */
  lists?: ListView[];
  pointers?: Pointer[];
  regions?: Region[];
  /** Semantic code-line key — matched against `@key` markers in each language's code. */
  line?: string;
  /** Plain-language description of this step. */
  note: string;
  vars?: Record<string, string | number | boolean>;
  aux?: AuxPanel[];
  stats?: Stats;
  result?: string;
}

export interface TracerInput {
  arr: number[];
  arr2?: number[];
  arr3?: number[];
  target?: number;
  k?: number;
}

export type Tracer = (input: TracerInput) => Frame[];

export type TopicId = "arrays" | "linked-list";

export type PatternId =
  | "two-pointers" | "sliding-window" | "sorting-searching" | "hashing" | "greedy"
  | "ll-rewiring" | "ll-fast-slow" | "ll-merge" | "ll-numbers" | "ll-hash-walk";
export type Difficulty = "easy" | "medium" | "hard";

export interface ArrayField {
  key: "arr" | "arr2" | "arr3";
  label: string;
  min?: number;
  max?: number;
  minLen?: number;
  maxLen?: number;
  sorted?: boolean;
  allowed?: number[];
  /** Custom rule, returns an error message or null. */
  check?: (values: number[]) => string | null;
  /** Custom random generator for the "random input" button. */
  gen?: () => number[];
  /** Values are single lowercase letters (stored as char codes). */
  letters?: boolean;
}

export interface ScalarField {
  key: "target" | "k";
  label: string;
  min?: number;
  max?: number;
  hint?: string;
}

export interface InputSpec {
  arrays: ArrayField[];
  scalars?: ScalarField[];
  defaults: TracerInput;
  /** Cross-field validation (e.g. k ≤ n). */
  check?: (input: TracerInput) => string | null;
}

export interface Complexity {
  time: string;
  space: string;
  timeWhy: string;
  spaceWhy: string;
  /** Rough operation count for input size n (used for the comparison bars). */
  ops: (n: number) => number;
}

export type ApproachLevel = "brute" | "improved" | "optimal";

export interface Approach {
  level: ApproachLevel;
  name: string;
  idea: string;
  walkthrough: string[];
  pseudocode: string;
  code: Partial<Record<Lang, string>>;
  complexity: Complexity;
  pros: string[];
  cons: string[];
  tracer?: string;
}

export interface Checkpoint {
  q: string;
  options: string[];
  answer: number;
  right: string;
  wrong: string;
}

export interface Problem {
  slug: string;
  topic: TopicId;
  /** Row numbers inside this topic's section of the Love Babbar 450 sheet. */
  sheet: number[];
  title: string;
  sheetTitle: string;
  pattern: PatternId;
  also?: string[];
  difficulty: Difficulty;
  summary: string;
  intro: string;
  example: { input: string; output: string; why: string };
  clues: string[];
  approaches: Approach[];
  input: InputSpec;
  checkpoints: Checkpoint[];
  /** True for the three fully-worked reference lessons. */
  flagship?: boolean;
}

export interface Pattern {
  id: PatternId;
  topic: TopicId;
  name: string;
  tone: "teal" | "pink" | "lavender" | "yellow" | "coral";
  what: string;
  clues: string[];
  mini: "pointers" | "window" | "bars" | "hash" | "jumps" | "relink" | "chase" | "zip" | "digits" | "lookup";
}

export interface Topic {
  id: TopicId;
  name: string;
  /** Sheet section name, e.g. "Array". */
  sheetName: string;
  tone: "teal" | "pink" | "lavender" | "yellow" | "coral";
  blurb: string;
  /** How many rows the topic has in the sheet. */
  sheetRows: number;
  /** Lesson to start with. */
  start: string;
}

/** Lightweight problem info for lists and cards. */
export interface ProblemSummary {
  slug: string;
  topic: TopicId;
  title: string;
  summary: string;
  pattern: PatternId;
  difficulty: Difficulty;
  sheet: number[];
  checkpoints: number;
  flagship: boolean;
}
