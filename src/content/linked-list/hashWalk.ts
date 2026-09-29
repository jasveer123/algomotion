import type { Problem } from "@/lib/types";

const listField = (key: "arr" | "arr2" | "arr3", label: string, maxLen = 8, extra: object = {}) => ({ key, label, min: -99, max: 99, minLen: 1, maxLen, ...extra });
const distinctSorted = (v: number[]) => (v.some((x, i) => i > 0 && x <= v[i - 1]) ? "values must be distinct and in increasing order." : null);

export const removeDupUnsorted: Problem = {
  slug: "remove-duplicates-unsorted-list",
  topic: "linked-list",
  sheet: [7],
  title: "remove duplicates from an unsorted linked list",
  sheetTitle: "Remove Duplicates in a Un-sorted Linked List.",
  pattern: "ll-hash-walk",
  difficulty: "easy",
  summary: "keep the first occurrence of every value.",
  intro: "remove every node whose value already appeared earlier in the list, keeping the first occurrences in their original order.",
  example: { input: "5 → 2 → 2 → 4", output: "5 → 2 → 4", why: "the second 2 is removed." },
  clues: ["duplicates can be anywhere — not just neighbours.", "'have i seen this value?' → hash set.", "unlinking needs the previous node."],
  approaches: [
    {
      level: "brute", name: "nested loops", idea: "for each node, scan the rest of the list and unlink later copies of its value.",
      walkthrough: ["outer pointer walks the list.", "inner pointer unlinks any later node with the same value."], pseudocode: "for o in list\n  p ← o\n  while p.next: if p.next.val = o.val: p.next ← p.next.next else p ← p.next",
      code: {
        js: `function removeDuplicates(head) {
  for (let o = head; o; o = o.next) { // @init
    let p = o;
    while (p.next) {
      if (p.next.val === o.val) p.next = p.next.next; // @drop
      else p = p.next; // @scan
    }
  }
  return head; // @done
}`,
        py: `def remove_duplicates(head):
    o = head  # @init
    while o:
        p = o
        while p.next:
            if p.next.val == o.val: p.next = p.next.next  # @drop
            else: p = p.next  # @scan
        o = o.next
    return head  # @done`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "each node scans everything after it.", spaceWhy: "two pointers.", ops: (n) => (n * n) / 2 },
      pros: ["no extra memory."], cons: ["quadratic."],
      tracer: "ll-dedup-nested",
    },
    {
      level: "optimal", name: "hash set", idea: "walk once with prev/curr; if curr's value is in the set, unlink curr; otherwise add it and move prev forward.",
      walkthrough: ["seen = {}.", "value seen → prev.next = curr.next.", "else add the value, prev = curr.", "curr = curr.next."],
      pseudocode: "seen ← {}; prev ← null\nfor curr in list\n  if curr.val ∈ seen: prev.next ← curr.next\n  else: seen.add(curr.val); prev ← curr",
      code: {
        js: `function removeDuplicates(head) {
  const seen = new Set(); // @init
  let prev = null, curr = head;
  while (curr) {
    if (seen.has(curr.val)) prev.next = curr.next; // @drop
    else { seen.add(curr.val); prev = curr; } // @keep
    curr = curr.next;
  }
  return head; // @done
}`,
        py: `def remove_duplicates(head):
    seen = set()  # @init
    prev, curr = None, head
    while curr:
        if curr.val in seen: prev.next = curr.next  # @drop
        else: seen.add(curr.val); prev = curr  # @keep
        curr = curr.next
    return head  # @done`,
        java: `static Node removeDuplicates(Node head) {
    Set<Integer> seen = new HashSet<>(); // @init
    Node prev = null, curr = head;
    while (curr != null) {
        if (seen.contains(curr.val)) prev.next = curr.next; // @drop
        else { seen.add(curr.val); prev = curr; } // @keep
        curr = curr.next;
    }
    return head; // @done
}`,
        cpp: `Node* removeDuplicates(Node* head) {
    unordered_set<int> seen; // @init
    Node *prev = nullptr, *curr = head;
    while (curr) {
        if (seen.count(curr->val)) prev->next = curr->next; // @drop
        else { seen.insert(curr->val); prev = curr; } // @keep
        curr = curr->next;
    }
    return head; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "one pass with O(1) set operations.", spaceWhy: "the set of distinct values.", ops: (n) => n },
      pros: ["linear, keeps first occurrences in order."], cons: ["O(n) memory; sorting first would give O(n log n) with O(1) space but lose the order."],
      tracer: "ll-dedup-hash",
    },
  ],
  input: { arrays: [listField("arr", "list values", 9)], defaults: { arr: [5, 2, 2, 4, 5, 3] } },
  checkpoints: [
    { q: "when a duplicate is unlinked, does prev move?", options: ["yes", "no — prev must stay on the last kept node"], answer: 1, right: "right — the removed node is gone; prev is still the last kept one.", wrong: "prev is the node before curr. if curr is removed, who is before the next node?" },
    { q: "why not just compare each node with its neighbour?", options: ["that only works when the list is sorted", "it's too slow", "neighbours can't be duplicates"], answer: 0, right: "exactly — unsorted duplicates can be far apart.", wrong: "in 5 → 2 → 4 → 5, are the two 5s neighbours?" },
  ],
};

export const intersectionPoint: Problem = {
  slug: "intersection-point",
  topic: "linked-list",
  sheet: [12],
  title: "intersection point of two linked lists",
  sheetTitle: "Intersection Point of two Linked Lists.",
  pattern: "ll-hash-walk",
  also: ["two pointers"],
  difficulty: "medium",
  summary: "two lists merge into a shared tail (a Y shape) — find the first shared node.",
  intro: "two singly linked lists join at some node and share every node after it, forming a Y. find the node where they meet. (it's the same node object, not just an equal value.)",
  example: { input: "a: 3 → 6 → 9 ↘, b: 10 ↘, shared: 15 → 30", output: "15", why: "15 is the first node reachable from both heads." },
  clues: ["compare nodes, not values.", "if both lists were the same length, walking in step would find it.", "switching heads when a pointer runs out equalises the distances: a + shared + b = b + shared + a."],
  approaches: [
    {
      level: "brute", name: "hash set of a's nodes", idea: "store every node of list a; walk b and return the first node that's in the set.",
      walkthrough: ["put all of a's nodes in a set.", "walk b: first node in the set is the answer."], pseudocode: "seen ← nodes of a\nfor node in b: if node ∈ seen: return node",
      code: { js: `function intersection(a, b) {\n  const seen = new Set();\n  for (let c = a; c; c = c.next) seen.add(c);\n  for (let c = b; c; c = c.next) if (seen.has(c)) return c;\n  return null;\n}`, py: `def intersection(a, b):\n    seen = set()\n    while a: seen.add(a); a = a.next\n    while b:\n        if b in seen: return b\n        b = b.next\n    return None` },
      complexity: { time: "O(n + m)", space: "O(n)", timeWhy: "one pass over each list.", spaceWhy: "a's nodes in a set.", ops: (n) => 2 * n },
      pros: ["simple."], cons: ["O(n) memory."],
    },
    {
      level: "optimal", name: "two pointers that switch heads", idea: "p walks a then b; q walks b then a. both travel the same total distance, so they arrive at the intersection at the same time (or both at null).",
      walkthrough: ["p = a, q = b.", "step both; a pointer that hits null restarts at the other list's head.", "stop when p == q."],
      pseudocode: "p ← a; q ← b\nwhile p ≠ q\n  p ← p ? p.next : b\n  q ← q ? q.next : a\nreturn p",
      code: {
        js: `function intersection(a, b) {
  let p = a, q = b; // @init
  while (p !== q) {
    p = p ? p.next : b; // @step
    q = q ? q.next : a; // @step
  }
  return p; // @done
}`,
        py: `def intersection(a, b):
    p, q = a, b  # @init
    while p is not q:
        p = p.next if p else b  # @step
        q = q.next if q else a  # @step
    return p  # @done`,
        java: `static Node intersection(Node a, Node b) {
    Node p = a, q = b; // @init
    while (p != q) {
        p = (p != null) ? p.next : b; // @step
        q = (q != null) ? q.next : a; // @step
    }
    return p; // @done
}`,
        cpp: `Node* intersection(Node* a, Node* b) {
    Node *p = a, *q = b; // @init
    while (p != q) {
        p = p ? p->next : b; // @step
        q = q ? q->next : a; // @step
    }
    return p; // @done
}`,
      },
      complexity: { time: "O(n + m)", space: "O(1)", timeWhy: "each pointer walks at most both lists once.", spaceWhy: "two pointers.", ops: (n) => 2 * n },
      pros: ["constant memory, no length counting."], cons: ["looks like magic until you write out the distances."],
      tracer: "ll-intersection-point",
    },
  ],
  input: { arrays: [listField("arr", "a's own nodes", 5), listField("arr2", "b's own nodes", 5), listField("arr3", "shared tail", 4)], defaults: { arr: [3, 6, 9], arr2: [10], arr3: [15, 30] } },
  checkpoints: [
    { q: "a has 3 own nodes, b has 1, and they share 2. how many steps until p and q meet?", options: ["5", "7", "4"], answer: 1, right: "right — p walks 3 + 2 + 1 (null) + 1 = 7 and q walks 1 + 2 + 1 + 3 = 7, so they land on the first shared node together.", wrong: "write out each path: own part, shared part, the step onto null, then the other list's own part." },
    { q: "why must we compare node identity and not values?", options: ["values are slower to compare", "two different nodes can hold the same value without being shared", "values can be negative"], answer: 1, right: "exactly — sharing means the same node.", wrong: "could a's list and b's list both contain a 7 that isn't shared?" },
  ],
};

