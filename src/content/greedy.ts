import type { Problem } from "@/lib/types";

const lg = (n: number) => Math.max(1, Math.log2(Math.max(2, n)));

export const minimiseHeights: Problem = {
  slug: "minimise-heights",
  sheet: [9],
  title: "minimise the maximum difference between heights",
  sheetTitle: "Minimise the maximum difference between heights [V.IMP]",
  pattern: "greedy",
  also: ["sorting"],
  difficulty: "medium",
  summary: "raise or lower every tower by exactly k to make them as even as possible.",
  intro: "each tower must be changed by exactly k — either raised by k or lowered by k (heights can't go negative). choose for each tower so that the difference between the tallest and shortest tower afterwards is as small as possible.",
  example: { input: "heights = [1, 5, 8, 10], k = 2", output: "5", why: "→ [3, 3, 6, 8]: the difference is 8 − 3 = 5." },
  clues: ["every element gets one of two choices (+k or −k).", "sort first: in some optimal answer, a prefix goes up and the suffix goes down.", "then only n − 1 split points need checking."],
  approaches: [
    {
      level: "brute", name: "try all 2ⁿ choices", idea: "for every tower independently choose +k or −k and measure the result.",
      walkthrough: ["enumerate each ± pattern.", "skip patterns with negative heights.", "keep the smallest max − min."], pseudocode: "for mask in 0..2ⁿ−1: build heights, best ← min(best, max − min)",
      code: { js: `function minDiff(arr, k) {\n  let best = Infinity;\n  for (let mask = 0; mask < 1 << arr.length; mask++) {\n    const h = arr.map((x, i) => (mask >> i) & 1 ? x + k : x - k);\n    if (h.some((x) => x < 0)) continue;\n    best = Math.min(best, Math.max(...h) - Math.min(...h));\n  }\n  return best;\n}`, py: `from itertools import product\ndef min_diff(arr, k):\n    best = float("inf")\n    for signs in product((k, -k), repeat=len(arr)):\n        h = [x + s for x, s in zip(arr, signs)]\n        if min(h) >= 0: best = min(best, max(h) - min(h))\n    return best` },
      complexity: { time: "O(2ⁿ · n)", space: "O(n)", timeWhy: "every combination of choices.", spaceWhy: "one candidate array.", ops: (n) => Math.min(1e6, 2 ** n * n) },
      pros: ["always correct."], cons: ["exponential."],
    },
    {
      level: "optimal", name: "sort, then try each split", idea: "after sorting, raise [0..i−1] and lower [i..n−1]. the new min is min(s[0]+k, s[i]−k) and the new max is max(s[i−1]+k, s[n−1]−k).",
      walkthrough: ["sort.", "baseline: best = s[n−1] − s[0].", "for each split i: skip if s[i] − k < 0.", "compute low/high from the four border values; keep the best."],
      pseudocode: "sort s\nbest ← s[n−1] − s[0]\nfor i in 1..n−1\n  if s[i] − k < 0: continue\n  low ← min(s[0]+k, s[i]−k)\n  high ← max(s[i−1]+k, s[n−1]−k)\n  best ← min(best, high − low)",
      code: {
        js: `function minDiff(arr, k) {
  arr.sort((a, b) => a - b); // @sort
  const n = arr.length;
  let best = arr[n - 1] - arr[0]; // @init
  for (let i = 1; i < n; i++) {
    if (arr[i] - k < 0) continue; // @skip
    const low = Math.min(arr[0] + k, arr[i] - k); // @split
    const high = Math.max(arr[i - 1] + k, arr[n - 1] - k); // @split
    best = Math.min(best, high - low); // @best
  }
  return best; // @done
}`,
        py: `def min_diff(arr, k):
    arr.sort()  # @sort
    n = len(arr)
    best = arr[-1] - arr[0]  # @init
    for i in range(1, n):
        if arr[i] - k < 0: continue  # @skip
        low = min(arr[0] + k, arr[i] - k)  # @split
        high = max(arr[i - 1] + k, arr[-1] - k)  # @split
        best = min(best, high - low)  # @best
    return best  # @done`,
        java: `static int minDiff(int[] arr, int k) {
    Arrays.sort(arr); // @sort
    int n = arr.length;
    int best = arr[n - 1] - arr[0]; // @init
    for (int i = 1; i < n; i++) {
        if (arr[i] - k < 0) continue; // @skip
        int low = Math.min(arr[0] + k, arr[i] - k); // @split
        int high = Math.max(arr[i - 1] + k, arr[n - 1] - k); // @split
        best = Math.min(best, high - low); // @best
    }
    return best; // @done
}`,
        cpp: `int minDiff(vector<int> arr, int k) {
    sort(arr.begin(), arr.end()); // @sort
    int n = arr.size();
    int best = arr[n - 1] - arr[0]; // @init
    for (int i = 1; i < n; i++) {
        if (arr[i] - k < 0) continue; // @skip
        int low = min(arr[0] + k, arr[i] - k); // @split
        int high = max(arr[i - 1] + k, arr[n - 1] - k); // @split
        best = min(best, high - low); // @best
    }
    return best; // @done
}`,
      },
      complexity: { time: "O(n log n)", space: "O(1)", timeWhy: "sorting, then one linear pass over split points.", spaceWhy: "a few variables.", ops: (n) => n * lg(n) },
      pros: ["checks n − 1 candidates instead of 2ⁿ."], cons: ["the 'prefix up, suffix down' insight must be argued, not assumed."],
      tracer: "heights",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "tower heights", min: 0, max: 99, minLen: 1, maxLen: 10 }],
    scalars: [{ key: "k", label: "k", min: 0, max: 50 }],
    defaults: { arr: [1, 5, 8, 10], k: 2 },
  },
  checkpoints: [
    { q: "why does sorting make this greedy approach work?", options: ["sorted arrays are faster to read", "some optimal answer raises a sorted prefix and lowers the suffix", "k must be sorted too"], answer: 1, right: "exactly — so there are only n − 1 splits to try.", wrong: "think about which towers you'd want to raise: the short ones or the tall ones?" },
    { q: "for a split at i, which tower can become the new tallest?", options: ["only s[n−1] − k", "s[i−1] + k or s[n−1] − k", "s[0] + k"], answer: 1, right: "right — the top of the raised part or the top of the lowered part.", wrong: "the raised part's max is at its right end; the lowered part's max is at its right end too." },
  ],
};

