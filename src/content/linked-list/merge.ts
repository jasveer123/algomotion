import type { Problem } from "@/lib/types";

const lg = (n: number) => Math.max(1, Math.log2(Math.max(2, n)));
const listField = (key: "arr" | "arr2" | "arr3", label: string, maxLen = 7, sorted = false) => ({ key, label, min: -99, max: 99, minLen: 1, maxLen, ...(sorted ? { sorted: true } : {}) });

export const intersectSorted: Problem = {
  slug: "intersection-sorted-lists",
  topic: "linked-list",
  sheet: [11],
  title: "intersection of two sorted linked lists",
  sheetTitle: "Intersection of two Sorted Linked List.",
  pattern: "ll-merge",
  difficulty: "easy",
  summary: "build a new list of the values present in both sorted lists.",
  intro: "given two sorted linked lists, create a new sorted list containing the values common to both (repeated common values are included as many times as they appear in both).",
  example: { input: "a: 1 → 2 → 3 → 4 → 6, b: 2 → 4 → 6 → 8", output: "2 → 4 → 6", why: "2, 4 and 6 appear in both." },
  clues: ["two sorted inputs → walk them together, like a merge.", "the smaller front value can't match anything later in the other list.", "a dummy head makes building the result list easy."],
  approaches: [
    {
      level: "brute", name: "check each value of a against all of b", idea: "for every node of a, scan b for an unused equal value.",
      walkthrough: ["for each value in a, search b.", "append matches to the result."], pseudocode: "for x in a: if x in b (unused): append x",
      code: { js: `function intersect(a, b) {\n  const used = new Set(), out = [];\n  for (let x = a; x; x = x.next)\n    for (let y = b; y; y = y.next)\n      if (!used.has(y) && y.val === x.val) { used.add(y); out.push(x.val); break; }\n  return out;\n}`, py: `def intersect(a, b):\n    used, out, x = set(), [], a\n    while x:\n        y = b\n        while y:\n            if y not in used and y.val == x.val:\n                used.add(y); out.append(x.val); break\n            y = y.next\n        x = x.next\n    return out` },
      complexity: { time: "O(n·m)", space: "O(m)", timeWhy: "a scan of b for every node of a.", spaceWhy: "the used set.", ops: (n) => (n * n) / 2 },
      pros: ["works for unsorted lists."], cons: ["ignores the sorted order."],
    },
    {
      level: "optimal", name: "two pointers", idea: "compare the fronts: equal → append a new node and advance both; otherwise advance the smaller one.",
      walkthrough: ["dummy head + tail pointer for the result.", "a.val == b.val → append, move both.", "else move the smaller.", "stop when either list ends."],
      pseudocode: "while a and b\n  if a.val = b.val: append a.val; a ← a.next; b ← b.next\n  elif a.val < b.val: a ← a.next\n  else: b ← b.next",
      code: {
        js: `function intersect(a, b) {
  const dummy = { next: null }; let tail = dummy; // @init
  while (a && b) {
    if (a.val === b.val) { // @match
      tail.next = { val: a.val, next: null }; tail = tail.next; // @match
      a = a.next; b = b.next;
    } else if (a.val < b.val) a = a.next; // @advance
    else b = b.next; // @advance
  }
  return dummy.next; // @done
}`,
        py: `def intersect(a, b):
    dummy = tail = Node(0)  # @init
    while a and b:
        if a.val == b.val:  # @match
            tail.next = Node(a.val); tail = tail.next  # @match
            a, b = a.next, b.next
        elif a.val < b.val: a = a.next  # @advance
        else: b = b.next  # @advance
    return dummy.next  # @done`,
        java: `static Node intersect(Node a, Node b) {
    Node dummy = new Node(0), tail = dummy; // @init
    while (a != null && b != null) {
        if (a.val == b.val) { // @match
            tail.next = new Node(a.val); tail = tail.next; // @match
            a = a.next; b = b.next;
        } else if (a.val < b.val) a = a.next; // @advance
        else b = b.next; // @advance
    }
    return dummy.next; // @done
}`,
        cpp: `Node* intersect(Node* a, Node* b) {
    Node dummy(0); Node* tail = &dummy; // @init
    while (a && b) {
        if (a->val == b->val) { // @match
            tail->next = new Node(a->val); tail = tail->next; // @match
            a = a->next; b = b->next;
        } else if (a->val < b->val) a = a->next; // @advance
        else b = b->next; // @advance
    }
    return dummy.next; // @done
}`,
      },
      complexity: { time: "O(n + m)", space: "O(1) extra", timeWhy: "each step moves at least one pointer.", spaceWhy: "only the output nodes.", ops: (n) => n },
      pros: ["linear, uses the sorted order."], cons: ["sorted inputs only."],
      tracer: "ll-intersect-sorted",
    },
  ],
  input: { arrays: [listField("arr", "a (sorted)", 7, true), listField("arr2", "b (sorted)", 7, true)], defaults: { arr: [1, 2, 3, 4, 6], arr2: [2, 4, 6, 8] } },
  checkpoints: [
    { q: "fronts are 3 (in a) and 4 (in b). what moves?", options: ["a's pointer", "b's pointer", "both"], answer: 0, right: "right — 3 can't appear later in b, which only grows.", wrong: "which of the two values can no longer match anything?" },
    { q: "why a dummy head for the result?", options: ["to store the length", "so appending the first node needs no special case", "for sorting"], answer: 1, right: "exactly.", wrong: "without it, the first append has to set the head separately…" },
  ],
};

