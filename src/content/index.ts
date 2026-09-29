import type { Pattern, PatternId, Problem } from "@/lib/types";
import { kadane, moveNegatives, pairSum } from "./flagship";
import { factorialLarge, mergeIntervals, minJumps, minimiseHeights, nextPermutation, profitTwice } from "./greedy";
import { longestConsecutive, moreThanNByK, subsetCheck, zeroSumSubarray } from "./hashing";
import { maxProductSubarray, minSwapsK, smallestSubarray, stockOnce } from "./slidingWindow";
import { chocolateDistribution, countInversions, kthElement, maxMin, medianDifferent, medianEqual } from "./sortingSearching";
import {
  alternatingPosNeg, commonThree, findDuplicate, mergeWithoutExtraSpace, palindromeOps, reverseArray,
  rotateByOne, sort012, threeWayPartition, trappingRainWater, tripletSum, unionIntersection,
} from "./twoPointers";

export const PATTERNS: Pattern[] = [
  {
    id: "two-pointers",
    name: "two pointers",
    tone: "teal",
    mini: "pointers",
    what: "walk two (or three) indexes through the array — from both ends, or one chasing the other — so a nested loop becomes a single pass. also covers in-place partitioning and fast/slow cycle detection.",
    clues: ["the array is sorted, or can be sorted cheaply.", "you must rearrange in place with O(1) extra space.", "you compare or swap pairs from opposite ends.", "values point at indexes (fast & slow pointers)."],
  },
  {
    id: "sliding-window",
    name: "sliding window & running sums",
    tone: "pink",
    mini: "window",
    what: "keep a running summary (sum, product, count, min) of a contiguous stretch and update it in O(1) as the stretch grows, shrinks or slides — instead of recomputing every subarray. kadane's 'extend or restart' is the running-sum form.",
    clues: ["the words contiguous, subarray or substring.", "a best (max/min/shortest/longest) value over stretches.", "a fixed window size, or a condition that grows/shrinks one.", "the brute force re-adds overlapping ranges."],
  },
  {
    id: "sorting-searching",
    name: "sorting & binary search",
    tone: "lavender",
    mini: "bars",
    what: "put the data in order (or use order that's already there) so the answer is found by position, partition or halving — merge sort for counting, quickselect for kth, binary search on partitions for medians.",
    clues: ["kth smallest/largest, median, or 'how unsorted is it'.", "one or both inputs are already sorted.", "the best group becomes contiguous once sorted.", "log n is expected — halve the search space."],
  },
  {
    id: "hashing",
    name: "hashing",
    tone: "yellow",
    mini: "hash",
    what: "trade memory for speed: remember what you've seen (values, counts, prefix sums) in a hash map or set so each 'have I seen this before?' question costs O(1).",
    clues: ["you need a partner value (target − x).", "you're counting occurrences or frequencies.", "a repeated prefix sum signals a zero-sum stretch.", "order doesn't matter, only membership."],
  },
  {
    id: "greedy",
    name: "greedy & simulation",
    tone: "coral",
    mini: "jumps",
    what: "make the locally best move at each step when you can argue it never hurts — often after sorting — or carefully simulate a process (state machines, digit-by-digit arithmetic).",
    clues: ["a sequence of decisions with a clear 'best right now' choice.", "intervals, jumps or reachability.", "a small, fixed number of states (at most two trades).", "numbers too big for built-in types."],
  },
];

/** All 35 unique Array problems from the Love Babbar 450 sheet, in sheet order. */
export const PROBLEMS: Problem[] = [
  reverseArray, maxMin, kthElement, sort012, moveNegatives, unionIntersection, rotateByOne, kadane,
  minimiseHeights, minJumps, findDuplicate, mergeWithoutExtraSpace, mergeIntervals, nextPermutation,
  countInversions, stockOnce, pairSum, commonThree, alternatingPosNeg, zeroSumSubarray, factorialLarge,
  maxProductSubarray, longestConsecutive, moreThanNByK, profitTwice, subsetCheck, tripletSum,
  trappingRainWater, chocolateDistribution, smallestSubarray, threeWayPartition, minSwapsK, palindromeOps,
  medianEqual, medianDifferent,
];

export const problemBySlug = (slug: string) => PROBLEMS.find((p) => p.slug === slug);
export const problemsFor = (id: PatternId) => PROBLEMS.filter((p) => p.pattern === id);
export const patternById = (id: PatternId) => PATTERNS.find((p) => p.id === id)!;
export const FLAGSHIP = PROBLEMS.filter((p) => p.flagship);
