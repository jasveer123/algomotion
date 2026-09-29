import type { Approach, Problem } from "@/lib/types";

const lg = (n: number) => Math.max(1, Math.log2(Math.max(2, n)));

export const maxMin: Problem = {
  slug: "max-and-min",
  sheet: [2],
  title: "find the maximum and minimum element",
  sheetTitle: "Find the maximum and minimum element in an array",
  pattern: "sorting-searching",
  also: ["tournament method"],
  difficulty: "easy",
  summary: "find the smallest and largest value with as few comparisons as possible.",
  intro: "return both the minimum and the maximum of an array. any linear scan works — the interesting question is how few comparisons you can get away with.",
  example: { input: "[1000, 11, 445, 1, 330, 3000]", output: "min 1 · max 3000", why: "1 is the smallest value, 3000 the largest." },
  clues: ["you need two extremes at once.", "comparisons are the cost being measured.", "comparing elements in pairs first means each one only needs to challenge one extreme."],
  approaches: [
    {
      level: "brute", name: "sort, take the ends", idea: "sort the array; the first element is the min and the last is the max.",
      walkthrough: ["sort.", "min = s[0], max = s[n − 1]."], pseudocode: "s ← sort(arr)\nreturn s[0], s[n−1]",
      code: { js: `function minMax(arr) {\n  const s = [...arr].sort((a, b) => a - b);\n  return { min: s[0], max: s[s.length - 1] };\n}`, py: `def min_max(arr):\n    s = sorted(arr)\n    return s[0], s[-1]` },
      complexity: { time: "O(n log n)", space: "O(n)", timeWhy: "sorting.", spaceWhy: "a sorted copy.", ops: (n) => n * lg(n) },
      pros: ["one line."], cons: ["sorting does far more work than needed."],
    },
    {
      level: "improved", name: "one linear scan", idea: "walk once, comparing each element with the current min and max.",
      walkthrough: ["min = max = arr[0].", "each x: compare with min, then with max."], pseudocode: "for x in arr[1..]\n  if x < min: min ← x\n  if x > max: max ← x",
      code: { js: `function minMax(arr) {\n  let min = arr[0], max = arr[0];\n  for (const x of arr) { if (x < min) min = x; if (x > max) max = x; }\n  return { min, max };\n}`, py: `def min_max(arr):\n    lo = hi = arr[0]\n    for x in arr:\n        if x < lo: lo = x\n        if x > hi: hi = x\n    return lo, hi` },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "about 2(n − 1) comparisons.", spaceWhy: "two variables.", ops: (n) => 2 * (n - 1) },
      pros: ["linear, simple."], cons: ["2 comparisons per element."],
    },
    {
      level: "optimal", name: "compare in pairs", idea: "take elements two at a time: compare them with each other, then only the smaller challenges min and only the bigger challenges max — 3 comparisons per 2 elements.",
      walkthrough: ["seed min/max from the first one (odd n) or two (even n) elements.", "for each pair: find the smaller and bigger (1 comparison).", "smaller vs min, bigger vs max (2 comparisons)."],
      pseudocode: "seed min, max\nfor each pair (a, b)\n  (s, g) ← a < b ? (a, b) : (b, a)\n  if s < min: min ← s\n  if g > max: max ← g",
      code: {
        js: `function minMax(arr) {
  let min, max, i;
  if (arr.length % 2 === 0) { // @init
    [min, max] = arr[0] < arr[1] ? [arr[0], arr[1]] : [arr[1], arr[0]]; // @init
    i = 2;
  } else { min = max = arr[0]; i = 1; } // @init
  for (; i + 1 < arr.length; i += 2) {
    const [s, g] = arr[i] < arr[i + 1] ? [arr[i], arr[i + 1]] : [arr[i + 1], arr[i]]; // @pair
    if (s < min) min = s; // @update
    if (g > max) max = g; // @update
  }
  return { min, max }; // @done
}`,
        py: `def min_max(arr):
    if len(arr) % 2 == 0:  # @init
        lo, hi = sorted(arr[:2]); i = 2  # @init
    else:
        lo = hi = arr[0]; i = 1  # @init
    while i + 1 < len(arr):
        s, g = (arr[i], arr[i + 1]) if arr[i] < arr[i + 1] else (arr[i + 1], arr[i])  # @pair
        if s < lo: lo = s  # @update
        if g > hi: hi = g  # @update
        i += 2
    return lo, hi  # @done`,
        java: `static int[] minMax(int[] arr) {
    int min, max, i;
    if (arr.length % 2 == 0) { // @init
        min = Math.min(arr[0], arr[1]); max = Math.max(arr[0], arr[1]); i = 2; // @init
    } else { min = max = arr[0]; i = 1; } // @init
    for (; i + 1 < arr.length; i += 2) {
        int s = arr[i] < arr[i + 1] ? arr[i] : arr[i + 1]; // @pair
        int g = arr[i] < arr[i + 1] ? arr[i + 1] : arr[i]; // @pair
        if (s < min) min = s; // @update
        if (g > max) max = g; // @update
    }
    return new int[]{min, max}; // @done
}`,
        cpp: `pair<int, int> minMax(const vector<int>& arr) {
    int mn, mx; size_t i;
    if (arr.size() % 2 == 0) { // @init
        mn = min(arr[0], arr[1]); mx = max(arr[0], arr[1]); i = 2; // @init
    } else { mn = mx = arr[0]; i = 1; } // @init
    for (; i + 1 < arr.size(); i += 2) {
        auto [s, g] = minmax(arr[i], arr[i + 1]); // @pair
        if (s < mn) mn = s; // @update
        if (g > mx) mx = g; // @update
    }
    return {mn, mx}; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "about 1.5n comparisons instead of 2n — still linear, 25% fewer.", spaceWhy: "two variables.", ops: (n) => Math.ceil(1.5 * n) },
      pros: ["the fewest comparisons possible for this problem (≈ 3n/2)."], cons: ["more code for a constant-factor win."],
      tracer: "maxMin",
    },
  ],
  input: { arrays: [{ key: "arr", label: "numbers", min: -999, max: 9999, minLen: 1, maxLen: 12 }], defaults: { arr: [1000, 11, 445, 1, 330, 3000] } },
  checkpoints: [
    { q: "in the pair method, which element of a pair gets compared with max?", options: ["both", "only the bigger one", "only the smaller one"], answer: 1, right: "right — the smaller one can't be a new max.", wrong: "if a < b, could a ever be bigger than the max when b isn't?" },
    { q: "for n = 100, roughly how many comparisons does the pair method use?", options: ["~100", "~150", "~200"], answer: 1, right: "yes — 3 per 2 elements ≈ 150.", wrong: "3 comparisons for every 2 elements…" },
  ],
};

export const kthElement: Problem = {
  slug: "kth-max-min",
  sheet: [3],
  title: "find the kth max and min element",
  sheetTitle: "Find the \"Kth\" max and min element of an array",
  pattern: "sorting-searching",
  also: ["quickselect", "heap"],
  difficulty: "medium",
  summary: "the kth smallest and kth largest value without fully sorting.",
  intro: "given an array of distinct numbers and k, find the kth smallest and the kth largest elements.",
  example: { input: "arr = [7, 10, 4, 3, 20, 15], k = 3", output: "kth min 7 · kth max 10", why: "sorted: 3, 4, 7, 10, 15, 20 — 7 is third from the left, 10 third from the right." },
  clues: ["you need one position of the sorted order, not the whole order.", "partitioning places a pivot at its final sorted index.", "“top k” phrasing also suggests a heap of size k."],
  approaches: [
    {
      level: "brute", name: "sort", idea: "sort ascending: kth min is s[k − 1], kth max is s[n − k].",
      walkthrough: ["sort.", "index directly."], pseudocode: "s ← sort(arr)\nreturn s[k−1], s[n−k]",
      code: { js: `function kth(arr, k) {\n  const s = [...arr].sort((a, b) => a - b);\n  return { min: s[k - 1], max: s[s.length - k] };\n}`, py: `def kth(arr, k):\n    s = sorted(arr)\n    return s[k - 1], s[-k]` },
      complexity: { time: "O(n log n)", space: "O(n)", timeWhy: "sorting.", spaceWhy: "a sorted copy.", ops: (n) => n * lg(n) },
      pros: ["simple, gives both answers at once."], cons: ["sorts everything to read one position."],
    },
    {
      level: "improved", name: "heap of size k", idea: "keep the k smallest in a max-heap: its top is the kth smallest (mirror with a min-heap for the kth largest).",
      walkthrough: ["push each value; if the heap exceeds k, pop the top.", "after the scan, the top is the answer."], pseudocode: "for x in arr\n  push x into max-heap H\n  if |H| > k: pop H\nreturn top(H)",
      code: { js: `// JS has no built-in heap; shown with a sorted array standing in for it.\nfunction kthSmallest(arr, k) {\n  const heap = [];\n  for (const x of arr) {\n    heap.push(x); heap.sort((a, b) => b - a);\n    if (heap.length > k) heap.shift();\n  }\n  return heap[0];\n}`, py: `import heapq\ndef kth(arr, k):\n    return heapq.nsmallest(k, arr)[-1], heapq.nlargest(k, arr)[-1]` },
      complexity: { time: "O(n log k)", space: "O(k)", timeWhy: "n heap operations on a heap of size k.", spaceWhy: "the heap.", ops: (n) => n * 2 },
      pros: ["great when k is small or data streams in."], cons: ["extra memory; two heaps for both answers."],
    },
    {
      level: "optimal", name: "quickselect", idea: "partition around a pivot like quicksort — the pivot lands at its sorted index. recurse only into the side that holds index k − 1.",
      walkthrough: ["pivot = last element of the range.", "move smaller values left of it; place the pivot.", "pivot index = k − 1 → done; else keep only the side containing k − 1.", "for the kth max, search for index n − k."],
      pseudocode: "lo ← 0; hi ← n−1\nwhile lo ≤ hi\n  p ← partition(lo, hi)\n  if p = k−1: return arr[p]\n  if p < k−1: lo ← p+1 else hi ← p−1",
      code: {
        js: `function kthSmallest(arr, k) {
  let lo = 0, hi = arr.length - 1; // @init
  while (lo <= hi) {
    const p = partition(arr, lo, hi);
    if (p === k - 1) return arr[p]; // @found
    if (p < k - 1) lo = p + 1; else hi = p - 1; // @narrow
  }
}
function partition(arr, lo, hi) {
  const pivot = arr[hi]; // @pivot
  let i = lo;
  for (let j = lo; j < hi; j++) { // @scan
    if (arr[j] < pivot) { [arr[i], arr[j]] = [arr[j], arr[i]]; i++; } // @swap
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]]; // @place
  return i;
}
// kth largest = kthSmallest(arr, arr.length - k + 1)`,
        py: `def kth_smallest(arr, k):
    lo, hi = 0, len(arr) - 1  # @init
    while lo <= hi:
        p = partition(arr, lo, hi)
        if p == k - 1: return arr[p]  # @found
        if p < k - 1: lo = p + 1  # @narrow
        else: hi = p - 1  # @narrow

def partition(arr, lo, hi):
    pivot, i = arr[hi], lo  # @pivot
    for j in range(lo, hi):  # @scan
        if arr[j] < pivot:  # @swap
            arr[i], arr[j] = arr[j], arr[i]; i += 1  # @swap
    arr[i], arr[hi] = arr[hi], arr[i]  # @place
    return i
# kth largest = kth_smallest(arr, len(arr) - k + 1)`,
        java: `static int kthSmallest(int[] arr, int k) {
    int lo = 0, hi = arr.length - 1; // @init
    while (lo <= hi) {
        int p = partition(arr, lo, hi);
        if (p == k - 1) return arr[p]; // @found
        if (p < k - 1) lo = p + 1; else hi = p - 1; // @narrow
    }
    return -1;
}
static int partition(int[] arr, int lo, int hi) {
    int pivot = arr[hi], i = lo; // @pivot
    for (int j = lo; j < hi; j++) { // @scan
        if (arr[j] < pivot) { int t = arr[i]; arr[i] = arr[j]; arr[j] = t; i++; } // @swap
    }
    int t = arr[i]; arr[i] = arr[hi]; arr[hi] = t; // @place
    return i;
}`,
        cpp: `int partition(vector<int>& arr, int lo, int hi) {
    int pivot = arr[hi], i = lo; // @pivot
    for (int j = lo; j < hi; j++) { // @scan
        if (arr[j] < pivot) swap(arr[i++], arr[j]); // @swap
    }
    swap(arr[i], arr[hi]); // @place
    return i;
}
int kthSmallest(vector<int>& arr, int k) {
    int lo = 0, hi = (int)arr.size() - 1; // @init
    while (lo <= hi) {
        int p = partition(arr, lo, hi);
        if (p == k - 1) return arr[p]; // @found
        if (p < k - 1) lo = p + 1; else hi = p - 1; // @narrow
    }
    return -1;
}`,
      },
      complexity: { time: "O(n) average", space: "O(1)", timeWhy: "each round throws away part of the range: n + n/2 + n/4 + … ≈ 2n on average. an unlucky pivot every time degrades to O(n²).", spaceWhy: "in-place partitioning, iterative loop.", ops: (n) => 2 * n },
      pros: ["average linear time, in place."], cons: ["worst case O(n²) — randomise the pivot to make it unlikely.", "reorders the input."],
      tracer: "quickselect",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "distinct numbers", min: -99, max: 99, minLen: 1, maxLen: 10, check: (v) => (new Set(v).size !== v.length ? "use distinct values for this problem." : null) }],
    scalars: [{ key: "k", label: "k", min: 1, max: 10 }],
    defaults: { arr: [7, 10, 4, 3, 20, 15], k: 3 },
    check: (i) => ((i.k ?? 1) > i.arr.length ? "k can't be bigger than the array length." : null),
  },
  checkpoints: [
    { q: "after one partition, the pivot lands at index 4 and we want index 2. what next?", options: ["search the right side", "search the left side only", "sort both sides"], answer: 1, right: "right — index 2 is to the left; the right side is thrown away.", wrong: "which side of the pivot contains index 2?" },
    { q: "kth largest in an array of n elements is which kth smallest?", options: ["k", "n − k + 1", "n − k"], answer: 1, right: "yes — counting from the other end.", wrong: "the largest (k = 1) is the nth smallest. generalise that." },
  ],
};