const quickCode = {
  js: `function quickSort(low, high) {
  if (!low || !high || low === high) return; // @base
  const p = partition(low, high);
  if (p !== low) { let q = low; while (q.next !== p) q = q.next; quickSort(low, q); }
  if (p !== high) quickSort(p.next, high);
}
function partition(low, high) {
  const pivot = high.val; // @pivot
  let i = low;
  for (let j = low; j !== high; j = j.next) { // @scan
    if (j.val < pivot) { [i.val, j.val] = [j.val, i.val]; i = i.next; } // @swap
  }
  [i.val, high.val] = [high.val, i.val]; // @place
  return i;
} // @done`,
  py: `def quick_sort(low, high):
    if low is None or high is None or low is high:
        return  # @base
    p = partition(low, high)
    if p is not low:
        q = low
        while q.next is not p: q = q.next
        quick_sort(low, q)
    if p is not high:
        quick_sort(p.next, high)

def partition(low, high):
    pivot, i, j = high.val, low, low  # @pivot
    while j is not high:  # @scan
        if j.val < pivot:
            i.val, j.val = j.val, i.val; i = i.next  # @swap
        j = j.next
    i.val, high.val = high.val, i.val  # @place
    return i  # @done`,
  java: `static void quickSort(Node low, Node high) {
    if (low == null || high == null || low == high) return; // @base
    Node p = partition(low, high);
    if (p != low) { Node q = low; while (q.next != p) q = q.next; quickSort(low, q); }
    if (p != high) quickSort(p.next, high);
}
static Node partition(Node low, Node high) {
    int pivot = high.val; // @pivot
    Node i = low;
    for (Node j = low; j != high; j = j.next) { // @scan
        if (j.val < pivot) { int t = i.val; i.val = j.val; j.val = t; i = i.next; } // @swap
    }
    int t = i.val; i.val = high.val; high.val = t; // @place
    return i; // @done
}`,
  cpp: `Node* partition(Node* low, Node* high) {
    int pivot = high->val; // @pivot
    Node* i = low;
    for (Node* j = low; j != high; j = j->next) { // @scan
        if (j->val < pivot) { swap(i->val, j->val); i = i->next; } // @swap
    }
    swap(i->val, high->val); // @place
    return i; // @done
}
void quickSort(Node* low, Node* high) {
    if (!low || !high || low == high) return; // @base
    Node* p = partition(low, high);
    if (p != low) { Node* q = low; while (q->next != p) q = q->next; quickSort(low, q); }
    if (p != high) quickSort(p->next, high);
}`,
};

