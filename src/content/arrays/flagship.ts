import type { Problem } from "@/lib/types";

const log2 = (n: number) => Math.max(1, Math.log2(Math.max(2, n)));

export const kadane: Problem = {
  slug: "kadane",
  topic: "arrays",
  sheet: [8, 13],
  title: "largest sum contiguous subarray (kadane's algorithm)",
  sheetTitle: "find Largest sum contiguous Subarray [V. IMP] · Kadane's Algo [V.V.V.V.V IMP]",
  pattern: "sliding-window",
  also: ["dynamic programming", "running sum"],
  difficulty: "medium",
  flagship: true,
  summary: "find the stretch of neighbouring numbers with the biggest total.",
  intro:
    "you're given a list of numbers — some positive, some negative. pick one unbroken stretch of them (at least one number) so that their total is as large as possible, and report that total. think of daily profit and loss: which run of consecutive days made the most money?",
  example: { input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6", why: "the stretch [4, -1, 2, 1] adds up to 6. no other unbroken stretch does better." },
  clues: [
    "the question says contiguous or subarray — the numbers must sit next to each other.",
    "it asks for a maximum (or minimum) of a sum, not the stretch itself.",
    "the array has negative numbers — otherwise you'd just take everything.",
    "you feel tempted to try every start and end: that's the O(n²) signal that a running value can replace a loop.",
  ],
  approaches: [
    {
      level: "brute",
      name: "try every subarray",
      idea: "for every start i and end j, add up the numbers between them from scratch and keep the biggest total.",
      walkthrough: ["pick a start index i.", "pick an end index j ≥ i.", "loop from i to j adding numbers — a brand new sum every time.", "compare it with the best total so far."],
      pseudocode: "best ← −∞\nfor i in 0..n−1\n  for j in i..n−1\n    sum ← 0\n    for k in i..j: sum ← sum + arr[k]\n    best ← max(best, sum)\nreturn best",
      code: {
        js: `function maxSubarraySum(arr) {
  let best = -Infinity; // @init
  for (let i = 0; i < arr.length; i++) {
    for (let j = i; j < arr.length; j++) {
      let sum = 0; // @sum
      for (let k = i; k <= j; k++) sum += arr[k]; // @sum
      best = Math.max(best, sum); // @best
    }
  }
  return best; // @done
}`,
        py: `def max_subarray_sum(arr):
    best = float("-inf")  # @init
    n = len(arr)
    for i in range(n):
        for j in range(i, n):
            total = sum(arr[i:j + 1])  # @sum
            best = max(best, total)  # @best
    return best  # @done`,
        java: `static int maxSubarraySum(int[] arr) {
    int best = Integer.MIN_VALUE; // @init
    for (int i = 0; i < arr.length; i++) {
        for (int j = i; j < arr.length; j++) {
            int sum = 0; // @sum
            for (int k = i; k <= j; k++) sum += arr[k]; // @sum
            best = Math.max(best, sum); // @best
        }
    }
    return best; // @done
}`,
        cpp: `int maxSubarraySum(const vector<int>& arr) {
    int best = INT_MIN; // @init
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = i; j < n; j++) {
            int sum = 0; // @sum
            for (int k = i; k <= j; k++) sum += arr[k]; // @sum
            best = max(best, sum); // @best
        }
    }
    return best; // @done
}`,
      },
      complexity: { time: "O(n³)", space: "O(1)", timeWhy: "about n²/2 subarrays, and each one is re-added from scratch — up to n more steps. doubling the input makes it roughly 8× slower.", spaceWhy: "just a few number variables, no matter how long the array is.", ops: (n) => (n * (n + 1) * (n + 2)) / 6 },
      pros: ["obviously correct — it literally checks everything.", "a great way to test a faster solution against."],
      cons: ["re-adds the same numbers over and over.", "far too slow past a few hundred elements."],
      tracer: "kadane-brute",
    },
    {
      level: "improved",
      name: "running sum per start",
      idea: "fix a start i, then grow the end j one step at a time, adding just the new number to a running sum.",
      walkthrough: ["pick a start index i and reset sum to 0.", "move j right one step and add arr[j] — the previous sum is reused.", "after every addition, compare with best."],
      pseudocode: "best ← −∞\nfor i in 0..n−1\n  sum ← 0\n  for j in i..n−1\n    sum ← sum + arr[j]\n    best ← max(best, sum)\nreturn best",
      code: {
        js: `function maxSubarraySum(arr) {
  let best = -Infinity; // @init
  for (let i = 0; i < arr.length; i++) {
    let sum = 0; // @outer
    for (let j = i; j < arr.length; j++) {
      sum += arr[j]; // @add
      best = Math.max(best, sum); // @best
    }
  }
  return best; // @done
}`,
        py: `def max_subarray_sum(arr):
    best = float("-inf")  # @init
    for i in range(len(arr)):
        total = 0  # @outer
        for j in range(i, len(arr)):
            total += arr[j]  # @add
            best = max(best, total)  # @best
    return best  # @done`,
        java: `static int maxSubarraySum(int[] arr) {
    int best = Integer.MIN_VALUE; // @init
    for (int i = 0; i < arr.length; i++) {
        int sum = 0; // @outer
        for (int j = i; j < arr.length; j++) {
            sum += arr[j]; // @add
            best = Math.max(best, sum); // @best
        }
    }
    return best; // @done
}`,
        cpp: `int maxSubarraySum(const vector<int>& arr) {
    int best = INT_MIN; // @init
    for (size_t i = 0; i < arr.size(); i++) {
        int sum = 0; // @outer
        for (size_t j = i; j < arr.size(); j++) {
            sum += arr[j]; // @add
            best = max(best, sum); // @best
        }
    }
    return best; // @done
}`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "one addition per (start, end) pair — about n²/2 of them. doubling the input makes it about 4× slower.", spaceWhy: "still only a running sum and a best.", ops: (n) => (n * (n + 1)) / 2 },
      pros: ["simple two-loop code.", "a big jump from O(n³) with a one-line change."],
      cons: ["still restarts from every index, so still quadratic.", "struggles on arrays of 10⁵ elements."],
      tracer: "kadane-improved",
    },
    {
      level: "optimal",
      name: "kadane's algorithm",
      idea: "at each number, either extend the current run or start fresh here — whichever is bigger. the best run seen so far is the answer.",
      walkthrough: [
        "carry current = the best sum of a run that ends at the previous number.",
        "at a new number x, the best run ending here is either x alone, or current + x.",
        "if current had gone negative, it only drags x down — so start fresh at x.",
        "update best whenever current beats it.",
      ],
      pseudocode: "best ← arr[0]\ncurrent ← 0\nfor x in arr\n  current ← max(x, current + x)\n  best ← max(best, current)\nreturn best",
      code: {
        js: `function maxSubarraySum(arr) {
  let best = arr[0]; // @init
  let current = 0; // @init
  for (const x of arr) {
    current = Math.max(x, current + x); // @extend
    best = Math.max(best, current); // @best
  }
  return best; // @done
}`,
        py: `def max_subarray_sum(arr):
    best = arr[0]  # @init
    current = 0  # @init
    for x in arr:
        current = max(x, current + x)  # @extend
        best = max(best, current)  # @best
    return best  # @done`,
        java: `static int maxSubarraySum(int[] arr) {
    int best = arr[0]; // @init
    int current = 0; // @init
    for (int x : arr) {
        current = Math.max(x, current + x); // @extend
        best = Math.max(best, current); // @best
    }
    return best; // @done
}`,
        cpp: `int maxSubarraySum(const vector<int>& arr) {
    int best = arr[0]; // @init
    int current = 0; // @init
    for (int x : arr) {
        current = max(x, current + x); // @extend
        best = max(best, current); // @best
    }
    return best; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "we look at each number exactly once. doubling the input doubles the work — nothing more.", spaceWhy: "two variables, current and best, whatever the input size.", ops: (n) => n },
      pros: ["single pass, constant memory.", "works when every number is negative (it returns the largest one).", "the same 'extend or restart' idea powers max product subarray and stock problems."],
      cons: ["returns the sum, not the stretch — track a start index if you need the subarray itself (the animation does).", "the 'why is this correct' step takes a moment to trust."],
      tracer: "kadane-optimal",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 12 }],
    defaults: { arr: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
  },
  checkpoints: [
    { q: "current = −3 and the next number is 5. what does kadane do?", options: ["extend: current becomes 2", "start fresh: current becomes 5", "skip the 5"], answer: 1, right: "exactly — a negative run only drags 5 down, so we start over at 5.", wrong: "close! compare 5 on its own with −3 + 5 = 2. which is bigger?" },
    { q: "every number is negative: [−8, −3, −6]. what's the answer?", options: ["0", "−3", "−17"], answer: 1, right: "yes! the subarray must hold at least one number, so the least negative one wins.", wrong: "not quite — the subarray can't be empty, so 0 isn't allowed. which single number hurts least?" },
    { q: "why is kadane O(n) while the improved version is O(n²)?", options: ["it sorts first", "it never restarts the scan from an earlier index", "it uses a hash map"], answer: 1, right: "that's it — one pass, and the running value remembers everything it needs.", wrong: "good guess, but kadane uses no extra structures. what does it avoid doing that the double loop does?" },
  ],
};

export const moveNegatives: Problem = {
  slug: "move-negatives",
  topic: "arrays",
  sheet: [5],
  title: "move all negative elements to one side",
  sheetTitle: "Move all the negative elements to one side of the array",
  pattern: "two-pointers",
  also: ["partition"],
  difficulty: "easy",
  flagship: true,
  summary: "rearrange so every negative number comes before every non-negative one.",
  intro:
    "you have a mix of negative and positive numbers. rearrange the array in place so that all the negative numbers come first and all the others come after. unless stated otherwise, the order inside each group doesn't matter — just the split.",
  example: { input: "[-12, 11, -13, -5, 6, -7, 5, -3, -6]", output: "[-12, -13, -5, -7, -3, -6, 5, 6, 11]", why: "all six negatives sit on the left, the three non-negatives on the right." },
  clues: [
    "you're splitting items into two groups by a yes/no test (negative or not).",
    "the task says in place or with O(1) extra space.",
    "the order inside each group isn't required — that's the green light for swapping.",
    "the same shape appears in sort 0s/1s/2s and quicksort's partition step.",
  ],
  approaches: [
    {
      level: "brute",
      name: "bubble each negative left",
      idea: "whenever you meet a negative, swap it leftwards one step at a time until it reaches the other negatives.",
      walkthrough: ["keep a count of negatives already placed at the front.", "scan left to right.", "on a negative, swap it with its left neighbour until it sits right after the placed negatives.", "the original order of both groups is preserved."],
      pseudocode: "placed ← 0\nfor i in 0..n−1\n  if arr[i] < 0\n    for k from i down to placed+1\n      swap arr[k], arr[k−1]\n    placed ← placed + 1",
      code: {
        js: `function moveNegatives(arr) {
  let placed = 0; // @init
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) { // @check
      for (let k = i; k > placed; k--) { // @shift
        [arr[k], arr[k - 1]] = [arr[k - 1], arr[k]]; // @shift
      }
      placed++; // @place
    }
  }
  return arr; // @done
}`,
        py: `def move_negatives(arr):
    placed = 0  # @init
    for i in range(len(arr)):
        if arr[i] < 0:  # @check
            for k in range(i, placed, -1):  # @shift
                arr[k], arr[k - 1] = arr[k - 1], arr[k]  # @shift
            placed += 1  # @place
    return arr  # @done`,
        java: `static void moveNegatives(int[] arr) {
    int placed = 0; // @init
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] < 0) { // @check
            for (int k = i; k > placed; k--) { // @shift
                int t = arr[k]; arr[k] = arr[k - 1]; arr[k - 1] = t; // @shift
            }
            placed++; // @place
        }
    }
} // @done`,
        cpp: `void moveNegatives(vector<int>& arr) {
    int placed = 0; // @init
    for (int i = 0; i < (int)arr.size(); i++) {
        if (arr[i] < 0) { // @check
            for (int k = i; k > placed; k--) { // @shift
                swap(arr[k], arr[k - 1]); // @shift
            }
            placed++; // @place
        }
    }
} // @done`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "a negative near the end may travel past almost every element; with many negatives that's about n²/4 swaps.", spaceWhy: "swaps happen in place; only a counter is stored.", ops: (n) => (n * n) / 4 },
      pros: ["keeps the original order in both groups (stable).", "no extra memory."],
      cons: ["quadratic number of swaps.", "lots of data movement for large arrays."],
      tracer: "negatives-brute",
    },
    {
      level: "improved",
      name: "copy into a second array",
      idea: "build a new array: first copy every negative, then every non-negative, then copy it back.",
      walkthrough: ["make an empty output array.", "pass 1 copies the negatives in order.", "pass 2 copies the rest in order.", "write the output back over the input."],
      pseudocode: "out ← []\nfor x in arr: if x < 0: out.append(x)\nfor x in arr: if x ≥ 0: out.append(x)\narr ← out",
      code: {
        js: `function moveNegatives(arr) {
  const out = []; // @init
  for (const x of arr) if (x < 0) out.push(x); // @negs
  for (const x of arr) if (x >= 0) out.push(x); // @rest
  for (let i = 0; i < arr.length; i++) arr[i] = out[i]; // @copy
  return arr;
}`,
        py: `def move_negatives(arr):
    out = []  # @init
    out += [x for x in arr if x < 0]  # @negs
    out += [x for x in arr if x >= 0]  # @rest
    arr[:] = out  # @copy
    return arr`,
        java: `static void moveNegatives(int[] arr) {
    int[] out = new int[arr.length]; // @init
    int w = 0;
    for (int x : arr) if (x < 0) out[w++] = x; // @negs
    for (int x : arr) if (x >= 0) out[w++] = x; // @rest
    System.arraycopy(out, 0, arr, 0, arr.length); // @copy
}`,
        cpp: `void moveNegatives(vector<int>& arr) {
    vector<int> out; // @init
    for (int x : arr) if (x < 0) out.push_back(x); // @negs
    for (int x : arr) if (x >= 0) out.push_back(x); // @rest
    arr = out; // @copy
}`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "three straight passes over the array — about 3n steps.", spaceWhy: "the output array is as long as the input.", ops: (n) => 3 * n },
      pros: ["linear time and stable.", "very easy to get right."],
      cons: ["needs a second array of size n — breaks the in-place requirement."],
      tracer: "negatives-improved",
    },
    {
      level: "optimal",
      name: "two-pointer partition",
      idea: "pointer j marks where the next negative belongs. scan with i; every negative you meet gets swapped to j, and j moves up.",
      walkthrough: ["everything before j is negative (the 'done' zone).", "everything between j and i is non-negative.", "when arr[i] is negative, swap it into slot j and grow the zone.", "one pass and the split is complete."],
      pseudocode: "j ← 0\nfor i in 0..n−1\n  if arr[i] < 0\n    swap arr[i], arr[j]\n    j ← j + 1",
      code: {
        js: `function moveNegatives(arr) {
  let j = 0; // @init
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) { // @check
      [arr[i], arr[j]] = [arr[j], arr[i]]; // @swap
      j++; // @swap
    }
  }
  return arr; // @done
}`,
        py: `def move_negatives(arr):
    j = 0  # @init
    for i in range(len(arr)):
        if arr[i] < 0:  # @check
            arr[i], arr[j] = arr[j], arr[i]  # @swap
            j += 1  # @swap
    return arr  # @done`,
        java: `static void moveNegatives(int[] arr) {
    int j = 0; // @init
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] < 0) { // @check
            int t = arr[i]; arr[i] = arr[j]; arr[j] = t; // @swap
            j++; // @swap
        }
    }
} // @done`,
        cpp: `void moveNegatives(vector<int>& arr) {
    int j = 0; // @init
    for (int i = 0; i < (int)arr.size(); i++) {
        if (arr[i] < 0) { // @check
            swap(arr[i], arr[j]); // @swap
            j++; // @swap
        }
    }
} // @done`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "i visits each element once and every swap is O(1).", spaceWhy: "two index variables; the array is rearranged in place.", ops: (n) => n },
      pros: ["one pass, no extra memory.", "the exact partition step used inside quicksort."],
      cons: ["not stable: the non-negatives can get shuffled (5, 6, 11 instead of 11, 6, 5)."],
      tracer: "negatives-optimal",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 12 }],
    defaults: { arr: [-12, 11, -13, -5, 6, -7, 5, -3, -6] },
  },
  checkpoints: [
    { q: "in the two-pointer version, what is true about every index before j?", options: ["it holds a negative number", "it hasn't been checked yet", "it holds the largest values"], answer: 0, right: "right — [0, j) is the finished negative zone.", wrong: "not quite. j only moves after we swap a negative into place. so what must be before it?" },
    { q: "an interviewer says 'keep the original order of the positives'. which approach fits with O(1) space?", options: ["two-pointer partition", "bubble each negative left", "hash map"], answer: 1, right: "nice — bubbling left is stable, at the cost of O(n²) time.", wrong: "the partition swaps things out of order. which approach only ever moves a negative past its neighbour?" },
  ],
};

