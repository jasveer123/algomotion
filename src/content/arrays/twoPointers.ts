import type { Problem } from "@/lib/types";

const lg = (n: number) => Math.max(1, Math.log2(Math.max(2, n)));

export const reverseArray: Problem = {
  slug: "reverse-array",
  topic: "arrays",
  sheet: [1],
  title: "reverse the array",
  sheetTitle: "Reverse the array",
  pattern: "two-pointers",
  difficulty: "easy",
  summary: "flip the array so the last element comes first.",
  intro: "turn the array back to front: the first element becomes the last, the second becomes second-to-last, and so on. ideally do it in place, without building a second array.",
  example: { input: "[1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]", why: "each element i trades places with element n − 1 − i." },
  clues: ["positions pair up symmetrically: first with last, second with second-last.", "the work shrinks from both ends toward the middle.", "in place / O(1) space is asked for."],
  approaches: [
    {
      level: "brute", name: "build a reversed copy", idea: "read the array from the back and write each value into a new array.",
      walkthrough: ["create an empty array.", "walk from the last index to the first, appending.", "copy back if the original must change."],
      pseudocode: "out ← []\nfor i from n−1 down to 0: out.append(arr[i])\nreturn out",
      code: {
        js: `function reverseArray(arr) {
  const out = [];
  for (let i = arr.length - 1; i >= 0; i--) out.push(arr[i]);
  return out;
}`,
        py: `def reverse_array(arr):
    return [arr[i] for i in range(len(arr) - 1, -1, -1)]`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "every element is read and written once.", spaceWhy: "the copy is as long as the input.", ops: (n) => 2 * n },
      pros: ["impossible to get wrong.", "original stays untouched if you need it."], cons: ["doubles the memory."],
    },
    {
      level: "optimal", name: "two pointers swapping inward", idea: "swap the two ends, then step both pointers inward until they meet.",
      walkthrough: ["l = 0, r = n − 1.", "swap arr[l] and arr[r].", "l++, r−−; stop when l ≥ r."],
      pseudocode: "l ← 0; r ← n−1\nwhile l < r\n  swap arr[l], arr[r]\n  l ← l+1; r ← r−1",
      code: {
        js: `function reverseArray(arr) {
  let l = 0, r = arr.length - 1; // @init
  while (l < r) {
    [arr[l], arr[r]] = [arr[r], arr[l]]; // @swap
    l++; r--; // @move
  }
  return arr; // @done
}`,
        py: `def reverse_array(arr):
    l, r = 0, len(arr) - 1  # @init
    while l < r:
        arr[l], arr[r] = arr[r], arr[l]  # @swap
        l += 1; r -= 1  # @move
    return arr  # @done`,
        java: `static void reverseArray(int[] arr) {
    int l = 0, r = arr.length - 1; // @init
    while (l < r) {
        int t = arr[l]; arr[l] = arr[r]; arr[r] = t; // @swap
        l++; r--; // @move
    }
} // @done`,
        cpp: `void reverseArray(vector<int>& arr) {
    int l = 0, r = (int)arr.size() - 1; // @init
    while (l < r) {
        swap(arr[l], arr[r]); // @swap
        l++; r--; // @move
    }
} // @done`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "n/2 swaps — each pair is touched once.", spaceWhy: "two indexes, nothing else.", ops: (n) => Math.floor(n / 2) },
      pros: ["in place, half the swaps of a copy.", "the building block for rotation and next permutation."], cons: ["destroys the original order (copy first if you need it)."],
      tracer: "reverse",
    },
  ],
  input: { arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 12 }], defaults: { arr: [1, 2, 3, 4, 5, 6, 7] } },
  checkpoints: [
    { q: "for an array of 7 elements, how many swaps does the two-pointer version make?", options: ["7", "3", "6"], answer: 1, right: "yes — ⌊7/2⌋ = 3. the middle element stays put.", wrong: "each swap fixes two positions, and the middle one never moves. try ⌊n/2⌋." },
    { q: "when should the loop stop?", options: ["when l ≥ r", "when l = n", "after n swaps"], answer: 0, right: "right — once the pointers meet or cross, everything is already swapped.", wrong: "if you keep going past the middle, you'd swap everything back!" },
  ],
};

export const sort012: Problem = {
  slug: "sort-012",
  topic: "arrays",
  sheet: [4],
  title: "sort an array of 0s, 1s and 2s",
  sheetTitle: "Given an array which consists of only 0, 1 and 2. Sort the array without using any sorting algo",
  pattern: "two-pointers",
  also: ["dutch national flag"],
  difficulty: "easy",
  summary: "sort three kinds of values in a single pass, no sorting library.",
  intro: "the array only contains 0, 1 and 2. arrange it so all 0s come first, then 1s, then 2s — without calling a sort function, ideally in one pass.",
  example: { input: "[0, 2, 1, 2, 0]", output: "[0, 0, 1, 2, 2]", why: "the values are grouped: two 0s, one 1, two 2s." },
  clues: ["only a handful of distinct values (here, three).", "“without using a sorting algorithm” — the answer is partitioning.", "you can decide where an element goes just by looking at it."],
  approaches: [
    {
      level: "brute", name: "counting", idea: "count the 0s, 1s and 2s, then overwrite the array with that many of each.",
      walkthrough: ["pass 1: count each value.", "pass 2: write c0 zeros, c1 ones, c2 twos."],
      pseudocode: "count c0, c1, c2\nwrite c0 × 0, c1 × 1, c2 × 2",
      code: {
        js: `function sort012(arr) {
  const c = [0, 0, 0];
  for (const x of arr) c[x]++;
  let w = 0;
  for (let v = 0; v < 3; v++) while (c[v]--) arr[w++] = v;
  return arr;
}`,
        py: `def sort012(arr):
    c = [arr.count(0), arr.count(1), arr.count(2)]
    arr[:] = [0] * c[0] + [1] * c[1] + [2] * c[2]
    return arr`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "two passes over the array.", spaceWhy: "three counters.", ops: (n) => 2 * n },
      pros: ["simple and linear."], cons: ["two passes.", "only works because the values are known in advance — it rewrites values instead of moving elements."],
    },
    {
      level: "optimal", name: "dutch national flag (three pointers)", idea: "keep three zones — 0s before low, 1s between low and mid, 2s after high — and let mid classify the unknown middle.",
      walkthrough: ["low = mid = 0, high = n − 1.", "arr[mid] = 0 → swap to low; low++, mid++.", "arr[mid] = 1 → mid++.", "arr[mid] = 2 → swap to high; high−− (don't move mid: the swapped-in value is unchecked)."],
      pseudocode: "low ← 0; mid ← 0; high ← n−1\nwhile mid ≤ high\n  if arr[mid] = 0: swap(low, mid); low++; mid++\n  elif arr[mid] = 1: mid++\n  else: swap(mid, high); high−−",
      code: {
        js: `function sort012(arr) {
  let low = 0, mid = 0, high = arr.length - 1; // @init
  while (mid <= high) {
    if (arr[mid] === 0) { // @zero
      [arr[low], arr[mid]] = [arr[mid], arr[low]]; // @zero
      low++; mid++; // @zero
    } else if (arr[mid] === 1) { // @one
      mid++; // @one
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]]; // @two
      high--; // @two
    }
  }
  return arr; // @done
}`,
        py: `def sort012(arr):
    low, mid, high = 0, 0, len(arr) - 1  # @init
    while mid <= high:
        if arr[mid] == 0:  # @zero
            arr[low], arr[mid] = arr[mid], arr[low]  # @zero
            low += 1; mid += 1  # @zero
        elif arr[mid] == 1:  # @one
            mid += 1  # @one
        else:
            arr[mid], arr[high] = arr[high], arr[mid]  # @two
            high -= 1  # @two
    return arr  # @done`,
        java: `static void sort012(int[] arr) {
    int low = 0, mid = 0, high = arr.length - 1; // @init
    while (mid <= high) {
        if (arr[mid] == 0) { // @zero
            int t = arr[low]; arr[low] = arr[mid]; arr[mid] = t; // @zero
            low++; mid++; // @zero
        } else if (arr[mid] == 1) { // @one
            mid++; // @one
        } else {
            int t = arr[mid]; arr[mid] = arr[high]; arr[high] = t; // @two
            high--; // @two
        }
    }
} // @done`,
        cpp: `void sort012(vector<int>& arr) {
    int low = 0, mid = 0, high = (int)arr.size() - 1; // @init
    while (mid <= high) {
        if (arr[mid] == 0) { // @zero
            swap(arr[low], arr[mid]); // @zero
            low++; mid++; // @zero
        } else if (arr[mid] == 1) { // @one
            mid++; // @one
        } else {
            swap(arr[mid], arr[high]); // @two
            high--; // @two
        }
    }
} // @done`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "each step either moves mid forward or high backward, so at most n steps.", spaceWhy: "three indexes.", ops: (n) => n },
      pros: ["one pass, in place.", "moves real elements, so it also works for objects keyed 0/1/2."], cons: ["not stable.", "the 'don't advance mid after a 2-swap' rule is a classic bug."],
      tracer: "dnf012",
    },
  ],
  input: { arrays: [{ key: "arr", label: "values (0, 1 or 2)", allowed: [0, 1, 2], minLen: 1, maxLen: 12 }], defaults: { arr: [0, 2, 1, 2, 0, 1, 1, 0, 2] } },
  checkpoints: [
    { q: "arr[mid] is 2 and we swap it with arr[high]. why don't we move mid?", options: ["the new arr[mid] hasn't been checked yet", "mid must always equal low", "it would go out of bounds"], answer: 0, right: "exactly — whatever came from high is still unknown.", wrong: "think about what just landed at mid. do we know if it's a 0, 1 or 2?" },
    { q: "which zone is still unsorted at any moment?", options: ["[0, low)", "[mid, high]", "(high, n)"], answer: 1, right: "yes — the loop runs until that middle zone is empty.", wrong: "low's zone holds 0s and high's zone holds 2s. what's left?" },
  ],
};