export const quickSortList: Problem = {
  slug: "quicksort-linked-list",
  topic: "linked-list",
  sheet: [14],
  title: "quicksort for linked lists",
  sheetTitle: "Quicksort for Linked Lists.[Very Important]",
  pattern: "ll-merge",
  also: ["partition", "divide and conquer"],
  difficulty: "medium",
  summary: "partition around the last node's value, then sort both sides.",
  intro: "sort a linked list with quicksort. pick the last node's value as the pivot, move smaller values towards the front of the range, put the pivot in its final place, and recurse on both sides.",
  example: { input: "1 → 6 → 2 → 12 → 56 → 3", output: "1 → 2 → 3 → 6 → 12 → 56", why: "the same nodes, values rearranged in order." },
  clues: ["quicksort = partition + recurse on both sides.", "on a list, 'swap' is easiest as swapping values between two nodes.", "the partition only needs forward walks — no index access."],
  approaches: [
    {
      level: "brute", name: "copy, sort, write back", idea: "copy the values into an array, sort it, and write the values back.",
      walkthrough: ["copy values.", "sort.", "write back."], pseudocode: "vals ← values; sort; write back",
      code: { js: `function sortList(head) {\n  const v = [];\n  for (let c = head; c; c = c.next) v.push(c.val);\n  v.sort((a, b) => a - b);\n  let i = 0;\n  for (let c = head; c; c = c.next) c.val = v[i++];\n  return head;\n}`, py: `def sort_list(head):\n    v, c = [], head\n    while c: v.append(c.val); c = c.next\n    v.sort()\n    c, i = head, 0\n    while c: c.val = v[i]; c, i = c.next, i + 1\n    return head` },
      complexity: { time: "O(n log n)", space: "O(n)", timeWhy: "the array sort.", spaceWhy: "an array of all values.", ops: (n) => n * lg(n) + 2 * n },
      pros: ["simple."], cons: ["extra array."],
    },
    {
      level: "optimal", name: "lomuto partition on the list", idea: "pivot = high's value. walk j from low to high; each value smaller than the pivot is swapped into position i, which then moves forward. finally swap the pivot into i and recurse on both sides.",
      walkthrough: ["pivot = last node's value.", "i = low; for j from low to before high: if j.val < pivot, swap values of i and j, i = i.next.", "swap i and high: the pivot is placed.", "recurse on [low, node before i] and [i.next, high]."],
      pseudocode: "partition(low, high):\n  pivot ← high.val; i ← low\n  for j from low until high: if j.val < pivot: swap(i.val, j.val); i ← i.next\n  swap(i.val, high.val); return i",
      code: quickCode,
      complexity: { time: "O(n log n) average", space: "O(log n) average", timeWhy: "balanced partitions give log n levels; an already sorted list gives O(n²).", spaceWhy: "recursion depth.", ops: (n) => n * lg(n) },
      pros: ["in place."], cons: ["worst case O(n²) — and on a list you can't cheaply pick a random pivot.", "finding the node before the pivot costs an extra walk."],
      tracer: "ll-quick-sort",
    },
  ],
  input: { arrays: [listField("arr", "list values", 8)], defaults: { arr: [1, 6, 2, 12, 56, 3] } },
  checkpoints: [
    { q: "after a partition, what's special about the pivot's node?", options: ["it's the head", "its value is in its final sorted position", "it's the middle"], answer: 1, right: "right — everything before is smaller, everything after is not.", wrong: "what does the partition guarantee about the values around the pivot?" },
    { q: "why is picking a random pivot awkward on a linked list?", options: ["it isn't", "reaching a random node costs O(n) walking", "lists can't store random numbers"], answer: 1, right: "exactly — no index access.", wrong: "how do you get to the 7th node of a list?" },
  ],
};