export const minJumps: Problem = {
  slug: "min-jumps",
  sheet: [10],
  title: "minimum number of jumps to reach the end",
  sheetTitle: "Minimum no. of Jumps to reach end of an array",
  pattern: "greedy",
  also: ["bfs by levels"],
  difficulty: "medium",
  summary: "each number is your max jump length — fewest jumps to the last index?",
  intro: "you start at index 0. arr[i] is the maximum number of steps you can jump forward from index i. find the minimum number of jumps to reach the last index, or −1 if it can't be reached.",
  example: { input: "[1, 3, 5, 8, 9, 2, 6, 7, 6, 8, 9]", output: "3", why: "0 → 1 (value 3) → 4 (value 9) → reaches the end." },
  clues: ["“minimum number of steps” on a line → think in levels (bfs).", "each jump covers a range of reachable indexes.", "within a range, only the furthest next reach matters — greedy."],
  approaches: [
    {
      level: "brute", name: "dynamic programming", idea: "jumps[i] = fewest jumps to reach i; for each i, update every index it can reach.",
      walkthrough: ["jumps[0] = 0, others ∞.", "for each i, for each step 1..arr[i]: jumps[i+s] = min(jumps[i+s], jumps[i]+1)."], pseudocode: "for i: for s in 1..arr[i]: jumps[i+s] ← min(jumps[i+s], jumps[i]+1)",
      code: { js: `function minJumps(arr) {\n  const n = arr.length, J = Array(n).fill(Infinity);\n  J[0] = 0;\n  for (let i = 0; i < n; i++)\n    for (let s = 1; s <= arr[i] && i + s < n; s++) J[i + s] = Math.min(J[i + s], J[i] + 1);\n  return J[n - 1] === Infinity ? -1 : J[n - 1];\n}`, py: `def min_jumps(arr):\n    n = len(arr); J = [0] + [float("inf")] * (n - 1)\n    for i in range(n):\n        for s in range(1, arr[i] + 1):\n            if i + s < n: J[i + s] = min(J[i + s], J[i] + 1)\n    return -1 if J[-1] == float("inf") else J[-1]` },
      complexity: { time: "O(n²)", space: "O(n)", timeWhy: "each index may relax up to n others.", spaceWhy: "the jumps table.", ops: (n) => (n * n) / 2 },
      pros: ["easy to prove correct."], cons: ["quadratic when jump values are large."],
    },
    {
      level: "optimal", name: "greedy ranges (implicit bfs)", idea: "track the end of the current jump's reach and the furthest index reachable with one more jump. when you walk past the current end, you must jump — and you jump to wherever gives the furthest reach.",
      walkthrough: ["jumps = 1, end = far = arr[0].", "for each i: far = max(far, i + arr[i]).", "reaching the last index → return jumps.", "i = end → if far ≤ i you're stuck; else jumps++, end = far."],
      pseudocode: "jumps ← 1; end ← arr[0]; far ← arr[0]\nfor i in 1..n−1\n  if i = n−1: return jumps\n  far ← max(far, i + arr[i])\n  if i = end\n    if far ≤ i: return −1\n    jumps++; end ← far",
      code: {
        js: `function minJumps(arr) {
  const n = arr.length;
  if (n <= 1) return 0; // @init
  if (arr[0] === 0) return -1; // @init
  let jumps = 1, end = arr[0], far = arr[0]; // @init
  for (let i = 1; i < n; i++) {
    if (i === n - 1) return jumps; // @reach
    far = Math.max(far, i + arr[i]); // @far
    if (i === end) {
      if (far <= i) return -1; // @stuck
      jumps++; end = far; // @jump
    }
  }
  return jumps;
}`,
        py: `def min_jumps(arr):
    n = len(arr)
    if n <= 1: return 0  # @init
    if arr[0] == 0: return -1  # @init
    jumps, end, far = 1, arr[0], arr[0]  # @init
    for i in range(1, n):
        if i == n - 1: return jumps  # @reach
        far = max(far, i + arr[i])  # @far
        if i == end:
            if far <= i: return -1  # @stuck
            jumps += 1; end = far  # @jump
    return jumps`,
        java: `static int minJumps(int[] arr) {
    int n = arr.length;
    if (n <= 1) return 0; // @init
    if (arr[0] == 0) return -1; // @init
    int jumps = 1, end = arr[0], far = arr[0]; // @init
    for (int i = 1; i < n; i++) {
        if (i == n - 1) return jumps; // @reach
        far = Math.max(far, i + arr[i]); // @far
        if (i == end) {
            if (far <= i) return -1; // @stuck
            jumps++; end = far; // @jump
        }
    }
    return jumps;
}`,
        cpp: `int minJumps(const vector<int>& arr) {
    int n = arr.size();
    if (n <= 1) return 0; // @init
    if (arr[0] == 0) return -1; // @init
    int jumps = 1, end = arr[0], far = arr[0]; // @init
    for (int i = 1; i < n; i++) {
        if (i == n - 1) return jumps; // @reach
        far = max(far, i + arr[i]); // @far
        if (i == end) {
            if (far <= i) return -1; // @stuck
            jumps++; end = far; // @jump
        }
    }
    return jumps;
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one pass; each index is visited once.", spaceWhy: "three counters.", ops: (n) => n },
      pros: ["linear and tiny."], cons: ["counts jumps but doesn't record the path (store the best landing index if you need it)."],
      tracer: "jumps",
    },
  ],
  input: { arrays: [{ key: "arr", label: "max jump from each index", min: 0, max: 9, minLen: 1, maxLen: 12 }], defaults: { arr: [1, 3, 5, 8, 9, 2, 6, 7, 6, 8, 9] } },
  checkpoints: [
    { q: "what does `end` represent?", options: ["the last index of the array", "the furthest index reachable with the current number of jumps", "the index we'll jump to next"], answer: 1, right: "right — one 'bfs level' of reachable indexes.", wrong: "end only grows when we add a jump. what does it bound?" },
    { q: "[3, 2, 1, 0, 4]. can we reach the end?", options: ["yes, in 2 jumps", "no — every path gets stuck at index 3", "yes, in 1 jump"], answer: 1, right: "exactly — the furthest reach is index 3, which holds 0.", wrong: "from any of indexes 0–2, how far can you get? what's at that spot?" },
  ],
};

export const mergeIntervals: Problem = {
  slug: "merge-intervals",
  sheet: [14],
  title: "merge overlapping intervals",
  sheetTitle: "Merge Intervals",
  pattern: "greedy",
  also: ["sort by start", "sweep"],
  difficulty: "medium",
  summary: "collapse overlapping [start, end] intervals into non-overlapping ones.",
  intro: "given a list of intervals [start, end], merge every group of overlapping intervals and return the result, sorted by start. intervals that touch (end = next start) count as overlapping.",
  example: { input: "[[1, 3], [2, 4], [6, 8], [9, 10]]", output: "[[1, 4], [6, 8], [9, 10]]", why: "[1, 3] and [2, 4] overlap and become [1, 4]." },
  clues: ["intervals / meetings / time ranges.", "“overlapping” → sort by start so overlaps become neighbours.", "then one sweep, extending or starting a new interval."],
  approaches: [
    {
      level: "brute", name: "repeat until nothing merges", idea: "compare every pair; merge any two that overlap; repeat until a full pass changes nothing.",
      walkthrough: ["for each pair (i, j): overlap → merge into i, remove j.", "restart until stable."], pseudocode: "repeat\n  for i < j: if overlap(i, j): merge j into i; remove j\nuntil no change",
      code: { js: `function merge(iv) {\n  let changed = true;\n  while (changed) {\n    changed = false;\n    outer: for (let i = 0; i < iv.length; i++)\n      for (let j = i + 1; j < iv.length; j++)\n        if (iv[i][0] <= iv[j][1] && iv[j][0] <= iv[i][1]) {\n          iv[i] = [Math.min(iv[i][0], iv[j][0]), Math.max(iv[i][1], iv[j][1])];\n          iv.splice(j, 1); changed = true; break outer;\n        }\n  }\n  return iv.sort((a, b) => a[0] - b[0]);\n}`, py: `def merge(iv):\n    changed = True\n    while changed:\n        changed = False\n        for i in range(len(iv)):\n            for j in range(i + 1, len(iv)):\n                if iv[i][0] <= iv[j][1] and iv[j][0] <= iv[i][1]:\n                    iv[i] = [min(iv[i][0], iv[j][0]), max(iv[i][1], iv[j][1])]\n                    del iv[j]; changed = True; break\n            if changed: break\n    return sorted(iv)` },
      complexity: { time: "O(n³)", space: "O(1)", timeWhy: "up to n merges, each found by an O(n²) search.", spaceWhy: "in place.", ops: (n) => n * n * n },
      pros: ["no sorting insight needed."], cons: ["very slow."],
    },
    {
      level: "optimal", name: "sort by start, then sweep", idea: "sort by start. keep the last merged interval; if the next one starts before it ends, stretch its end, otherwise start a new one.",
      walkthrough: ["sort by start.", "out = [first].", "next.start ≤ last.end → last.end = max(last.end, next.end).", "else push next."],
      pseudocode: "sort by start\nout ← [iv[0]]\nfor cur in iv[1..]\n  if cur.start ≤ last(out).end: last.end ← max(last.end, cur.end)\n  else: out.push(cur)",
      code: {
        js: `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]); // @sort
  const out = [intervals[0]]; // @init
  for (let i = 1; i < intervals.length; i++) {
    const last = out[out.length - 1];
    if (intervals[i][0] <= last[1]) { // @overlap
      last[1] = Math.max(last[1], intervals[i][1]); // @overlap
    } else {
      out.push(intervals[i]); // @push
    }
  }
  return out; // @done
}`,
        py: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])  # @sort
    out = [intervals[0]]  # @init
    for start, end in intervals[1:]:
        if start <= out[-1][1]:  # @overlap
            out[-1][1] = max(out[-1][1], end)  # @overlap
        else:
            out.append([start, end])  # @push
    return out  # @done`,
        java: `static List<int[]> merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]); // @sort
    List<int[]> out = new ArrayList<>(); // @init
    out.add(intervals[0]); // @init
    for (int i = 1; i < intervals.length; i++) {
        int[] last = out.get(out.size() - 1);
        if (intervals[i][0] <= last[1]) { // @overlap
            last[1] = Math.max(last[1], intervals[i][1]); // @overlap
        } else {
            out.add(intervals[i]); // @push
        }
    }
    return out; // @done
}`,
        cpp: `vector<vector<int>> merge(vector<vector<int>> iv) {
    sort(iv.begin(), iv.end()); // @sort
    vector<vector<int>> out{iv[0]}; // @init
    for (size_t i = 1; i < iv.size(); i++) {
        if (iv[i][0] <= out.back()[1]) { // @overlap
            out.back()[1] = max(out.back()[1], iv[i][1]); // @overlap
        } else {
            out.push_back(iv[i]); // @push
        }
    }
    return out; // @done
}`,
      },
      complexity: { time: "O(n log n)", space: "O(n)", timeWhy: "sorting, then one linear sweep.", spaceWhy: "the output list (up to n intervals).", ops: (n) => n * lg(n) },
      pros: ["clean, standard interview answer."], cons: ["mutates the input when sorting."],
      tracer: "intervals",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "intervals as start, end pairs (e.g. 1, 3, 2, 4)", min: 0, max: 99, minLen: 2, maxLen: 12, check: (v) => (v.length % 2 ? "enter an even count: start, end, start, end…" : v.some((x, i) => i % 2 === 1 && x < v[i - 1]) ? "each interval needs start ≤ end." : null),
      gen: () => Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => { const s = Math.floor(Math.random() * 15); return [s, s + 1 + Math.floor(Math.random() * 5)]; }).flat() }],
    defaults: { arr: [1, 3, 2, 4, 6, 8, 9, 10] },
  },
  checkpoints: [
    { q: "sorted intervals [1, 5] and [5, 7]. merge?", options: ["yes → [1, 7]", "no, they only touch"], answer: 0, right: "right — 5 ≤ 5 counts as overlapping here.", wrong: "the test is next.start ≤ last.end. is 5 ≤ 5?" },
    { q: "why take max(last.end, cur.end) instead of just cur.end?", options: ["for speed", "cur might sit entirely inside last, e.g. [1, 10] then [2, 3]", "to keep the list sorted"], answer: 1, right: "exactly — otherwise [1, 10] would shrink to [1, 3].", wrong: "try [1, 10] followed by [2, 3]." },
  ],
};

