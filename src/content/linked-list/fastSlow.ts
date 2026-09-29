import type { Problem } from "@/lib/types";

const listField = (maxLen = 9, label = "list values") => ({ key: "arr" as const, label, min: -99, max: 99, minLen: 1, maxLen });
const loopScalar = { key: "k" as const, label: "tail links back to index (−1 = no loop)", min: -1, max: 8 };
const loopCheck = (i: { arr: number[]; k?: number }) => ((i.k ?? -1) >= i.arr.length ? "the loop index must be smaller than the list length (or −1)." : null);

export const removeLoop: Problem = {
  slug: "remove-loop",
  topic: "linked-list",
  sheet: [4],
  title: "delete the loop in a linked list",
  sheetTitle: "Write a program to Delete loop in a linked list.",
  pattern: "ll-fast-slow",
  also: ["floyd's cycle detection"],
  difficulty: "medium",
  summary: "find the node that closes the loop and point it at null.",
  intro: "the list's last node links back to an earlier node, forming a loop. remove the loop by setting the last node's next to null, without breaking the rest of the list.",
  example: { input: "1 → 3 → 4, and 4 links back to 3", output: "1 → 3 → 4 → null", why: "4's link back to 3 is the one that's cut." },
  clues: ["first, detect the loop (floyd).", "the node to fix is the one whose next is the loop's start.", "a loop that starts at the head is a special case."],
  approaches: [
    {
      level: "brute", name: "hash set of visited nodes", idea: "walk while remembering nodes; the first node whose next is already visited is the last node of the loop.",
      walkthrough: ["walk from the head.", "if c.next is in the set, c closes the loop: set c.next = null.", "otherwise add c and continue."], pseudocode: "seen ← {}\nfor c from head\n  seen.add(c)\n  if c.next ∈ seen: c.next ← null; stop",
      code: {
        js: `function removeLoop(head) {
  const seen = new Set();
  for (let c = head; c; c = c.next) {
    seen.add(c);
    if (seen.has(c.next)) { c.next = null; break; }
  }
  return head;
}`,
        py: `def remove_loop(head):
    seen, c = set(), head
    while c:
        seen.add(c)
        if c.next in seen:
            c.next = None; break
        c = c.next
    return head`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "one walk.", spaceWhy: "the set of visited nodes.", ops: (n) => 2 * n },
      pros: ["simple, one pass."], cons: ["O(n) memory."],
    },
    {
      level: "optimal", name: "floyd + find the loop's last node", idea: "meet inside the loop with slow/fast. restart slow at the head; move both one step until their next pointers coincide — fast is then the loop's last node. cut it.",
      walkthrough: ["phase 1: slow/fast until they meet (or fast hits null → no loop).", "slow = head.", "if slow == fast, the loop starts at the head: walk fast round to the node before the head.", "else move both until slow.next == fast.next.", "fast.next = null."],
      pseudocode: "meet with floyd (no meeting → return)\nslow ← head\nif slow = fast: while fast.next ≠ slow: fast ← fast.next\nelse: while slow.next ≠ fast.next: slow ← slow.next; fast ← fast.next\nfast.next ← null",
      code: {
        js: `function removeLoop(head) {
  let slow = head, fast = head; // @init
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next; // @move
    if (slow === fast) break; // @meet
  }
  if (slow !== fast) return head; // @none
  slow = head; // @reset
  if (slow === fast) { while (fast.next !== slow) fast = fast.next; } // @tail
  else { while (slow.next !== fast.next) { slow = slow.next; fast = fast.next; } } // @tail
  fast.next = null; // @cut
  return head;
}`,
        py: `def remove_loop(head):
    slow = fast = head  # @init
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next  # @move
        if slow is fast: break  # @meet
    if slow is not fast:
        return head  # @none
    slow = head  # @reset
    if slow is fast:
        while fast.next is not slow: fast = fast.next  # @tail
    else:
        while slow.next is not fast.next:
            slow, fast = slow.next, fast.next  # @tail
    fast.next = None  # @cut
    return head`,
        java: `static Node removeLoop(Node head) {
    Node slow = head, fast = head; // @init
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next; // @move
        if (slow == fast) break; // @meet
    }
    if (slow != fast) return head; // @none
    slow = head; // @reset
    if (slow == fast) { while (fast.next != slow) fast = fast.next; } // @tail
    else { while (slow.next != fast.next) { slow = slow.next; fast = fast.next; } } // @tail
    fast.next = null; // @cut
    return head;
}`,
        cpp: `Node* removeLoop(Node* head) {
    Node *slow = head, *fast = head; // @init
    while (fast && fast->next) {
        slow = slow->next; fast = fast->next->next; // @move
        if (slow == fast) break; // @meet
    }
    if (slow != fast) return head; // @none
    slow = head; // @reset
    if (slow == fast) { while (fast->next != slow) fast = fast->next; } // @tail
    else { while (slow->next != fast->next) { slow = slow->next; fast = fast->next; } } // @tail
    fast->next = nullptr; // @cut
    return head;
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "a constant number of passes over the list.", spaceWhy: "two pointers.", ops: (n) => 3 * n },
      pros: ["no extra memory."], cons: ["the head-is-in-the-loop case trips many solutions."],
      tracer: "ll-remove-loop",
    },
  ],
  input: { arrays: [listField()], scalars: [loopScalar], check: loopCheck, defaults: { arr: [1, 3, 4, 5, 6], k: 1 } },
  checkpoints: [
    { q: "phase 2 stops when slow.next == fast.next. which node is fast on?", options: ["the loop's start", "the last node of the loop", "the head"], answer: 1, right: "right — its next is the loop's start, so that's the link to cut.", wrong: "both nexts point at the same node (the loop's start). what's fast, relative to it?" },
    { q: "what if the tail links back to the head (index 0)?", options: ["phase 2 finds it the same way", "slow and fast are both at the head after reset, so walk fast round to the node before the head", "there's no loop"], answer: 1, right: "exactly — the special case in the code.", wrong: "after resetting slow to the head, where is fast in this case?" },
  ],
};

export const loopStart: Problem = {
  slug: "loop-start",
  topic: "linked-list",
  sheet: [5],
  title: "find the starting point of the loop",
  sheetTitle: "Find the starting point of the loop.",
  pattern: "ll-fast-slow",
  also: ["floyd's cycle detection"],
  difficulty: "medium",
  summary: "return the first node that's inside the loop.",
  intro: "a list contains a loop. return the node where the loop begins — the first node you'd visit twice while walking from the head.",
  example: { input: "1 → 2 → 3 → 4 → 5 → 6, and 6 links back to 3", output: "3", why: "walking from 1, the first repeated node is 3." },
  clues: ["same setup as loop detection.", "after the meeting, the distance head → start equals meeting point → start (going round).", "so two pointers moving at the same speed meet exactly at the start."],
  approaches: [
    {
      level: "brute", name: "hash set", idea: "walk from the head; the first node already in the set is the start.",
      walkthrough: ["walk, adding nodes to a set.", "first repeat = start."], pseudocode: "seen ← {}\nfor c from head: if c ∈ seen: return c; seen.add(c)",
      code: { js: `function loopStart(head) {\n  const seen = new Set();\n  for (let c = head; c; c = c.next) { if (seen.has(c)) return c; seen.add(c); }\n  return null;\n}`, py: `def loop_start(head):\n    seen, c = set(), head\n    while c:\n        if c in seen: return c\n        seen.add(c); c = c.next\n    return None` },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "one walk.", spaceWhy: "the set.", ops: (n) => 2 * n },
      pros: ["obvious."], cons: ["O(n) memory."],
    },
    {
      level: "optimal", name: "floyd, phase 2", idea: "find a meeting point with slow/fast. move slow back to the head and step both one node at a time; they meet at the loop's start.",
      walkthrough: ["phase 1: slow ×1, fast ×2 until they meet.", "slow = head.", "move both by one until they're equal.", "that node is the start."],
      pseudocode: "meet with floyd\nslow ← head\nwhile slow ≠ fast: slow ← slow.next; fast ← fast.next\nreturn slow",
      code: {
        js: `function loopStart(head) {
  let slow = head, fast = head; // @init
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next; // @move
    if (slow === fast) { // @meet
      slow = head; // @reset
      while (slow !== fast) { slow = slow.next; fast = fast.next; } // @walk
      return slow; // @found
    }
  }
  return null; // @done
}`,
        py: `def loop_start(head):
    slow = fast = head  # @init
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next  # @move
        if slow is fast:  # @meet
            slow = head  # @reset
            while slow is not fast:
                slow, fast = slow.next, fast.next  # @walk
            return slow  # @found
    return None  # @done`,
        java: `static Node loopStart(Node head) {
    Node slow = head, fast = head; // @init
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next; // @move
        if (slow == fast) { // @meet
            slow = head; // @reset
            while (slow != fast) { slow = slow.next; fast = fast.next; } // @walk
            return slow; // @found
        }
    }
    return null; // @done
}`,
        cpp: `Node* loopStart(Node* head) {
    Node *slow = head, *fast = head; // @init
    while (fast && fast->next) {
        slow = slow->next; fast = fast->next->next; // @move
        if (slow == fast) { // @meet
            slow = head; // @reset
            while (slow != fast) { slow = slow->next; fast = fast->next; } // @walk
            return slow; // @found
        }
    }
    return nullptr; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "each phase is at most a couple of passes.", spaceWhy: "two pointers.", ops: (n) => 3 * n },
      pros: ["constant memory, list untouched."], cons: ["the correctness proof (distance argument) is the part interviewers probe."],
      tracer: "ll-loop-start",
    },
  ],
  input: { arrays: [listField()], scalars: [loopScalar], check: loopCheck, defaults: { arr: [1, 2, 3, 4, 5, 6], k: 2 } },
  checkpoints: [
    { q: "in phase 2, both pointers move…", options: ["1 and 2 steps", "1 step each", "2 steps each"], answer: 1, right: "right — equal speeds, equal distances to the start.", wrong: "phase 2 relies on equal distances. what speeds make them arrive together?" },
    { q: "head → start is 2 nodes. how far is the meeting point from the start (going forward round the loop)?", options: ["2 nodes (mod loop length)", "always 0", "the loop length"], answer: 0, right: "exactly — that's why they meet at the start.", wrong: "the key fact: both distances are equal, up to whole laps." },
  ],
};

export const middleNode: Problem = {
  slug: "middle-of-linked-list",
  topic: "linked-list",
  sheet: [15],
  title: "find the middle of a linked list",
  sheetTitle: "Find the middle Element of a linked list.",
  pattern: "ll-fast-slow",
  difficulty: "easy",
  summary: "one pass, two speeds: slow ends up halfway.",
  intro: "return the middle node's value. for an even number of nodes there are two middles — return the second one.",
  example: { input: "2 → 4 → 6 → 7 → 5 → 1", output: "7", why: "six nodes: the middles are 6 and 7, and we return the second." },
  clues: ["you don't know the length in advance.", "one pointer twice as fast as another covers the list in half the time."],
  approaches: [
    {
      level: "brute", name: "count, then walk half", idea: "count the nodes, then walk n/2 steps.",
      walkthrough: ["count n.", "walk ⌊n/2⌋ steps from the head."], pseudocode: "n ← length\nwalk n div 2 steps",
      code: { js: `function middle(head) {\n  let n = 0;\n  for (let c = head; c; c = c.next) n++;\n  let c = head;\n  for (let i = 0; i < Math.floor(n / 2); i++) c = c.next;\n  return c.val;\n}`, py: `def middle(head):\n    n, c = 0, head\n    while c: n += 1; c = c.next\n    c = head\n    for _ in range(n // 2): c = c.next\n    return c.val` },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "1.5 passes.", spaceWhy: "a counter.", ops: (n) => 1.5 * n },
      pros: ["clear."], cons: ["two passes."],
    },
    {
      level: "optimal", name: "slow and fast pointers", idea: "move slow one step and fast two steps; when fast can't move two more, slow is in the middle.",
      walkthrough: ["slow = fast = head.", "while fast and fast.next: slow ×1, fast ×2.", "return slow."],
      pseudocode: "slow ← head; fast ← head\nwhile fast and fast.next: slow ← slow.next; fast ← fast.next.next\nreturn slow",
      code: {
        js: `function middle(head) {
  let slow = head, fast = head; // @init
  while (fast && fast.next) {
    slow = slow.next; // @move
    fast = fast.next.next; // @move
  }
  return slow.val; // @done
}`,
        py: `def middle(head):
    slow = fast = head  # @init
    while fast and fast.next:
        slow = slow.next  # @move
        fast = fast.next.next  # @move
    return slow.val  # @done`,
        java: `static int middle(Node head) {
    Node slow = head, fast = head; // @init
    while (fast != null && fast.next != null) {
        slow = slow.next; // @move
        fast = fast.next.next; // @move
    }
    return slow.val; // @done
}`,
        cpp: `int middle(Node* head) {
    Node *slow = head, *fast = head; // @init
    while (fast && fast->next) {
        slow = slow->next; // @move
        fast = fast->next->next; // @move
    }
    return slow->val; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "fast walks the list once; slow walks half.", spaceWhy: "two pointers.", ops: (n) => n },
      pros: ["single pass."], cons: ["the even-length choice (first or second middle) depends on the loop condition — know which you need."],
      tracer: "ll-middle",
    },
  ],
  input: { arrays: [listField()], defaults: { arr: [2, 4, 6, 7, 5, 1] } },
  checkpoints: [
    { q: "for 1 → 2 → 3 → 4 → 5, where does slow stop?", options: ["2", "3", "4"], answer: 1, right: "right — the exact middle.", wrong: "fast visits 1, 3, 5. how many times did slow move?" },
    { q: "which loop condition makes slow stop at the FIRST middle of an even list?", options: ["while fast and fast.next", "while fast.next and fast.next.next", "while slow"], answer: 1, right: "yes — fast stops one step earlier.", wrong: "stopping fast earlier stops slow earlier too…" },
  ],
};

export const isCircularList: Problem = {
  slug: "is-circular",
  topic: "linked-list",
  sheet: [16],
  title: "check if a linked list is circular",
  sheetTitle: "Check if a linked list is a circular linked list.",
  pattern: "ll-fast-slow",
  difficulty: "easy",
  summary: "does the tail link back to the head?",
  intro: "a linked list is circular if its last node points back to the head (instead of to null). decide whether a given list is circular.",
  example: { input: "1 → 2 → 3 → (back to 1)", output: "true", why: "walking from the head returns to the head." },
  clues: ["walk until you hit null (not circular) or come back to the head (circular).", "an empty list is usually treated as circular.", "if the loop might not include the head, use floyd instead."],
  approaches: [
    {
      level: "optimal", name: "walk until null or head", idea: "start from head.next and walk; stop at null or at the head.",
      walkthrough: ["c = head.next.", "while c is not null and not head: c = c.next.", "circular iff c == head."],
      pseudocode: "c ← head.next\nwhile c ≠ null and c ≠ head: c ← c.next\nreturn c = head",
      code: {
        js: `function isCircular(head) {
  if (!head) return true; // @init
  let c = head.next;
  while (c && c !== head) c = c.next; // @walk
  return c === head; // @done
}`,
        py: `def is_circular(head):
    if head is None:
        return True  # @init
    c = head.next
    while c and c is not head:
        c = c.next  # @walk
    return c is head  # @done`,
        java: `static boolean isCircular(Node head) {
    if (head == null) return true; // @init
    Node c = head.next;
    while (c != null && c != head) c = c.next; // @walk
    return c == head; // @done
}`,
        cpp: `bool isCircular(Node* head) {
    if (!head) return true; // @init
    Node* c = head->next;
    while (c && c != head) c = c->next; // @walk
    return c == head; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "at most one lap.", spaceWhy: "one pointer.", ops: (n) => n },
      pros: ["simple."], cons: ["loops forever if the list has a loop that doesn't pass through the head — use floyd for general loops."],
      tracer: "ll-is-circular",
    },
  ],
  input: { arrays: [listField(8)], scalars: [{ key: "k", label: "circular? (1 = yes, 0 = no)", min: 0, max: 1 }], defaults: { arr: [1, 2, 3, 4], k: 1 } },
  checkpoints: [
    { q: "why start from head.next rather than head?", options: ["to skip a value", "so the loop doesn't stop immediately because c == head", "no reason"], answer: 1, right: "exactly.", wrong: "the loop stops when c == head. what if c starts there?" },
    { q: "1 → 2 → 3 → 2 (loop back to 2). what happens with this algorithm?", options: ["returns false", "loops forever", "returns true"], answer: 1, right: "right — it never meets null or the head. floyd handles this.", wrong: "follow it: 2, 3, 2, 3… does it ever see null or 1?" },
  ],
};

export const splitCircular: Problem = {
  slug: "split-circular-list",
  topic: "linked-list",
  sheet: [17],
  title: "split a circular linked list into two halves",
  sheetTitle: "Split a Circular linked list into two halves.",
  pattern: "ll-fast-slow",
  difficulty: "medium",
  summary: "two circular lists from one; the first gets the extra node if odd.",
  intro: "split a circular linked list into two circular lists of (nearly) equal size. if the count is odd, the first half gets one more node.",
  example: { input: "1 → 5 → 7 → (back to 1)", output: "1 → 5 → (back to 1) and 7 → (back to 7)", why: "three nodes: the first half takes two." },
  clues: ["finding the middle → slow/fast pointers.", "the 'end' of a circular list is the node before the head.", "each half must be closed into its own circle."],
  approaches: [
    {
      level: "optimal", name: "slow/fast, then close both circles", idea: "move slow ×1 and fast ×2 until fast is on the last or second-to-last node; slow ends the first half. relink both halves into circles.",
      walkthrough: ["stop when fast.next or fast.next.next is the head.", "even count: nudge fast to the real last node.", "head2 = slow.next.", "fast.next = head2; slow.next = head."],
      pseudocode: "while fast.next ≠ head and fast.next.next ≠ head: slow ×1, fast ×2\nif fast.next.next = head: fast ← fast.next\nhead2 ← slow.next\nfast.next ← head2; slow.next ← head",
      code: {
        js: `function split(head) {
  let slow = head, fast = head; // @init
  while (fast.next !== head && fast.next.next !== head) {
    slow = slow.next; fast = fast.next.next; // @move
  }
  if (fast.next.next === head) fast = fast.next; // @even
  const head1 = head, head2 = slow.next; // @split
  fast.next = head2; // @close
  slow.next = head1; // @close
  return [head1, head2]; // @done
}`,
        py: `def split(head):
    slow = fast = head  # @init
    while fast.next is not head and fast.next.next is not head:
        slow, fast = slow.next, fast.next.next  # @move
    if fast.next.next is head:
        fast = fast.next  # @even
    head1, head2 = head, slow.next  # @split
    fast.next = head2  # @close
    slow.next = head1  # @close
    return head1, head2  # @done`,
        java: `static Node[] split(Node head) {
    Node slow = head, fast = head; // @init
    while (fast.next != head && fast.next.next != head) {
        slow = slow.next; fast = fast.next.next; // @move
    }
    if (fast.next.next == head) fast = fast.next; // @even
    Node head1 = head, head2 = slow.next; // @split
    fast.next = head2; // @close
    slow.next = head1; // @close
    return new Node[]{head1, head2}; // @done
}`,
        cpp: `pair<Node*, Node*> split(Node* head) {
    Node *slow = head, *fast = head; // @init
    while (fast->next != head && fast->next->next != head) {
        slow = slow->next; fast = fast->next->next; // @move
    }
    if (fast->next->next == head) fast = fast->next; // @even
    Node *head1 = head, *head2 = slow->next; // @split
    fast->next = head2; // @close
    slow->next = head1; // @close
    return {head1, head2}; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "fast makes one lap.", spaceWhy: "a few pointers.", ops: (n) => n },
      pros: ["one pass, no counting."], cons: ["the even/odd nudge is easy to miss."],
      tracer: "ll-split-circular",
    },
  ],
  input: { arrays: [{ ...listField(8), minLen: 2 }], defaults: { arr: [1, 5, 7] } },
  checkpoints: [
    { q: "with 4 nodes, where does slow stop?", options: ["on node 1", "on node 2", "on node 3"], answer: 1, right: "right — the first half is nodes 1 and 2.", wrong: "the first half of 4 nodes has 2 nodes. where does it end?" },
    { q: "after splitting, what must slow.next point to?", options: ["null", "head2", "the first half's head"], answer: 2, right: "yes — each half is its own circle.", wrong: "the halves must stay circular…" },
  ],
};

export const palindromeList: Problem = {
  slug: "palindrome-linked-list",
  topic: "linked-list",
  sheet: [18],
  title: "check if a linked list is a palindrome",
  sheetTitle: "Write a Program to check whether the Singly Linked list is a palindrome or not.",
  pattern: "ll-fast-slow",
  also: ["reverse"],
  difficulty: "medium",
  summary: "does it read the same forwards and backwards?",
  intro: "decide whether the values of a singly linked list read the same forwards and backwards, ideally using O(1) extra memory.",
  example: { input: "1 → 2 → 1", output: "true", why: "reading backwards also gives 1, 2, 1." },
  clues: ["you can't walk backwards in a singly linked list…", "…but you can reverse half of it.", "find the middle with slow/fast pointers."],
  approaches: [
    {
      level: "brute", name: "stack or array", idea: "copy the values into an array and compare it with its reverse.",
      walkthrough: ["copy values.", "compare vals[i] with vals[n − 1 − i]."], pseudocode: "vals ← values\nreturn vals = reverse(vals)",
      code: { js: `function isPalindrome(head) {\n  const v = [];\n  for (let c = head; c; c = c.next) v.push(c.val);\n  for (let i = 0, j = v.length - 1; i < j; i++, j--) if (v[i] !== v[j]) return false;\n  return true;\n}`, py: `def is_palindrome(head):\n    v, c = [], head\n    while c: v.append(c.val); c = c.next\n    return v == v[::-1]` },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "two passes.", spaceWhy: "an array of all values.", ops: (n) => 2 * n },
      pros: ["simple, list untouched."], cons: ["O(n) memory."],
    },
    {
      level: "optimal", name: "reverse the second half", idea: "find the middle with slow/fast, reverse the second half in place, and compare it node by node with the first half.",
      walkthrough: ["slow/fast: slow stops at the middle.", "reverse from slow to the end.", "walk a from the head and b from the reversed half, comparing values.", "(restore the half afterwards if the list must be unchanged.)"],
      pseudocode: "slow ← middle\nsecond ← reverse(slow)\nfor a from head, b from second: if a.val ≠ b.val: return false\nreturn true",
      code: {
        js: `function isPalindrome(head) {
  let slow = head, fast = head; // @middle
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; } // @middle
  let prev = null, curr = slow; // @reverse
  while (curr) { const nx = curr.next; curr.next = prev; prev = curr; curr = nx; } // @reverse
  let a = head, b = prev, ok = true; // @compare
  while (b) { if (a.val !== b.val) { ok = false; break; } a = a.next; b = b.next; } // @compare
  return ok; // @done
}`,
        py: `def is_palindrome(head):
    slow = fast = head  # @middle
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next  # @middle
    prev, curr = None, slow  # @reverse
    while curr:
        nx = curr.next; curr.next = prev; prev, curr = curr, nx  # @reverse
    a, b, ok = head, prev, True  # @compare
    while b:
        if a.val != b.val: ok = False; break  # @compare
        a, b = a.next, b.next
    return ok  # @done`,
        java: `static boolean isPalindrome(Node head) {
    Node slow = head, fast = head; // @middle
    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; } // @middle
    Node prev = null, curr = slow; // @reverse
    while (curr != null) { Node nx = curr.next; curr.next = prev; prev = curr; curr = nx; } // @reverse
    Node a = head, b = prev; boolean ok = true; // @compare
    while (b != null) { if (a.val != b.val) { ok = false; break; } a = a.next; b = b.next; } // @compare
    return ok; // @done
}`,
        cpp: `bool isPalindrome(Node* head) {
    Node *slow = head, *fast = head; // @middle
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; } // @middle
    Node *prev = nullptr, *curr = slow; // @reverse
    while (curr) { Node* nx = curr->next; curr->next = prev; prev = curr; curr = nx; } // @reverse
    Node *a = head, *b = prev; bool ok = true; // @compare
    while (b) { if (a->val != b->val) { ok = false; break; } a = a->next; b = b->next; } // @compare
    return ok; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "three half-passes.", spaceWhy: "a few pointers — the list itself is used as scratch space.", ops: (n) => 1.5 * n },
      pros: ["constant memory."], cons: ["temporarily modifies the list; restore it if others use it concurrently."],
      tracer: "ll-palindrome",
    },
  ],
  input: { arrays: [listField()], defaults: { arr: [1, 2, 3, 2, 1] } },
  checkpoints: [
    { q: "why reverse only the second half?", options: ["it's faster to reverse less", "so we can walk both halves forward at the same time and compare", "to sort it"], answer: 1, right: "exactly — the reversed half reads the list backwards from the end.", wrong: "comparing needs the end read backwards. how do you get that in a singly linked list?" },
    { q: "for an odd-length list, what about the exact middle node?", options: ["it must equal the head", "it's compared with itself or skipped — it can't break a palindrome", "it's removed"], answer: 1, right: "right — the middle mirrors itself.", wrong: "what is the middle of a palindrome compared against?" },
  ],
};

export const nthFromEnd: Problem = {
  slug: "nth-from-end",
  topic: "linked-list",
  sheet: [35],
  title: "nth node from the end of a linked list",
  sheetTitle: "Program for n’th node from the end of a Linked List",
  pattern: "ll-fast-slow",
  also: ["two pointers with a gap"],
  difficulty: "easy",
  summary: "one pass: give one pointer an n-node head start.",
  intro: "return the value of the nth node counting from the end (the last node is n = 1). if the list has fewer than n nodes, return −1.",
  example: { input: "1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9, n = 2", output: "8", why: "8 is second from the end." },
  clues: ["counting from the end in a singly linked list.", "two pointers with a fixed gap of n.", "when the leading pointer runs off the end, the trailing one is in position."],
  approaches: [
    {
      level: "brute", name: "count, then walk", idea: "count the length L, then walk L − n steps from the head.",
      walkthrough: ["count L.", "if n > L → −1.", "walk L − n steps."], pseudocode: "L ← length\nif n > L: return −1\nwalk L − n steps",
      code: { js: `function nthFromEnd(head, n) {\n  let L = 0;\n  for (let c = head; c; c = c.next) L++;\n  if (n > L) return -1;\n  let c = head;\n  for (let i = 0; i < L - n; i++) c = c.next;\n  return c.val;\n}`, py: `def nth_from_end(head, n):\n    L, c = 0, head\n    while c: L += 1; c = c.next\n    if n > L: return -1\n    c = head\n    for _ in range(L - n): c = c.next\n    return c.val` },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "two passes.", spaceWhy: "a counter.", ops: (n) => 2 * n },
      pros: ["straightforward."], cons: ["two passes."],
    },
    {
      level: "optimal", name: "lead and trail with a gap", idea: "move lead n nodes ahead; then move lead and trail together until lead is null. trail is the answer.",
      walkthrough: ["lead = trail = head.", "advance lead n times (if it runs out → −1).", "advance both until lead is null.", "return trail."],
      pseudocode: "lead ← head; trail ← head\nrepeat n times: if lead = null: return −1; lead ← lead.next\nwhile lead: lead ← lead.next; trail ← trail.next\nreturn trail.val",
      code: {
        js: `function nthFromEnd(head, n) {
  let lead = head, trail = head; // @init
  for (let i = 0; i < n; i++) {
    if (!lead) return -1; // @short
    lead = lead.next; // @gap
  }
  while (lead) { lead = lead.next; trail = trail.next; } // @move
  return trail.val; // @done
}`,
        py: `def nth_from_end(head, n):
    lead = trail = head  # @init
    for _ in range(n):
        if lead is None:
            return -1  # @short
        lead = lead.next  # @gap
    while lead:
        lead, trail = lead.next, trail.next  # @move
    return trail.val  # @done`,
        java: `static int nthFromEnd(Node head, int n) {
    Node lead = head, trail = head; // @init
    for (int i = 0; i < n; i++) {
        if (lead == null) return -1; // @short
        lead = lead.next; // @gap
    }
    while (lead != null) { lead = lead.next; trail = trail.next; } // @move
    return trail.val; // @done
}`,
        cpp: `int nthFromEnd(Node* head, int n) {
    Node *lead = head, *trail = head; // @init
    for (int i = 0; i < n; i++) {
        if (!lead) return -1; // @short
        lead = lead->next; // @gap
    }
    while (lead) { lead = lead->next; trail = trail->next; } // @move
    return trail->val; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "lead walks the list once.", spaceWhy: "two pointers.", ops: (n) => n },
      pros: ["single pass."], cons: ["off-by-one on the gap is the usual bug — test n = 1 and n = length."],
      tracer: "ll-nth-from-end",
    },
  ],
  input: { arrays: [listField()], scalars: [{ key: "k", label: "n", min: 1, max: 12 }], defaults: { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9], k: 2 } },
  checkpoints: [
    { q: "with n = 1, which node is returned?", options: ["the head", "the last node", "the second-last node"], answer: 1, right: "right — first from the end.", wrong: "n = 1 means the very last node…" },
    { q: "when lead becomes null, how far is trail from the end?", options: ["n nodes", "n − 1 nodes", "1 node"], answer: 0, right: "yes — the gap was kept at n the whole time.", wrong: "the gap between them never changed…" },
  ],
};