export const sortKSorted: Problem = {
  slug: "sort-k-sorted-dll",
  topic: "linked-list",
  sheet: [23],
  title: "sort a k-sorted doubly linked list",
  sheetTitle: "Sort a “k”sorted Doubly Linked list.[Very IMP]",
  pattern: "ll-merge",
  also: ["min-heap"],
  difficulty: "hard",
  summary: "every node is at most k places from home — a heap of size k + 1 sorts it in O(n log k).",
  intro: "each node of a doubly linked list is at most k positions away from where it belongs in sorted order. sort the list efficiently.",
  example: { input: "3 ⇄ 6 ⇄ 2 ⇄ 12 ⇄ 56 ⇄ 8, k = 2", output: "2 ⇄ 3 ⇄ 6 ⇄ 8 ⇄ 12 ⇄ 56", why: "every value moved at most two places." },
  clues: ["'at most k away' → the smallest remaining value is among the next k + 1 nodes.", "repeatedly taking the minimum of a sliding group = min-heap.", "cost O(n log k) instead of O(n log n)."],
  approaches: [
    {
      level: "brute", name: "insertion sort", idea: "insertion sort is fast on nearly sorted input: each node moves back at most k places.",
      walkthrough: ["for each node, move it backwards while its value is smaller than the previous one."], pseudocode: "for each node: bubble it back while prev.val > node.val",
      code: { js: `function sortK(head) {\n  for (let c = head ? head.next : null; c; c = c.next) {\n    let p = c;\n    while (p.prev && p.prev.val > p.val) { [p.prev.val, p.val] = [p.val, p.prev.val]; p = p.prev; }\n  }\n  return head;\n}`, py: `def sort_k(head):\n    c = head.next if head else None\n    while c:\n        p = c\n        while p.prev and p.prev.val > p.val:\n            p.prev.val, p.val = p.val, p.prev.val; p = p.prev\n        c = c.next\n    return head` },
      complexity: { time: "O(n·k)", space: "O(1)", timeWhy: "each node moves back at most k places.", spaceWhy: "in place.", ops: (n) => n * 3 },
      pros: ["tiny code, no heap."], cons: ["O(n·k) — slow when k is large."],
    },
    {
      level: "optimal", name: "min-heap of k + 1 nodes", idea: "keep the next k + 1 nodes in a min-heap; repeatedly pop the minimum, link it to the output (fixing prev), and push the next input node.",
      walkthrough: ["push the first k + 1 nodes.", "pop the minimum and append it to the result (both links).", "push the next input node, if any.", "repeat until the heap is empty."],
      pseudocode: "heap ← first k+1 nodes\nwhile heap not empty\n  m ← pop min; append m (set prev and next)\n  if input remains: push next node",
      code: {
        js: `// MinHeap: any binary heap ordered by node.val
function sortKSorted(head, k) {
  const heap = new MinHeap((a, b) => a.val - b.val); // @init
  const dummy = { next: null }; let tail = dummy;
  let c = head;
  for (let i = 0; i <= k && c; i++, c = c.next) heap.push(c); // @fill
  while (heap.size) {
    const m = heap.pop(); // @pop
    tail.next = m; m.prev = tail === dummy ? null : tail; tail = m; // @pop
    if (c) { heap.push(c); c = c.next; } // @push
  }
  tail.next = null; // @done
  return dummy.next;
}`,
        py: `import heapq
def sort_k_sorted(head, k):
    heap, c, i = [], head, 0  # @init
    while c and i <= k:
        heapq.heappush(heap, (c.val, id(c), c)); c = c.next; i += 1  # @fill
    dummy = tail = Node(0)
    while heap:
        _, _, m = heapq.heappop(heap)  # @pop
        tail.next = m; m.prev = None if tail is dummy else tail; tail = m  # @pop
        if c:
            heapq.heappush(heap, (c.val, id(c), c)); c = c.next  # @push
    tail.next = None  # @done
    return dummy.next`,
        java: `static Node sortKSorted(Node head, int k) {
    PriorityQueue<Node> heap = new PriorityQueue<>((a, b) -> a.val - b.val); // @init
    Node dummy = new Node(0), tail = dummy, c = head;
    for (int i = 0; i <= k && c != null; i++, c = c.next) heap.add(c); // @fill
    while (!heap.isEmpty()) {
        Node m = heap.poll(); // @pop
        tail.next = m; m.prev = (tail == dummy) ? null : tail; tail = m; // @pop
        if (c != null) { heap.add(c); c = c.next; } // @push
    }
    tail.next = null; // @done
    return dummy.next;
}`,
        cpp: `Node* sortKSorted(Node* head, int k) {
    auto cmp = [](Node* a, Node* b) { return a->val > b->val; };
    priority_queue<Node*, vector<Node*>, decltype(cmp)> heap(cmp); // @init
    Node dummy(0); Node *tail = &dummy, *c = head;
    for (int i = 0; i <= k && c; i++, c = c->next) heap.push(c); // @fill
    while (!heap.empty()) {
        Node* m = heap.top(); heap.pop(); // @pop
        tail->next = m; m->prev = (tail == &dummy) ? nullptr : tail; tail = m; // @pop
        if (c) { heap.push(c); c = c->next; } // @push
    }
    tail->next = nullptr; // @done
    return dummy.next;
}`,
      },
      complexity: { time: "O(n log k)", space: "O(k)", timeWhy: "n pushes and pops on a heap of size k + 1.", spaceWhy: "the heap.", ops: (n) => n * 2 },
      pros: ["optimal for this problem."], cons: ["needs a heap; remember to fix prev links."],
      tracer: "ll-k-sorted",
    },
  ],
  input: { arrays: [listField("arr", "list values", 8)], scalars: [{ key: "k", label: "k", min: 0, max: 7 }], defaults: { arr: [3, 6, 2, 12, 56, 8], k: 2 } },
  checkpoints: [
    { q: "why must the heap hold k + 1 nodes rather than k?", options: ["for safety", "the smallest remaining value can be up to k places ahead, i.e. anywhere in the next k + 1 nodes", "heaps need an odd size"], answer: 1, right: "exactly.", wrong: "count the positions: the current slot plus up to k further ones." },
    { q: "k = 0. what does that mean?", options: ["the list is already sorted", "the list is reversed", "it's random"], answer: 0, right: "right — every node is exactly in place.", wrong: "0 places away from its sorted position…" },
  ],
};