export const pairSum: Problem = {
  slug: "pair-sum",
  topic: "arrays",
  sheet: [18],
  title: "count pairs with a given sum",
  sheetTitle: "find all pairs on integer array whose sum is equal to given number",
  pattern: "hashing",
  also: ["two sum", "two pointers"],
  difficulty: "easy",
  flagship: true,
  summary: "count the pairs of positions whose values add up to k.",
  intro:
    "given an array and a number k, count how many pairs of different positions (i < j) hold values that add up to k. if a value repeats, each copy counts as a separate partner.",
  example: { input: "arr = [1, 5, 7, -1, 5], k = 6", output: "3", why: "the pairs are (1, 5), (7, −1) and (1, 5) again — the second 5 is a different position." },
  clues: [
    "two numbers must combine to hit a target.",
    "for each number you can say exactly which partner it needs: k − x.",
    "“have I seen this value before?” is a hash-map question.",
    "if the array were sorted, two pointers from both ends would also work.",
  ],
  approaches: [
    {
      level: "brute",
      name: "check every pair",
      idea: "two loops: for every i, try every j after it and count the pairs that add up to k.",
      walkthrough: ["fix i.", "try each j from i + 1 to the end.", "if arr[i] + arr[j] = k, count it."],
      pseudocode: "count ← 0\nfor i in 0..n−1\n  for j in i+1..n−1\n    if arr[i] + arr[j] = k: count ← count + 1\nreturn count",
      code: {
        js: `function countPairs(arr, k) {
  let count = 0; // @init
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) { // @check
      if (arr[i] + arr[j] === k) count++; // @hit
    }
  }
  return count; // @done
}`,
        py: `def count_pairs(arr, k):
    count = 0  # @init
    n = len(arr)
    for i in range(n):
        for j in range(i + 1, n):  # @check
            if arr[i] + arr[j] == k:  # @hit
                count += 1  # @hit
    return count  # @done`,
        java: `static int countPairs(int[] arr, int k) {
    int count = 0; // @init
    for (int i = 0; i < arr.length; i++) {
        for (int j = i + 1; j < arr.length; j++) { // @check
            if (arr[i] + arr[j] == k) count++; // @hit
        }
    }
    return count; // @done
}`,
        cpp: `int countPairs(const vector<int>& arr, int k) {
    int count = 0; // @init
    for (size_t i = 0; i < arr.size(); i++) {
        for (size_t j = i + 1; j < arr.size(); j++) { // @check
            if (arr[i] + arr[j] == k) count++; // @hit
        }
    }
    return count; // @done
}`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "n(n−1)/2 pairs are checked. 1,000 numbers means about half a million checks.", spaceWhy: "just a counter.", ops: (n) => (n * (n - 1)) / 2 },
      pros: ["can't miss a pair.", "no extra memory, input untouched."],
      cons: ["quadratic — slow for big inputs."],
      tracer: "pairs-brute",
    },
    {
      level: "improved",
      name: "sort + two pointers",
      idea: "sort, then squeeze from both ends: a sum that's too small moves the left pointer up, too big moves the right one down.",
      walkthrough: ["sort the array.", "lo starts left, hi starts right.", "sum too small → lo++. too big → hi−−.", "on a match, count every duplicate combination at once, then move past them."],
      pseudocode: "sort arr\nlo ← 0; hi ← n−1\nwhile lo < hi\n  s ← arr[lo] + arr[hi]\n  if s < k: lo++\n  elif s > k: hi−−\n  elif arr[lo] = arr[hi]: count += C(hi−lo+1, 2); stop\n  else: count += (copies of arr[lo]) × (copies of arr[hi]); skip them",
      code: {
        js: `function countPairs(arr, k) {
  arr.sort((a, b) => a - b); // @sort
  let lo = 0, hi = arr.length - 1, count = 0;
  while (lo < hi) {
    const s = arr[lo] + arr[hi];
    if (s < k) lo++; // @less
    else if (s > k) hi--; // @more
    else if (arr[lo] === arr[hi]) { // @hit
      const m = hi - lo + 1; // @hit
      count += (m * (m - 1)) / 2; // @hit
      break;
    } else {
      let cl = 1, ch = 1; // @hit
      while (arr[lo + cl] === arr[lo]) cl++; // @hit
      while (arr[hi - ch] === arr[hi]) ch++; // @hit
      count += cl * ch; // @hit
      lo += cl; hi -= ch;
    }
  }
  return count; // @done
}`,
        py: `def count_pairs(arr, k):
    arr.sort()  # @sort
    lo, hi, count = 0, len(arr) - 1, 0
    while lo < hi:
        s = arr[lo] + arr[hi]
        if s < k:
            lo += 1  # @less
        elif s > k:
            hi -= 1  # @more
        elif arr[lo] == arr[hi]:
            m = hi - lo + 1  # @hit
            count += m * (m - 1) // 2  # @hit
            break
        else:
            cl = ch = 1  # @hit
            while arr[lo + cl] == arr[lo]: cl += 1  # @hit
            while arr[hi - ch] == arr[hi]: ch += 1  # @hit
            count += cl * ch  # @hit
            lo += cl; hi -= ch
    return count  # @done`,
        java: `static int countPairs(int[] arr, int k) {
    Arrays.sort(arr); // @sort
    int lo = 0, hi = arr.length - 1, count = 0;
    while (lo < hi) {
        int s = arr[lo] + arr[hi];
        if (s < k) lo++; // @less
        else if (s > k) hi--; // @more
        else if (arr[lo] == arr[hi]) { // @hit
            int m = hi - lo + 1; // @hit
            count += m * (m - 1) / 2; // @hit
            break;
        } else {
            int cl = 1, ch = 1; // @hit
            while (arr[lo + cl] == arr[lo]) cl++; // @hit
            while (arr[hi - ch] == arr[hi]) ch++; // @hit
            count += cl * ch; // @hit
            lo += cl; hi -= ch;
        }
    }
    return count; // @done
}`,
        cpp: `int countPairs(vector<int> arr, int k) {
    sort(arr.begin(), arr.end()); // @sort
    int lo = 0, hi = arr.size() - 1, count = 0;
    while (lo < hi) {
        int s = arr[lo] + arr[hi];
        if (s < k) lo++; // @less
        else if (s > k) hi--; // @more
        else if (arr[lo] == arr[hi]) { // @hit
            int m = hi - lo + 1; // @hit
            count += m * (m - 1) / 2; // @hit
            break;
        } else {
            int cl = 1, ch = 1; // @hit
            while (arr[lo + cl] == arr[lo]) cl++; // @hit
            while (arr[hi - ch] == arr[hi]) ch++; // @hit
            count += cl * ch; // @hit
            lo += cl; hi -= ch;
        }
    }
    return count; // @done
}`,
      },
      complexity: { time: "O(n log n)", space: "O(1)", timeWhy: "sorting dominates; the two-pointer sweep afterwards is a single O(n) pass.", spaceWhy: "sorting in place needs no extra array (ignoring the sort's own stack).", ops: (n) => n * log2(n) + n },
      pros: ["much faster than checking every pair.", "no hash map needed."],
      cons: ["sorting changes the input order.", "duplicate counting is easy to get wrong."],
      tracer: "pairs-improved",
    },
    {
      level: "optimal",
      name: "hash map of counts",
      idea: "walk once. for each x, the map already knows how many earlier numbers equal k − x — each is a pair ending here. then record x.",
      walkthrough: ["keep a map: value → how many times seen so far.", "at x, look up k − x and add its count to the answer.", "then add x to the map.", "every pair is counted exactly once, when its second element is reached."],
      pseudocode: "seen ← empty map\ncount ← 0\nfor x in arr\n  count ← count + seen[k − x]\n  seen[x] ← seen[x] + 1\nreturn count",
      code: {
        js: `function countPairs(arr, k) {
  const seen = new Map(); // @init
  let count = 0; // @init
  for (const x of arr) {
    const need = k - x; // @need
    if (seen.has(need)) count += seen.get(need); // @hit
    seen.set(x, (seen.get(x) || 0) + 1); // @store
  }
  return count; // @done
}`,
        py: `def count_pairs(arr, k):
    seen = {}  # @init
    count = 0  # @init
    for x in arr:
        need = k - x  # @need
        count += seen.get(need, 0)  # @hit
        seen[x] = seen.get(x, 0) + 1  # @store
    return count  # @done`,
        java: `static int countPairs(int[] arr, int k) {
    Map<Integer, Integer> seen = new HashMap<>(); // @init
    int count = 0; // @init
    for (int x : arr) {
        int need = k - x; // @need
        count += seen.getOrDefault(need, 0); // @hit
        seen.merge(x, 1, Integer::sum); // @store
    }
    return count; // @done
}`,
        cpp: `int countPairs(const vector<int>& arr, int k) {
    unordered_map<int, int> seen; // @init
    int count = 0; // @init
    for (int x : arr) {
        int need = k - x; // @need
        if (seen.count(need)) count += seen[need]; // @hit
        seen[x]++; // @store
    }
    return count; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "one pass; each map lookup and update takes constant time on average.", spaceWhy: "in the worst case every value is different, so the map holds n entries.", ops: (n) => 2 * n },
      pros: ["single pass, handles duplicates naturally.", "keeps the original order — no sorting."],
      cons: ["uses O(n) extra memory.", "hash lookups are 'average' O(1), not guaranteed."],
      tracer: "pairs-optimal",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 2, maxLen: 10 }],
    scalars: [{ key: "target", label: "k (target sum)", min: -198, max: 198 }],
    defaults: { arr: [1, 5, 7, -1, 5], target: 6 },
  },
  checkpoints: [
    { q: "k = 10 and we're at x = 3. what do we look up in the map?", options: ["3", "7", "13"], answer: 1, right: "yes — 3 needs a partner of 10 − 3 = 7.", wrong: "almost! we need the partner that completes the sum: k − x." },
    { q: "why do we add x to the map after the lookup, not before?", options: ["it's faster", "so x never pairs with itself", "the map would overflow"], answer: 1, right: "exactly — otherwise x = 5, k = 10 would count itself as a pair.", wrong: "think about k = 10, x = 5. what would happen if 5 was stored before we looked up 10 − 5?" },
    { q: "[2, 2, 2] with k = 4. how many pairs?", options: ["1", "2", "3"], answer: 2, right: "right — positions (0,1), (0,2) and (1,2). the map adds 0 + 1 + 2 = 3.", wrong: "count pairs of positions, not values: (0,1), (0,2), (1,2)…" },
  ],
};