export const nextPermutation: Problem = {
  slug: "next-permutation",
  sheet: [15],
  title: "next permutation",
  sheetTitle: "Next Permutation",
  pattern: "greedy",
  also: ["two pointers", "in-place reverse"],
  difficulty: "medium",
  summary: "rearrange into the next larger ordering of the same numbers.",
  intro: "rearrange the numbers into the lexicographically next greater permutation (the next one in dictionary order). if it's already the largest, wrap around to the smallest (sorted ascending). do it in place.",
  example: { input: "[1, 2, 3, 6, 5, 4]", output: "[1, 2, 4, 3, 5, 6]", why: "3 is bumped to the next bigger value (4), and what follows is made as small as possible." },
  clues: ["“next larger ordering” → change as far to the right as possible.", "a descending suffix is already its largest arrangement.", "swap the pivot with its successor, then reverse the suffix."],
  approaches: [
    {
      level: "brute", name: "generate all permutations", idea: "list every permutation in sorted order and return the one after the current.",
      walkthrough: ["generate all n! permutations.", "sort them.", "find the current and take the next."], pseudocode: "P ← sorted(all permutations)\nreturn P[(index of arr) + 1]",
      code: { js: `// factorial time — for comparison only\nfunction next(arr) {\n  const all = [];\n  const go = (rest, cur) => rest.length ? rest.forEach((x, i) => go([...rest.slice(0, i), ...rest.slice(i + 1)], [...cur, x])) : all.push(cur);\n  go([...arr].sort((a, b) => a - b), []);\n  const key = arr.join();\n  const i = all.findIndex((p) => p.join() === key);\n  return all[(i + 1) % all.length];\n}`, py: `from itertools import permutations\ndef next_perm(arr):\n    ps = sorted(set(permutations(arr)))\n    return list(ps[(ps.index(tuple(arr)) + 1) % len(ps)])` },
      complexity: { time: "O(n! · n)", space: "O(n! · n)", timeWhy: "every permutation is generated.", spaceWhy: "they're all stored.", ops: (n) => Math.min(1e6, [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800][Math.min(n, 10)] * n) },
      pros: ["obviously matches the definition."], cons: ["hopeless beyond ~10 elements."],
    },
    {
      level: "optimal", name: "pivot, successor, reverse", idea: "from the right, find the first i with arr[i] < arr[i + 1] (the pivot). swap it with the smallest bigger value to its right, then reverse the suffix to make it as small as possible.",
      walkthrough: ["scan right-to-left for the pivot i.", "if found: scan right-to-left for the first arr[j] > arr[i], swap.", "reverse arr[i + 1 ..]. (no pivot → whole array reversed = smallest permutation.)"],
      pseudocode: "i ← n−2; while i ≥ 0 and arr[i] ≥ arr[i+1]: i−−\nif i ≥ 0\n  j ← n−1; while arr[j] ≤ arr[i]: j−−\n  swap arr[i], arr[j]\nreverse arr[i+1 .. n−1]",
      code: {
        js: `function nextPermutation(arr) {
  let i = arr.length - 2; // @pivot
  while (i >= 0 && arr[i] >= arr[i + 1]) i--; // @pivot
  if (i >= 0) {
    let j = arr.length - 1; // @successor
    while (arr[j] <= arr[i]) j--; // @successor
    [arr[i], arr[j]] = [arr[j], arr[i]]; // @swap
  }
  let l = i + 1, r = arr.length - 1; // @reverse
  while (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; l++; r--; } // @reverse
  return arr; // @done
}`,
        py: `def next_permutation(arr):
    i = len(arr) - 2  # @pivot
    while i >= 0 and arr[i] >= arr[i + 1]: i -= 1  # @pivot
    if i >= 0:
        j = len(arr) - 1  # @successor
        while arr[j] <= arr[i]: j -= 1  # @successor
        arr[i], arr[j] = arr[j], arr[i]  # @swap
    arr[i + 1:] = reversed(arr[i + 1:])  # @reverse
    return arr  # @done`,
        java: `static void nextPermutation(int[] arr) {
    int i = arr.length - 2; // @pivot
    while (i >= 0 && arr[i] >= arr[i + 1]) i--; // @pivot
    if (i >= 0) {
        int j = arr.length - 1; // @successor
        while (arr[j] <= arr[i]) j--; // @successor
        int t = arr[i]; arr[i] = arr[j]; arr[j] = t; // @swap
    }
    for (int l = i + 1, r = arr.length - 1; l < r; l++, r--) { // @reverse
        int t = arr[l]; arr[l] = arr[r]; arr[r] = t; // @reverse
    }
} // @done`,
        cpp: `void nextPermutation(vector<int>& arr) {
    int i = (int)arr.size() - 2; // @pivot
    while (i >= 0 && arr[i] >= arr[i + 1]) i--; // @pivot
    if (i >= 0) {
        int j = (int)arr.size() - 1; // @successor
        while (arr[j] <= arr[i]) j--; // @successor
        swap(arr[i], arr[j]); // @swap
    }
    reverse(arr.begin() + i + 1, arr.end()); // @reverse
} // @done`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "at most three right-to-left scans.", spaceWhy: "in place.", ops: (n) => 3 * n },
      pros: ["linear, in place — what c++'s std::next_permutation does."], cons: ["three steps that are easy to mis-order from memory."],
      tracer: "nextPerm",
    },
  ],
  input: { arrays: [{ key: "arr", label: "numbers", min: 0, max: 99, minLen: 1, maxLen: 10 }], defaults: { arr: [1, 2, 3, 6, 5, 4] } },
  checkpoints: [
    { q: "[1, 3, 5, 4, 2]: which index is the pivot?", options: ["index 1 (value 3)", "index 2 (value 5)", "index 0 (value 1)"], answer: 0, right: "right — from the right, 3 < 5 is the first rise.", wrong: "scan from the right until a value is smaller than the one after it." },
    { q: "after swapping, why reverse the suffix instead of sorting it?", options: ["reverse is shorter code", "the suffix is still descending, so reversing sorts it in O(n)", "sorting would be wrong"], answer: 1, right: "exactly — a descending run reversed is ascending.", wrong: "what order is the suffix in, before and after the swap?" },
  ],
};