export const whyMergeSort: Problem = {
  slug: "quicksort-vs-mergesort",
  topic: "linked-list",
  sheet: [27],
  title: "why quicksort for arrays but merge sort for linked lists?",
  sheetTitle: "Why Quicksort is preferred for. Arrays and Merge Sort for LinkedLists ?",
  pattern: "ll-merge",
  also: ["concept"],
  difficulty: "medium",
  summary: "each algorithm matches what its data structure does cheaply.",
  intro: "a concept question. arrays give O(1) access to any index and store elements next to each other — perfect for quicksort's in-place swaps and cache-friendly scans. linked lists give cheap insertion and relinking but no random access — perfect for merge sort, which only walks forwards and can merge without a buffer. compare both algorithms on the same list below.",
  example: { input: "same list, both algorithms", output: "merge sort: guaranteed n log n, no buffer · quicksort: worst case n², awkward pivots", why: "the counters in the animations show the difference." },
  clues: ["ask what each algorithm needs: random access? extra memory? sequential access only?", "arrays: merge sort needs an O(n) buffer; lists: merging just relinks.", "arrays: quicksort swaps in place and is cache friendly; lists: no random pivot, slow to find 'the node before'."],
  approaches: [
    {
      level: "improved", name: "quicksort on a list", idea: "partitioning works on a list (walk and swap values), but choosing a good pivot needs random access, and recursing left needs the node before the pivot — extra walking with no cache benefit.",
      walkthrough: ["pivot must be an end node (random access is O(n)).", "sorted or nearly sorted input → O(n²).", "finding the node before the pivot costs another walk."],
      pseudocode: "partition(low, high) with value swaps\nrecurse on both sides",
      code: quickCode,
      complexity: { time: "O(n log n) avg · O(n²) worst", space: "O(log n)–O(n)", timeWhy: "poor pivots are likely on lists because random picks are expensive.", spaceWhy: "recursion depth, up to n on bad input.", ops: (n) => n * lg(n) * 1.4 },
      pros: ["in place on arrays AND lists."], cons: ["loses its array advantages (cache locality, random pivots) on lists."],
      tracer: "ll-quick-sort",
    },
    {
      level: "optimal", name: "merge sort on a list", idea: "split with slow/fast pointers and merge by relinking. on a list, merging needs no extra buffer, and the running time is always O(n log n).",
      walkthrough: ["split at the middle (slow/fast).", "sort both halves.", "merge by relinking — O(1) extra space.", "always n log n, and stable."],
      pseudocode: "mergeSort(head): split, sort both halves, merge",
      code: {
        js: `function mergeSort(head) {
  if (!head || !head.next) return head; // @base
  let slow = head, fast = head.next; // @split
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; } // @split
  const right = slow.next; slow.next = null; // @cut
  return merge(mergeSort(head), mergeSort(right));
}
function merge(a, b) {
  const dummy = { next: null }; let t = dummy; // @merge
  while (a && b) {
    if (a.val <= b.val) { t.next = a; a = a.next; } else { t.next = b; b = b.next; } // @take
    t = t.next;
  }
  t.next = a || b; // @rest
  return dummy.next; // @done
}`,
        py: `def merge_sort(head):
    if head is None or head.next is None:
        return head  # @base
    slow, fast = head, head.next  # @split
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next  # @split
    right = slow.next; slow.next = None  # @cut
    return merge(merge_sort(head), merge_sort(right))

def merge(a, b):
    dummy = t = Node(0)  # @merge
    while a and b:
        if a.val <= b.val: t.next, a = a, a.next  # @take
        else: t.next, b = b, b.next  # @take
        t = t.next
    t.next = a or b  # @rest
    return dummy.next  # @done`,
        java: `static Node mergeSort(Node head) {
    if (head == null || head.next == null) return head; // @base
    Node slow = head, fast = head.next; // @split
    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; } // @split
    Node right = slow.next; slow.next = null; // @cut
    return merge(mergeSort(head), mergeSort(right));
}
static Node merge(Node a, Node b) {
    Node dummy = new Node(0), t = dummy; // @merge
    while (a != null && b != null) {
        if (a.val <= b.val) { t.next = a; a = a.next; } else { t.next = b; b = b.next; } // @take
        t = t.next;
    }
    t.next = (a != null) ? a : b; // @rest
    return dummy.next; // @done
}`,
        cpp: `Node* merge(Node* a, Node* b) {
    Node dummy(0); Node* t = &dummy; // @merge
    while (a && b) {
        if (a->val <= b->val) { t->next = a; a = a->next; } else { t->next = b; b = b->next; } // @take
        t = t->next;
    }
    t->next = a ? a : b; // @rest
    return dummy.next; // @done
}
Node* mergeSort(Node* head) {
    if (!head || !head->next) return head; // @base
    Node *slow = head, *fast = head->next; // @split
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; } // @split
    Node* right = slow->next; slow->next = nullptr; // @cut
    return merge(mergeSort(head), mergeSort(right));
}`,
      },
      complexity: { time: "O(n log n) always", space: "O(log n)", timeWhy: "log n levels, each merging all n nodes.", spaceWhy: "recursion only — merging relinks nodes.", ops: (n) => n * lg(n) },
      pros: ["guaranteed n log n, stable, no buffer on lists."], cons: ["on arrays it needs an O(n) buffer — which is why quicksort wins there."],
      tracer: "ll-merge-sort",
    },
  ],
  input: { arrays: [listField("arr", "list values", 8)], defaults: { arr: [1, 2, 3, 4, 5, 6] } },
  checkpoints: [
    { q: "why does merge sort need an extra buffer on arrays but not on lists?", options: ["arrays are smaller", "merging arrays copies elements into a new block; merging lists just relinks existing nodes", "lists are already sorted"], answer: 1, right: "exactly.", wrong: "think about what 'put this element next' means for each structure." },
    { q: "the default input is already sorted. which algorithm suffers?", options: ["merge sort", "quicksort with the last element as pivot", "neither"], answer: 1, right: "right — every partition is maximally unbalanced: O(n²).", wrong: "with a sorted list, the last element is always the largest. how balanced are the partitions?" },
  ],
};