export const countInversions: Problem = {
  slug: "count-inversions",
  sheet: [16],
  title: "count inversions",
  sheetTitle: "Count Inversion",
  pattern: "sorting-searching",
  also: ["merge sort", "divide and conquer"],
  difficulty: "hard",
  summary: "how far is the array from sorted? count pairs that are out of order.",
  intro: "an inversion is a pair of positions i < j where arr[i] > arr[j]. count all inversions — a measure of how unsorted the array is (0 for sorted, n(n−1)/2 for reversed).",
  example: { input: "[2, 4, 1, 3, 5]", output: "3", why: "(2, 1), (4, 1) and (4, 3) are out of order." },
  clues: ["counting pairs with an order condition across the array.", "brute force is O(n²) over pairs.", "during merge sort, a right-half element that jumps ahead passes every remaining left element — counted in bulk."],
  approaches: [
    {
      level: "brute", name: "check every pair", idea: "count pairs i < j with arr[i] > arr[j].",
      walkthrough: ["two nested loops."], pseudocode: "for i < j: if arr[i] > arr[j]: count++",
      code: { js: `function inversions(arr) {\n  let c = 0;\n  for (let i = 0; i < arr.length; i++)\n    for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) c++;\n  return c;\n}`, py: `def inversions(arr):\n    n = len(arr)\n    return sum(arr[i] > arr[j] for i in range(n) for j in range(i + 1, n))` },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "all pairs.", spaceWhy: "a counter.", ops: (n) => (n * (n - 1)) / 2 },
      pros: ["literal definition."], cons: ["quadratic."],
    },
    {
      level: "optimal", name: "merge sort with counting", idea: "sort both halves recursively; while merging, each time an element is taken from the right half, it was smaller than every element still waiting in the left half — add that many inversions.",
      walkthrough: ["split in half and recurse.", "merge: left[i] ≤ right[j] → take left, no inversions.", "right[j] < left[i] → take right, add (mid − i + 1).", "copy the merged run back."],
      pseudocode: "sort(lo, hi)\n  if lo ≥ hi: return 0\n  mid ← (lo+hi)/2\n  c ← sort(lo, mid) + sort(mid+1, hi)\n  merge; when taking from the right: c += mid − i + 1\n  return c",
      code: {
        js: `function countInversions(arr) {
  return sort(arr, 0, arr.length - 1);
}
function sort(arr, lo, hi) {
  if (lo >= hi) return 0; // @base
  const mid = (lo + hi) >> 1; // @split
  let count = sort(arr, lo, mid) + sort(arr, mid + 1, hi); // @split
  const merged = [];
  let i = lo, j = mid + 1;
  while (i <= mid && j <= hi) {
    if (arr[i] <= arr[j]) merged.push(arr[i++]); // @takeLeft
    else { merged.push(arr[j++]); count += mid - i + 1; } // @takeRight
  }
  while (i <= mid) merged.push(arr[i++]);
  while (j <= hi) merged.push(arr[j++]);
  for (let t = 0; t < merged.length; t++) arr[lo + t] = merged[t]; // @copy
  return count; // @done
}`,
        py: `def count_inversions(arr):
    def sort(lo, hi):
        if lo >= hi: return 0  # @base
        mid = (lo + hi) // 2  # @split
        count = sort(lo, mid) + sort(mid + 1, hi)  # @split
        merged, i, j = [], lo, mid + 1
        while i <= mid and j <= hi:
            if arr[i] <= arr[j]:
                merged.append(arr[i]); i += 1  # @takeLeft
            else:
                merged.append(arr[j]); j += 1  # @takeRight
                count += mid - i + 1  # @takeRight
        merged += arr[i:mid + 1] + arr[j:hi + 1]
        arr[lo:hi + 1] = merged  # @copy
        return count  # @done
    return sort(0, len(arr) - 1)`,
        java: `static long sort(int[] arr, int lo, int hi) {
    if (lo >= hi) return 0; // @base
    int mid = (lo + hi) / 2; // @split
    long count = sort(arr, lo, mid) + sort(arr, mid + 1, hi); // @split
    int[] merged = new int[hi - lo + 1];
    int i = lo, j = mid + 1, w = 0;
    while (i <= mid && j <= hi) {
        if (arr[i] <= arr[j]) merged[w++] = arr[i++]; // @takeLeft
        else { merged[w++] = arr[j++]; count += mid - i + 1; } // @takeRight
    }
    while (i <= mid) merged[w++] = arr[i++];
    while (j <= hi) merged[w++] = arr[j++];
    System.arraycopy(merged, 0, arr, lo, merged.length); // @copy
    return count; // @done
}`,
        cpp: `long long sortCount(vector<int>& arr, int lo, int hi) {
    if (lo >= hi) return 0; // @base
    int mid = (lo + hi) / 2; // @split
    long long count = sortCount(arr, lo, mid) + sortCount(arr, mid + 1, hi); // @split
    vector<int> merged;
    int i = lo, j = mid + 1;
    while (i <= mid && j <= hi) {
        if (arr[i] <= arr[j]) merged.push_back(arr[i++]); // @takeLeft
        else { merged.push_back(arr[j++]); count += mid - i + 1; } // @takeRight
    }
    while (i <= mid) merged.push_back(arr[i++]);
    while (j <= hi) merged.push_back(arr[j++]);
    copy(merged.begin(), merged.end(), arr.begin() + lo); // @copy
    return count; // @done
}`,
      },
      complexity: { time: "O(n log n)", space: "O(n)", timeWhy: "log n levels of merging, each level touching all n elements.", spaceWhy: "the merge buffer.", ops: (n) => n * lg(n) },
      pros: ["counts up to n²/2 inversions without looking at pairs one by one."], cons: ["sorts (modifies) the array; copy it first if you need the original.", "use 64-bit counters — the count can reach ~n²/2."],
      tracer: "inversions",
    },
  ],
  input: { arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 10 }], defaults: { arr: [2, 4, 1, 3, 5] } },
  checkpoints: [
    { q: "merging [2, 4] with [1, 3]: we take 1 from the right first. how many inversions does that add?", options: ["1", "2", "0"], answer: 1, right: "right — 1 is smaller than both 2 and 4 still in the left half.", wrong: "count how many left-half values are still waiting when 1 is taken." },
    { q: "how many inversions does a fully reversed array of 5 elements have?", options: ["5", "10", "25"], answer: 1, right: "yes — every pair is inverted: 5·4/2 = 10.", wrong: "every pair is out of order. how many pairs are there?" },
  ],
};

