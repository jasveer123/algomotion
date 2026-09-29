import type { Problem } from "@/lib/types";

const lg = (n: number) => Math.max(1, Math.log2(Math.max(2, n)));
const loopInput = {
  arrays: [{ key: "arr" as const, label: "list values", min: -99, max: 99, minLen: 1, maxLen: 9 }],
  scalars: [{ key: "k" as const, label: "tail links back to index (−1 = no loop)", min: -1, max: 8 }],
  check: (i: { arr: number[]; k?: number }) => ((i.k ?? -1) >= i.arr.length ? "the loop index must be smaller than the list length (or −1)." : null),
};

export const reverseList: Problem = {
  slug: "reverse-linked-list",
  topic: "linked-list",
  sheet: [1],
  title: "reverse a linked list (iterative & recursive)",
  sheetTitle: "Write a Program to reverse the Linked List. (Both Iterative and recursive)",
  pattern: "ll-rewiring",
  also: ["three pointers", "recursion"],
  difficulty: "easy",
  flagship: true,
  summary: "turn 1 → 2 → 3 into 3 → 2 → 1 by flipping every link.",
  intro: "a singly linked list is a chain of nodes, each holding a value and a pointer to the next node. reverse it: the last node becomes the head and every arrow points the other way. you can't jump to the middle of a list, so everything happens by walking along it.",
  example: { input: "1 → 2 → 3 → 4 → 5 → null", output: "5 → 4 → 3 → 2 → 1 → null", why: "each node's next pointer now points to the node that used to come before it." },
  clues: [
    "the answer is the same nodes in the opposite order — rewire, don't rebuild.",
    "each node only needs to know who came before it: that's a 'prev' pointer.",
    "changing curr.next loses the rest of the list unless you save it first.",
    "reversal is a building block: palindromes, k-group reversal and adding numbers all use it.",
  ],
  approaches: [
    {
      level: "brute",
      name: "copy values, write them back",
      idea: "read every value into an array (a stack), then walk the list again writing the values back in reverse order.",
      walkthrough: ["walk the list, pushing each value onto a stack.", "walk it again from the head.", "pop a value into each node — the last value comes out first."],
      pseudocode: "stack ← []\nfor node in list: stack.push(node.val)\nfor node in list: node.val ← stack.pop()\nreturn head",
      code: {
        js: `// node: { val, next }
function reverse(head) {
  const vals = []; // @init
  for (let c = head; c; c = c.next) vals.push(c.val); // @collect
  for (let c = head; c; c = c.next) c.val = vals.pop(); // @write
  return head; // @done
}`,
        py: `def reverse(head):
    vals = []  # @init
    c = head
    while c:
        vals.append(c.val)  # @collect
        c = c.next
    c = head
    while c:
        c.val = vals.pop()  # @write
        c = c.next
    return head  # @done`,
        java: `static Node reverse(Node head) {
    Deque<Integer> vals = new ArrayDeque<>(); // @init
    for (Node c = head; c != null; c = c.next) vals.push(c.val); // @collect
    for (Node c = head; c != null; c = c.next) c.val = vals.pop(); // @write
    return head; // @done
}`,
        cpp: `Node* reverse(Node* head) {
    stack<int> vals; // @init
    for (Node* c = head; c; c = c->next) vals.push(c->val); // @collect
    for (Node* c = head; c; c = c->next) { c->val = vals.top(); vals.pop(); } // @write
    return head; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "two walks along the list.", spaceWhy: "the stack holds every value.", ops: (n) => 2 * n },
      pros: ["very easy to get right."],
      cons: ["needs n extra slots.", "copies values instead of moving nodes — wrong if nodes carry more data or other code holds pointers to them."],
      tracer: "ll-reverse-stack",
    },
    {
      level: "improved",
      name: "recursion",
      idea: "reverse everything after the head first; then make the old second node point back to the head, and cut the head's forward link.",
      walkthrough: ["base case: an empty list or a single node is already reversed.", "recursively reverse head.next — it returns the new head (the old tail).", "head.next is now the tail of the reversed part: set head.next.next = head.", "set head.next = null so the old head becomes the new tail."],
      pseudocode: "reverse(head):\n  if head is null or head.next is null: return head\n  newHead ← reverse(head.next)\n  head.next.next ← head\n  head.next ← null\n  return newHead",
      code: {
        js: `function reverse(head) {
  if (head === null || head.next === null) return head; // @base
  const newHead = reverse(head.next); // @recurse
  head.next.next = head; // @flip
  head.next = null; // @cut
  return newHead; // @done
}`,
        py: `def reverse(head):
    if head is None or head.next is None:
        return head  # @base
    new_head = reverse(head.next)  # @recurse
    head.next.next = head  # @flip
    head.next = None  # @cut
    return new_head  # @done`,
        java: `static Node reverse(Node head) {
    if (head == null || head.next == null) return head; // @base
    Node newHead = reverse(head.next); // @recurse
    head.next.next = head; // @flip
    head.next = null; // @cut
    return newHead; // @done
}`,
        cpp: `Node* reverse(Node* head) {
    if (!head || !head->next) return head; // @base
    Node* newHead = reverse(head->next); // @recurse
    head->next->next = head; // @flip
    head->next = nullptr; // @cut
    return newHead; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "one call per node.", spaceWhy: "n calls wait on the call stack at the deepest point — a very long list can overflow it.", ops: (n) => 2 * n },
      pros: ["short and elegant; moves real links.", "a great recursion exercise."],
      cons: ["O(n) stack depth — risky for lists with hundreds of thousands of nodes."],
      tracer: "ll-reverse-recursive",
    },
    {
      level: "optimal",
      name: "iterative, three pointers",
      idea: "walk once with prev, curr and next: save curr.next, point curr back at prev, then step both pointers forward.",
      walkthrough: ["prev = null, curr = head.", "save next = curr.next (otherwise the rest of the list is lost).", "flip: curr.next = prev.", "advance: prev = curr, curr = next.", "when curr is null, prev is the new head."],
      pseudocode: "prev ← null; curr ← head\nwhile curr ≠ null\n  next ← curr.next\n  curr.next ← prev\n  prev ← curr; curr ← next\nreturn prev",
      code: {
        js: `function reverse(head) {
  let prev = null, curr = head; // @init
  while (curr !== null) {
    const next = curr.next; // @save
    curr.next = prev; // @flip
    prev = curr; // @advance
    curr = next; // @advance
  }
  return prev; // @done
}`,
        py: `def reverse(head):
    prev, curr = None, head  # @init
    while curr is not None:
        nxt = curr.next  # @save
        curr.next = prev  # @flip
        prev = curr  # @advance
        curr = nxt  # @advance
    return prev  # @done`,
        java: `static Node reverse(Node head) {
    Node prev = null, curr = head; // @init
    while (curr != null) {
        Node next = curr.next; // @save
        curr.next = prev; // @flip
        prev = curr; // @advance
        curr = next; // @advance
    }
    return prev; // @done
}`,
        cpp: `Node* reverse(Node* head) {
    Node *prev = nullptr, *curr = head; // @init
    while (curr) {
        Node* next = curr->next; // @save
        curr->next = prev; // @flip
        prev = curr; // @advance
        curr = next; // @advance
    }
    return prev; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one pass; every node's link is flipped exactly once.", spaceWhy: "three pointer variables, whatever the length.", ops: (n) => n },
      pros: ["one pass, constant memory, moves real nodes.", "the pattern reused by k-group reversal and palindrome checks."],
      cons: ["forgetting to save next first is the classic bug — the rest of the list vanishes."],
      tracer: "ll-reverse",
    },
  ],
  input: { arrays: [{ key: "arr", label: "list values", min: -99, max: 99, minLen: 1, maxLen: 9 }], defaults: { arr: [1, 2, 3, 4, 5] } },
  checkpoints: [
    { q: "in the iterative version, why save next before flipping?", options: ["for speed", "after curr.next = prev we can no longer reach the rest of the list", "because prev might be null"], answer: 1, right: "exactly — that link was the only way forward.", wrong: "think about what curr.next points to right after the flip." },
    { q: "when the loop ends, which pointer is the new head?", options: ["curr", "prev", "head"], answer: 1, right: "yes — curr is null, and prev sits on the old tail.", wrong: "curr has walked off the end. who is standing on the last node?" },
    { q: "why is the recursive version O(n) space?", options: ["it copies the values", "every node adds a call that waits on the stack", "it builds a new list"], answer: 1, right: "right — n calls are pending at the deepest point.", wrong: "no copies are made. what piles up while the recursion goes deeper?" },
  ],
};

export const detectLoop: Problem = {
  slug: "detect-loop",
  topic: "linked-list",
  sheet: [3],
  title: "detect a loop in a linked list",
  sheetTitle: "Write a program to Detect loop in a linked list.",
  pattern: "ll-fast-slow",
  also: ["floyd's cycle detection", "hashing"],
  difficulty: "easy",
  flagship: true,
  summary: "does following next pointers ever end, or go round in a circle?",
  intro: "normally the last node of a list points to null. in a broken list, the last node points back to some earlier node, so walking the list never ends. decide whether the list has such a loop.",
  example: { input: "1 → 3 → 4 → 5 → 6, and 6 links back to 4", output: "true", why: "after 6 you arrive at 4 again, and the walk goes round forever." },
  clues: [
    "you can't just walk until null — with a loop, you'd walk forever.",
    "'have i been here before?' suggests a hash set of visited nodes.",
    "two runners at different speeds on a circular track must eventually meet.",
    "O(1) space is often asked for — that's floyd's tortoise and hare.",
  ],
  approaches: [
    {
      level: "brute",
      name: "hash set of visited nodes",
      idea: "remember every node you've stood on. reaching one you've seen means there's a loop; reaching null means there isn't.",
      walkthrough: ["start at the head with an empty set.", "if the current node is in the set → loop.", "otherwise add it and move on.", "falling off the end → no loop."],
      pseudocode: "seen ← empty set\nfor node from head following next\n  if node ∈ seen: return true\n  seen.add(node)\nreturn false",
      code: {
        js: `function hasLoop(head) {
  const seen = new Set(); // @init
  for (let c = head; c; c = c.next) {
    if (seen.has(c)) return true; // @hit
    seen.add(c); // @store
  }
  return false; // @done
}`,
        py: `def has_loop(head):
    seen = set()  # @init
    c = head
    while c:
        if c in seen:
            return True  # @hit
        seen.add(c)  # @store
        c = c.next
    return False  # @done`,
        java: `static boolean hasLoop(Node head) {
    Set<Node> seen = new HashSet<>(); // @init
    for (Node c = head; c != null; c = c.next) {
        if (seen.contains(c)) return true; // @hit
        seen.add(c); // @store
    }
    return false; // @done
}`,
        cpp: `bool hasLoop(Node* head) {
    unordered_set<Node*> seen; // @init
    for (Node* c = head; c; c = c->next) {
        if (seen.count(c)) return true; // @hit
        seen.insert(c); // @store
    }
    return false; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "each node is visited once before we either hit null or a repeat.", spaceWhy: "the set can hold every node.", ops: (n) => 2 * n },
      pros: ["simple; also tells you exactly where the loop begins (the first repeated node)."],
      cons: ["O(n) memory."],
      tracer: "ll-loop-hash",
    },
    {
      level: "improved",
      name: "mark visited nodes",
      idea: "add a 'visited' flag to every node and set it as you walk. meeting a node that's already flagged means a loop.",
      walkthrough: ["walk from the head.", "flagged node → loop.", "otherwise set its flag and continue.", "null → no loop."],
      pseudocode: "for node from head following next\n  if node.visited: return true\n  node.visited ← true\nreturn false",
      code: {
        js: `function hasLoop(head) {
  for (let c = head; c; c = c.next) { // @init
    if (c.visited) return true; // @hit
    c.visited = true; // @store
  }
  return false; // @done
}`,
        py: `def has_loop(head):
    c = head  # @init
    while c:
        if getattr(c, "visited", False):
            return True  # @hit
        c.visited = True  # @store
        c = c.next
    return False  # @done`,
        java: `// Node has an extra field: boolean visited;
static boolean hasLoop(Node head) {
    for (Node c = head; c != null; c = c.next) { // @init
        if (c.visited) return true; // @hit
        c.visited = true; // @store
    }
    return false; // @done
}`,
        cpp: `// Node has an extra field: bool visited = false;
bool hasLoop(Node* head) {
    for (Node* c = head; c; c = c->next) { // @init
        if (c->visited) return true; // @hit
        c->visited = true; // @store
    }
    return false; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(n) in nodes", timeWhy: "one walk.", spaceWhy: "no separate set, but every node carries an extra flag — still n extra bits, and the list is modified.", ops: (n) => n },
      pros: ["no hash set."],
      cons: ["changes the node structure and leaves flags behind that must be reset.", "not allowed when the list is read-only."],
      tracer: "ll-loop-mark",
    },
    {
      level: "optimal",
      name: "floyd's tortoise and hare",
      idea: "slow moves one node per step, fast moves two. if there's a loop, fast laps slow and they land on the same node; if not, fast reaches null.",
      walkthrough: ["slow = fast = head.", "each step: slow = slow.next, fast = fast.next.next.", "same node → loop.", "fast or fast.next is null → no loop."],
      pseudocode: "slow ← head; fast ← head\nwhile fast ≠ null and fast.next ≠ null\n  slow ← slow.next\n  fast ← fast.next.next\n  if slow = fast: return true\nreturn false",
      code: {
        js: `function hasLoop(head) {
  let slow = head, fast = head; // @init
  while (fast && fast.next) {
    slow = slow.next; // @move
    fast = fast.next.next; // @move
    if (slow === fast) return true; // @meet
  }
  return false; // @done
}`,
        py: `def has_loop(head):
    slow = fast = head  # @init
    while fast and fast.next:
        slow = slow.next  # @move
        fast = fast.next.next  # @move
        if slow is fast:
            return True  # @meet
    return False  # @done`,
        java: `static boolean hasLoop(Node head) {
    Node slow = head, fast = head; // @init
    while (fast != null && fast.next != null) {
        slow = slow.next; // @move
        fast = fast.next.next; // @move
        if (slow == fast) return true; // @meet
    }
    return false; // @done
}`,
        cpp: `bool hasLoop(Node* head) {
    Node *slow = head, *fast = head; // @init
    while (fast && fast->next) {
        slow = slow->next; // @move
        fast = fast->next->next; // @move
        if (slow == fast) return true; // @meet
    }
    return false; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "once both are in the loop, the gap between them shrinks by one per step, so they meet within one lap.", spaceWhy: "two pointers.", ops: (n) => 2 * n },
      pros: ["constant memory, list untouched.", "extends to finding the loop's start and removing the loop."],
      cons: ["why they must meet takes a moment to convince yourself of."],
      tracer: "ll-loop-floyd",
    },
  ],
  input: { ...loopInput, defaults: { arr: [1, 3, 4, 5, 6], k: 2 } },
  checkpoints: [
    { q: "fast moves 2 and slow moves 1. inside the loop, how does the gap between them change each step?", options: ["it grows by 1", "it shrinks by 1", "it stays the same"], answer: 1, right: "exactly — fast closes in by one node per step, so they can't skip past each other.", wrong: "fast gains one node on slow every step. what does that do to the gap?" },
    { q: "why check both fast and fast.next before moving?", options: ["style", "fast.next.next would crash if either is null", "to find the middle"], answer: 1, right: "right — in a list without a loop, fast is the first to hit the end.", wrong: "what happens if you read .next of null?" },
    { q: "which approach leaves the list completely untouched and uses O(1) memory?", options: ["hash set", "marking nodes", "floyd's"], answer: 2, right: "yes — two pointers, no writes.", wrong: "one uses a set, one writes flags into nodes…" },
  ],
};

export const mergeSortList: Problem = {
  slug: "merge-sort-linked-list",
  topic: "linked-list",
  sheet: [13],
  title: "merge sort for linked lists",
  sheetTitle: "Merge Sort For Linked lists.[Very Important]",
  pattern: "ll-merge",
  also: ["divide and conquer", "fast & slow pointers"],
  difficulty: "medium",
  flagship: true,
  summary: "sort a linked list in O(n log n) by splitting and merging links.",
  intro: "sort the values of a linked list in increasing order. unlike arrays, lists have no index access, so algorithms that jump around (like heapsort or classic quicksort) are awkward — but merge sort only ever walks and relinks, which lists do cheaply.",
  example: { input: "3 → 5 → 2 → 4 → 1", output: "1 → 2 → 3 → 4 → 5", why: "the same five nodes, relinked in sorted order." },
  clues: [
    "'sort a linked list' in O(n log n) → merge sort is the standard answer.",
    "finding the middle of a list = slow/fast pointers.",
    "merging two sorted lists needs no extra array — just relink.",
    "O(1) extra space for the merge (unlike arrays, which need a buffer).",
  ],
  approaches: [
    {
      level: "brute",
      name: "copy to an array, sort, write back",
      idea: "read the values into an array, sort the array, then walk the list overwriting values in order.",
      walkthrough: ["walk the list, copying values.", "sort the array with any O(n log n) sort.", "walk again, writing sorted values into the nodes."],
      pseudocode: "vals ← values of list\nsort vals\nwrite vals back into the nodes in order",
      code: {
        js: `function sortList(head) {
  const vals = []; // @collect
  for (let c = head; c; c = c.next) vals.push(c.val); // @collect
  vals.sort((x, y) => x - y); // @sort
  let i = 0;
  for (let c = head; c; c = c.next) c.val = vals[i++]; // @write
  return head; // @done
}`,
        py: `def sort_list(head):
    vals = []  # @collect
    c = head
    while c:
        vals.append(c.val)  # @collect
        c = c.next
    vals.sort()  # @sort
    c, i = head, 0
    while c:
        c.val = vals[i]  # @write
        c, i = c.next, i + 1
    return head  # @done`,
        java: `static Node sortList(Node head) {
    List<Integer> vals = new ArrayList<>(); // @collect
    for (Node c = head; c != null; c = c.next) vals.add(c.val); // @collect
    Collections.sort(vals); // @sort
    int i = 0;
    for (Node c = head; c != null; c = c.next) c.val = vals.get(i++); // @write
    return head; // @done
}`,
        cpp: `Node* sortList(Node* head) {
    vector<int> vals; // @collect
    for (Node* c = head; c; c = c->next) vals.push_back(c->val); // @collect
    sort(vals.begin(), vals.end()); // @sort
    int i = 0;
    for (Node* c = head; c; c = c->next) c->val = vals[i++]; // @write
    return head; // @done
}`,
      },
      complexity: { time: "O(n log n)", space: "O(n)", timeWhy: "dominated by the array sort.", spaceWhy: "an array holding every value.", ops: (n) => n * lg(n) + 2 * n },
      pros: ["fast and simple in practice."],
      cons: ["O(n) extra memory.", "moves values, not nodes — not acceptable when nodes carry other data."],
      tracer: "ll-sort-array",
    },
    {
      level: "improved",
      name: "insertion sort by relinking",
      idea: "build a sorted list one node at a time: take the next node and splice it into its place in the sorted part.",
      walkthrough: ["start with an empty sorted list.", "take the next node from the input.", "walk the sorted list to find where it belongs.", "splice it in by changing two links."],
      pseudocode: "sorted ← empty (dummy head)\nfor each node in input\n  p ← dummy\n  while p.next and p.next.val < node.val: p ← p.next\n  node.next ← p.next; p.next ← node\nreturn dummy.next",
      code: {
        js: `function insertionSort(head) {
  const dummy = { next: null }; // @init
  let curr = head;
  while (curr) {
    const next = curr.next;
    let p = dummy;
    while (p.next && p.next.val < curr.val) p = p.next; // @scan
    curr.next = p.next; // @insert
    p.next = curr; // @insert
    curr = next;
  }
  return dummy.next; // @done
}`,
        py: `def insertion_sort(head):
    dummy = Node(0)  # @init
    curr = head
    while curr:
        nxt = curr.next
        p = dummy
        while p.next and p.next.val < curr.val:
            p = p.next  # @scan
        curr.next = p.next  # @insert
        p.next = curr  # @insert
        curr = nxt
    return dummy.next  # @done`,
        java: `static Node insertionSort(Node head) {
    Node dummy = new Node(0); // @init
    Node curr = head;
    while (curr != null) {
        Node next = curr.next;
        Node p = dummy;
        while (p.next != null && p.next.val < curr.val) p = p.next; // @scan
        curr.next = p.next; // @insert
        p.next = curr; // @insert
        curr = next;
    }
    return dummy.next; // @done
}`,
        cpp: `Node* insertionSort(Node* head) {
    Node dummy(0); // @init
    Node* curr = head;
    while (curr) {
        Node* next = curr->next;
        Node* p = &dummy;
        while (p->next && p->next->val < curr->val) p = p->next; // @scan
        curr->next = p->next; // @insert
        p->next = curr; // @insert
        curr = next;
    }
    return dummy.next; // @done
}`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "each insertion may walk the whole sorted part.", spaceWhy: "just a dummy node and a few pointers.", ops: (n) => (n * n) / 4 },
      pros: ["no extra memory; stable; great for nearly sorted lists."],
      cons: ["quadratic on random data."],
      tracer: "ll-insertion-sort",
    },
    {
      level: "optimal",
      name: "merge sort",
      idea: "split the list at its middle with slow/fast pointers, sort both halves recursively, then merge the two sorted halves by relinking.",
      walkthrough: ["base case: 0 or 1 node is sorted.", "find the middle: slow moves 1, fast moves 2 (fast starts one ahead so slow stops at the end of the left half).", "cut after slow, making two lists.", "sort each half recursively.", "merge: repeatedly link the smaller front node, then attach whatever remains."],
      pseudocode: "mergeSort(head):\n  if head = null or head.next = null: return head\n  slow ← head; fast ← head.next\n  while fast and fast.next: slow ← slow.next; fast ← fast.next.next\n  right ← slow.next; slow.next ← null\n  return merge(mergeSort(head), mergeSort(right))",
      code: {
        js: `function mergeSort(head) {
  if (!head || !head.next) return head; // @base
  let slow = head, fast = head.next; // @split
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; } // @split
  const right = slow.next; // @cut
  slow.next = null; // @cut
  return merge(mergeSort(head), mergeSort(right)); // @recurse
}
function merge(a, b) {
  const dummy = { next: null }; // @merge
  let t = dummy;
  while (a && b) {
    if (a.val <= b.val) { t.next = a; a = a.next; } // @take
    else { t.next = b; b = b.next; } // @take
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
    right = slow.next  # @cut
    slow.next = None  # @cut
    return merge(merge_sort(head), merge_sort(right))  # @recurse

def merge(a, b):
    dummy = t = Node(0)  # @merge
    while a and b:
        if a.val <= b.val:
            t.next, a = a, a.next  # @take
        else:
            t.next, b = b, b.next  # @take
        t = t.next
    t.next = a or b  # @rest
    return dummy.next  # @done`,
        java: `static Node mergeSort(Node head) {
    if (head == null || head.next == null) return head; // @base
    Node slow = head, fast = head.next; // @split
    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; } // @split
    Node right = slow.next; // @cut
    slow.next = null; // @cut
    return merge(mergeSort(head), mergeSort(right)); // @recurse
}
static Node merge(Node a, Node b) {
    Node dummy = new Node(0), t = dummy; // @merge
    while (a != null && b != null) {
        if (a.val <= b.val) { t.next = a; a = a.next; } // @take
        else { t.next = b; b = b.next; } // @take
        t = t.next;
    }
    t.next = (a != null) ? a : b; // @rest
    return dummy.next; // @done
}`,
        cpp: `Node* merge(Node* a, Node* b) {
    Node dummy(0); // @merge
    Node* t = &dummy;
    while (a && b) {
        if (a->val <= b->val) { t->next = a; a = a->next; } // @take
        else { t->next = b; b = b->next; } // @take
        t = t->next;
    }
    t->next = a ? a : b; // @rest
    return dummy.next; // @done
}
Node* mergeSort(Node* head) {
    if (!head || !head->next) return head; // @base
    Node *slow = head, *fast = head->next; // @split
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; } // @split
    Node* right = slow->next; // @cut
    slow->next = nullptr; // @cut
    return merge(mergeSort(head), mergeSort(right)); // @recurse
}`,
      },
      complexity: { time: "O(n log n)", space: "O(log n)", timeWhy: "log n levels of splitting, and each level's merges touch every node once.", spaceWhy: "only the recursion stack; merging relinks nodes instead of copying into a buffer.", ops: (n) => n * lg(n) },
      pros: ["guaranteed O(n log n), stable, moves real nodes.", "no auxiliary array — the reason merge sort is the natural list sort."],
      cons: ["recursion depth log n (a bottom-up version gets O(1) space at the cost of trickier code)."],
      tracer: "ll-merge-sort",
    },
  ],
  input: { arrays: [{ key: "arr", label: "list values", min: -99, max: 99, minLen: 1, maxLen: 8 }], defaults: { arr: [3, 5, 2, 4, 1] } },
  checkpoints: [
    { q: "why does fast start at head.next when splitting?", options: ["so slow stops at the end of the left half", "to skip the head", "it makes no difference"], answer: 0, right: "right — for two nodes, slow must stay on the first so both halves are non-empty.", wrong: "try a 2-node list. where should the cut be, and where would slow stop if fast started at head?" },
    { q: "merging two sorted lists of lengths 3 and 4 needs how much extra memory?", options: ["7 slots", "O(1) — a dummy node and a tail pointer", "4 slots"], answer: 1, right: "exactly — we relink existing nodes.", wrong: "we never copy values when merging lists. what do we change instead?" },
    { q: "why is merge sort preferred over quicksort for linked lists?", options: ["quicksort is always slower", "quicksort relies on fast index access and in-place swaps; merge sort only needs sequential walks", "merge sort uses less time in the worst case only on arrays"], answer: 1, right: "yes — lists walk cheaply but can't jump to an index.", wrong: "think about what each algorithm needs from the data structure." },
  ],
};