export const flattenList: Problem = {
  slug: "flatten-linked-list",
  topic: "linked-list",
  sheet: [28],
  title: "flatten a linked list",
  sheetTitle: "Flatten a Linked List",
  pattern: "ll-merge",
  also: ["merge two sorted lists"],
  difficulty: "hard",
  summary: "merge sorted sub-lists hanging below each node into one sorted list.",
  intro: "each node of the main list has two pointers: next (to the next main node) and bottom (to a sorted sub-list hanging below it). the heads are sorted too. flatten everything into a single sorted list linked through bottom pointers.",
  example: { input: "5 (7, 8, 30) → 10 (20) → 19 (22, 50) → 28 (35, 40, 45)", output: "5 → 7 → 8 → 10 → 19 → 20 → 22 → 28 → 30 → 35 → 40 → 45 → 50", why: "every column is sorted, so the answer is a merge of all columns." },
  clues: ["each column is a sorted list.", "flattening = merging several sorted lists.", "merge from the right: flatten(rest), then merge the current column into it."],
  approaches: [
    {
      level: "brute", name: "collect everything and sort", idea: "copy every value into an array, sort it and build a new list.",
      walkthrough: ["visit every node of every column.", "sort the values.", "build the result."], pseudocode: "vals ← all values; sort; build list",
      code: { js: `function flatten(root) {\n  const v = [];\n  for (let h = root; h; h = h.next) for (let c = h; c; c = c.bottom) v.push(c.val);\n  v.sort((a, b) => a - b);\n  return v;\n}`, py: `def flatten(root):\n    v, h = [], root\n    while h:\n        c = h\n        while c: v.append(c.val); c = c.bottom\n        h = h.next\n    return sorted(v)` },
      complexity: { time: "O(N log N)", space: "O(N)", timeWhy: "sorting all N values.", spaceWhy: "an array of all values.", ops: (n) => n * lg(n) },
      pros: ["simple."], cons: ["ignores that the columns are already sorted."],
    },
    {
      level: "optimal", name: "merge columns from the right", idea: "recursively flatten the rest of the main list, then merge the current column into that result with the two-list merge (using bottom pointers).",
      walkthrough: ["base: a single column is already flat.", "flatten root.next.", "merge root's column with it.", "return the merged list."],
      pseudocode: "flatten(root):\n  if root = null or root.next = null: return root\n  root.next ← flatten(root.next)\n  return merge(root, root.next)   (via bottom)",
      code: {
        js: `function flatten(root) {
  if (!root || !root.next) return root; // @base
  root.next = flatten(root.next); // @recurse
  return merge(root, root.next); // @merge
}
function merge(a, b) {
  const dummy = { bottom: null }; let t = dummy; // @merge
  while (a && b) {
    if (a.val < b.val) { t.bottom = a; a = a.bottom; } // @take
    else { t.bottom = b; b = b.bottom; } // @take
    t = t.bottom;
  }
  t.bottom = a || b; // @rest
  return dummy.bottom; // @done
}`,
        py: `def flatten(root):
    if root is None or root.next is None:
        return root  # @base
    root.next = flatten(root.next)  # @recurse
    return merge(root, root.next)  # @merge

def merge(a, b):
    dummy = t = Node(0)  # @merge
    while a and b:
        if a.val < b.val: t.bottom, a = a, a.bottom  # @take
        else: t.bottom, b = b, b.bottom  # @take
        t = t.bottom
    t.bottom = a or b  # @rest
    return dummy.bottom  # @done`,
        java: `static Node flatten(Node root) {
    if (root == null || root.next == null) return root; // @base
    root.next = flatten(root.next); // @recurse
    return merge(root, root.next); // @merge
}
static Node merge(Node a, Node b) {
    Node dummy = new Node(0), t = dummy; // @merge
    while (a != null && b != null) {
        if (a.val < b.val) { t.bottom = a; a = a.bottom; } // @take
        else { t.bottom = b; b = b.bottom; } // @take
        t = t.bottom;
    }
    t.bottom = (a != null) ? a : b; // @rest
    return dummy.bottom; // @done
}`,
        cpp: `Node* merge(Node* a, Node* b) {
    Node dummy(0); Node* t = &dummy; // @merge
    while (a && b) {
        if (a->val < b->val) { t->bottom = a; a = a->bottom; } // @take
        else { t->bottom = b; b = b->bottom; } // @take
        t = t->bottom;
    }
    t->bottom = a ? a : b; // @rest
    return dummy.bottom; // @done
}
Node* flatten(Node* root) {
    if (!root || !root->next) return root; // @base
    root->next = flatten(root->next); // @recurse
    return merge(root, root->next); // @merge
}`,
      },
      complexity: { time: "O(N·k)", space: "O(k)", timeWhy: "k columns merged one by one into a growing list of up to N nodes (a heap would give O(N log k)).", spaceWhy: "recursion over k columns.", ops: (n) => n * 3 },
      pros: ["no array, relinks existing nodes."], cons: ["merging one column at a time rescans the growing result; a min-heap over column heads is faster for many columns."],
      tracer: "ll-flatten",
    },
  ],
  input: {
    arrays: [
      { key: "arr", label: "main list heads (sorted)", min: 0, max: 99, minLen: 2, maxLen: 5, sorted: true },
      { key: "arr2", label: "column sizes (including the head)", min: 1, max: 4, minLen: 2, maxLen: 5 },
      { key: "arr3", label: "values below the heads, column by column", min: 0, max: 99, minLen: 0, maxLen: 12 },
    ],
    defaults: { arr: [5, 10, 19, 28], arr2: [4, 2, 3, 4], arr3: [7, 8, 30, 20, 22, 50, 35, 40, 45] },
    check: (i) => {
      const sizes = i.arr2 ?? [];
      if (sizes.length !== i.arr.length) return "give one column size per head.";
      const need = sizes.reduce((s, x) => s + x - 1, 0);
      if ((i.arr3 ?? []).length !== need) return `the column sizes need exactly ${need} values below the heads.`;
      let at = 0;
      for (let c = 0; c < i.arr.length; c++) {
        const col = [i.arr[c], ...(i.arr3 ?? []).slice(at, at + sizes[c] - 1)];
        at += sizes[c] - 1;
        if (col.some((v, j) => j > 0 && v < col[j - 1])) return `column ${c + 1} must be sorted top to bottom.`;
      }
      return null;
    },
  },
  checkpoints: [
    { q: "flattening 4 sorted columns is really…", options: ["sorting from scratch", "merging 4 sorted lists", "reversing a list"], answer: 1, right: "exactly — the same idea as merge k sorted lists.", wrong: "every column is already sorted. what do you do with several sorted lists?" },
    { q: "which pointer links the flattened result?", options: ["next", "bottom", "prev"], answer: 1, right: "right — by convention the answer runs down the bottom pointers.", wrong: "the problem says the result is linked through…" },
  ],
};