export const threeWayPartition: Problem = {
  slug: "three-way-partition",
  topic: "arrays",
  sheet: [32],
  title: "three-way partitioning around a range",
  sheetTitle: "Three way partitioning of an array around a given value",
  pattern: "two-pointers",
  also: ["dutch national flag"],
  difficulty: "easy",
  summary: "split into < a, within [a, b], and > b — in one pass.",
  intro: "given a range [a, b], rearrange the array so that everything smaller than a comes first, then everything between a and b (inclusive), then everything bigger than b. order within each group doesn't matter.",
  example: { input: "arr = [1, 14, 5, 20, 4, 2, 54, 20, 87, 98, 3, 1, 32], a = 14, b = 20", output: "[1, 5, 4, 2, 1, 3, 14, 20, 20, 98, 87, 32, 54]", why: "six values below 14, then 14, 20, 20, then the four above 20." },
  clues: ["three buckets decided by comparing each element to fixed values.", "it's the 0/1/2 problem with a different test.", "one pass, O(1) space expected."],
  approaches: [
    {
      level: "brute", name: "sort the whole array", idea: "sorting puts everything in order, which certainly satisfies the three groups.",
      walkthrough: ["sort ascending — done."], pseudocode: "sort arr",
      code: { js: `function threeWay(arr, a, b) {\n  return arr.sort((x, y) => x - y);\n}`, py: `def three_way(arr, a, b):\n    arr.sort()\n    return arr` },
      complexity: { time: "O(n log n)", space: "O(1)", timeWhy: "a comparison sort.", spaceWhy: "in-place sort.", ops: (n) => n * lg(n) },
      pros: ["one line."], cons: ["does more work than asked — full order isn't needed."],
    },
    {
      level: "optimal", name: "dutch national flag with a range", idea: "same three pointers as sorting 0s/1s/2s: < a goes to low, > b goes to high, the rest stays.",
      walkthrough: ["low = mid = 0, high = n − 1.", "arr[mid] < a → swap with low, advance both.", "a ≤ arr[mid] ≤ b → mid++.", "arr[mid] > b → swap with high, high−−."],
      pseudocode: "low ← 0; mid ← 0; high ← n−1\nwhile mid ≤ high\n  if arr[mid] < a: swap(low, mid); low++; mid++\n  elif arr[mid] ≤ b: mid++\n  else: swap(mid, high); high−−",
      code: {
        js: `function threeWay(arr, a, b) {
  let low = 0, mid = 0, high = arr.length - 1; // @init
  while (mid <= high) {
    if (arr[mid] < a) { // @zero
      [arr[low], arr[mid]] = [arr[mid], arr[low]]; // @zero
      low++; mid++; // @zero
    } else if (arr[mid] <= b) { // @one
      mid++; // @one
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]]; // @two
      high--; // @two
    }
  }
  return arr; // @done
}`,
        py: `def three_way(arr, a, b):
    low, mid, high = 0, 0, len(arr) - 1  # @init
    while mid <= high:
        if arr[mid] < a:  # @zero
            arr[low], arr[mid] = arr[mid], arr[low]  # @zero
            low += 1; mid += 1  # @zero
        elif arr[mid] <= b:  # @one
            mid += 1  # @one
        else:
            arr[mid], arr[high] = arr[high], arr[mid]  # @two
            high -= 1  # @two
    return arr  # @done`,
        java: `static void threeWay(int[] arr, int a, int b) {
    int low = 0, mid = 0, high = arr.length - 1; // @init
    while (mid <= high) {
        if (arr[mid] < a) { // @zero
            int t = arr[low]; arr[low] = arr[mid]; arr[mid] = t; // @zero
            low++; mid++; // @zero
        } else if (arr[mid] <= b) { // @one
            mid++; // @one
        } else {
            int t = arr[mid]; arr[mid] = arr[high]; arr[high] = t; // @two
            high--; // @two
        }
    }
} // @done`,
        cpp: `void threeWay(vector<int>& arr, int a, int b) {
    int low = 0, mid = 0, high = (int)arr.size() - 1; // @init
    while (mid <= high) {
        if (arr[mid] < a) { // @zero
            swap(arr[low], arr[mid]); // @zero
            low++; mid++; // @zero
        } else if (arr[mid] <= b) { // @one
            mid++; // @one
        } else {
            swap(arr[mid], arr[high]); // @two
            high--; // @two
        }
    }
} // @done`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "every step shrinks the unknown zone by one.", spaceWhy: "three indexes.", ops: (n) => n },
      pros: ["one pass, in place.", "the partition used by 3-way quicksort for arrays with many duplicates."], cons: ["not stable."],
      tracer: "threeWay",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 13 }],
    scalars: [{ key: "target", label: "a (range start)", min: -99, max: 99 }, { key: "k", label: "b (range end)", min: -99, max: 99 }],
    defaults: { arr: [1, 14, 5, 20, 4, 2, 54, 20, 87, 98, 3, 1, 32], target: 14, k: 20 },
    check: (i) => ((i.target ?? 0) > (i.k ?? 0) ? "a must be ≤ b." : null),
  },
  checkpoints: [
    { q: "a = 10, b = 20 and arr[mid] = 20. what happens?", options: ["swap it to low", "mid++", "swap it to high"], answer: 1, right: "right — 20 is inside [10, 20] (inclusive), so it stays in the middle zone.", wrong: "check the range — is 20 between a and b, inclusive?" },
    { q: "how is this problem related to sort 0s/1s/2s?", options: ["it isn't", "same algorithm, the test just compares to a and b", "it needs a hash map instead"], answer: 1, right: "exactly — 'value is 0' becomes 'value < a', and so on.", wrong: "look at the three zones. do they remind you of 0s, 1s and 2s?" },
  ],
};

