import type { Problem } from "@/lib/types";

export const smallestSubarray: Problem = {
  slug: "smallest-subarray-sum",
  sheet: [31],
  title: "smallest subarray with sum greater than x",
  sheetTitle: "Smallest Subarray with sum greater than a given value",
  pattern: "sliding-window",
  also: ["variable-size window"],
  difficulty: "easy",
  summary: "shortest stretch of positive numbers whose total is more than x.",
  intro: "the array holds non-negative numbers. find the length of the shortest contiguous subarray whose sum is strictly greater than x. if none exists, the answer is 0.",
  example: { input: "arr = [1, 4, 45, 6, 0, 19], x = 51", output: "3", why: "[4, 45, 6] sums to 55 > 51, and no two neighbours beat 51." },
  clues: ["contiguous subarray + a sum condition + 'smallest/longest'.", "all numbers are non-negative, so growing the window never lowers the sum.", "once a window is valid, try shrinking it from the left."],
  approaches: [
    {
      level: "brute", name: "grow from every start", idea: "for each start, extend right until the sum exceeds x, recording the length.",
      walkthrough: ["fix start.", "add elements until sum > x.", "keep the smallest length."], pseudocode: "for s in 0..n−1\n  sum ← 0\n  for e in s..n−1\n    sum += arr[e]\n    if sum > x: best ← min(best, e−s+1); break",
      code: { js: `function smallest(arr, x) {\n  let best = Infinity;\n  for (let s = 0; s < arr.length; s++) {\n    let sum = 0;\n    for (let e = s; e < arr.length; e++) {\n      sum += arr[e];\n      if (sum > x) { best = Math.min(best, e - s + 1); break; }\n    }\n  }\n  return best === Infinity ? 0 : best;\n}`, py: `def smallest(arr, x):\n    best = float("inf")\n    for s in range(len(arr)):\n        total = 0\n        for e in range(s, len(arr)):\n            total += arr[e]\n            if total > x:\n                best = min(best, e - s + 1); break\n    return 0 if best == float("inf") else best` },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "each start may scan to the end.", spaceWhy: "a sum and a best.", ops: (n) => (n * n) / 2 },
      pros: ["straightforward."], cons: ["re-adds overlapping windows."],
    },
    {
      level: "optimal", name: "variable sliding window", idea: "grow the window's right edge; whenever the sum exceeds x, record the length and shrink from the left while it still exceeds x.",
      walkthrough: ["start = 0, sum = 0.", "for each end: sum += arr[end].", "while sum > x: record end − start + 1, subtract arr[start], start++."],
      pseudocode: "start ← 0; sum ← 0; best ← ∞\nfor end in 0..n−1\n  sum += arr[end]\n  while sum > x\n    best ← min(best, end−start+1)\n    sum −= arr[start]; start++",
      code: {
        js: `function smallest(arr, x) {
  let best = Infinity, sum = 0, start = 0; // @init
  for (let end = 0; end < arr.length; end++) {
    sum += arr[end]; // @grow
    while (sum > x) {
      best = Math.min(best, end - start + 1); // @record
      sum -= arr[start++]; // @shrink
    }
  }
  return best === Infinity ? 0 : best; // @done
}`,
        py: `def smallest(arr, x):
    best, total, start = float("inf"), 0, 0  # @init
    for end in range(len(arr)):
        total += arr[end]  # @grow
        while total > x:
            best = min(best, end - start + 1)  # @record
            total -= arr[start]; start += 1  # @shrink
    return 0 if best == float("inf") else best  # @done`,
        java: `static int smallest(int[] arr, int x) {
    int best = Integer.MAX_VALUE, sum = 0, start = 0; // @init
    for (int end = 0; end < arr.length; end++) {
        sum += arr[end]; // @grow
        while (sum > x) {
            best = Math.min(best, end - start + 1); // @record
            sum -= arr[start++]; // @shrink
        }
    }
    return best == Integer.MAX_VALUE ? 0 : best; // @done
}`,
        cpp: `int smallest(const vector<int>& arr, int x) {
    int best = INT_MAX, sum = 0, start = 0; // @init
    for (int end = 0; end < (int)arr.size(); end++) {
        sum += arr[end]; // @grow
        while (sum > x) {
            best = min(best, end - start + 1); // @record
            sum -= arr[start++]; // @shrink
        }
    }
    return best == INT_MAX ? 0 : best; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "each element enters the window once and leaves at most once — at most 2n moves.", spaceWhy: "two pointers and a sum.", ops: (n) => 2 * n },
      pros: ["linear, constant memory."], cons: ["relies on non-negative numbers; with negatives, shrinking could raise the sum and the window logic breaks."],
      tracer: "smallestSub",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "non-negative numbers", min: 0, max: 99, minLen: 1, maxLen: 12 }],
    scalars: [{ key: "target", label: "x", min: 0, max: 999 }],
    defaults: { arr: [1, 4, 45, 6, 0, 19], target: 51 },
  },
  checkpoints: [
    { q: "why is the window approach O(n) even with a while loop inside the for loop?", options: ["the while loop runs once", "start only moves forward, at most n times in total", "it isn't — it's O(n²)"], answer: 1, right: "exactly — count moves of start across the whole run, not per iteration.", wrong: "look at start. can it ever move backwards?" },
    { q: "what breaks if the array contains negative numbers?", options: ["nothing", "shrinking might increase the sum, so a valid shorter window can be missed", "the answer is always 0"], answer: 1, right: "right — the window trick needs 'adding helps, removing hurts'.", wrong: "removing a negative number from the left would do what to the sum?" },
  ],
};

export const maxProductSubarray: Problem = {
  slug: "max-product-subarray",
  sheet: [23],
  title: "maximum product subarray",
  sheetTitle: "find maximum product subarray",
  pattern: "sliding-window",
  also: ["kadane variant", "dynamic programming"],
  difficulty: "medium",
  summary: "the contiguous stretch with the largest product.",
  intro: "find the contiguous subarray (at least one number) whose product is the largest, and return that product. negatives and zeros make it interesting.",
  example: { input: "[6, -3, -10, 0, 2]", output: "180", why: "6 × −3 × −10 = 180; the two negatives cancel out." },
  clues: ["it's kadane's question with × instead of +.", "a negative number turns the smallest product into the largest.", "a zero resets everything."],
  approaches: [
    {
      level: "brute", name: "every subarray", idea: "for every start, multiply rightwards and keep the max.",
      walkthrough: ["fix start.", "running product to each end.", "keep the largest."], pseudocode: "for i: p ← 1; for j ≥ i: p ← p·arr[j]; best ← max(best, p)",
      code: { js: `function maxProduct(arr) {\n  let best = -Infinity;\n  for (let i = 0; i < arr.length; i++) {\n    let p = 1;\n    for (let j = i; j < arr.length; j++) { p *= arr[j]; best = Math.max(best, p); }\n  }\n  return best;\n}`, py: `def max_product(arr):\n    best = float("-inf")\n    for i in range(len(arr)):\n        p = 1\n        for j in range(i, len(arr)):\n            p *= arr[j]; best = max(best, p)\n    return best` },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "all n²/2 subarrays.", spaceWhy: "a running product.", ops: (n) => (n * n) / 2 },
      pros: ["clearly correct."], cons: ["quadratic."],
    },
    {
      level: "optimal", name: "track max and min", idea: "like kadane, but keep both the largest (hi) and smallest (lo) product ending here; a negative number swaps their roles.",
      walkthrough: ["hi = lo = best = arr[0].", "if x < 0, swap hi and lo.", "hi = max(x, hi·x), lo = min(x, lo·x).", "best = max(best, hi)."],
      pseudocode: "hi ← lo ← best ← arr[0]\nfor x in arr[1..]\n  if x < 0: swap hi, lo\n  hi ← max(x, hi·x); lo ← min(x, lo·x)\n  best ← max(best, hi)",
      code: {
        js: `function maxProduct(arr) {
  let hi = arr[0], lo = arr[0], best = arr[0]; // @init
  for (let i = 1; i < arr.length; i++) {
    const x = arr[i];
    if (x < 0) [hi, lo] = [lo, hi]; // @flip
    hi = Math.max(x, hi * x); // @update
    lo = Math.min(x, lo * x); // @update
    best = Math.max(best, hi); // @best
  }
  return best; // @done
}`,
        py: `def max_product(arr):
    hi = lo = best = arr[0]  # @init
    for x in arr[1:]:
        if x < 0: hi, lo = lo, hi  # @flip
        hi = max(x, hi * x)  # @update
        lo = min(x, lo * x)  # @update
        best = max(best, hi)  # @best
    return best  # @done`,
        java: `static long maxProduct(int[] arr) {
    long hi = arr[0], lo = arr[0], best = arr[0]; // @init
    for (int i = 1; i < arr.length; i++) {
        long x = arr[i];
        if (x < 0) { long t = hi; hi = lo; lo = t; } // @flip
        hi = Math.max(x, hi * x); // @update
        lo = Math.min(x, lo * x); // @update
        best = Math.max(best, hi); // @best
    }
    return best; // @done
}`,
        cpp: `long long maxProduct(const vector<int>& arr) {
    long long hi = arr[0], lo = arr[0], best = arr[0]; // @init
    for (size_t i = 1; i < arr.size(); i++) {
        long long x = arr[i];
        if (x < 0) swap(hi, lo); // @flip
        hi = max(x, hi * x); // @update
        lo = min(x, lo * x); // @update
        best = max(best, hi); // @best
    }
    return best; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one pass with constant work per element.", spaceWhy: "three running values.", ops: (n) => n },
      pros: ["linear, handles zeros and negatives."], cons: ["products overflow 32-bit ints quickly — use 64-bit (the java/c++ versions do)."],
      tracer: "maxProduct",
    },
  ],
  input: { arrays: [{ key: "arr", label: "numbers", min: -9, max: 9, minLen: 1, maxLen: 10 }], defaults: { arr: [6, -3, -10, 0, 2] } },
  checkpoints: [
    { q: "why track the minimum product at all?", options: ["for the final answer", "a negative number can turn the minimum into the new maximum", "to detect zeros"], answer: 1, right: "exactly — −30 × −2 = 60.", wrong: "what happens when you multiply a very negative product by a negative number?" },
    { q: "what does a 0 in the array do to hi and lo?", options: ["nothing", "both become 0, so the next run starts fresh", "the answer becomes 0"], answer: 1, right: "right — max(x, hi·0) with x = 0 resets the run.", wrong: "hi = max(0, hi × 0). what's that?" },
  ],
};

export const minSwapsK: Problem = {
  slug: "min-swaps-k-together",
  sheet: [33],
  title: "minimum swaps to bring elements ≤ k together",
  sheetTitle: "Minimum swaps required bring elements less equal K together",
  pattern: "sliding-window",
  also: ["fixed-size window"],
  difficulty: "medium",
  summary: "fewest swaps to gather every value ≤ k into one contiguous block.",
  intro: "you may swap any two elements. find the minimum number of swaps needed to bring all elements that are less than or equal to k next to each other (anywhere in the array).",
  example: { input: "arr = [2, 1, 5, 6, 3], k = 3", output: "1", why: "swap 5 and 3 → [2, 1, 3, 6, 5]; the three small values now sit together." },
  clues: ["the final block has a known size: the count of good elements.", "try every window of that size — a fixed-size sliding window.", "each bad element inside the chosen window costs exactly one swap."],
  approaches: [
    {
      level: "brute", name: "count bad in every window", idea: "for every window of length good, count elements > k from scratch.",
      walkthrough: ["good = count(x ≤ k).", "for each start, count bad in [start, start+good)."], pseudocode: "for s in 0..n−good\n  bad ← count(arr[s..s+good−1] > k)\n  best ← min(best, bad)",
      code: { js: `function minSwap(arr, k) {\n  const good = arr.filter((x) => x <= k).length;\n  let best = Infinity;\n  for (let s = 0; s + good <= arr.length; s++) {\n    let bad = 0;\n    for (let i = s; i < s + good; i++) if (arr[i] > k) bad++;\n    best = Math.min(best, bad);\n  }\n  return good ? best : 0;\n}`, py: `def min_swap(arr, k):\n    good = sum(x <= k for x in arr)\n    if not good: return 0\n    return min(sum(x > k for x in arr[s:s + good]) for s in range(len(arr) - good + 1))` },
      complexity: { time: "O(n·g)", space: "O(1)", timeWhy: "n windows × g elements each.", spaceWhy: "counters only.", ops: (n) => (n * n) / 4 },
      pros: ["direct."], cons: ["recounts almost the same window every time."],
    },
    {
      level: "optimal", name: "fixed sliding window", idea: "count bad elements in the first window, then slide: subtract the one that leaves, add the one that enters.",
      walkthrough: ["good = count(x ≤ k).", "bad = count(> k) in the first good elements.", "slide by one: update bad in O(1).", "answer = smallest bad seen."],
      pseudocode: "good ← count(x ≤ k)\nbad ← count(arr[0..good−1] > k); best ← bad\nfor i in good..n−1\n  if arr[i−good] > k: bad−−\n  if arr[i] > k: bad++\n  best ← min(best, bad)",
      code: {
        js: `function minSwap(arr, k) {
  const good = arr.filter((x) => x <= k).length; // @count
  let bad = 0;
  for (let i = 0; i < good; i++) if (arr[i] > k) bad++; // @first
  let best = bad; // @first
  for (let i = good; i < arr.length; i++) {
    if (arr[i - good] > k) bad--; // @slide
    if (arr[i] > k) bad++; // @slide
    best = Math.min(best, bad); // @best
  }
  return best; // @done
}`,
        py: `def min_swap(arr, k):
    good = sum(x <= k for x in arr)  # @count
    bad = sum(x > k for x in arr[:good])  # @first
    best = bad  # @first
    for i in range(good, len(arr)):
        if arr[i - good] > k: bad -= 1  # @slide
        if arr[i] > k: bad += 1  # @slide
        best = min(best, bad)  # @best
    return best  # @done`,
        java: `static int minSwap(int[] arr, int k) {
    int good = 0;
    for (int x : arr) if (x <= k) good++; // @count
    int bad = 0;
    for (int i = 0; i < good; i++) if (arr[i] > k) bad++; // @first
    int best = bad; // @first
    for (int i = good; i < arr.length; i++) {
        if (arr[i - good] > k) bad--; // @slide
        if (arr[i] > k) bad++; // @slide
        best = Math.min(best, bad); // @best
    }
    return best; // @done
}`,
        cpp: `int minSwap(const vector<int>& arr, int k) {
    int good = count_if(arr.begin(), arr.end(), [&](int x) { return x <= k; }); // @count
    int bad = 0;
    for (int i = 0; i < good; i++) if (arr[i] > k) bad++; // @first
    int best = bad; // @first
    for (int i = good; i < (int)arr.size(); i++) {
        if (arr[i - good] > k) bad--; // @slide
        if (arr[i] > k) bad++; // @slide
        best = min(best, bad); // @best
    }
    return best; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one pass to count, one pass to slide.", spaceWhy: "three counters.", ops: (n) => 2 * n },
      pros: ["linear, constant memory."], cons: ["only counts swaps — building the actual swaps takes one more pass."],
      tracer: "minSwapsK",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 12 }],
    scalars: [{ key: "k", label: "k", min: -99, max: 99 }],
    defaults: { arr: [2, 7, 9, 5, 8, 7, 4], k: 5 },
  },
  checkpoints: [
    { q: "why is the window length fixed?", options: ["because k is fixed", "because the block must hold exactly the good elements", "it isn't"], answer: 1, right: "yes — the good elements must end up in a block of exactly that many slots.", wrong: "how many slots does the final block of good elements take?" },
    { q: "a window of 3 contains 1 bad element. how many swaps does it need?", options: ["1", "2", "3"], answer: 0, right: "right — swap the bad one with a good one from outside.", wrong: "each bad element inside the window needs one good element swapped in." },
  ],
};

export const stockOnce: Problem = {
  slug: "best-time-stock",
  sheet: [17],
  title: "best time to buy and sell stock (once)",
  sheetTitle: "Best time to buy and Sell stock",
  pattern: "sliding-window",
  also: ["running minimum", "kadane variant"],
  difficulty: "easy",
  summary: "buy one day, sell a later day — maximise the profit.",
  intro: "prices[i] is a stock's price on day i. you may buy once and sell once, on a later day. what's the largest profit you can make? if prices only fall, the answer is 0.",
  example: { input: "[7, 1, 5, 3, 6, 4]", output: "5", why: "buy at 1 on day 1, sell at 6 on day 4." },
  clues: ["the best sale today uses the cheapest price before today.", "you only need a running minimum, not every pair.", "a two-pointer window: buy day on the left, sell day on the right."],
  approaches: [
    {
      level: "brute", name: "every buy/sell pair", idea: "try every buy day with every later sell day.",
      walkthrough: ["i < j.", "profit = prices[j] − prices[i]."], pseudocode: "for i < j: best ← max(best, p[j] − p[i])",
      code: { js: `function maxProfit(p) {\n  let best = 0;\n  for (let i = 0; i < p.length; i++)\n    for (let j = i + 1; j < p.length; j++) best = Math.max(best, p[j] - p[i]);\n  return best;\n}`, py: `def max_profit(p):\n    return max([p[j] - p[i] for i in range(len(p)) for j in range(i + 1, len(p))] + [0])` },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "all pairs.", spaceWhy: "a best value.", ops: (n) => (n * n) / 2 },
      pros: ["clear."], cons: ["quadratic."],
    },
    {
      level: "optimal", name: "running minimum", idea: "walk the days; remember the cheapest price so far; today's best sale is price − cheapest.",
      walkthrough: ["minPrice = ∞, best = 0.", "each day: minPrice = min(minPrice, p).", "best = max(best, p − minPrice)."],
      pseudocode: "minPrice ← ∞; best ← 0\nfor p in prices\n  minPrice ← min(minPrice, p)\n  best ← max(best, p − minPrice)",
      code: {
        js: `function maxProfit(prices) {
  let minPrice = Infinity, best = 0; // @init
  for (const p of prices) {
    minPrice = Math.min(minPrice, p); // @min
    best = Math.max(best, p - minPrice); // @profit
  }
  return best; // @done
}`,
        py: `def max_profit(prices):
    min_price, best = float("inf"), 0  # @init
    for p in prices:
        min_price = min(min_price, p)  # @min
        best = max(best, p - min_price)  # @profit
    return best  # @done`,
        java: `static int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE, best = 0; // @init
    for (int p : prices) {
        minPrice = Math.min(minPrice, p); // @min
        best = Math.max(best, p - minPrice); // @profit
    }
    return best; // @done
}`,
        cpp: `int maxProfit(const vector<int>& prices) {
    int minPrice = INT_MAX, best = 0; // @init
    for (int p : prices) {
        minPrice = min(minPrice, p); // @min
        best = max(best, p - minPrice); // @profit
    }
    return best; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one pass.", spaceWhy: "two numbers.", ops: (n) => n },
      pros: ["one pass, tiny code."], cons: ["only one transaction — see 'at most twice' for the harder version."],
      tracer: "stockOnce",
    },
  ],
  input: { arrays: [{ key: "arr", label: "prices", min: 0, max: 999, minLen: 1, maxLen: 12 }], defaults: { arr: [7, 1, 5, 3, 6, 4] } },
  checkpoints: [
    { q: "prices = [9, 7, 4, 1]. what's the best profit?", options: ["8", "0", "−3"], answer: 1, right: "right — prices only fall, so the best move is not trading.", wrong: "you must buy before you sell. is any later price higher?" },
    { q: "how is this like kadane's algorithm?", options: ["it isn't", "profit(p) = max subarray sum of the daily price changes", "both sort the input"], answer: 1, right: "exactly — summing daily differences from buy to sell day is a subarray sum.", wrong: "think about the daily ups and downs between buy and sell days." },
  ],
};