export const mergeKLists: Problem = {
  slug: "merge-k-sorted-lists",
  topic: "linked-list",
  sheet: [31],
  title: "merge k sorted linked lists",
  sheetTitle: "Merge K sorted Linked list",
  pattern: "ll-merge",
  also: ["min-heap"],
  difficulty: "hard",
  summary: "one sorted list from k sorted lists, using a heap of the fronts.",
  intro: "merge k sorted linked lists into a single sorted linked list.",
  example: { input: "1 → 2 → 3, 4 → 5, 5 → 6 → 7 → 8", output: "1 → 2 → 3 → 4 → 5 → 5 → 6 → 7 → 8", why: "all nodes, in sorted order." },
  clues: ["the next output node is always one of the k current fronts.", "choosing the minimum of k values repeatedly → min-heap.", "alternative: merge lists in pairs (divide and conquer)."],
  approaches: [
    {
      level: "brute", name: "merge one list at a time", idea: "merge list 1 with list 2, then the result with list 3, and so on.",
      walkthrough: ["result = list 1.", "for each next list: result = merge(result, list)."], pseudocode: "result ← lists[0]\nfor l in lists[1..]: result ← merge(result, l)",
      code: { js: `function mergeK(lists) {\n  let result = lists[0] || null;\n  for (let i = 1; i < lists.length; i++) result = merge(result, lists[i]);\n  return result;\n}`, py: `def merge_k(lists):\n    result = lists[0] if lists else None\n    for l in lists[1:]:\n        result = merge(result, l)\n    return result` },
      complexity: { time: "O(N·k)", space: "O(1)", timeWhy: "the growing result is re-walked k times.", spaceWhy: "relinking only.", ops: (n) => n * 3 },
      pros: ["reuses merge two lists."], cons: ["slow for many lists."],
    },
    {
      level: "optimal", name: "min-heap of fronts", idea: "put each list's head into a min-heap. pop the smallest, link it to the result, and push its successor.",
      walkthrough: ["push every non-empty head.", "pop the minimum; append it.", "push the popped node's next, if any.", "repeat until the heap is empty."],
      pseudocode: "heap ← heads\nwhile heap: m ← pop; append m; if m.next: push m.next",
      code: {
        js: `// MinHeap: any binary heap ordered by node.val
function mergeK(lists) {
  const heap = new MinHeap((a, b) => a.val - b.val); // @init
  const dummy = { next: null }; let t = dummy;
  for (const l of lists) if (l) heap.push(l); // @fill
  while (heap.size) {
    const node = heap.pop(); // @pop
    t.next = node; t = node; // @pop
    if (node.next) heap.push(node.next); // @push
  }
  return dummy.next; // @done
}`,
        py: `import heapq
def merge_k(lists):
    heap = [(l.val, i, l) for i, l in enumerate(lists) if l]  # @init
    heapq.heapify(heap)  # @fill
    dummy = t = Node(0)
    while heap:
        _, i, node = heapq.heappop(heap)  # @pop
        t.next = node; t = node  # @pop
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))  # @push
    return dummy.next  # @done`,
        java: `static Node mergeK(Node[] lists) {
    PriorityQueue<Node> heap = new PriorityQueue<>((a, b) -> a.val - b.val); // @init
    for (Node l : lists) if (l != null) heap.add(l); // @fill
    Node dummy = new Node(0), t = dummy;
    while (!heap.isEmpty()) {
        Node node = heap.poll(); // @pop
        t.next = node; t = node; // @pop
        if (node.next != null) heap.add(node.next); // @push
    }
    return dummy.next; // @done
}`,
        cpp: `Node* mergeK(vector<Node*>& lists) {
    auto cmp = [](Node* a, Node* b) { return a->val > b->val; };
    priority_queue<Node*, vector<Node*>, decltype(cmp)> heap(cmp); // @init
    for (Node* l : lists) if (l) heap.push(l); // @fill
    Node dummy(0); Node* t = &dummy;
    while (!heap.empty()) {
        Node* node = heap.top(); heap.pop(); // @pop
        t->next = node; t = node; // @pop
        if (node->next) heap.push(node->next); // @push
    }
    return dummy.next; // @done
}`,
      },
      complexity: { time: "O(N log k)", space: "O(k)", timeWhy: "N pops and pushes on a heap of at most k nodes.", spaceWhy: "the heap.", ops: (n) => n * 2 },
      pros: ["optimal; relinks existing nodes."], cons: ["needs a priority queue."],
      tracer: "ll-merge-k",
    },
  ],
  input: { arrays: [listField("arr", "list 1 (sorted)", 5, true), listField("arr2", "list 2 (sorted)", 5, true), listField("arr3", "list 3 (sorted)", 5, true)], defaults: { arr: [1, 2, 3], arr2: [4, 5], arr3: [5, 6, 7, 8] } },
  checkpoints: [
    { q: "how many nodes are in the heap at any time?", options: ["N", "at most k", "always 1"], answer: 1, right: "right — at most one front per list.", wrong: "we push a node's successor only after popping it…" },
    { q: "why is the heap version faster than merging lists one by one?", options: ["it isn't", "each node is handled with an O(log k) heap operation instead of being re-walked up to k times", "heaps sort faster than merging in general"], answer: 1, right: "exactly.", wrong: "count how many times a node from list 1 is walked over in the one-by-one version." },
  ],
};