export const profitTwice: Problem = {
  slug: "stock-at-most-twice",
  sheet: [26],
  title: "maximum profit buying and selling a share at most twice",
  sheetTitle: "Maximum profit by buying and selling a share atmost twice",
  pattern: "greedy",
  also: ["dynamic programming (state machine)"],
  difficulty: "hard",
  summary: "best total profit with up to two non-overlapping trades.",
  intro: "prices[i] is the price on day i. you can complete at most two transactions (buy then sell), and the second buy must come after the first sell. find the maximum total profit.",
  example: { input: "[10, 22, 5, 75, 65, 80]", output: "87", why: "buy 10 → sell 22 (+12), buy 5 → sell 80 (+75): 87." },
  clues: ["a limited number of transactions → track a small set of states.", "each state's best only depends on the previous day.", "it generalises 'best time to buy and sell once'."],
  approaches: [
    {
      level: "brute", name: "split point", idea: "for every split day, add the best single trade on the left and the best single trade on the right.",
      walkthrough: ["for each split s: best(0..s) + best(s..n−1)."], pseudocode: "for s: best ← max(best, once(p[0..s]) + once(p[s..n−1]))",
      code: { js: `function once(p) {\n  let m = Infinity, b = 0;\n  for (const x of p) { m = Math.min(m, x); b = Math.max(b, x - m); }\n  return b;\n}\nfunction twice(p) {\n  let best = 0;\n  for (let s = 0; s < p.length; s++) best = Math.max(best, once(p.slice(0, s + 1)) + once(p.slice(s)));\n  return best;\n}`, py: `def once(p):\n    m, b = float("inf"), 0\n    for x in p: m = min(m, x); b = max(b, x - m)\n    return b\ndef twice(p):\n    return max(once(p[:s + 1]) + once(p[s:]) for s in range(len(p)))` },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "n splits × a linear single-trade scan.", spaceWhy: "a few variables (slices aside).", ops: (n) => n * n },
      pros: ["reuses the one-trade solution."], cons: ["quadratic."],
    },
    {
      level: "improved", name: "prefix/suffix best arrays", idea: "left[i] = best single trade within days 0..i; right[i] = best within i..n−1. answer = max(left[i] + right[i]).",
      walkthrough: ["one pass left-to-right for left[].", "one pass right-to-left for right[].", "combine."], pseudocode: "left[i] ← max(left[i−1], p[i] − min so far)\nright[i] ← max(right[i+1], max so far − p[i])\nanswer ← max(left[i] + right[i])",
      code: { js: `function twice(p) {\n  const n = p.length, L = Array(n).fill(0), R = Array(n).fill(0);\n  let lo = p[0];\n  for (let i = 1; i < n; i++) { lo = Math.min(lo, p[i]); L[i] = Math.max(L[i - 1], p[i] - lo); }\n  let hi = p[n - 1];\n  for (let i = n - 2; i >= 0; i--) { hi = Math.max(hi, p[i]); R[i] = Math.max(R[i + 1], hi - p[i]); }\n  return Math.max(...L.map((x, i) => x + R[i]));\n}`, py: `def twice(p):\n    n = len(p); L = [0] * n; R = [0] * n\n    lo = p[0]\n    for i in range(1, n): lo = min(lo, p[i]); L[i] = max(L[i - 1], p[i] - lo)\n    hi = p[-1]\n    for i in range(n - 2, -1, -1): hi = max(hi, p[i]); R[i] = max(R[i + 1], hi - p[i])\n    return max(l + r for l, r in zip(L, R))` },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "three linear passes.", spaceWhy: "two helper arrays.", ops: (n) => 3 * n },
      pros: ["linear, intuitive."], cons: ["2n extra memory."],
    },
    {
      level: "optimal", name: "four-state machine", idea: "keep the best balance after each stage — 1st buy, 1st sell, 2nd buy, 2nd sell — updating all four with each day's price.",
      walkthrough: ["buy1 = max(buy1, −p).", "sell1 = max(sell1, buy1 + p).", "buy2 = max(buy2, sell1 − p).", "sell2 = max(sell2, buy2 + p). answer = sell2."],
      pseudocode: "buy1 ← buy2 ← −∞; sell1 ← sell2 ← 0\nfor p in prices\n  buy1 ← max(buy1, −p)\n  sell1 ← max(sell1, buy1 + p)\n  buy2 ← max(buy2, sell1 − p)\n  sell2 ← max(sell2, buy2 + p)\nreturn sell2",
      code: {
        js: `function maxProfitTwice(prices) {
  let buy1 = -Infinity, sell1 = 0, buy2 = -Infinity, sell2 = 0; // @init
  for (const p of prices) {
    buy1 = Math.max(buy1, -p); // @update
    sell1 = Math.max(sell1, buy1 + p); // @update
    buy2 = Math.max(buy2, sell1 - p); // @update
    sell2 = Math.max(sell2, buy2 + p); // @update
  }
  return sell2; // @done
}`,
        py: `def max_profit_twice(prices):
    buy1 = buy2 = float("-inf"); sell1 = sell2 = 0  # @init
    for p in prices:
        buy1 = max(buy1, -p)  # @update
        sell1 = max(sell1, buy1 + p)  # @update
        buy2 = max(buy2, sell1 - p)  # @update
        sell2 = max(sell2, buy2 + p)  # @update
    return sell2  # @done`,
        java: `static int maxProfitTwice(int[] prices) {
    int buy1 = Integer.MIN_VALUE, sell1 = 0, buy2 = Integer.MIN_VALUE, sell2 = 0; // @init
    for (int p : prices) {
        buy1 = Math.max(buy1, -p); // @update
        sell1 = Math.max(sell1, buy1 + p); // @update
        buy2 = Math.max(buy2, sell1 - p); // @update
        sell2 = Math.max(sell2, buy2 + p); // @update
    }
    return sell2; // @done
}`,
        cpp: `int maxProfitTwice(const vector<int>& prices) {
    int buy1 = INT_MIN, sell1 = 0, buy2 = INT_MIN, sell2 = 0; // @init
    for (int p : prices) {
        buy1 = max(buy1, -p); // @update
        sell1 = max(sell1, buy1 + p); // @update
        buy2 = max(buy2, sell1 - p); // @update
        sell2 = max(sell2, buy2 + p); // @update
    }
    return sell2; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one pass, four updates per day.", spaceWhy: "four numbers.", ops: (n) => 4 * n },
      pros: ["linear, constant memory, generalises to k transactions (2k states)."], cons: ["the states feel abstract until you read them as 'money in hand'."],
      tracer: "profitTwice",
    },
  ],
  input: { arrays: [{ key: "arr", label: "prices", min: 0, max: 999, minLen: 1, maxLen: 10 }], defaults: { arr: [10, 22, 5, 75, 65, 80] } },
  checkpoints: [
    { q: "what does buy2 mean in money terms?", options: ["the price of the second buy", "the most cash you can hold right after the second buy (first profit − second price)", "the total profit"], answer: 1, right: "exactly — each state is your best balance at that stage.", wrong: "buy2 = max(buy2, sell1 − p). what is sell1 − p?" },
    { q: "prices only rise: [1, 2, 3, 4, 5]. best with two trades?", options: ["4", "8", "3"], answer: 0, right: "right — one trade 1 → 5 already captures everything.", wrong: "splitting a rising run into two trades doesn't earn more than the whole run." },
  ],
};

export const factorialLarge: Problem = {
  slug: "factorial-large",
  sheet: [22],
  title: "factorial of a large number",
  sheetTitle: "Find factorial of a large number",
  pattern: "greedy",
  also: ["array as big integer", "simulation"],
  difficulty: "medium",
  summary: "compute n! when it's far too big for any number type.",
  intro: "compute n! (1 × 2 × … × n) exactly, even when it has hundreds of digits — too big for 64-bit integers. store the number as an array of digits and multiply like you would by hand.",
  example: { input: "n = 25", output: "15511210043330985984000000", why: "25! has 26 digits — it overflows 64-bit integers (max ≈ 9.2 × 10¹⁸)." },
  clues: ["the result overflows every built-in type.", "an array of digits can represent any size number.", "multiplying digit by digit with a carry is grade-school arithmetic."],
  approaches: [
    {
      level: "brute", name: "built-in big integers", idea: "use a language big-integer type (BigInt, python int, BigInteger).",
      walkthrough: ["result = 1.", "multiply by 2..n."], pseudocode: "r ← 1 (big)\nfor x in 2..n: r ← r × x",
      code: { js: `function factorial(n) {\n  let r = 1n;\n  for (let x = 2n; x <= BigInt(n); x++) r *= x;\n  return r.toString();\n}`, py: `def factorial(n):\n    r = 1\n    for x in range(2, n + 1): r *= x\n    return str(r)` },
      complexity: { time: "O(n · d)", space: "O(d)", timeWhy: "n multiplications of a d-digit number by a small one.", spaceWhy: "the big integer.", ops: (n) => n * n },
      pros: ["short, fast, correct."], cons: ["hides the idea the problem is testing — interviewers usually ask for it without big-int types."],
    },
    {
      level: "optimal", name: "digit array multiplication", idea: "store digits least-significant first. to multiply by x, multiply every digit, keep prod % 10, carry the rest; append any leftover carry as new digits.",
      walkthrough: ["digits = [1].", "for x in 2..n: carry = 0; for each digit: prod = d·x + carry, d = prod % 10, carry = prod / 10.", "while carry: append carry % 10.", "read the array backwards."],
      pseudocode: "digits ← [1]\nfor x in 2..n\n  carry ← 0\n  for i in 0..len−1\n    prod ← digits[i]·x + carry\n    digits[i] ← prod mod 10; carry ← prod div 10\n  while carry > 0: append carry mod 10; carry ← carry div 10\nreturn reverse(digits)",
      code: {
        js: `function factorial(n) {
  const digits = [1]; // @init
  for (let x = 2; x <= n; x++) { // @loop
    let carry = 0;
    for (let i = 0; i < digits.length; i++) {
      const prod = digits[i] * x + carry; // @digit
      digits[i] = prod % 10; // @digit
      carry = Math.floor(prod / 10); // @digit
    }
    while (carry > 0) {
      digits.push(carry % 10); // @carry
      carry = Math.floor(carry / 10); // @carry
    }
  }
  return digits.reverse().join(""); // @done
}`,
        py: `def factorial(n):
    digits = [1]  # @init
    for x in range(2, n + 1):  # @loop
        carry = 0
        for i in range(len(digits)):
            prod = digits[i] * x + carry  # @digit
            digits[i] = prod % 10  # @digit
            carry = prod // 10  # @digit
        while carry:
            digits.append(carry % 10)  # @carry
            carry //= 10  # @carry
    return "".join(map(str, reversed(digits)))  # @done`,
        java: `static String factorial(int n) {
    List<Integer> digits = new ArrayList<>(List.of(1)); // @init
    for (int x = 2; x <= n; x++) { // @loop
        int carry = 0;
        for (int i = 0; i < digits.size(); i++) {
            int prod = digits.get(i) * x + carry; // @digit
            digits.set(i, prod % 10); // @digit
            carry = prod / 10; // @digit
        }
        while (carry > 0) {
            digits.add(carry % 10); // @carry
            carry /= 10; // @carry
        }
    }
    StringBuilder sb = new StringBuilder();
    for (int i = digits.size() - 1; i >= 0; i--) sb.append(digits.get(i)); // @done
    return sb.toString();
}`,
        cpp: `string factorial(int n) {
    vector<int> digits{1}; // @init
    for (int x = 2; x <= n; x++) { // @loop
        int carry = 0;
        for (size_t i = 0; i < digits.size(); i++) {
            int prod = digits[i] * x + carry; // @digit
            digits[i] = prod % 10; // @digit
            carry = prod / 10; // @digit
        }
        while (carry > 0) {
            digits.push_back(carry % 10); // @carry
            carry /= 10; // @carry
        }
    }
    string s;
    for (auto it = digits.rbegin(); it != digits.rend(); ++it) s += char('0' + *it); // @done
    return s;
}`,
      },
      complexity: { time: "O(n · d)", space: "O(d)", timeWhy: "n multiplications, each touching all d digits (d ≈ n log₁₀ n for n!).", spaceWhy: "one slot per digit of the answer.", ops: (n) => n * Math.max(1, Math.round(n * Math.log10(Math.max(2, n)) / 2)) },
      pros: ["works in any language, for any size.", "the same technique powers big-number add, multiply and power."], cons: ["one digit per slot is simple but slow; real big-int libraries store base 10⁹ chunks."],
      tracer: "factorial",
    },
  ],
  input: { arrays: [], scalars: [{ key: "k", label: "n", min: 1, max: 30 }], defaults: { arr: [], k: 25 } },
  checkpoints: [
    { q: "why store digits least-significant first?", options: ["it's required by the language", "carries flow towards the end, so new digits are simply appended", "it uses less memory"], answer: 1, right: "exactly — growing at the end of an array is cheap.", wrong: "where do new digits appear when a number grows: at the front or the back?" },
    { q: "digit 7 × 6 with an incoming carry of 3. what stays and what carries?", options: ["stays 5, carry 4", "stays 4, carry 5", "stays 45, carry 0"], answer: 0, right: "right — 7·6 + 3 = 45 → keep 5, carry 4.", wrong: "compute 7 × 6 + 3, then split it into last digit and the rest." },
  ],
};