export const pairsDLL: Problem = {
  slug: "pairs-sum-dll",
  topic: "linked-list",
  sheet: [21],
  title: "find pairs with a given sum in a doubly linked list",
  sheetTitle: "Find pairs with a given sum in a DLL.",
  pattern: "ll-hash-walk",
  also: ["two pointers"],
  difficulty: "easy",
  summary: "a sorted DLL can be squeezed from both ends, just like a sorted array.",
  intro: "given a sorted doubly linked list of distinct values and a target x, list every pair of nodes whose values add up to x.",
  example: { input: "1 ⇄ 2 ⇄ 4 ⇄ 5 ⇄ 6 ⇄ 8 ⇄ 9, x = 7", output: "(1, 6) (2, 5)", why: "1 + 6 = 7 and 2 + 5 = 7." },
  clues: ["sorted + pair sum → two pointers from both ends.", "prev pointers let the right pointer move backwards.", "stop when the pointers meet or cross."],
  approaches: [
    {
      level: "brute", name: "every pair", idea: "for each node, check every later node.",
      walkthrough: ["nested loops over the list."], pseudocode: "for a in list: for b after a: if a+b = x: record",
      code: { js: `function pairs(head, x) {\n  const out = [];\n  for (let a = head; a; a = a.next) for (let b = a.next; b; b = b.next) if (a.val + b.val === x) out.push([a.val, b.val]);\n  return out;\n}`, py: `def pairs(head, x):\n    out, a = [], head\n    while a:\n        b = a.next\n        while b:\n            if a.val + b.val == x: out.append((a.val, b.val))\n            b = b.next\n        a = a.next\n    return out` },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "all pairs.", spaceWhy: "no extra structures.", ops: (n) => (n * n) / 2 },
      pros: ["works unsorted."], cons: ["quadratic."],
    },
    {
      level: "optimal", name: "two pointers from both ends", idea: "first at the head, second at the tail. sum too small → first = first.next; too big → second = second.prev; equal → record and move both.",
      walkthrough: ["walk to the tail for the second pointer.", "compare the sum with x and move one or both pointers.", "stop when they meet or cross."],
      pseudocode: "first ← head; second ← tail\nwhile first ≠ second and second.next ≠ first\n  s ← first.val + second.val\n  if s = x: record; first ← first.next; second ← second.prev\n  elif s < x: first ← first.next\n  else: second ← second.prev",
      code: {
        js: `function pairs(head, x) {
  let first = head, second = head; // @init
  while (second.next) second = second.next; // @init
  const out = [];
  while (first !== second && second.next !== first) {
    const s = first.val + second.val;
    if (s === x) { out.push([first.val, second.val]); first = first.next; second = second.prev; } // @hit
    else if (s < x) first = first.next; // @less
    else second = second.prev; // @more
  }
  return out; // @done
}`,
        py: `def pairs(head, x):
    first = second = head  # @init
    while second.next: second = second.next  # @init
    out = []
    while first is not second and second.next is not first:
        s = first.val + second.val
        if s == x: out.append((first.val, second.val)); first, second = first.next, second.prev  # @hit
        elif s < x: first = first.next  # @less
        else: second = second.prev  # @more
    return out  # @done`,
        java: `static List<int[]> pairs(Node head, int x) {
    Node first = head, second = head; // @init
    while (second.next != null) second = second.next; // @init
    List<int[]> out = new ArrayList<>();
    while (first != second && second.next != first) {
        int s = first.val + second.val;
        if (s == x) { out.add(new int[]{first.val, second.val}); first = first.next; second = second.prev; } // @hit
        else if (s < x) first = first.next; // @less
        else second = second.prev; // @more
    }
    return out; // @done
}`,
        cpp: `vector<pair<int,int>> pairs(Node* head, int x) {
    Node *first = head, *second = head; // @init
    while (second->next) second = second->next; // @init
    vector<pair<int,int>> out;
    while (first != second && second->next != first) {
        int s = first->val + second->val;
        if (s == x) { out.push_back({first->val, second->val}); first = first->next; second = second->prev; } // @hit
        else if (s < x) first = first->next; // @less
        else second = second->prev; // @more
    }
    return out; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "each step moves at least one pointer inward.", spaceWhy: "two pointers (plus the output).", ops: (n) => n },
      pros: ["linear, no hash set."], cons: ["needs sorted input and prev links."],
      tracer: "ll-pairs-dll",
    },
  ],
  input: { arrays: [listField("arr", "sorted distinct values", 9, { check: distinctSorted })], scalars: [{ key: "target", label: "target sum x", min: -198, max: 198 }], defaults: { arr: [1, 2, 4, 5, 6, 8, 9], target: 7 } },
  checkpoints: [
    { q: "why does this need a DOUBLY linked list?", options: ["to store the sum", "the right pointer has to move backwards", "for sorting"], answer: 1, right: "exactly — prev makes second = second.prev O(1).", wrong: "which pointer moves towards the head, and how?" },
    { q: "the loop condition includes second.next != first. why?", options: ["it detects the pointers crossing", "it detects the tail", "no reason"], answer: 0, right: "right — after crossing, every pair would be counted twice.", wrong: "what happens after first passes second?" },
  ],
};

export const tripletsDLL: Problem = {
  slug: "triplets-sum-dll",
  topic: "linked-list",
  sheet: [22],
  title: "count triplets in a sorted DLL with a given sum",
  sheetTitle: "Count triplets in a sorted DLL whose sum is equal to given value “X”.",
  pattern: "ll-hash-walk",
  also: ["two pointers"],
  difficulty: "medium",
  summary: "fix one node, then two-pointer the rest.",
  intro: "given a sorted doubly linked list of distinct values and a value x, count the triplets of nodes whose values sum to x.",
  example: { input: "1 ⇄ 2 ⇄ 4 ⇄ 5 ⇄ 6 ⇄ 8 ⇄ 9, x = 17", output: "2", why: "2 + 6 + 9 and 4 + 5 + 8." },
  clues: ["a triplet is one fixed value plus a pair.", "the pair can be found with two pointers because the list is sorted.", "O(n²) instead of O(n³)."],
  approaches: [
    {
      level: "brute", name: "three nested loops", idea: "try every combination of three nodes.",
      walkthrough: ["i < j < k over the list."], pseudocode: "for a: for b after a: for c after b: if a+b+c = x: count++",
      code: { js: `function countTriplets(head, x) {\n  let count = 0;\n  for (let a = head; a; a = a.next)\n    for (let b = a.next; b; b = b.next)\n      for (let c = b.next; c; c = c.next) if (a.val + b.val + c.val === x) count++;\n  return count;\n}`, py: `def count_triplets(head, x):\n    count, a = 0, head\n    while a:\n        b = a.next\n        while b:\n            c = b.next\n            while c:\n                if a.val + b.val + c.val == x: count += 1\n                c = c.next\n            b = b.next\n        a = a.next\n    return count` },
      complexity: { time: "O(n³)", space: "O(1)", timeWhy: "all triplets.", spaceWhy: "no extra structures.", ops: (n) => (n * n * n) / 6 },
      pros: ["obvious."], cons: ["cubic."],
    },
    {
      level: "optimal", name: "fix one, two pointers for the pair", idea: "for each node c, run the pair-sum squeeze on the nodes after it with target x − c.val.",
      walkthrough: ["find the tail once.", "for each c: l = c.next, r = tail.", "sum == x → count, move both; smaller → l forward; bigger → r back."],
      pseudocode: "for c in list\n  l ← c.next; r ← tail\n  while l ≠ r and r.next ≠ l\n    s ← c+l+r\n    if s = x: count++; l ← l.next; r ← r.prev\n    elif s < x: l ← l.next else r ← r.prev",
      code: {
        js: `function countTriplets(head, x) {
  let count = 0, last = head; // @init
  while (last.next) last = last.next;
  for (let c = head; c; c = c.next) { // @fix
    let l = c.next, r = last;
    while (l && r && l !== r && r.next !== l) {
      const s = c.val + l.val + r.val;
      if (s === x) { count++; l = l.next; r = r.prev; } // @hit
      else if (s < x) l = l.next; // @less
      else r = r.prev; // @more
    }
  }
  return count; // @done
}`,
        py: `def count_triplets(head, x):
    count, last = 0, head  # @init
    while last.next: last = last.next
    c = head
    while c:  # @fix
        l, r = c.next, last
        while l and r and l is not r and r.next is not l:
            s = c.val + l.val + r.val
            if s == x: count += 1; l, r = l.next, r.prev  # @hit
            elif s < x: l = l.next  # @less
            else: r = r.prev  # @more
        c = c.next
    return count  # @done`,
        java: `static int countTriplets(Node head, int x) {
    int count = 0; Node last = head; // @init
    while (last.next != null) last = last.next;
    for (Node c = head; c != null; c = c.next) { // @fix
        Node l = c.next, r = last;
        while (l != null && r != null && l != r && r.next != l) {
            int s = c.val + l.val + r.val;
            if (s == x) { count++; l = l.next; r = r.prev; } // @hit
            else if (s < x) l = l.next; // @less
            else r = r.prev; // @more
        }
    }
    return count; // @done
}`,
        cpp: `int countTriplets(Node* head, int x) {
    int count = 0; Node* last = head; // @init
    while (last->next) last = last->next;
    for (Node* c = head; c; c = c->next) { // @fix
        Node *l = c->next, *r = last;
        while (l && r && l != r && r->next != l) {
            int s = c->val + l->val + r->val;
            if (s == x) { count++; l = l->next; r = r->prev; } // @hit
            else if (s < x) l = l->next; // @less
            else r = r->prev; // @more
        }
    }
    return count; // @done
}`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "n fixed nodes × a linear squeeze.", spaceWhy: "a few pointers.", ops: (n) => (n * n) / 2 },
      pros: ["quadratic, constant memory."], cons: ["relies on sorted, distinct values."],
      tracer: "ll-triplets-dll",
    },
  ],
  input: { arrays: [listField("arr", "sorted distinct values", 9, { check: distinctSorted })], scalars: [{ key: "target", label: "target sum x", min: -300, max: 300 }], defaults: { arr: [1, 2, 4, 5, 6, 8, 9], target: 17 } },
  checkpoints: [
    { q: "with c fixed at 2 and x = 17, what pair sum do we look for?", options: ["17", "15", "19"], answer: 1, right: "right — 17 − 2.", wrong: "the fixed value already contributes 2…" },
    { q: "why only look at nodes after c?", options: ["to avoid counting the same triplet more than once", "because earlier nodes are smaller", "speed only"], answer: 0, right: "exactly — each triplet is counted once, by its smallest member.", wrong: "if c could pair with earlier nodes, how many times would (2, 6, 9) be counted?" },
  ],
};

