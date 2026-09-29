# algomotion

A visual way to learn data structures & algorithms: step-by-step animations, pattern recognition and solutions that grow from brute force to optimal — built around the Love Babbar 450 sheet.

**Topics so far:** arrays (35 lessons, 36 sheet rows) and linked lists (36 lessons, 36 sheet rows), each grouped into five patterns, plus a visualizer and a data-structure lab.

```bash
npm install
npm run dev              # http://localhost:3000
npm run check:content    # validate every lesson: sheet coverage, code markers, default inputs
npm run build
```

## where things live

| path | what |
| --- | --- |
| `src/content/<topic>/` | lesson content per topic (`arrays/`, `linked-list/`), one file per pattern, plus the topic's pattern list in `index.ts` |
| `src/content/index.ts` | the topic list and helpers used by pages |
| `src/lib/tracers/` | step-by-step animations — array tracers at the top level, linked-list tracers in `ll/` |
| `src/lib/list.ts` | the linked-list model tracers use (stable node ids so nodes glide when relinked) |
| `src/components/algo/` | lesson building blocks: `AlgorithmCanvas` (arrays), `ListCanvas` (nodes & arrows), playback, code viewer, checkpoints, pattern cards |
| `src/components/lesson/`, `lab/`, `visualizer/` | the lesson template, the array + linked-list lab, the visualizer |
| `src/app/globals.css` | design tokens (Neobrutalism + AlgoMotion state colours) and all styles |

## adding a topic

1. Add the topic to `TOPICS` in `src/content/index.ts` and its `TopicId` in `src/lib/types.ts`.
2. Create `src/content/<topic>/` with patterns (`topic` set on each) and lessons in sheet order.
3. Write tracers for new animations and register them in `src/lib/tracers/index.ts`.
4. Run `npm run check:content` — it fails until every sheet row is covered and every animation matches its code.
