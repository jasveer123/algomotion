import type { Lang } from "./types";

export interface ParsedCode {
  lines: string[];
  /** keys[i] = semantic keys attached to line i via a trailing `// @key` or `# @key` marker. */
  keys: string[][];
}

const MARKER = /\s*(?:\/\/|#)\s*@([\w,-]+)\s*$/;

export function parseCode(src: string): ParsedCode {
  const raw = src.replace(/^\n+|\s+$/g, "").split("\n");
  const lines: string[] = [];
  const keys: string[][] = [];
  for (const line of raw) {
    const m = line.match(MARKER);
    if (m) {
      lines.push(line.slice(0, m.index).replace(/\s+$/, ""));
      keys.push(m[1].split(","));
    } else {
      lines.push(line);
      keys.push([]);
    }
  }
  return { lines, keys };
}

const KEYWORDS: Record<Lang, string[]> = {
  js: ["function", "const", "let", "var", "for", "of", "in", "while", "do", "if", "else", "return", "new", "true", "false", "null", "continue", "break", "Infinity"],
  py: ["def", "for", "in", "while", "if", "elif", "else", "return", "True", "False", "None", "not", "and", "or", "continue", "break", "lambda", "import", "from", "float", "range", "len"],
  java: ["public", "static", "int", "long", "double", "boolean", "void", "new", "for", "while", "do", "if", "else", "return", "true", "false", "null", "continue", "break", "class", "final"],
  cpp: ["int", "long", "double", "bool", "void", "auto", "const", "for", "while", "do", "if", "else", "return", "true", "false", "continue", "break", "vector", "string", "unordered_map", "unordered_set", "pair"],
};

export type Token = { t: "kw" | "str" | "num" | "com" | "txt"; v: string };

export function tokenize(line: string, lang: Lang): Token[] {
  const out: Token[] = [];
  const kw = new Set(KEYWORDS[lang]);
  const comment = lang === "py" ? "#" : "//";
  let i = 0;
  let buf = "";
  const flush = () => { if (buf) { out.push({ t: "txt", v: buf }); buf = ""; } };
  while (i < line.length) {
    const ch = line[i];
    if (line.startsWith(comment, i)) { flush(); out.push({ t: "com", v: line.slice(i) }); return out; }
    if (ch === '"' || ch === "'") {
      flush();
      let j = i + 1;
      while (j < line.length && line[j] !== ch) j += line[j] === "\\" ? 2 : 1;
      out.push({ t: "str", v: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < line.length && /[\w]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (kw.has(word)) { flush(); out.push({ t: "kw", v: word }); } else buf += word;
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch) && !/[\w]/.test(line[i - 1] ?? "")) {
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      flush();
      out.push({ t: "num", v: line.slice(i, j) });
      i = j;
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}