export const cloneRandom: Problem = {
  slug: "clone-random-list",
  topic: "linked-list",
  sheet: [30],
  title: "clone a linked list with next and random pointers",
  sheetTitle: "Clone a linked list with next and random pointer",
  pattern: "ll-hash-walk",
  also: ["interleaving"],
  difficulty: "hard",
  summary: "deep-copy a list whose nodes also point at random other nodes.",
  intro: "each node has a next pointer and a random pointer that may point to any node in the list (or null). build a completely separate copy with the same values and the same next/random structure.",
  example: { input: "1 → 2 → 3 → 4, randoms: 1↝2, 2↝1, 3↝null, 4↝3", output: "a new 1 → 2 → 3 → 4 with the same randoms", why: "every copied random points to the corresponding copied node." },
  clues: ["copying random requires knowing 'the copy of node x'.", "a hash map old → new answers that directly.", "weaving each copy right after its original answers it without a map: copy(x) = x.next."],
  approaches: [
    {
      level: "brute", name: "hash map old → copy", idea: "first pass: create a copy of every node and remember it in a map. second pass: set each copy's next and random through the map.",
      walkthrough: ["map[x] = new node with x's value.", "map[x].next = map[x.next]; map[x].random = map[x.random]."], pseudocode: "for x: map[x] ← copy of x\nfor x: map[x].next ← map[x.next]; map[x].random ← map[x.random]",
      code: { js: `function clone(head) {\n  const map = new Map();\n  for (let c = head; c; c = c.next) map.set(c, { val: c.val, next: null, random: null });\n  for (let c = head; c; c = c.next) {\n    map.get(c).next = map.get(c.next) || null;\n    map.get(c).random = map.get(c.random) || null;\n  }\n  return map.get(head) || null;\n}`, py: `def clone(head):\n    m, c = {}, head\n    while c: m[c] = Node(c.val); c = c.next\n    c = head\n    while c:\n        m[c].next = m.get(c.next); m[c].random = m.get(c.random); c = c.next\n    return m.get(head)` },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "two passes.", spaceWhy: "the map.", ops: (n) => 2 * n },
      pros: ["clear and robust."], cons: ["O(n) extra map."],
    },
    {
      level: "optimal", name: "interleave copies", idea: "insert each copy right after its original. then copy.random = original.random.next. finally unweave the two lists.",
      walkthrough: ["pass 1: A → A' → B → B' → …", "pass 2: A'.random = A.random.next.", "pass 3: restore originals' next and link the copies together."],
      pseudocode: "for c: insert copy after c\nfor c: c.next.random ← c.random ? c.random.next : null\nfor c: copy ← c.next; c.next ← copy.next; copy.next ← copy.next?.next",
      code: {
        js: `function clone(head) {
  if (!head) return null; // @init
  for (let c = head; c; c = c.next.next) c.next = { val: c.val, next: c.next, random: null }; // @weave
  for (let c = head; c; c = c.next.next) if (c.random) c.next.random = c.random.next; // @random
  const copyHead = head.next; // @split
  for (let c = head; c; c = c.next) {
    const copy = c.next; c.next = copy.next; // @split
    copy.next = copy.next ? copy.next.next : null; // @split
  }
  return copyHead; // @done
}`,
        py: `def clone(head):
    if head is None: return None  # @init
    c = head
    while c:
        n = Node(c.val); n.next = c.next; c.next = n; c = n.next  # @weave
    c = head
    while c:
        if c.random: c.next.random = c.random.next  # @random
        c = c.next.next
    copy_head, c = head.next, head  # @split
    while c:
        copy = c.next; c.next = copy.next  # @split
        copy.next = copy.next.next if copy.next else None  # @split
        c = c.next
    return copy_head  # @done`,
        java: `static Node clone(Node head) {
    if (head == null) return null; // @init
    for (Node c = head; c != null; c = c.next.next) { Node n = new Node(c.val); n.next = c.next; c.next = n; } // @weave
    for (Node c = head; c != null; c = c.next.next) if (c.random != null) c.next.random = c.random.next; // @random
    Node copyHead = head.next; // @split
    for (Node c = head; c != null; c = c.next) {
        Node copy = c.next; c.next = copy.next; // @split
        copy.next = (copy.next != null) ? copy.next.next : null; // @split
    }
    return copyHead; // @done
}`,
        cpp: `Node* clone(Node* head) {
    if (!head) return nullptr; // @init
    for (Node* c = head; c; c = c->next->next) { Node* n = new Node(c->val); n->next = c->next; c->next = n; } // @weave
    for (Node* c = head; c; c = c->next->next) if (c->random) c->next->random = c->random->next; // @random
    Node* copyHead = head->next; // @split
    for (Node* c = head; c; c = c->next) {
        Node* copy = c->next; c->next = copy->next; // @split
        copy->next = copy->next ? copy->next->next : nullptr; // @split
    }
    return copyHead; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1) extra", timeWhy: "three linear passes.", spaceWhy: "no map — the list itself stores the old → new mapping temporarily.", ops: (n) => 3 * n },
      pros: ["no extra memory besides the copies."], cons: ["temporarily modifies the original list."],
      tracer: "ll-clone-random",
    },
  ],
  input: {
    arrays: [listField("arr", "values", 6), { key: "arr2", label: "random target index per node (−1 = null)", min: -1, max: 5, minLen: 1, maxLen: 6 }],
    defaults: { arr: [1, 2, 3, 4], arr2: [1, 0, -1, 2] },
    check: (i) => ((i.arr2 ?? []).length !== i.arr.length ? "give one random index per node." : (i.arr2 ?? []).some((x) => x >= i.arr.length) ? "random indexes must point inside the list." : null),
  },
  checkpoints: [
    { q: "after weaving, where is the copy of node x?", options: ["x.random", "x.next", "at the end"], answer: 1, right: "right — that's what makes copy.random = x.random.next work.", wrong: "each copy was inserted directly after its original…" },
    { q: "why can't we just copy next pointers and values?", options: ["randoms would still point to ORIGINAL nodes", "values would be lost", "it would be too slow"], answer: 0, right: "exactly — the copy must be fully independent.", wrong: "a shallow copy of random still points where?" },
  ],
};

export const firstNonRepeating: Problem = {
  slug: "first-non-repeating-stream",
  topic: "linked-list",
  sheet: [36],
  title: "first non-repeating character in a stream",
  sheetTitle: "Find the first non-repeating character from a stream of characters",
  pattern: "ll-hash-walk",
  also: ["queue", "doubly linked list + hash map"],
  difficulty: "medium",
  summary: "after every character, report the oldest character seen exactly once.",
  intro: "characters arrive one at a time. after each one, output the first character (in arrival order) that has appeared exactly once so far, or '#' if there is none.",
  example: { input: "a a b c", output: "a # b b", why: "after 'a': a · after 'aa': none · after 'aab': b · after 'aabc': b." },
  clues: ["the answer is the oldest unique character — a queue-like order.", "a character can stop being unique at any time and must leave the middle of that order in O(1).", "doubly linked list (order) + hash map (character → node) gives O(1) insert and delete."],
  approaches: [
    {
      level: "brute", name: "re-scan the prefix each time", idea: "after each character, count frequencies of the whole prefix and scan it for the first count of 1.",
      walkthrough: ["for each prefix: count characters.", "scan the prefix for the first with count 1."], pseudocode: "for i: counts ← freq(stream[0..i]); answer ← first char with count 1",
      code: { js: `function firstNonRepeating(s) {\n  let out = "";\n  for (let i = 0; i < s.length; i++) {\n    const cnt = {};\n    for (let j = 0; j <= i; j++) cnt[s[j]] = (cnt[s[j]] || 0) + 1;\n    let ans = "#";\n    for (let j = 0; j <= i; j++) if (cnt[s[j]] === 1) { ans = s[j]; break; }\n    out += ans;\n  }\n  return out;\n}`, py: `from collections import Counter\ndef first_non_repeating(s):\n    out = []\n    for i in range(len(s)):\n        cnt = Counter(s[:i + 1])\n        out.append(next((ch for ch in s[:i + 1] if cnt[ch] == 1), "#"))\n    return "".join(out)` },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "each prefix is rescanned.", spaceWhy: "26 counters.", ops: (n) => n * n },
      pros: ["simple."], cons: ["quadratic — no good for a real stream."],
    },
    {
      level: "optimal", name: "doubly linked list + hash map", idea: "keep unique characters in a doubly linked list in arrival order, with a map from character to its node. a second occurrence unlinks the node in O(1) and marks the character as repeated. the head is always the answer.",
      walkthrough: ["new character → append a node and map it.", "second occurrence → unlink its node, mark repeated.", "already repeated → ignore.", "answer = head's character, or '#'."],
      pseudocode: "for ch in stream\n  if ch not repeated\n    if ch not in map: append node(ch); map[ch] ← node\n    else: unlink map[ch]; delete map[ch]; mark ch repeated\n  output head ? head.ch : '#'",
      code: {
        js: `function firstNonRepeating(stream) {
  const inList = new Map(), repeated = new Set(), dll = new DoublyLinkedList(); // @init
  let out = "";
  for (const ch of stream) {
    if (!repeated.has(ch)) {
      if (!inList.has(ch)) inList.set(ch, dll.append(ch)); // @add
      else { dll.remove(inList.get(ch)); inList.delete(ch); repeated.add(ch); } // @remove
    }
    out += dll.head ? dll.head.val : "#"; // @answer
  }
  return out; // @done
}`,
        py: `from collections import OrderedDict
def first_non_repeating(stream):
    in_list, repeated = OrderedDict(), set()  # an OrderedDict is a DLL + hash map  # @init
    out = []
    for ch in stream:
        if ch not in repeated:
            if ch not in in_list: in_list[ch] = True  # @add
            else: del in_list[ch]; repeated.add(ch)  # @remove
        out.append(next(iter(in_list)) if in_list else "#")  # @answer
    return "".join(out)  # @done`,
        java: `static String firstNonRepeating(String stream) {
    LinkedHashSet<Character> inList = new LinkedHashSet<>(); // a DLL + hash map // @init
    Set<Character> repeated = new HashSet<>();
    StringBuilder out = new StringBuilder();
    for (char ch : stream.toCharArray()) {
        if (!repeated.contains(ch)) {
            if (!inList.contains(ch)) inList.add(ch); // @add
            else { inList.remove(ch); repeated.add(ch); } // @remove
        }
        out.append(inList.isEmpty() ? '#' : inList.iterator().next()); // @answer
    }
    return out.toString(); // @done
}`,
        cpp: `string firstNonRepeating(const string& stream) {
    list<char> dll; unordered_map<char, list<char>::iterator> inList; // @init
    unordered_set<char> repeated; string out;
    for (char ch : stream) {
        if (!repeated.count(ch)) {
            if (!inList.count(ch)) inList[ch] = dll.insert(dll.end(), ch); // @add
            else { dll.erase(inList[ch]); inList.erase(ch); repeated.insert(ch); } // @remove
        }
        out += dll.empty() ? '#' : dll.front(); // @answer
    }
    return out; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(alphabet)", timeWhy: "O(1) work per character.", spaceWhy: "at most one node and one map entry per distinct character.", ops: (n) => n },
      pros: ["O(1) per character — works for a live stream."], cons: ["two structures to keep in sync."],
      tracer: "ll-first-unique",
    },
  ],
  input: { arrays: [{ key: "arr", label: "stream of letters (a–z)", letters: true, minLen: 1, maxLen: 10 }], defaults: { arr: [97, 97, 98, 99] } },
  checkpoints: [
    { q: "why a doubly linked list rather than a plain queue?", options: ["queues are slower", "a repeated character must be removed from the MIDDLE in O(1)", "to sort the characters"], answer: 1, right: "exactly — with the map, we jump to the node and unlink it.", wrong: "when 'b' repeats, where in the order is it?" },
    { q: "stream 'z z': outputs?", options: ["z z", "z #", "# #"], answer: 1, right: "right — after the second z, nothing is unique.", wrong: "after the first z it's unique; after the second…" },
  ],
};