export const alternatingPosNeg: Problem = {
  slug: "alternate-positive-negative",
  topic: "arrays",
  sheet: [20],
  title: "rearrange in alternating positive & negative (O(1) space)",
  sheetTitle: "Rearrange the array in alternating positive and negative items with O(1) extra space",
  pattern: "two-pointers",
  also: ["rotation", "stable rearrangement"],
  difficulty: "medium",
  summary: "alternate negative/positive while keeping the original order, without extra memory.",
  intro: "rearrange the array so negative and non-negative numbers alternate — negative at even indexes, non-negative at odd ones — while keeping each group's original order. if one group runs out, the leftovers stay at the end. no extra array allowed.",
  example: { input: "[1, 2, 3, -4, -1, 4]", output: "[-4, 1, -1, 2, 3, 4]", why: "negatives −4, −1 and positives 1, 2, 3, 4 keep their order; the extra positives trail at the end." },
  clues: ["“maintain the order” rules out plain swapping.", "O(1) space rules out copying into two lists.", "moving one element to an earlier spot while shifting the rest by one = a right rotation."],
  approaches: [
    {
      level: "brute", name: "two lists, then merge", idea: "copy negatives and non-negatives into two lists, then write them back alternately.",
      walkthrough: ["split into neg and pos lists (order kept).", "write neg[0], pos[0], neg[1], pos[1]…", "append whatever is left."],
      pseudocode: "neg ← negatives in order; pos ← others in order\ninterleave neg and pos back into arr",
      code: {
        js: `function rearrange(arr) {
  const neg = arr.filter((x) => x < 0), pos = arr.filter((x) => x >= 0);
  let i = 0, a = 0, b = 0;
  while (a < neg.length && b < pos.length) { arr[i++] = neg[a++]; arr[i++] = pos[b++]; }
  while (a < neg.length) arr[i++] = neg[a++];
  while (b < pos.length) arr[i++] = pos[b++];
  return arr;
}`,
        py: `def rearrange(arr):
    neg = [x for x in arr if x < 0]
    pos = [x for x in arr if x >= 0]
    out = []
    for i in range(max(len(neg), len(pos))):
        if i < len(neg): out.append(neg[i])
        if i < len(pos): out.append(pos[i])
    arr[:] = out
    return arr`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "a few linear passes.", spaceWhy: "the two lists hold every element.", ops: (n) => 3 * n },
      pros: ["linear time, easy."], cons: ["breaks the O(1) extra space rule.", "note: the tail handling differs slightly from the in-place version when counts are unequal."],
    },
    {
      level: "optimal", name: "find the misplaced slot, rotate right", idea: "remember the first out-of-place index. when you meet an element of the opposite sign, rotate the block between them right by one — the right element lands in place and order is kept.",
      walkthrough: ["even index wants a negative, odd index a non-negative.", "`wrong` = first index holding the wrong sign.", "scan i forward; when arr[i]'s sign is opposite to arr[wrong], rotate [wrong..i] right.", "the next misplaced index is wrong + 2 (if the block was long enough) — otherwise nothing is misplaced."],
      pseudocode: "wrong ← −1\nfor i in 0..n−1\n  if wrong ≥ 0 and sign(arr[i]) ≠ sign(arr[wrong])\n    rotate arr[wrong..i] right by 1\n    wrong ← (i − wrong ≥ 2) ? wrong + 2 : −1\n  if wrong = −1 and arr[i] is on the wrong parity: wrong ← i",
      code: {
        js: `function rearrange(arr) {
  let wrong = -1; // @init
  for (let i = 0; i < arr.length; i++) {
    if (wrong >= 0 && (arr[i] < 0) !== (arr[wrong] < 0)) { // @found
      const last = arr[i]; // @rotate
      for (let k = i; k > wrong; k--) arr[k] = arr[k - 1]; // @rotate
      arr[wrong] = last; // @rotate
      wrong = i - wrong >= 2 ? wrong + 2 : -1; // @rotate
    }
    if (wrong === -1 && (arr[i] >= 0) === (i % 2 === 0)) wrong = i; // @mark
  }
  return arr; // @done
}`,
        py: `def rearrange(arr):
    wrong = -1  # @init
    for i in range(len(arr)):
        if wrong >= 0 and (arr[i] < 0) != (arr[wrong] < 0):  # @found
            last = arr[i]  # @rotate
            arr[wrong + 1:i + 1] = arr[wrong:i]  # @rotate
            arr[wrong] = last  # @rotate
            wrong = wrong + 2 if i - wrong >= 2 else -1  # @rotate
        if wrong == -1 and (arr[i] >= 0) == (i % 2 == 0):  # @mark
            wrong = i  # @mark
    return arr  # @done`,
        java: `static void rearrange(int[] arr) {
    int wrong = -1; // @init
    for (int i = 0; i < arr.length; i++) {
        if (wrong >= 0 && (arr[i] < 0) != (arr[wrong] < 0)) { // @found
            int last = arr[i]; // @rotate
            for (int k = i; k > wrong; k--) arr[k] = arr[k - 1]; // @rotate
            arr[wrong] = last; // @rotate
            wrong = i - wrong >= 2 ? wrong + 2 : -1; // @rotate
        }
        if (wrong == -1 && (arr[i] >= 0) == (i % 2 == 0)) wrong = i; // @mark
    }
} // @done`,
        cpp: `void rearrange(vector<int>& arr) {
    int wrong = -1; // @init
    for (int i = 0; i < (int)arr.size(); i++) {
        if (wrong >= 0 && (arr[i] < 0) != (arr[wrong] < 0)) { // @found
            int last = arr[i]; // @rotate
            for (int k = i; k > wrong; k--) arr[k] = arr[k - 1]; // @rotate
            arr[wrong] = last; // @rotate
            wrong = i - wrong >= 2 ? wrong + 2 : -1; // @rotate
        }
        if (wrong == -1 && (arr[i] >= 0) == (i % 2 == 0)) wrong = i; // @mark
    }
} // @done`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "each rotation can shift up to n elements, and there can be up to n rotations.", spaceWhy: "one saved value and one index — truly constant.", ops: (n) => (n * n) / 4 },
      pros: ["keeps both groups in their original order.", "O(1) extra space, as the problem demands."], cons: ["quadratic in the worst case — the price of stability without memory."],
      tracer: "alternating",
    },
  ],
  input: { arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 12 }], defaults: { arr: [-5, -2, 5, 2, 4, 7, 1, 8, 0, -8] } },
  checkpoints: [
    { q: "why rotate instead of swapping the two elements directly?", options: ["rotation is faster", "a swap would break the original order", "swaps aren't allowed in place"], answer: 1, right: "exactly — rotation slides everything in between along, so relative order survives.", wrong: "try it: swapping jumps one element over several others. what happens to their order?" },
    { q: "is 0 treated as positive or negative here?", options: ["negative", "non-negative (goes with the positives)", "it's skipped"], answer: 1, right: "yes — the test is x < 0, so 0 joins the non-negatives.", wrong: "look at the test in the code: arr[i] < 0." },
  ],
};

export const mergeWithoutExtraSpace: Problem = {
  slug: "merge-without-extra-space",
  topic: "arrays",
  sheet: [12],
  title: "merge two sorted arrays without extra space",
  sheetTitle: "Merge 2 sorted arrays without using Extra space.",
  pattern: "two-pointers",
  also: ["gap method (shell sort)"],
  difficulty: "hard",
  summary: "merge so the smallest n values end up in a and the rest in b — no third array.",
  intro: "you have two sorted arrays a (size n) and b (size m). rearrange their elements so that a holds the n smallest values in sorted order and b holds the remaining m values in sorted order — without using a third array.",
  example: { input: "a = [1, 4, 7, 8, 10], b = [2, 3, 9]", output: "a = [1, 2, 3, 4, 7], b = [8, 9, 10]", why: "reading a then b gives the fully sorted sequence 1, 2, 3, 4, 7, 8, 9, 10." },
  clues: ["two already-sorted inputs → some kind of merge.", "no extra space forbids the usual merge buffer.", "treat a and b as one long virtual array."],
  approaches: [
    {
      level: "brute", name: "insert each smaller b value into a", idea: "walk a; whenever a[i] > b[0], swap them, then slide the new b[0] into its sorted place in b.",
      walkthrough: ["for each i in a: if a[i] > b[0], swap.", "re-insert b[0] into b like insertion sort."],
      pseudocode: "for i in 0..n−1\n  if a[i] > b[0]\n    swap a[i], b[0]\n    insertion-sort b[0] into b",
      code: {
        js: `function merge(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[0]) {
      [a[i], b[0]] = [b[0], a[i]];
      let k = 0;
      while (k + 1 < b.length && b[k] > b[k + 1]) { [b[k], b[k + 1]] = [b[k + 1], b[k]]; k++; }
    }
  }
}`,
        py: `def merge(a, b):
    for i in range(len(a)):
        if a[i] > b[0]:
            a[i], b[0] = b[0], a[i]
            k = 0
            while k + 1 < len(b) and b[k] > b[k + 1]:
                b[k], b[k + 1] = b[k + 1], b[k]
                k += 1`,
      },
      complexity: { time: "O(n·m)", space: "O(1)", timeWhy: "each of n positions may push one value through all m slots of b.", spaceWhy: "swaps only.", ops: (n) => (n * n) / 4 },
      pros: ["intuitive, in place."], cons: ["slow when both arrays are large."],
    },
    {
      level: "optimal", name: "gap method", idea: "compare elements that are gap apart across the combined a+b and swap if out of order; halve the gap each pass until it's 1.",
      walkthrough: ["gap = ⌈(n + m) / 2⌉.", "for each i, compare position i and i + gap (possibly in different arrays), swap if the left one is bigger.", "gap = ⌈gap / 2⌉; the pass with gap 1 finishes the job."],
      pseudocode: "gap ← ⌈(n+m)/2⌉\nwhile gap > 0\n  for i in 0..n+m−gap−1\n    if at(i) > at(i+gap): swap them\n  gap ← (gap = 1) ? 0 : ⌈gap/2⌉",
      code: {
        js: `function merge(a, b) {
  const n = a.length, m = b.length;
  let gap = Math.ceil((n + m) / 2); // @init
  const get = (i) => (i < n ? a[i] : b[i - n]);
  const put = (i, v) => { if (i < n) a[i] = v; else b[i - n] = v; };
  while (gap > 0) { // @gap
    for (let i = 0; i + gap < n + m; i++) {
      if (get(i) > get(i + gap)) { // @compare
        const t = get(i); put(i, get(i + gap)); put(i + gap, t); // @swap
      }
    }
    gap = gap === 1 ? 0 : Math.ceil(gap / 2); // @shrink
  }
} // @done`,
        py: `def merge(a, b):
    n, m = len(a), len(b)
    gap = (n + m + 1) // 2  # @init
    def get(i): return a[i] if i < n else b[i - n]
    def put(i, v):
        if i < n: a[i] = v
        else: b[i - n] = v
    while gap > 0:  # @gap
        for i in range(n + m - gap):
            if get(i) > get(i + gap):  # @compare
                x, y = get(i), get(i + gap)  # @swap
                put(i, y); put(i + gap, x)  # @swap
        gap = 0 if gap == 1 else (gap + 1) // 2  # @shrink
    return a, b  # @done`,
        java: `static void merge(int[] a, int[] b) {
    int n = a.length, m = b.length;
    int gap = (n + m + 1) / 2; // @init
    while (gap > 0) { // @gap
        for (int i = 0; i + gap < n + m; i++) {
            int j = i + gap;
            int x = i < n ? a[i] : b[i - n], y = j < n ? a[j] : b[j - n];
            if (x > y) { // @compare
                if (i < n) a[i] = y; else b[i - n] = y; // @swap
                if (j < n) a[j] = x; else b[j - n] = x; // @swap
            }
        }
        gap = gap == 1 ? 0 : (gap + 1) / 2; // @shrink
    }
} // @done`,
        cpp: `void merge(vector<int>& a, vector<int>& b) {
    int n = a.size(), m = b.size();
    int gap = (n + m + 1) / 2; // @init
    auto at = [&](int i) -> int& { return i < n ? a[i] : b[i - n]; };
    while (gap > 0) { // @gap
        for (int i = 0; i + gap < n + m; i++) {
            if (at(i) > at(i + gap)) { // @compare
                swap(at(i), at(i + gap)); // @swap
            }
        }
        gap = gap == 1 ? 0 : (gap + 1) / 2; // @shrink
    }
} // @done`,
      },
      complexity: { time: "O((n+m) log(n+m))", space: "O(1)", timeWhy: "about log(n+m) passes, each a linear sweep.", spaceWhy: "only indexes; values swap in place across the two arrays.", ops: (n) => n * lg(n) },
      pros: ["truly in place.", "much faster than insertion for big arrays."], cons: ["the 'why does it work' argument (shell-sort style) is non-obvious.", "index juggling across two arrays is error-prone."],
      tracer: "mergeGap",
    },
  ],
  input: {
    arrays: [
      { key: "arr", label: "a (sorted)", min: -99, max: 99, minLen: 1, maxLen: 6, sorted: true },
      { key: "arr2", label: "b (sorted)", min: -99, max: 99, minLen: 1, maxLen: 6, sorted: true },
    ],
    defaults: { arr: [1, 4, 7, 8, 10], arr2: [2, 3, 9] },
  },
  checkpoints: [
    { q: "a has 5 elements and b has 3. what's the first gap?", options: ["4", "8", "3"], answer: 0, right: "right — ⌈8 / 2⌉ = 4.", wrong: "the gap starts at half the combined length, rounded up." },
    { q: "which pass guarantees the arrays are fully sorted?", options: ["the first one", "the pass with gap = 1", "none — you still need a final sort"], answer: 1, right: "yes — gap 1 is a final bubble pass over nearly-sorted data.", wrong: "the gap keeps halving. what happens when it reaches 1?" },
  ],
};