const medianApproaches = (sameSize: boolean): Approach[] => [
  {
    level: "brute", name: "merge everything, pick the middle", idea: "merge the two sorted arrays into one, then read the middle value(s).",
    walkthrough: ["two-pointer merge into a new array.", "odd total → middle element; even → average of the two middles."], pseudocode: "m ← merge(a, b)\nreturn median of m",
    code: { js: `function median(a, b) {\n  const m = [...a, ...b].sort((x, y) => x - y);\n  const h = m.length >> 1;\n  return m.length % 2 ? m[h] : (m[h - 1] + m[h]) / 2;\n}`, py: `def median(a, b):\n    m = sorted(a + b)\n    h = len(m) // 2\n    return m[h] if len(m) % 2 else (m[h - 1] + m[h]) / 2` },
    complexity: { time: "O(n + m)", space: "O(n + m)", timeWhy: "a linear merge (the short code above sorts, which is O((n+m) log(n+m))).", spaceWhy: "the merged array.", ops: (n) => n },
    pros: ["easy to trust."], cons: ["builds a whole new array to read one or two values."],
  },
  {
    level: "improved", name: "merge-count to the middle", idea: "walk both arrays like a merge but only count — stop when you reach the middle position, remembering the last two values seen.",
    walkthrough: ["two pointers, count steps.", "stop at position (n + m)/2.", "no merged array needed."], pseudocode: "walk the merge order (n+m)/2 + 1 steps\nkeep the last two values → median",
    code: { js: `function median(a, b) {\n  const total = a.length + b.length;\n  let i = 0, j = 0, prev = 0, cur = 0;\n  for (let c = 0; c <= total >> 1; c++) {\n    prev = cur;\n    cur = j >= b.length || (i < a.length && a[i] <= b[j]) ? a[i++] : b[j++];\n  }\n  return total % 2 ? cur : (prev + cur) / 2;\n}`, py: `def median(a, b):\n    total, i, j, prev, cur = len(a) + len(b), 0, 0, 0, 0\n    for _ in range(total // 2 + 1):\n        prev = cur\n        if j >= len(b) or (i < len(a) and a[i] <= b[j]):\n            cur = a[i]; i += 1\n        else:\n            cur = b[j]; j += 1\n    return cur if total % 2 else (prev + cur) / 2` },
    complexity: { time: "O(n + m)", space: "O(1)", timeWhy: "about (n + m)/2 steps.", spaceWhy: "a few variables.", ops: (n) => n / 2 },
    pros: ["no extra memory."], cons: ["still linear."],
  },
  {
    level: "optimal", name: "binary search the partition", idea: sameSize ? "cut both arrays so the two left parts together hold half the numbers, and every left value ≤ every right value. binary-search the cut in one array — the other cut is then fixed." : "cut both arrays so the left parts hold half of all numbers and every left value ≤ every right value. binary-search the cut in the shorter array; the longer array's cut follows.",
    walkthrough: ["half = ⌈(n + m) / 2⌉.", "try i from the shorter array, j = half − i from the longer.", "valid when aLeft ≤ bRight and bLeft ≤ aRight.", "aLeft too big → move i left; bLeft too big → move i right.", "median from the border values."],
    pseudocode: "ensure |a| ≤ |b|\nlo ← 0; hi ← |a|\nwhile lo ≤ hi\n  i ← (lo+hi)/2; j ← half − i\n  if a[i−1] ≤ b[j] and b[j−1] ≤ a[i]: median from max(lefts) / min(rights)\n  elif a[i−1] > b[j]: hi ← i−1\n  else: lo ← i+1",
    code: {
      js: `function median(a, b) {
  if (a.length > b.length) [a, b] = [b, a];
  const n = a.length, m = b.length, half = (n + m + 1) >> 1;
  let lo = 0, hi = n; // @init
  while (lo <= hi) {
    const i = (lo + hi) >> 1, j = half - i; // @cut
    const aL = i > 0 ? a[i - 1] : -Infinity, aR = i < n ? a[i] : Infinity; // @cut
    const bL = j > 0 ? b[j - 1] : -Infinity, bR = j < m ? b[j] : Infinity; // @cut
    if (aL <= bR && bL <= aR) {
      const left = Math.max(aL, bL); // @found
      return (n + m) % 2 ? left : (left + Math.min(aR, bR)) / 2; // @found
    }
    if (aL > bR) hi = i - 1; else lo = i + 1; // @move
  }
}`,
      py: `def median(a, b):
    if len(a) > len(b): a, b = b, a
    n, m = len(a), len(b); half = (n + m + 1) // 2
    lo, hi = 0, n  # @init
    INF = float("inf")
    while lo <= hi:
        i = (lo + hi) // 2; j = half - i  # @cut
        aL = a[i - 1] if i > 0 else -INF; aR = a[i] if i < n else INF  # @cut
        bL = b[j - 1] if j > 0 else -INF; bR = b[j] if j < m else INF  # @cut
        if aL <= bR and bL <= aR:
            left = max(aL, bL)  # @found
            return left if (n + m) % 2 else (left + min(aR, bR)) / 2  # @found
        if aL > bR: hi = i - 1  # @move
        else: lo = i + 1  # @move`,
      java: `static double median(int[] a, int[] b) {
    if (a.length > b.length) { int[] t = a; a = b; b = t; }
    int n = a.length, m = b.length, half = (n + m + 1) / 2;
    int lo = 0, hi = n; // @init
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i; // @cut
        int aL = i > 0 ? a[i - 1] : Integer.MIN_VALUE, aR = i < n ? a[i] : Integer.MAX_VALUE; // @cut
        int bL = j > 0 ? b[j - 1] : Integer.MIN_VALUE, bR = j < m ? b[j] : Integer.MAX_VALUE; // @cut
        if (aL <= bR && bL <= aR) {
            int left = Math.max(aL, bL); // @found
            return (n + m) % 2 == 1 ? left : (left + Math.min(aR, bR)) / 2.0; // @found
        }
        if (aL > bR) hi = i - 1; else lo = i + 1; // @move
    }
    return 0;
}`,
      cpp: `double median(vector<int> a, vector<int> b) {
    if (a.size() > b.size()) swap(a, b);
    int n = a.size(), m = b.size(), half = (n + m + 1) / 2;
    int lo = 0, hi = n; // @init
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i; // @cut
        int aL = i > 0 ? a[i - 1] : INT_MIN, aR = i < n ? a[i] : INT_MAX; // @cut
        int bL = j > 0 ? b[j - 1] : INT_MIN, bR = j < m ? b[j] : INT_MAX; // @cut
        if (aL <= bR && bL <= aR) {
            int left = max(aL, bL); // @found
            return (n + m) % 2 ? left : (left + min(aR, bR)) / 2.0; // @found
        }
        if (aL > bR) hi = i - 1; else lo = i + 1; // @move
    }
    return 0;
}`,
    },
    complexity: { time: sameSize ? "O(log n)" : "O(log min(n, m))", space: "O(1)", timeWhy: "each round halves the range of possible cuts in the shorter array.", spaceWhy: "a handful of indexes and border values.", ops: (n) => Math.ceil(lg(n)) },
    pros: ["logarithmic — the classic 'hard' answer interviewers want."], cons: ["lots of off-by-one traps; the ±∞ sentinels are what make the edges work."],
    tracer: "median",
  },
];

