import type { Problem } from "@/lib/types";

const lg = (n: number) => Math.max(1, Math.log2(Math.max(2, n)));

export const zeroSumSubarray: Problem = {
  slug: "zero-sum-subarray",
  topic: "arrays",
  sheet: [21],
  title: "subarray with sum equal to 0",
  sheetTitle: "Find if there is any subarray with sum equal to 0",
  pattern: "hashing",
  also: ["prefix sums"],
  difficulty: "medium",
  summary: "does any contiguous stretch add up to exactly zero?",
  intro: "decide whether the array contains at least one contiguous subarray (of length ≥ 1) whose elements add up to 0.",
  example: { input: "[4, 2, -3, 1, 6]", output: "yes", why: "2 + (−3) + 1 = 0." },
  clues: ["subarray sums → think prefix sums: sum(i..j) = prefix[j] − prefix[i−1].", "a sum of 0 means two prefix sums are equal.", "“have I seen this prefix before?” → hash set."],
  approaches: [
    {
      level: "brute", name: "every subarray", idea: "for each start, keep a running sum to every end and check for 0.",
      walkthrough: ["fix i.", "sum arr[i..j] incrementally.", "0 → yes."], pseudocode: "for i: s ← 0; for j ≥ i: s += arr[j]; if s = 0: return true",
      code: { js: `function hasZeroSum(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    let s = 0;\n    for (let j = i; j < arr.length; j++) { s += arr[j]; if (s === 0) return true; }\n  }\n  return false;\n}`, py: `def has_zero_sum(arr):\n    for i in range(len(arr)):\n        s = 0\n        for j in range(i, len(arr)):\n            s += arr[j]\n            if s == 0: return True\n    return False` },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "all subarrays.", spaceWhy: "one running sum.", ops: (n) => (n * n) / 2 },
      pros: ["simple."], cons: ["quadratic."],
    },
    {
      level: "optimal", name: "prefix sums in a hash set", idea: "keep a running total. if it ever repeats (including the starting 0), the numbers in between summed to 0.",
      walkthrough: ["seen = {0}, prefix = 0.", "prefix += x.", "prefix already in seen → yes.", "otherwise add it and continue."],
      pseudocode: "seen ← {0}; prefix ← 0\nfor x in arr\n  prefix += x\n  if prefix ∈ seen: return true\n  seen.add(prefix)\nreturn false",
      code: {
        js: `function hasZeroSum(arr) {
  const seen = new Set([0]); // @init
  let prefix = 0; // @init
  for (const x of arr) {
    prefix += x; // @prefix
    if (seen.has(prefix)) return true; // @hit
    seen.add(prefix); // @store
  }
  return false; // @done
}`,
        py: `def has_zero_sum(arr):
    seen = {0}  # @init
    prefix = 0  # @init
    for x in arr:
        prefix += x  # @prefix
        if prefix in seen: return True  # @hit
        seen.add(prefix)  # @store
    return False  # @done`,
        java: `static boolean hasZeroSum(int[] arr) {
    Set<Long> seen = new HashSet<>(List.of(0L)); // @init
    long prefix = 0; // @init
    for (int x : arr) {
        prefix += x; // @prefix
        if (seen.contains(prefix)) return true; // @hit
        seen.add(prefix); // @store
    }
    return false; // @done
}`,
        cpp: `bool hasZeroSum(const vector<int>& arr) {
    unordered_set<long long> seen{0}; // @init
    long long prefix = 0; // @init
    for (int x : arr) {
        prefix += x; // @prefix
        if (seen.count(prefix)) return true; // @hit
        seen.insert(prefix); // @store
    }
    return false; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "one pass with O(1) average set operations.", spaceWhy: "up to n distinct prefix sums.", ops: (n) => n },
      pros: ["linear.", "the same trick counts subarrays with sum k (store counts instead of a set)."], cons: ["O(n) memory."],
      tracer: "zeroSum",
    },
  ],
  input: { arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 12 }], defaults: { arr: [4, 2, -3, 1, 6] } },
  checkpoints: [
    { q: "why does the set start with 0 already in it?", options: ["for speed", "so a prefix that itself is 0 (a zero-sum from index 0) is detected", "it doesn't matter"], answer: 1, right: "exactly — e.g. [3, −3]: prefix 0 must match the empty prefix.", wrong: "try [3, −3]. the prefixes are 3, 0. what must already be in the set?" },
    { q: "prefix sums are 4, 6, 3, 4. what does the repeated 4 tell us?", options: ["the element 4 is duplicated", "the elements after the first 4 up to the second one sum to 0", "nothing"], answer: 1, right: "right — 2 + (−3) + 1 = 0.", wrong: "if the running total returns to 4, what did the numbers in between add?" },
  ],
};

export const longestConsecutive: Problem = {
  slug: "longest-consecutive",
  topic: "arrays",
  sheet: [24],
  title: "longest consecutive subsequence",
  sheetTitle: "Find longest coinsecutive subsequence",
  pattern: "hashing",
  also: ["hash set"],
  difficulty: "medium",
  summary: "the longest run of consecutive integers, in any order.",
  intro: "find the length of the longest set of values that form consecutive integers (like 1, 2, 3, 4). the values can appear anywhere in the array, in any order.",
  example: { input: "[1, 9, 3, 10, 4, 20, 2]", output: "4", why: "1, 2, 3, 4 are all present." },
  clues: ["order in the array doesn't matter — only membership.", "“is x + 1 present?” asked many times → hash set.", "only start counting from numbers with no x − 1."],
  approaches: [
    {
      level: "brute", name: "sort and count runs", idea: "sort, then walk counting how long each +1 streak lasts (skipping duplicates).",
      walkthrough: ["sort.", "extend the run when s[i] = s[i−1] + 1, ignore equal neighbours."], pseudocode: "sort\nfor i: if s[i] = s[i−1]+1: run++ elif s[i] ≠ s[i−1]: run ← 1",
      code: { js: `function longest(arr) {\n  const s = [...new Set(arr)].sort((a, b) => a - b);\n  let best = 0, run = 0;\n  for (let i = 0; i < s.length; i++) {\n    run = i && s[i] === s[i - 1] + 1 ? run + 1 : 1;\n    best = Math.max(best, run);\n  }\n  return best;\n}`, py: `def longest(arr):\n    s = sorted(set(arr)); best = run = 0\n    for i, x in enumerate(s):\n        run = run + 1 if i and x == s[i - 1] + 1 else 1\n        best = max(best, run)\n    return best` },
      complexity: { time: "O(n log n)", space: "O(n)", timeWhy: "sorting dominates.", spaceWhy: "the de-duplicated copy.", ops: (n) => n * lg(n) },
      pros: ["simple and reliable."], cons: ["sorting is more than we need."],
    },
    {
      level: "optimal", name: "hash set, count from run starts", idea: "put everything in a set. a number x starts a run only if x − 1 is missing; from there count x + 1, x + 2… while present.",
      walkthrough: ["set = all values.", "for each x: skip if x − 1 ∈ set.", "else walk x, x+1, … and record the length."],
      pseudocode: "S ← set(arr)\nfor x in S\n  if x−1 ∉ S\n    len ← 1\n    while x+len ∈ S: len++\n    best ← max(best, len)",
      code: {
        js: `function longest(arr) {
  const set = new Set(arr); // @init
  let best = 0; // @init
  for (const x of set) {
    if (set.has(x - 1)) continue; // @skip
    let len = 1; // @start
    while (set.has(x + len)) len++; // @walk
    best = Math.max(best, len); // @best
  }
  return best; // @done
}`,
        py: `def longest(arr):
    s = set(arr)  # @init
    best = 0  # @init
    for x in s:
        if x - 1 in s: continue  # @skip
        length = 1  # @start
        while x + length in s: length += 1  # @walk
        best = max(best, length)  # @best
    return best  # @done`,
        java: `static int longest(int[] arr) {
    Set<Integer> set = new HashSet<>(); // @init
    for (int x : arr) set.add(x); // @init
    int best = 0;
    for (int x : set) {
        if (set.contains(x - 1)) continue; // @skip
        int len = 1; // @start
        while (set.contains(x + len)) len++; // @walk
        best = Math.max(best, len); // @best
    }
    return best; // @done
}`,
        cpp: `int longest(const vector<int>& arr) {
    unordered_set<int> s(arr.begin(), arr.end()); // @init
    int best = 0; // @init
    for (int x : s) {
        if (s.count(x - 1)) continue; // @skip
        int len = 1; // @start
        while (s.count(x + len)) len++; // @walk
        best = max(best, len); // @best
    }
    return best; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "each value is walked only from its run's start, so total walking is n.", spaceWhy: "the set.", ops: (n) => 2 * n },
      pros: ["linear despite the inner while loop."], cons: ["hash set memory; worse constants than sorting for small inputs."],
      tracer: "longestConsec",
    },
  ],
  input: { arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 12 }], defaults: { arr: [1, 9, 3, 10, 4, 20, 2] } },
  checkpoints: [
    { q: "why skip x when x − 1 is in the set?", options: ["x is a duplicate", "x's run will be counted from its smaller start, so counting here repeats work", "x is too large"], answer: 1, right: "exactly — that's what keeps the total work linear.", wrong: "if x − 1 exists, x belongs to a run that starts earlier…" },
    { q: "the inner while loop looks nested. why isn't this O(n²)?", options: ["the set is small", "each value is walked at most once across all runs", "it is O(n²)"], answer: 1, right: "right — runs don't overlap, so all walks add up to n.", wrong: "count how many times any single value can be stepped on by the while loop." },
  ],
};

export const moreThanNByK: Problem = {
  slug: "more-than-n-by-k",
  topic: "arrays",
  sheet: [25],
  title: "elements appearing more than n/k times",
  sheetTitle: "Given an array of size n and a number k, fin all elements that appear more than \" n/k \" times.",
  pattern: "hashing",
  also: ["frequency map", "boyer–moore (extended)"],
  difficulty: "medium",
  summary: "find every value that shows up more than n/k times.",
  intro: "given an array of n numbers and an integer k, list all values that occur more than ⌊n/k⌋ times. there can be at most k − 1 such values.",
  example: { input: "arr = [3, 1, 2, 2, 1, 2, 3, 3], k = 4", output: "[3, 2]", why: "n/k = 2; 2 and 3 each appear 3 times." },
  clues: ["“how many times does each value appear?” → frequency map.", "a threshold relative to n.", "at most k − 1 answers — a hint for the O(k)-space voting version."],
  approaches: [
    {
      level: "brute", name: "count each value by scanning", idea: "for every distinct value, scan the whole array to count it.",
      walkthrough: ["for each value x: count occurrences.", "keep x if count > n/k."], pseudocode: "for x in distinct(arr): if count(arr, x) > ⌊n/k⌋: output x",
      code: { js: `function moreThan(arr, k) {\n  const limit = Math.floor(arr.length / k);\n  return [...new Set(arr)].filter((x) => arr.filter((y) => y === x).length > limit);\n}`, py: `def more_than(arr, k):\n    return [x for x in dict.fromkeys(arr) if arr.count(x) > len(arr) // k]` },
      complexity: { time: "O(n²)", space: "O(n)", timeWhy: "up to n distinct values × a full scan.", spaceWhy: "the distinct list.", ops: (n) => (n * n) / 2 },
      pros: ["obvious."], cons: ["rescans the array per value."],
    },
    {
      level: "optimal", name: "frequency hash map", idea: "count every value in one pass, then keep those above ⌊n/k⌋.",
      walkthrough: ["count[x]++ for every x.", "limit = ⌊n/k⌋.", "output values with count > limit."],
      pseudocode: "for x in arr: count[x]++\nreturn [x for x with count[x] > ⌊n/k⌋]",
      code: {
        js: `function moreThan(arr, k) {
  const count = new Map(); // @init
  for (const x of arr) count.set(x, (count.get(x) || 0) + 1); // @count
  const limit = Math.floor(arr.length / k); // @filter
  return [...count].filter(([, c]) => c > limit).map(([v]) => v); // @filter
}`,
        py: `from collections import Counter
def more_than(arr, k):
    count = Counter()  # @init
    for x in arr: count[x] += 1  # @count
    limit = len(arr) // k  # @filter
    return [v for v, c in count.items() if c > limit]  # @filter`,
        java: `static List<Integer> moreThan(int[] arr, int k) {
    Map<Integer, Integer> count = new LinkedHashMap<>(); // @init
    for (int x : arr) count.merge(x, 1, Integer::sum); // @count
    int limit = arr.length / k; // @filter
    List<Integer> out = new ArrayList<>(); // @filter
    count.forEach((v, c) -> { if (c > limit) out.add(v); }); // @filter
    return out;
}`,
        cpp: `vector<int> moreThan(const vector<int>& arr, int k) {
    unordered_map<int, int> count; // @init
    for (int x : arr) count[x]++; // @count
    int limit = arr.size() / k; // @filter
    vector<int> out; // @filter
    for (auto& [v, c] : count) if (c > limit) out.push_back(v); // @filter
    return out;
}`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "one counting pass plus one pass over the distinct values.", spaceWhy: "one map entry per distinct value.", ops: (n) => 2 * n },
      pros: ["linear and simple."], cons: ["O(n) memory — the extended boyer–moore vote gets it to O(k) at the cost of O(n·k) time."],
      tracer: "nByK",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 12 }],
    scalars: [{ key: "k", label: "k", min: 2, max: 12 }],
    defaults: { arr: [3, 1, 2, 2, 1, 2, 3, 3], k: 4 },
  },
  checkpoints: [
    { q: "n = 8, k = 4. a value appearing exactly 2 times — is it included?", options: ["yes", "no — it must appear more than 2 times"], answer: 1, right: "right — 'more than n/k' is strict.", wrong: "⌊8/4⌋ = 2. is 2 more than 2?" },
    { q: "what's the maximum number of values that can qualify?", options: ["k", "k − 1", "n / k"], answer: 1, right: "yes — k values each above n/k would need more than n elements.", wrong: "if k values each appeared more than n/k times, how many elements would that take?" },
  ],
};