export const rotateByOne: Problem = {
  slug: "rotate-by-one",
  topic: "arrays",
  sheet: [7],
  title: "cyclically rotate an array by one",
  sheetTitle: "Write a program to cyclically rotate an array by one.",
  pattern: "two-pointers",
  also: ["in-place shift"],
  difficulty: "easy",
  summary: "move the last element to the front and shift the rest right.",
  intro: "rotate the array one step clockwise: the last element wraps around to the front and every other element moves one place to the right.",
  example: { input: "[1, 2, 3, 4, 5]", output: "[5, 1, 2, 3, 4]", why: "5 wraps to the front; 1–4 each shift right by one." },
  clues: ["one element leaves one end and re-enters the other.", "everything else moves by exactly one position.", "in place: save the one value you'd overwrite."],
  approaches: [
    {
      level: "brute", name: "copy with an offset", idea: "write arr[(i − 1 + n) % n] into position i of a new array.",
      walkthrough: ["new array out.", "out[i] = arr[(i − 1 + n) % n]."],
      pseudocode: "for i in 0..n−1: out[i] ← arr[(i−1+n) mod n]",
      code: { js: `function rotate(arr) {\n  const n = arr.length;\n  return arr.map((_, i) => arr[(i - 1 + n) % n]);\n}`, py: `def rotate(arr):\n    return arr[-1:] + arr[:-1]` },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "one pass.", spaceWhy: "a full copy.", ops: (n) => n },
      pros: ["one-liner, generalises to rotate by k."], cons: ["extra array."],
    },
    {
      level: "optimal", name: "save last, shift right", idea: "keep the last value aside, shift everything one step right from the back, then drop the saved value at index 0.",
      walkthrough: ["last = arr[n − 1].", "for i from n − 1 down to 1: arr[i] = arr[i − 1].", "arr[0] = last."],
      pseudocode: "last ← arr[n−1]\nfor i from n−1 down to 1: arr[i] ← arr[i−1]\narr[0] ← last",
      code: {
        js: `function rotate(arr) {
  const last = arr[arr.length - 1]; // @save
  for (let i = arr.length - 1; i > 0; i--) {
    arr[i] = arr[i - 1]; // @shift
  }
  arr[0] = last; // @place
  return arr;
}`,
        py: `def rotate(arr):
    last = arr[-1]  # @save
    for i in range(len(arr) - 1, 0, -1):
        arr[i] = arr[i - 1]  # @shift
    arr[0] = last  # @place
    return arr`,
        java: `static void rotate(int[] arr) {
    int last = arr[arr.length - 1]; // @save
    for (int i = arr.length - 1; i > 0; i--) {
        arr[i] = arr[i - 1]; // @shift
    }
    arr[0] = last; // @place
}`,
        cpp: `void rotate(vector<int>& arr) {
    int last = arr.back(); // @save
    for (int i = (int)arr.size() - 1; i > 0; i--) {
        arr[i] = arr[i - 1]; // @shift
    }
    arr[0] = last; // @place
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "n − 1 shifts.", spaceWhy: "one saved value.", ops: (n) => n },
      pros: ["in place, one pass."], cons: ["shifting must go back-to-front, or you overwrite values you still need."],
      tracer: "rotateOne",
    },
  ],
  input: { arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 1, maxLen: 12 }], defaults: { arr: [1, 2, 3, 4, 5] } },
  checkpoints: [
    { q: "why does the shift loop run from the back to the front?", options: ["it's faster", "front-to-back would overwrite values before they're copied", "no reason"], answer: 1, right: "exactly — going right-to-left, each value is copied before it gets overwritten.", wrong: "try it front-to-back on [1, 2, 3]: arr[1] = arr[0] … what happened to 2?" },
    { q: "how would you rotate by k instead of 1, still in O(1) space?", options: ["repeat this k times", "reverse all, then reverse the first k and the rest", "use a hash map"], answer: 1, right: "yes — the three-reversal trick is O(n) for any k.", wrong: "repeating works but costs O(n·k). there's a trick with reversals…" },
  ],
};

export const palindromeOps: Problem = {
  slug: "min-ops-palindrome",
  topic: "arrays",
  sheet: [34],
  title: "minimum merge operations to make an array palindrome",
  sheetTitle: "Minimum no. of operations required to make an array palindrome",
  pattern: "two-pointers",
  also: ["greedy"],
  difficulty: "medium",
  summary: "merge neighbours (replace two with their sum) as few times as possible to get a palindrome.",
  intro: "the only allowed operation is to merge two adjacent elements into one element equal to their sum. find the smallest number of merges that turns the array into a palindrome (reads the same forwards and backwards).",
  example: { input: "[11, 14, 15, 99]", output: "3", why: "merge everything into [139] — no shorter sequence of merges makes the ends match." },
  clues: ["palindrome → compare the two ends.", "the smaller end can only grow by merging with its neighbour.", "each decision is local and final (greedy two pointers)."],
  approaches: [
    {
      level: "optimal", name: "greedy two pointers", idea: "compare the ends. equal → shrink both. otherwise merge the smaller end into its neighbour (that's the only way it can grow to match) and count one operation.",
      walkthrough: ["i = 0, j = n − 1.", "arr[i] = arr[j]: i++, j−−.", "arr[i] < arr[j]: arr[i+1] += arr[i], i++, ops++.", "else: arr[j−1] += arr[j], j−−, ops++."],
      pseudocode: "i ← 0; j ← n−1; ops ← 0\nwhile i < j\n  if arr[i] = arr[j]: i++; j−−\n  elif arr[i] < arr[j]: arr[i+1] += arr[i]; i++; ops++\n  else: arr[j−1] += arr[j]; j−−; ops++",
      code: {
        js: `function minOps(arr) {
  let i = 0, j = arr.length - 1, ops = 0; // @init
  while (i < j) {
    if (arr[i] === arr[j]) { i++; j--; } // @equal
    else if (arr[i] < arr[j]) { arr[i + 1] += arr[i]; i++; ops++; } // @mergeLeft
    else { arr[j - 1] += arr[j]; j--; ops++; } // @mergeRight
  }
  return ops; // @done
}`,
        py: `def min_ops(arr):
    i, j, ops = 0, len(arr) - 1, 0  # @init
    while i < j:
        if arr[i] == arr[j]:  # @equal
            i += 1; j -= 1  # @equal
        elif arr[i] < arr[j]:  # @mergeLeft
            arr[i + 1] += arr[i]; i += 1; ops += 1  # @mergeLeft
        else:
            arr[j - 1] += arr[j]; j -= 1; ops += 1  # @mergeRight
    return ops  # @done`,
        java: `static int minOps(int[] arr) {
    int i = 0, j = arr.length - 1, ops = 0; // @init
    while (i < j) {
        if (arr[i] == arr[j]) { i++; j--; } // @equal
        else if (arr[i] < arr[j]) { arr[i + 1] += arr[i]; i++; ops++; } // @mergeLeft
        else { arr[j - 1] += arr[j]; j--; ops++; } // @mergeRight
    }
    return ops; // @done
}`,
        cpp: `int minOps(vector<int> arr) {
    int i = 0, j = (int)arr.size() - 1, ops = 0; // @init
    while (i < j) {
        if (arr[i] == arr[j]) { i++; j--; } // @equal
        else if (arr[i] < arr[j]) { arr[i + 1] += arr[i]; i++; ops++; } // @mergeLeft
        else { arr[j - 1] += arr[j]; j--; ops++; } // @mergeRight
    }
    return ops; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "every step moves i or j inward.", spaceWhy: "merges happen in place.", ops: (n) => n },
      pros: ["single pass, provably minimal for positive values."], cons: ["assumes positive numbers — with negatives, merging could shrink an end and the greedy argument breaks."],
      tracer: "palindromeOps",
    },
  ],
  input: { arrays: [{ key: "arr", label: "positive numbers", min: 1, max: 99, minLen: 1, maxLen: 10 }], defaults: { arr: [1, 4, 5, 9, 1] } },
  checkpoints: [
    { q: "ends are 3 and 7. which side merges?", options: ["the left (3)", "the right (7)", "both"], answer: 0, right: "right — 3 can only reach 7 by absorbing its neighbour.", wrong: "the bigger side can't shrink. which one needs to grow?" },
    { q: "what's the most merges you'd ever need for n elements?", options: ["n", "n − 1", "n / 2"], answer: 1, right: "yes — merging everything into one element always works in n − 1 steps.", wrong: "a single element is always a palindrome. how many merges get you there?" },
  ],
};

export const trappingRainWater: Problem = {
  slug: "trapping-rain-water",
  topic: "arrays",
  sheet: [29],
  title: "trapping rain water",
  sheetTitle: "Trapping Rain water problem",
  pattern: "two-pointers",
  also: ["prefix max"],
  difficulty: "hard",
  summary: "how much water sits between bars of different heights after rain?",
  intro: "each number is the height of a 1-wide bar. after it rains, water collects in the dips between taller bars. compute the total amount of trapped water.",
  example: { input: "[3, 0, 0, 2, 0, 4]", output: "10", why: "the dips hold 3 + 3 + 1 + 3 = 10 units between the 3 and the 4." },
  clues: ["water above a bar depends on the tallest bar on each side.", "you keep needing 'max to the left' and 'max to the right'.", "whichever side is shorter decides the water level — process that side."],
  approaches: [
    {
      level: "brute", name: "scan both sides for every bar", idea: "for each bar, find the tallest bar to its left and right; water = min of the two − its height.",
      walkthrough: ["for each i, scan left for max, scan right for max.", "add min(leftMax, rightMax) − h[i]."],
      pseudocode: "for i in 0..n−1\n  L ← max(h[0..i]); R ← max(h[i..n−1])\n  water += min(L, R) − h[i]",
      code: {
        js: `function trap(h) {
  let water = 0;
  for (let i = 0; i < h.length; i++) {
    const L = Math.max(...h.slice(0, i + 1)), R = Math.max(...h.slice(i));
    water += Math.min(L, R) - h[i];
  }
  return water;
}`,
        py: `def trap(h):
    return sum(min(max(h[:i + 1]), max(h[i:])) - h[i] for i in range(len(h)))`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "two scans per bar.", spaceWhy: "no arrays (slices aside).", ops: (n) => n * n },
      pros: ["follows the definition directly."], cons: ["recomputes the same maxima over and over."],
    },
    {
      level: "improved", name: "prefix and suffix maxima", idea: "precompute leftMax[i] and rightMax[i] in two passes, then one pass to add up the water.",
      walkthrough: ["leftMax left-to-right.", "rightMax right-to-left.", "sum min(leftMax[i], rightMax[i]) − h[i]."],
      pseudocode: "leftMax[i] ← max(leftMax[i−1], h[i])\nrightMax[i] ← max(rightMax[i+1], h[i])\nwater ← Σ min(leftMax[i], rightMax[i]) − h[i]",
      code: {
        js: `function trap(h) {
  const n = h.length, L = Array(n), R = Array(n);
  for (let i = 0; i < n; i++) L[i] = Math.max(i ? L[i - 1] : 0, h[i]);
  for (let i = n - 1; i >= 0; i--) R[i] = Math.max(i < n - 1 ? R[i + 1] : 0, h[i]);
  let water = 0;
  for (let i = 0; i < n; i++) water += Math.min(L[i], R[i]) - h[i];
  return water;
}`,
        py: `from itertools import accumulate
def trap(h):
    L = list(accumulate(h, max))
    R = list(accumulate(h[::-1], max))[::-1]
    return sum(min(l, r) - x for l, r, x in zip(L, R, h))`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "three linear passes.", spaceWhy: "two helper arrays of length n.", ops: (n) => 3 * n },
      pros: ["linear and easy to reason about."], cons: ["2n extra memory."],
    },
    {
      level: "optimal", name: "two pointers", idea: "move inward from both ends, always processing the shorter side: its water level is already decided by its own running max.",
      walkthrough: ["l = 0, r = n − 1, leftMax = rightMax = 0.", "if h[l] < h[r]: the right side is tall enough, so water at l = leftMax − h[l]; l++.", "else do the mirror on the right; r−−."],
      pseudocode: "while l < r\n  if h[l] < h[r]\n    leftMax ← max(leftMax, h[l]); water += leftMax − h[l]; l++\n  else\n    rightMax ← max(rightMax, h[r]); water += rightMax − h[r]; r−−",
      code: {
        js: `function trap(h) {
  let l = 0, r = h.length - 1; // @init
  let leftMax = 0, rightMax = 0, water = 0; // @init
  while (l < r) {
    if (h[l] < h[r]) { // @left
      leftMax = Math.max(leftMax, h[l]); // @left
      water += leftMax - h[l]; // @left
      l++; // @left
    } else {
      rightMax = Math.max(rightMax, h[r]); // @right
      water += rightMax - h[r]; // @right
      r--; // @right
    }
  }
  return water; // @done
}`,
        py: `def trap(h):
    l, r = 0, len(h) - 1  # @init
    left_max = right_max = water = 0  # @init
    while l < r:
        if h[l] < h[r]:  # @left
            left_max = max(left_max, h[l])  # @left
            water += left_max - h[l]  # @left
            l += 1  # @left
        else:
            right_max = max(right_max, h[r])  # @right
            water += right_max - h[r]  # @right
            r -= 1  # @right
    return water  # @done`,
        java: `static int trap(int[] h) {
    int l = 0, r = h.length - 1; // @init
    int leftMax = 0, rightMax = 0, water = 0; // @init
    while (l < r) {
        if (h[l] < h[r]) { // @left
            leftMax = Math.max(leftMax, h[l]); // @left
            water += leftMax - h[l]; // @left
            l++; // @left
        } else {
            rightMax = Math.max(rightMax, h[r]); // @right
            water += rightMax - h[r]; // @right
            r--; // @right
        }
    }
    return water; // @done
}`,
        cpp: `int trap(const vector<int>& h) {
    int l = 0, r = (int)h.size() - 1; // @init
    int leftMax = 0, rightMax = 0, water = 0; // @init
    while (l < r) {
        if (h[l] < h[r]) { // @left
            leftMax = max(leftMax, h[l]); // @left
            water += leftMax - h[l]; // @left
            l++; // @left
        } else {
            rightMax = max(rightMax, h[r]); // @right
            water += rightMax - h[r]; // @right
            r--; // @right
        }
    }
    return water; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "each bar is processed once as the pointers meet.", spaceWhy: "four numbers.", ops: (n) => n },
      pros: ["one pass, constant memory."], cons: ["the 'shorter side is safe' argument takes a moment to trust."],
      tracer: "trapping",
    },
  ],
  input: { arrays: [{ key: "arr", label: "bar heights", min: 0, max: 9, minLen: 1, maxLen: 12 }], defaults: { arr: [3, 0, 0, 2, 0, 4] } },
  checkpoints: [
    { q: "h[l] = 2, h[r] = 5, leftMax = 3. how much water sits above bar l?", options: ["1", "3", "0"], answer: 0, right: "right — the right side is taller, so the level is leftMax = 3; 3 − 2 = 1.", wrong: "the shorter side decides. water = leftMax − h[l]." },
    { q: "why is it safe to use leftMax without knowing the true right max?", options: ["the right max is at least h[r], which is taller than h[l]", "it isn't — the result is approximate", "because the array is sorted"], answer: 0, right: "exactly — a bar at least as tall as h[r] exists on the right, so leftMax is the binding limit.", wrong: "the result is exact. what do we know about the right side when h[l] < h[r]?" },
  ],
};

export const findDuplicate: Problem = {
  slug: "find-duplicate",
  topic: "arrays",
  sheet: [11],
  title: "find the duplicate in an array of n + 1 integers",
  sheetTitle: "find duplicate in an array of N+1 Integers",
  pattern: "two-pointers",
  also: ["fast & slow pointers", "floyd's cycle detection", "hashing"],
  difficulty: "medium",
  summary: "n + 1 numbers in the range 1..n — find the repeated one without changing the array.",
  intro: "the array has n + 1 slots, and every value is between 1 and n. by the pigeonhole principle at least one value repeats. find it — ideally without modifying the array and with constant extra memory.",
  example: { input: "[1, 3, 4, 2, 2]", output: "2", why: "2 appears twice; every other value appears once." },
  clues: ["values are valid indexes (1..n) → treat each value as a pointer.", "“don't modify the array, O(1) space” rules out sorting and hashing.", "a repeated value = two arrows into the same node = a cycle."],
  approaches: [
    {
      level: "brute", name: "sort, then look for neighbours", idea: "after sorting, a duplicate sits right next to its copy.",
      walkthrough: ["sort a copy.", "find i with s[i] = s[i + 1]."], pseudocode: "s ← sorted(arr)\nreturn first s[i] with s[i] = s[i+1]",
      code: { js: `function findDuplicate(arr) {\n  const s = [...arr].sort((a, b) => a - b);\n  for (let i = 1; i < s.length; i++) if (s[i] === s[i - 1]) return s[i];\n}`, py: `def find_duplicate(arr):\n    s = sorted(arr)\n    return next(s[i] for i in range(1, len(s)) if s[i] == s[i - 1])` },
      complexity: { time: "O(n log n)", space: "O(n)", timeWhy: "sorting.", spaceWhy: "a sorted copy (sorting in place would modify the input).", ops: (n) => n * lg(n) },
      pros: ["simple."], cons: ["either modifies the input or copies it."],
    },
    {
      level: "improved", name: "hash set", idea: "remember every value you've seen; the first repeat is the answer.",
      walkthrough: ["for each x: if x is in the set, return it; else add it."], pseudocode: "seen ← {}\nfor x in arr\n  if x ∈ seen: return x\n  seen.add(x)",
      code: { js: `function findDuplicate(arr) {\n  const seen = new Set();\n  for (const x of arr) { if (seen.has(x)) return x; seen.add(x); }\n}`, py: `def find_duplicate(arr):\n    seen = set()\n    for x in arr:\n        if x in seen: return x\n        seen.add(x)` },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "one pass with O(1) set lookups.", spaceWhy: "the set can hold n values.", ops: (n) => n },
      pros: ["linear, input untouched."], cons: ["O(n) extra memory."],
    },
    {
      level: "optimal", name: "floyd's tortoise and hare", idea: "follow i → arr[i]. a slow walker (1 hop) and a fast walker (2 hops) must meet inside the cycle; restart slow from the beginning and walk both 1 hop — they meet at the cycle's entrance, which is the duplicate.",
      walkthrough: ["slow = fast = arr[0].", "phase 1: slow = arr[slow], fast = arr[arr[fast]] until they meet.", "phase 2: slow = arr[0]; move both one hop until equal.", "the meeting value is the duplicate."],
      pseudocode: "slow ← arr[0]; fast ← arr[0]\nrepeat: slow ← arr[slow]; fast ← arr[arr[fast]] until slow = fast\nslow ← arr[0]\nwhile slow ≠ fast: slow ← arr[slow]; fast ← arr[fast]\nreturn slow",
      code: {
        js: `function findDuplicate(nums) {
  let slow = nums[0], fast = nums[0]; // @init
  do {
    slow = nums[slow]; // @phase1
    fast = nums[nums[fast]]; // @phase1
  } while (slow !== fast); // @meet
  slow = nums[0]; // @reset
  while (slow !== fast) {
    slow = nums[slow]; // @phase2
    fast = nums[fast]; // @phase2
  }
  return slow; // @done
}`,
        py: `def find_duplicate(nums):
    slow = fast = nums[0]  # @init
    while True:
        slow = nums[slow]  # @phase1
        fast = nums[nums[fast]]  # @phase1
        if slow == fast: break  # @meet
    slow = nums[0]  # @reset
    while slow != fast:
        slow = nums[slow]  # @phase2
        fast = nums[fast]  # @phase2
    return slow  # @done`,
        java: `static int findDuplicate(int[] nums) {
    int slow = nums[0], fast = nums[0]; // @init
    do {
        slow = nums[slow]; // @phase1
        fast = nums[nums[fast]]; // @phase1
    } while (slow != fast); // @meet
    slow = nums[0]; // @reset
    while (slow != fast) {
        slow = nums[slow]; // @phase2
        fast = nums[fast]; // @phase2
    }
    return slow; // @done
}`,
        cpp: `int findDuplicate(const vector<int>& nums) {
    int slow = nums[0], fast = nums[0]; // @init
    do {
        slow = nums[slow]; // @phase1
        fast = nums[nums[fast]]; // @phase1
    } while (slow != fast); // @meet
    slow = nums[0]; // @reset
    while (slow != fast) {
        slow = nums[slow]; // @phase2
        fast = nums[fast]; // @phase2
    }
    return slow; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "both phases take at most a few laps of a path of length ≤ n + 1.", spaceWhy: "two index variables; the array is only read.", ops: (n) => 3 * n },
      pros: ["O(1) memory and read-only — meets the strictest version of the problem."], cons: ["needs the 1..n value guarantee.", "the phase-2 meeting proof is famously surprising."],
      tracer: "floyd",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "n + 1 values, each in 1..n", min: 1, max: 11, minLen: 2, maxLen: 12, check: (v) => (v.some((x) => x > v.length - 1) ? `every value must be between 1 and ${v.length - 1} (n) for ${v.length} slots.` : null),
      gen: () => { const n = 4 + Math.floor(Math.random() * 5); const a = Array.from({ length: n }, (_, i) => i + 1); a.push(1 + Math.floor(Math.random() * n)); return a.sort(() => Math.random() - 0.5); } }],
    defaults: { arr: [1, 3, 4, 2, 2] },
  },
  checkpoints: [
    { q: "why must a duplicate create a cycle when we follow i → arr[i]?", options: ["because the array is sorted", "every step lands on a valid index, so the walk never ends — it has to repeat", "because arr[0] is 0"], answer: 1, right: "exactly — values 1..n are always valid indexes, so the path must eventually loop.", wrong: "think about the walk: can it ever fall off the array?" },
    { q: "after the walkers meet, what moves in phase 2?", options: ["slow restarts at arr[0]; both take 1 hop", "fast restarts; both take 2 hops", "only slow moves"], answer: 0, right: "right — equal speeds, and they meet at the cycle entrance.", wrong: "in phase 2, both walkers move at the same speed. which one restarts?" },
  ],
};

export const unionIntersection: Problem = {
  slug: "union-intersection",
  topic: "arrays",
  sheet: [6],
  title: "union and intersection of two sorted arrays",
  sheetTitle: "Find the Union and Intersection of the two sorted arrays.",
  pattern: "two-pointers",
  also: ["merge"],
  difficulty: "easy",
  summary: "list the distinct values in either array, and the values in both.",
  intro: "given two sorted arrays, produce their union (every distinct value that appears in either) and their intersection (every distinct value that appears in both), both in sorted order.",
  example: { input: "a = [1, 2, 3, 4, 5], b = [1, 2, 3, 6, 7]", output: "union [1, 2, 3, 4, 5, 6, 7] · intersection [1, 2, 3]", why: "1, 2, 3 are shared; 4, 5 are only in a; 6, 7 only in b." },
  clues: ["both inputs are sorted → walk them together.", "it looks like the merge step of merge sort.", "the smaller front value can't be in the other array (yet)."],
  approaches: [
    {
      level: "brute", name: "hash sets", idea: "put both arrays into sets: union = a ∪ b, intersection = a ∩ b, then sort.",
      walkthrough: ["set(a) ∪ set(b) → sort.", "set(a) ∩ set(b) → sort."], pseudocode: "U ← sort(set(a) ∪ set(b))\nI ← sort(set(a) ∩ set(b))",
      code: { js: `function unionInter(a, b) {\n  const A = new Set(a), B = new Set(b);\n  const union = [...new Set([...a, ...b])].sort((x, y) => x - y);\n  const inter = [...A].filter((x) => B.has(x)).sort((x, y) => x - y);\n  return { union, inter };\n}`, py: `def union_inter(a, b):\n    return sorted(set(a) | set(b)), sorted(set(a) & set(b))` },
      complexity: { time: "O((n+m) log(n+m))", space: "O(n+m)", timeWhy: "building sets is linear, the final sort isn't.", spaceWhy: "the sets.", ops: (n) => n * lg(n) },
      pros: ["works even for unsorted input."], cons: ["ignores the fact that the input is already sorted."],
    },
    {
      level: "optimal", name: "two pointers (merge)", idea: "compare a[i] and b[j]: the smaller goes to the union and its pointer advances; equal values go to both lists.",
      walkthrough: ["i = j = 0.", "a[i] < b[j] → union gets a[i]; i++.", "a[i] > b[j] → union gets b[j]; j++.", "equal → both lists; i++, j++.", "copy the leftovers into the union."],
      pseudocode: "while i < n and j < m\n  if a[i] < b[j]: add a[i] to U; i++\n  elif a[i] > b[j]: add b[j] to U; j++\n  else: add to U and I; i++; j++\nappend the rest to U",
      code: {
        js: `function unionInter(a, b) {
  let i = 0, j = 0; // @init
  const union = [], inter = []; // @init
  const add = (list, x) => { if (list[list.length - 1] !== x) list.push(x); };
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) add(union, a[i++]); // @less
    else if (a[i] > b[j]) add(union, b[j++]); // @more
    else { add(union, a[i]); add(inter, a[i]); i++; j++; } // @equal
  }
  while (i < a.length) add(union, a[i++]); // @rest
  while (j < b.length) add(union, b[j++]); // @rest
  return { union, inter };
}`,
        py: `def union_inter(a, b):
    i = j = 0  # @init
    union, inter = [], []  # @init
    def add(lst, x):
        if not lst or lst[-1] != x: lst.append(x)
    while i < len(a) and j < len(b):
        if a[i] < b[j]: add(union, a[i]); i += 1  # @less
        elif a[i] > b[j]: add(union, b[j]); j += 1  # @more
        else: add(union, a[i]); add(inter, a[i]); i += 1; j += 1  # @equal
    for x in a[i:] + b[j:]: add(union, x)  # @rest
    return union, inter`,
        java: `static List<List<Integer>> unionInter(int[] a, int[] b) {
    int i = 0, j = 0; // @init
    List<Integer> union = new ArrayList<>(), inter = new ArrayList<>(); // @init
    while (i < a.length && j < b.length) {
        if (a[i] < b[j]) add(union, a[i++]); // @less
        else if (a[i] > b[j]) add(union, b[j++]); // @more
        else { add(union, a[i]); add(inter, a[i]); i++; j++; } // @equal
    }
    while (i < a.length) add(union, a[i++]); // @rest
    while (j < b.length) add(union, b[j++]); // @rest
    return List.of(union, inter);
}
static void add(List<Integer> l, int x) {
    if (l.isEmpty() || l.get(l.size() - 1) != x) l.add(x);
}`,
        cpp: `pair<vector<int>, vector<int>> unionInter(const vector<int>& a, const vector<int>& b) {
    size_t i = 0, j = 0; // @init
    vector<int> U, I; // @init
    auto add = [](vector<int>& l, int x) { if (l.empty() || l.back() != x) l.push_back(x); };
    while (i < a.size() && j < b.size()) {
        if (a[i] < b[j]) add(U, a[i++]); // @less
        else if (a[i] > b[j]) add(U, b[j++]); // @more
        else { add(U, a[i]); add(I, a[i]); i++; j++; } // @equal
    }
    while (i < a.size()) add(U, a[i++]); // @rest
    while (j < b.size()) add(U, b[j++]); // @rest
    return {U, I};
}`,
      },
      complexity: { time: "O(n + m)", space: "O(1) extra", timeWhy: "each element is visited once.", spaceWhy: "only the output lists (which you have to return anyway).", ops: (n) => n },
      pros: ["linear, uses the sortedness.", "same skeleton as merge sort's merge."], cons: ["only works on sorted inputs."],
      tracer: "unionInter",
    },
  ],
  input: {
    arrays: [
      { key: "arr", label: "a (sorted)", min: -99, max: 99, minLen: 1, maxLen: 7, sorted: true },
      { key: "arr2", label: "b (sorted)", min: -99, max: 99, minLen: 1, maxLen: 7, sorted: true },
    ],
    defaults: { arr: [1, 2, 3, 4, 5], arr2: [1, 2, 3, 6, 7] },
  },
  checkpoints: [
    { q: "a[i] = 4 and b[j] = 6. what do we know about 4?", options: ["it's in both arrays", "it can't be in b — everything left in b is ≥ 6", "nothing yet"], answer: 1, right: "exactly — b is sorted, so 4 can only go to the union.", wrong: "b is sorted and we're at 6. could a 4 still appear later in b?" },
    { q: "why check the last element before adding to a list?", options: ["to keep values distinct when there are repeats", "to keep the list sorted", "for speed"], answer: 0, right: "right — [2, 2, 3] should contribute 2 only once.", wrong: "try a = [2, 2]. without the check, what would the union contain?" },
  ],
};

export const commonThree: Problem = {
  slug: "common-in-three",
  topic: "arrays",
  sheet: [19],
  title: "common elements in three sorted arrays",
  sheetTitle: "find common elements In 3 sorted arrays",
  pattern: "two-pointers",
  also: ["three pointers"],
  difficulty: "easy",
  summary: "find the values present in all three sorted arrays.",
  intro: "given three arrays sorted in non-decreasing order, list the distinct values that appear in all three.",
  example: { input: "a = [1, 5, 10, 20, 40, 80], b = [6, 7, 20, 80, 100], c = [3, 4, 15, 20, 30, 70, 80, 120]", output: "[20, 80]", why: "20 and 80 are the only values present in all three." },
  clues: ["several sorted inputs → one pointer per array.", "the smallest current value can never match the others — advance it.", "like union/intersection, but with three lists."],
  approaches: [
    {
      level: "brute", name: "hash counting", idea: "put each array into a set and keep values present in all three sets.",
      walkthrough: ["A, B, C = sets.", "keep x in A if x ∈ B and x ∈ C."], pseudocode: "return sorted(x ∈ A if x ∈ B and x ∈ C)",
      code: { js: `function common(a, b, c) {\n  const B = new Set(b), C = new Set(c);\n  return [...new Set(a)].filter((x) => B.has(x) && C.has(x));\n}`, py: `def common(a, b, c):\n    return sorted(set(a) & set(b) & set(c))` },
      complexity: { time: "O(n1 + n2 + n3)", space: "O(n2 + n3)", timeWhy: "linear set building and lookups.", spaceWhy: "two sets.", ops: (n) => n },
      pros: ["short code, works for unsorted input."], cons: ["extra memory the sorted order makes unnecessary."],
    },
    {
      level: "optimal", name: "three pointers", idea: "if all three front values match, record it and advance all. otherwise advance the pointer on the smallest value.",
      walkthrough: ["i = j = k = 0.", "a[i] = b[j] = c[k] → record, advance all.", "else advance whichever of a[i], b[j], c[k] is smallest."],
      pseudocode: "while i < n1 and j < n2 and k < n3\n  if a[i] = b[j] = c[k]: record; i++; j++; k++\n  elif a[i] < b[j]: i++\n  elif b[j] < c[k]: j++\n  else: k++",
      code: {
        js: `function common(a, b, c) {
  let i = 0, j = 0, k = 0; // @init
  const out = []; // @init
  while (i < a.length && j < b.length && k < c.length) {
    if (a[i] === b[j] && b[j] === c[k]) { // @match
      if (out[out.length - 1] !== a[i]) out.push(a[i]); // @match
      i++; j++; k++; // @match
    } else if (a[i] < b[j]) i++; // @advance
    else if (b[j] < c[k]) j++; // @advance
    else k++; // @advance
  }
  return out; // @done
}`,
        py: `def common(a, b, c):
    i = j = k = 0  # @init
    out = []  # @init
    while i < len(a) and j < len(b) and k < len(c):
        if a[i] == b[j] == c[k]:  # @match
            if not out or out[-1] != a[i]: out.append(a[i])  # @match
            i += 1; j += 1; k += 1  # @match
        elif a[i] < b[j]: i += 1  # @advance
        elif b[j] < c[k]: j += 1  # @advance
        else: k += 1  # @advance
    return out  # @done`,
        java: `static List<Integer> common(int[] a, int[] b, int[] c) {
    int i = 0, j = 0, k = 0; // @init
    List<Integer> out = new ArrayList<>(); // @init
    while (i < a.length && j < b.length && k < c.length) {
        if (a[i] == b[j] && b[j] == c[k]) { // @match
            if (out.isEmpty() || out.get(out.size() - 1) != a[i]) out.add(a[i]); // @match
            i++; j++; k++; // @match
        } else if (a[i] < b[j]) i++; // @advance
        else if (b[j] < c[k]) j++; // @advance
        else k++; // @advance
    }
    return out; // @done
}`,
        cpp: `vector<int> common(const vector<int>& a, const vector<int>& b, const vector<int>& c) {
    size_t i = 0, j = 0, k = 0; // @init
    vector<int> out; // @init
    while (i < a.size() && j < b.size() && k < c.size()) {
        if (a[i] == b[j] && b[j] == c[k]) { // @match
            if (out.empty() || out.back() != a[i]) out.push_back(a[i]); // @match
            i++; j++; k++; // @match
        } else if (a[i] < b[j]) i++; // @advance
        else if (b[j] < c[k]) j++; // @advance
        else k++; // @advance
    }
    return out; // @done
}`,
      },
      complexity: { time: "O(n1 + n2 + n3)", space: "O(1) extra", timeWhy: "every step advances at least one pointer.", spaceWhy: "three indexes plus the output.", ops: (n) => n },
      pros: ["linear, no extra structures."], cons: ["relies on sorted input."],
      tracer: "common3",
    },
  ],
  input: {
    arrays: [
      { key: "arr", label: "a (sorted)", min: -99, max: 150, minLen: 1, maxLen: 8, sorted: true },
      { key: "arr2", label: "b (sorted)", min: -99, max: 150, minLen: 1, maxLen: 8, sorted: true },
      { key: "arr3", label: "c (sorted)", min: -99, max: 150, minLen: 1, maxLen: 8, sorted: true },
    ],
    defaults: { arr: [1, 5, 10, 20, 40, 80], arr2: [6, 7, 20, 80, 100], arr3: [3, 4, 15, 20, 30, 70, 80, 120] },
  },
  checkpoints: [
    { q: "fronts are 5, 20, 3. which pointer moves?", options: ["a's (5)", "c's (3)", "all three"], answer: 1, right: "yes — 3 is the smallest, so it can never match.", wrong: "find the smallest of the three. could it still appear in the other arrays?" },
    { q: "what's the time complexity?", options: ["O(n1 · n2 · n3)", "O(n1 + n2 + n3)", "O(n log n)"], answer: 1, right: "right — every step moves a pointer forward, and there are only n1 + n2 + n3 positions.", wrong: "count how many times the pointers can move in total." },
  ],
};