export const medianEqual: Problem = {
  slug: "median-equal-size",
  sheet: [35],
  title: "median of two sorted arrays of equal size",
  sheetTitle: "Median of 2 sorted arrays of equal size",
  pattern: "sorting-searching",
  also: ["binary search on partitions"],
  difficulty: "hard",
  summary: "the median of the combined 2n numbers, without merging.",
  intro: "two sorted arrays each hold n numbers. find the median of all 2n numbers together — the average of the two middle values once everything is combined.",
  example: { input: "a = [1, 12, 15, 26, 38], b = [2, 13, 17, 30, 45]", output: "16", why: "combined: 1, 2, 12, 13, 15, 17, 26, 30, 38, 45 → (15 + 17) / 2 = 16." },
  clues: ["both inputs sorted + 'median' → binary search, not merging.", "a median splits the numbers into two equal halves.", "only the values at the cut borders matter."],
  approaches: medianApproaches(true),
  input: {
    arrays: [
      { key: "arr", label: "a (sorted)", min: -99, max: 99, minLen: 1, maxLen: 7, sorted: true },
      { key: "arr2", label: "b (sorted)", min: -99, max: 99, minLen: 1, maxLen: 7, sorted: true },
    ],
    defaults: { arr: [1, 12, 15, 26, 38], arr2: [2, 13, 17, 30, 45] },
    check: (i) => (i.arr.length !== (i.arr2 ?? []).length ? "for this problem both arrays must be the same size." : null),
  },
  checkpoints: [
    { q: "a cut is valid when…", options: ["both left parts have equal length", "every left value ≤ every right value", "the arrays are equal"], answer: 1, right: "exactly — then the left parts are the smaller half.", wrong: "the left half should hold the smallest numbers. what must be true at the borders?" },
    { q: "the total count is even. how is the median computed?", options: ["max of the left parts", "(max of lefts + min of rights) / 2", "min of the right parts"], answer: 1, right: "right — the two middle values sit on either side of the cut.", wrong: "with an even count there are two middle values. where are they?" },
  ],
};