export const subsetCheck: Problem = {
  slug: "subset-check",
  topic: "arrays",
  sheet: [27],
  title: "check whether one array is a subset of another",
  sheetTitle: "Find whether an array is a subset of another array",
  pattern: "hashing",
  also: ["frequency map"],
  difficulty: "easy",
  summary: "can every element of a2 be matched to an element of a1?",
  intro: "given arrays a1 and a2, decide whether a2 is a subset of a1: every element of a2 must be found in a1. if a value repeats in a2, a1 must have at least that many copies.",
  example: { input: "a1 = [11, 1, 13, 21, 3, 7], a2 = [11, 3, 7, 1]", output: "yes", why: "11, 3, 7 and 1 are all in a1." },
  clues: ["membership questions → hash map.", "repeats matter → store counts, not just presence.", "if both were sorted, two pointers would work too."],
  approaches: [
    {
      level: "brute", name: "search a1 for each element", idea: "for every element of a2, linearly search a1 (marking used copies).",
      walkthrough: ["for each x in a2: find an unused copy in a1.", "none → not a subset."], pseudocode: "for x in a2\n  find unused j with a1[j] = x, else return false\n  mark j used",
      code: { js: `function isSubset(a1, a2) {\n  const used = Array(a1.length).fill(false);\n  for (const x of a2) {\n    const j = a1.findIndex((y, i) => y === x && !used[i]);\n    if (j < 0) return false;\n    used[j] = true;\n  }\n  return true;\n}`, py: `def is_subset(a1, a2):\n    pool = list(a1)\n    for x in a2:\n        if x not in pool: return False\n        pool.remove(x)\n    return True` },
      complexity: { time: "O(n·m)", space: "O(n)", timeWhy: "m searches over n elements.", spaceWhy: "the used flags.", ops: (n) => (n * n) / 2 },
      pros: ["no hashing."], cons: ["quadratic."],
    },
    {
      level: "optimal", name: "frequency map", idea: "count a1's values, then let each element of a2 spend one count. running out means it isn't a subset.",
      walkthrough: ["freq[x]++ for x in a1.", "for x in a2: if freq[x] is 0 → no; else freq[x]−−."],
      pseudocode: "for x in a1: freq[x]++\nfor x in a2\n  if freq[x] = 0: return false\n  freq[x]−−\nreturn true",
      code: {
        js: `function isSubset(a1, a2) {
  const freq = new Map(); // @init
  for (const x of a1) freq.set(x, (freq.get(x) || 0) + 1); // @build
  for (const x of a2) {
    if (!freq.get(x)) return false; // @missing
    freq.set(x, freq.get(x) - 1); // @use
  }
  return true; // @done
}`,
        py: `from collections import Counter
def is_subset(a1, a2):
    freq = Counter()  # @init
    for x in a1: freq[x] += 1  # @build
    for x in a2:
        if freq[x] == 0: return False  # @missing
        freq[x] -= 1  # @use
    return True  # @done`,
        java: `static boolean isSubset(int[] a1, int[] a2) {
    Map<Integer, Integer> freq = new HashMap<>(); // @init
    for (int x : a1) freq.merge(x, 1, Integer::sum); // @build
    for (int x : a2) {
        if (freq.getOrDefault(x, 0) == 0) return false; // @missing
        freq.merge(x, -1, Integer::sum); // @use
    }
    return true; // @done
}`,
        cpp: `bool isSubset(const vector<int>& a1, const vector<int>& a2) {
    unordered_map<int, int> freq; // @init
    for (int x : a1) freq[x]++; // @build
    for (int x : a2) {
        if (freq[x] == 0) return false; // @missing
        freq[x]--; // @use
    }
    return true; // @done
}`,
      },
      complexity: { time: "O(n + m)", space: "O(n)", timeWhy: "one pass over each array.", spaceWhy: "counts for a1's distinct values.", ops: (n) => 2 * n },
      pros: ["linear, handles duplicates correctly."], cons: ["hash memory."],
      tracer: "subset",
    },
  ],
  input: {
    arrays: [
      { key: "arr", label: "a1", min: -99, max: 99, minLen: 1, maxLen: 8 },
      { key: "arr2", label: "a2", min: -99, max: 99, minLen: 1, maxLen: 8 },
    ],
    defaults: { arr: [11, 1, 13, 21, 3, 7], arr2: [11, 3, 7, 1] },
  },
  checkpoints: [
    { q: "a1 = [1, 2, 3], a2 = [1, 1]. subset?", options: ["yes", "no"], answer: 1, right: "right — a1 has only one 1 to spend.", wrong: "a2 needs two 1s. how many does a1 have?" },
    { q: "why store counts instead of a plain set?", options: ["sets are slower", "to handle values that repeat in a2", "counts use less memory"], answer: 1, right: "exactly — a set can't tell one copy from two.", wrong: "think about a2 = [5, 5] and a1 = [5]." },
  ],
};
