import type { Pattern, Problem } from "@/lib/types";
import { isCircularList, loopStart, middleNode, nthFromEnd, palindromeList, removeLoop, splitCircular } from "./fastSlow";
import { detectLoop, mergeSortList, reverseList } from "./flagship";
import { cloneRandom, firstNonRepeating, intersectionPoint, pairsDLL, removeDupUnsorted, tripletsDLL } from "./hashWalk";
import { flattenList, intersectSorted, mergeKLists, quickSortList, sortKSorted, whyMergeSort } from "./merge";
import { addOne, addTwo, multiplyLists } from "./numbers";
import {
  circularDelete, deleteGreaterRight, moveLastToFront, removeDupSorted, reverseDLL, reverseDLLGroups, reverseKGroup,
  reverseUnderLinear, rotateDLL, segregateEvenOdd, sort012List,
} from "./rewiring";

export const LL_PATTERNS: Pattern[] = [
  {
    id: "ll-rewiring",
    topic: "linked-list",
    name: "pointer rewiring",
    tone: "teal",
    mini: "relink",
    what: "change where next (and prev) pointers point, in place, instead of copying values: reverse runs of nodes, splice nodes out, or deal them into separate lists and join them back.",
    clues: ["the answer is the same nodes in a different order.", "you must work in place with O(1) extra space.", "keep a prev pointer — and save next before you overwrite it.", "a dummy head node removes 'is this the first node?' special cases."],
  },
  {
    id: "ll-fast-slow",
    topic: "linked-list",
    name: "fast & slow pointers",
    tone: "pink",
    mini: "chase",
    what: "run two pointers at different speeds (or with a fixed gap) along the list. their meeting point or relative position reveals loops, the middle, or the nth node from the end in one pass.",
    clues: ["you need the middle, a loop, or a position counted from the end.", "you may only walk the list once.", "O(1) space is required.", "the list might be circular or contain a cycle."],
  },
  {
    id: "ll-merge",
    topic: "linked-list",
    name: "merge & divide",
    tone: "lavender",
    mini: "zip",
    what: "combine sorted lists by repeatedly linking the smallest front node — for two lists, k lists (with a heap), or while merge-sorting. splitting at the middle plus merging sorts a list without an array.",
    clues: ["the inputs are sorted lists, or the output must be sorted.", "several lists must become one.", "sorting a list: merge sort needs no random access.", "a 'k-sorted' input hints at a heap of size k."],
  },
  {
    id: "ll-numbers",
    topic: "linked-list",
    name: "lists as numbers",
    tone: "yellow",
    mini: "digits",
    what: "treat each node as one digit of a big number. addition and multiplication become digit-by-digit walks with a carry — often after reversing so the ones digit comes first.",
    clues: ["each node holds a single digit.", "the number is too big for built-in types.", "a carry has to travel from the ones digit upwards.", "most-significant-digit-first lists usually need a reversal (or recursion)."],
  },
  {
    id: "ll-hash-walk",
    topic: "linked-list",
    name: "hashing & two-pointer walks",
    tone: "coral",
    mini: "lookup",
    what: "remember what you've seen in a hash set or map, or walk two pointers towards each other through a doubly linked list — the list versions of pair-sum, dedup and clone problems.",
    clues: ["'have i seen this value/node before?'", "a sorted doubly linked list can be walked from both ends.", "copying a structure with extra pointers (random, child).", "an o(1) lookup from a key to a node is needed."],
  },
];

/** The Linked List section of the Love Babbar 450 sheet, in sheet order. */
export const LL_PROBLEMS: Problem[] = [
  reverseList, reverseKGroup, detectLoop, removeLoop, loopStart, removeDupSorted, removeDupUnsorted, moveLastToFront,
  addOne, addTwo, intersectSorted, intersectionPoint, mergeSortList, quickSortList, middleNode, isCircularList,
  splitCircular, palindromeList, circularDelete, reverseDLL, pairsDLL, tripletsDLL, sortKSorted, rotateDLL,
  reverseDLLGroups, reverseUnderLinear, whyMergeSort, flattenList, sort012List, cloneRandom, mergeKLists,
  multiplyLists, deleteGreaterRight, segregateEvenOdd, nthFromEnd, firstNonRepeating,
];