export const medianDifferent: Problem = {
  slug: "median-different-size",
  sheet: [36],
  title: "median of two sorted arrays of different size",
  sheetTitle: "Median of 2 sorted arrays of different size",
  pattern: "sorting-searching",
  also: ["binary search on partitions"],
  difficulty: "hard",
  summary: "the median of two sorted arrays of any sizes, in logarithmic time.",
  intro: "two sorted arrays of sizes n and m (possibly different). find the median of all n + m numbers — the middle value, or the average of the two middle values if n + m is even.",
  example: { input: "a = [-5, 3, 6, 12, 15], b = [-12, -10, -6, -3, 4, 10]", output: "3", why: "combined (11 numbers): −12, −10, −6, −5, −3, 3, 4, 6, 10, 12, 15 → the 6th is 3." },
  clues: ["same as the equal-size version, but binary-search the shorter array.", "the other cut is forced: j = half − i.", "out-of-range borders become −∞ / +∞."],
  approaches: medianApproaches(false),
  input: {
    arrays: [
      { key: "arr", label: "a (sorted)", min: -99, max: 99, minLen: 1, maxLen: 7, sorted: true },
      { key: "arr2", label: "b (sorted)", min: -99, max: 99, minLen: 1, maxLen: 7, sorted: true },
    ],
    defaults: { arr: [-5, 3, 6, 12, 15], arr2: [-12, -10, -6, -3, 4, 10] },
  },
  checkpoints: [
    { q: "why binary-search the shorter array?", options: ["it's faster to sort", "every cut in it gives a valid j, and it's O(log min(n, m))", "the longer one isn't sorted"], answer: 1, right: "yes — searching the longer one could push j out of range.", wrong: "j = half − i. what happens to j if i ranges over the longer array?" },
    { q: "a's cut has no left element (i = 0). what value stands in for aLeft?", options: ["0", "−∞", "a[0]"], answer: 1, right: "right — −∞ can never break the ≤ checks.", wrong: "the missing value must never be 'too big'. what's smaller than everything?" },
  ],
};