export const tripletSum: Problem = {
  slug: "triplet-sum",
  topic: "arrays",
  sheet: [28],
  title: "find a triplet that sums to a given value",
  sheetTitle: "Find the triplet that sum to a given value",
  pattern: "two-pointers",
  also: ["sorting", "3sum"],
  difficulty: "medium",
  summary: "is there a group of three numbers that adds up to x?",
  intro: "given an array and a target x, decide whether some three elements (at different positions) add up to exactly x, and report one such triplet.",
  example: { input: "arr = [1, 4, 45, 6, 10, 8], x = 13", output: "1 + 4 + 8", why: "1 + 4 + 8 = 13." },
  clues: ["it's pair-sum with one extra number: fix one, then solve pair-sum on the rest.", "sorting unlocks the two-pointer squeeze.", "O(n³) brute force hints that one loop can become two pointers."],
  approaches: [
    {
      level: "brute", name: "three nested loops", idea: "try every combination of three positions.",
      walkthrough: ["i < j < k.", "check arr[i] + arr[j] + arr[k] = x."], pseudocode: "for i < j < k: if arr[i]+arr[j]+arr[k] = x: return",
      code: { js: `function findTriplet(arr, x) {\n  const n = arr.length;\n  for (let i = 0; i < n; i++)\n    for (let j = i + 1; j < n; j++)\n      for (let k = j + 1; k < n; k++)\n        if (arr[i] + arr[j] + arr[k] === x) return [arr[i], arr[j], arr[k]];\n  return null;\n}`, py: `from itertools import combinations\ndef find_triplet(arr, x):\n    return next((t for t in combinations(arr, 3) if sum(t) == x), None)` },
      complexity: { time: "O(n³)", space: "O(1)", timeWhy: "about n³/6 combinations.", spaceWhy: "no extra storage.", ops: (n) => (n * n * n) / 6 },
      pros: ["obvious."], cons: ["cubic."],
    },
    {
      level: "improved", name: "fix one + hash set", idea: "fix arr[i]; then look for a pair summing to x − arr[i] with a hash set, like pair-sum.",
      walkthrough: ["for each i, run pair-sum on the rest with target x − arr[i]."], pseudocode: "for i\n  seen ← {}\n  for j > i\n    if x − arr[i] − arr[j] ∈ seen: found\n    seen.add(arr[j])",
      code: { js: `function findTriplet(arr, x) {\n  for (let i = 0; i < arr.length; i++) {\n    const seen = new Set();\n    for (let j = i + 1; j < arr.length; j++) {\n      const need = x - arr[i] - arr[j];\n      if (seen.has(need)) return [arr[i], need, arr[j]];\n      seen.add(arr[j]);\n    }\n  }\n  return null;\n}`, py: `def find_triplet(arr, x):\n    for i in range(len(arr)):\n        seen = set()\n        for j in range(i + 1, len(arr)):\n            need = x - arr[i] - arr[j]\n            if need in seen: return arr[i], need, arr[j]\n            seen.add(arr[j])\n    return None` },
      complexity: { time: "O(n²)", space: "O(n)", timeWhy: "n outer iterations × a linear pair-sum.", spaceWhy: "the set.", ops: (n) => (n * n) / 2 },
      pros: ["quadratic, no sort needed."], cons: ["extra memory per outer loop."],
    },
    {
      level: "optimal", name: "sort + two pointers", idea: "sort once. fix arr[i], then squeeze l and r over the rest: too small → l++, too big → r−−.",
      walkthrough: ["sort.", "for each i: l = i + 1, r = n − 1.", "sum = arr[i] + arr[l] + arr[r].", "equal → found; smaller → l++; bigger → r−−."],
      pseudocode: "sort arr\nfor i in 0..n−3\n  l ← i+1; r ← n−1\n  while l < r\n    s ← arr[i]+arr[l]+arr[r]\n    if s = x: return\n    if s < x: l++ else r−−",
      code: {
        js: `function findTriplet(arr, x) {
  arr.sort((a, b) => a - b); // @sort
  for (let i = 0; i < arr.length - 2; i++) {
    let l = i + 1, r = arr.length - 1; // @fix
    while (l < r) {
      const sum = arr[i] + arr[l] + arr[r];
      if (sum === x) return [arr[i], arr[l], arr[r]]; // @found
      if (sum < x) l++; // @less
      else r--; // @more
    }
  }
  return null; // @done
}`,
        py: `def find_triplet(arr, x):
    arr.sort()  # @sort
    for i in range(len(arr) - 2):
        l, r = i + 1, len(arr) - 1  # @fix
        while l < r:
            s = arr[i] + arr[l] + arr[r]
            if s == x: return arr[i], arr[l], arr[r]  # @found
            if s < x: l += 1  # @less
            else: r -= 1  # @more
    return None  # @done`,
        java: `static int[] findTriplet(int[] arr, int x) {
    Arrays.sort(arr); // @sort
    for (int i = 0; i < arr.length - 2; i++) {
        int l = i + 1, r = arr.length - 1; // @fix
        while (l < r) {
            int sum = arr[i] + arr[l] + arr[r];
            if (sum == x) return new int[]{arr[i], arr[l], arr[r]}; // @found
            if (sum < x) l++; // @less
            else r--; // @more
        }
    }
    return null; // @done
}`,
        cpp: `vector<int> findTriplet(vector<int> arr, int x) {
    sort(arr.begin(), arr.end()); // @sort
    for (int i = 0; i + 2 < (int)arr.size(); i++) {
        int l = i + 1, r = (int)arr.size() - 1; // @fix
        while (l < r) {
            int sum = arr[i] + arr[l] + arr[r];
            if (sum == x) return {arr[i], arr[l], arr[r]}; // @found
            if (sum < x) l++; // @less
            else r--; // @more
        }
    }
    return {}; // @done
}`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "sorting is O(n log n); the n outer loops each squeeze in O(n).", spaceWhy: "in-place sort, a few indexes.", ops: (n) => (n * n) / 2 + n * lg(n) },
      pros: ["quadratic with O(1) memory.", "extends to 'find all unique triplets' by skipping duplicates."], cons: ["sorting reorders the input."],
      tracer: "triplet",
    },
  ],
  input: {
    arrays: [{ key: "arr", label: "numbers", min: -99, max: 99, minLen: 3, maxLen: 10 }],
    scalars: [{ key: "target", label: "x (target sum)", min: -300, max: 300 }],
    defaults: { arr: [1, 4, 45, 6, 10, 8], target: 13 },
  },
  checkpoints: [
    { q: "after sorting, arr[i] + arr[l] + arr[r] is too big. what moves?", options: ["l moves right", "r moves left", "i moves right"], answer: 1, right: "yes — moving r left is the only way to make the sum smaller.", wrong: "the array is sorted. which move decreases the sum?" },
    { q: "how does this relate to pair sum?", options: ["it's unrelated", "fix one number, then it is pair sum with target x − arr[i]", "it needs dynamic programming"], answer: 1, right: "exactly — every k-sum problem reduces to (k−1)-sum like this.", wrong: "what's left to find once arr[i] is fixed?" },
  ],
};