export const chocolateDistribution: Problem = {
  slug: "chocolate-distribution",
  sheet: [30],
  title: "chocolate distribution problem",
  sheetTitle: "Chocolate Distribution problem",
  pattern: "sorting-searching",
  also: ["sort + fixed window"],
  difficulty: "easy",
  summary: "hand m packets to m students so the richest and poorest differ as little as possible.",
  intro: "each packet holds some chocolates. give one packet to each of m students so that the difference between the largest and smallest packet handed out is as small as possible.",
  example: { input: "packets = [7, 3, 2, 4, 9, 12, 56], m = 3", output: "2", why: "give out 2, 3 and 4: the difference is 4 − 2 = 2." },
  clues: ["minimise max − min of a chosen group.", "after sorting, the best group is always a contiguous block.", "then slide a window of size m."],
  approaches: [
    {
      level: "brute", name: "try every group of m", idea: "check every combination of m packets.",
      walkthrough: ["enumerate combinations.", "track the smallest max − min."], pseudocode: "for each m-subset S: best ← min(best, max(S) − min(S))",
      code: { js: `// exponential — shown for comparison only\nfunction minDiff(arr, m, start = 0, pick = []) {\n  if (pick.length === m) return Math.max(...pick) - Math.min(...pick);\n  let best = Infinity;\n  for (let i = start; i < arr.length; i++) best = Math.min(best, minDiff(arr, m, i + 1, [...pick, arr[i]]));\n  return best;\n}`, py: `from itertools import combinations\ndef min_diff(arr, m):\n    return min(max(c) - min(c) for c in combinations(arr, m))` },
      complexity: { time: "O(C(n, m) · m)", space: "O(m)", timeWhy: "every group of m.", spaceWhy: "the current group.", ops: (n) => Math.min(1e6, 2 ** n) },
      pros: ["certainly optimal."], cons: ["exponential."],
    },
    {
      level: "optimal", name: "sort + window of size m", idea: "sort the packets; the fairest m packets are neighbours, so check every window of m consecutive packets.",
      walkthrough: ["sort.", "for each i: diff = s[i + m − 1] − s[i].", "keep the smallest."],
      pseudocode: "sort arr\nfor i in 0..n−m\n  best ← min(best, arr[i+m−1] − arr[i])",
      code: {
        js: `function minDiff(arr, m) {
  arr.sort((a, b) => a - b); // @sort
  let best = Infinity;
  for (let i = 0; i + m - 1 < arr.length; i++) {
    best = Math.min(best, arr[i + m - 1] - arr[i]); // @window
  }
  return best; // @done
}`,
        py: `def min_diff(arr, m):
    arr.sort()  # @sort
    best = min(arr[i + m - 1] - arr[i] for i in range(len(arr) - m + 1))  # @window
    return best  # @done`,
        java: `static int minDiff(int[] arr, int m) {
    Arrays.sort(arr); // @sort
    int best = Integer.MAX_VALUE;
    for (int i = 0; i + m - 1 < arr.length; i++) {
        best = Math.min(best, arr[i + m - 1] - arr[i]); // @window
    }
    return best; // @done
}`,
        cpp: `int minDiff(vector<int> arr, int m) {
    sort(arr.begin(), arr.end()); // @sort
    int best = INT_MAX;
    for (int i = 0; i + m - 1 < (int)arr.size(); i++) {
        best = min(best, arr[i + m - 1] - arr[i]); // @window
    }
    return best; // @done
}`,
      },
      complexity: { time: "O(n log n)", space: "O(1)", timeWhy: "the sort dominates; the window pass is linear.", spaceWhy: "in-place sort.", ops: (n) => n * lg(n) },
      pros: ["short and optimal."], cons: ["sorts the input."],
      tracer: "chocolate",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "packets", min: 0, max: 99, minLen: 1, maxLen: 12 }],
    scalars: [{ key: "k", label: "m (students)", min: 1, max: 12 }],
    defaults: { arr: [7, 3, 2, 4, 9, 12, 56], k: 3 },
    check: (i) => ((i.k ?? 1) > i.arr.length ? "there can't be more students than packets." : null),
  },
  checkpoints: [
    { q: "why is the best group always contiguous after sorting?", options: ["because sorting removes duplicates", "swapping in a value from outside a block can only widen max − min", "it isn't always"], answer: 1, right: "exactly — any gap inside the chosen group can be closed without increasing the spread.", wrong: "picture a group with a hole in it. can filling the hole ever make things worse?" },
    { q: "sorted [2, 3, 4, 7, 9], m = 2. answer?", options: ["1", "2", "3"], answer: 0, right: "right — 2 and 3 (or 3 and 4) differ by 1.", wrong: "check each pair of neighbours." },
  ],
};
