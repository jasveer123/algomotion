import type { Problem } from "@/lib/types";

const listField = (maxLen = 9, min = -99, max = 99, label = "list values") => ({ key: "arr" as const, label, min, max, minLen: 1, maxLen });

export const reverseKGroup: Problem = {
  slug: "reverse-k-group",
  topic: "linked-list",
  sheet: [2],
  title: "reverse a linked list in groups of k",
  sheetTitle: "Reverse a Linked List in group of Given Size. [Very Imp]",
  pattern: "ll-rewiring",
  difficulty: "hard",
  summary: "reverse every block of k nodes, then stitch the blocks back together.",
  intro: "split the list into consecutive groups of k nodes and reverse each group in place. if the last group has fewer than k nodes, reverse it too (this is the version the sheet uses).",
  example: { input: "1 → 2 → 2 → 4 → 5 → 6 → 7 → 8, k = 4", output: "4 → 2 → 2 → 1 → 8 → 7 → 6 → 5", why: "the first four nodes are reversed, then the next four." },
  clues: ["it's plain list reversal, repeated on chunks.", "after reversing a group, its first node becomes its tail — remember it to link the next group.", "the first reversed group supplies the new head."],
  approaches: [
    {
      level: "brute", name: "values through an array", idea: "copy values into an array, reverse each block of k in the array, write the values back.",
      walkthrough: ["copy all values.", "reverse every slice of length k.", "write back in order."], pseudocode: "vals ← values\nfor i in 0, k, 2k…: reverse vals[i..i+k−1]\nwrite vals back",
      code: {
        js: `function reverseK(head, k) {
  const vals = [];
  for (let c = head; c; c = c.next) vals.push(c.val);
  for (let i = 0; i < vals.length; i += k) {
    const part = vals.slice(i, i + k).reverse();
    vals.splice(i, part.length, ...part);
  }
  let i = 0;
  for (let c = head; c; c = c.next) c.val = vals[i++];
  return head;
}`,
        py: `def reverse_k(head, k):
    vals, c = [], head
    while c:
        vals.append(c.val); c = c.next
    for i in range(0, len(vals), k):
        vals[i:i + k] = vals[i:i + k][::-1]
    c, i = head, 0
    while c:
        c.val = vals[i]; c, i = c.next, i + 1
    return head`,
      },
      complexity: { time: "O(n)", space: "O(n)", timeWhy: "a few linear passes.", spaceWhy: "an array of all values.", ops: (n) => 3 * n },
      pros: ["hard to get wrong."], cons: ["extra memory, and it moves values instead of nodes."],
    },
    {
      level: "optimal", name: "reverse each group in place", idea: "reverse k nodes with the usual prev/curr/next loop, then link the previous group's tail (the old first node) to this group's new front.",
      walkthrough: ["remember groupHead = curr — after reversal it's the group's tail.", "reverse up to k nodes.", "the first group's new front is the answer's head.", "link the previous group's tail to prev (this group's new front).", "repeat until curr is null."],
      pseudocode: "newHead ← null; prevTail ← null; curr ← head\nwhile curr\n  groupHead ← curr; prev ← null; count ← 0\n  while curr and count < k: flip curr; count++\n  if newHead = null: newHead ← prev\n  if prevTail: prevTail.next ← prev\n  prevTail ← groupHead\nreturn newHead",
      code: {
        js: `function reverseK(head, k) {
  let newHead = null, prevTail = null, curr = head; // @init
  while (curr) {
    const groupHead = curr; // @group
    let prev = null, count = 0;
    while (curr && count < k) {
      const next = curr.next; curr.next = prev; // @flip
      prev = curr; curr = next; count++; // @flip
    }
    if (!newHead) newHead = prev; // @link
    if (prevTail) prevTail.next = prev; // @link
    prevTail = groupHead; // @link
  }
  return newHead; // @done
}`,
        py: `def reverse_k(head, k):
    new_head, prev_tail, curr = None, None, head  # @init
    while curr:
        group_head = curr  # @group
        prev, count = None, 0
        while curr and count < k:
            nxt = curr.next; curr.next = prev  # @flip
            prev, curr, count = curr, nxt, count + 1  # @flip
        if new_head is None: new_head = prev  # @link
        if prev_tail: prev_tail.next = prev  # @link
        prev_tail = group_head  # @link
    return new_head  # @done`,
        java: `static Node reverseK(Node head, int k) {
    Node newHead = null, prevTail = null, curr = head; // @init
    while (curr != null) {
        Node groupHead = curr; // @group
        Node prev = null; int count = 0;
        while (curr != null && count < k) {
            Node next = curr.next; curr.next = prev; // @flip
            prev = curr; curr = next; count++; // @flip
        }
        if (newHead == null) newHead = prev; // @link
        if (prevTail != null) prevTail.next = prev; // @link
        prevTail = groupHead; // @link
    }
    return newHead; // @done
}`,
        cpp: `Node* reverseK(Node* head, int k) {
    Node *newHead = nullptr, *prevTail = nullptr, *curr = head; // @init
    while (curr) {
        Node* groupHead = curr; // @group
        Node* prev = nullptr; int count = 0;
        while (curr && count < k) {
            Node* next = curr->next; curr->next = prev; // @flip
            prev = curr; curr = next; count++; // @flip
        }
        if (!newHead) newHead = prev; // @link
        if (prevTail) prevTail->next = prev; // @link
        prevTail = groupHead; // @link
    }
    return newHead; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "every node is flipped once and every group linked once.", spaceWhy: "a handful of pointers (the recursive textbook version uses O(n/k) stack).", ops: (n) => n },
      pros: ["one pass, in place."], cons: ["three pointers to juggle; drawing it out helps."],
      tracer: "ll-reverse-k",
    },
  ],
  input: { arrays: [listField()], scalars: [{ key: "k", label: "group size k", min: 1, max: 9 }], defaults: { arr: [1, 2, 2, 4, 5, 6, 7, 8], k: 4 } },
  checkpoints: [
    { q: "after reversing a group, which node becomes that group's tail?", options: ["the node that was first in the group", "the node that was last", "the list's head"], answer: 0, right: "right — that's why we remember groupHead before reversing.", wrong: "reversal flips the order. where does the group's first node end up?" },
    { q: "1 → 2 → 3 → 4 → 5 with k = 2. result?", options: ["2 → 1 → 4 → 3 → 5", "5 → 4 → 3 → 2 → 1", "2 → 1 → 3 → 4 → 5"], answer: 0, right: "yes — pairs are reversed, and the single 5 stays put.", wrong: "reverse (1,2), then (3,4), then the leftover (5)." },
  ],
};

export const removeDupSorted: Problem = {
  slug: "remove-duplicates-sorted-list",
  topic: "linked-list",
  sheet: [6],
  title: "remove duplicates from a sorted linked list",
  sheetTitle: "Remove Duplicates in a sorted Linked List.",
  pattern: "ll-rewiring",
  difficulty: "easy",
  summary: "keep one copy of each value in a sorted list.",
  intro: "the list is sorted, so equal values sit next to each other. remove the extra copies so each value appears once.",
  example: { input: "2 → 2 → 4 → 5 → 5 → 5", output: "2 → 4 → 5", why: "the repeated 2 and the two extra 5s are unlinked." },
  clues: ["sorted → duplicates are neighbours.", "deleting a node = pointing its predecessor past it.", "don't advance after a deletion — the next neighbour may be another copy."],
  approaches: [
    {
      level: "optimal", name: "compare with the next node", idea: "at each node, while the next node has the same value, skip it; otherwise move on.",
      walkthrough: ["curr = head.", "if curr.next has the same value, set curr.next = curr.next.next (stay on curr).", "otherwise move curr forward."],
      pseudocode: "curr ← head\nwhile curr and curr.next\n  if curr.val = curr.next.val: curr.next ← curr.next.next\n  else: curr ← curr.next",
      code: {
        js: `function removeDuplicates(head) {
  let curr = head; // @init
  while (curr && curr.next) {
    if (curr.val === curr.next.val) curr.next = curr.next.next; // @skip
    else curr = curr.next; // @move
  }
  return head; // @done
}`,
        py: `def remove_duplicates(head):
    curr = head  # @init
    while curr and curr.next:
        if curr.val == curr.next.val:
            curr.next = curr.next.next  # @skip
        else:
            curr = curr.next  # @move
    return head  # @done`,
        java: `static Node removeDuplicates(Node head) {
    Node curr = head; // @init
    while (curr != null && curr.next != null) {
        if (curr.val == curr.next.val) curr.next = curr.next.next; // @skip
        else curr = curr.next; // @move
    }
    return head; // @done
}`,
        cpp: `Node* removeDuplicates(Node* head) {
    Node* curr = head; // @init
    while (curr && curr->next) {
        if (curr->val == curr->next->val) { Node* d = curr->next; curr->next = d->next; delete d; } // @skip
        else curr = curr->next; // @move
    }
    return head; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "each node is looked at once.", spaceWhy: "one pointer.", ops: (n) => n },
      pros: ["one pass, in place."], cons: ["relies on sorted input — for unsorted lists use a hash set."],
      tracer: "ll-dedup-sorted",
    },
  ],
  input: { arrays: [{ ...listField(), sorted: true, label: "sorted list values" }], defaults: { arr: [2, 2, 4, 5, 5, 5] } },
  checkpoints: [
    { q: "after skipping a duplicate, why don't we move curr forward?", options: ["the new next might be another copy", "to save time", "curr becomes null"], answer: 0, right: "exactly — 5 → 5 → 5 needs two skips from the same node.", wrong: "try 5 → 5 → 5. what happens if you move on after one skip?" },
    { q: "in c++, what else should happen to a skipped node?", options: ["nothing", "delete it to free its memory", "move it to the end"], answer: 1, right: "right — otherwise it leaks.", wrong: "the node is unreachable now. who frees its memory?" },
  ],
};

export const moveLastToFront: Problem = {
  slug: "move-last-to-front",
  topic: "linked-list",
  sheet: [8],
  title: "move the last element to the front",
  sheetTitle: "Write a Program to Move the last element to Front in a Linked List.",
  pattern: "ll-rewiring",
  difficulty: "easy",
  summary: "make the tail node the new head.",
  intro: "take the last node of a singly linked list and move it to the front, so it becomes the new head.",
  example: { input: "1 → 2 → 3 → 4 → 5", output: "5 → 1 → 2 → 3 → 4", why: "5 is unlinked from the end and linked in front of 1." },
  clues: ["a singly linked list can't step backwards — track the second-last node while walking.", "only two links change."],
  approaches: [
    {
      level: "optimal", name: "walk to the end, relink", idea: "walk with two pointers (secLast, last) to the end; cut after secLast; point last at the old head.",
      walkthrough: ["walk until last.next is null, keeping secLast one behind.", "secLast.next = null.", "last.next = head; last is the new head."],
      pseudocode: "secLast ← null; last ← head\nwhile last.next: secLast ← last; last ← last.next\nsecLast.next ← null\nlast.next ← head\nreturn last",
      code: {
        js: `function moveToFront(head) {
  if (!head || !head.next) return head; // @init
  let secLast = null, last = head;
  while (last.next) { secLast = last; last = last.next; } // @walk
  secLast.next = null; // @cut
  last.next = head; // @link
  return last; // @done
}`,
        py: `def move_to_front(head):
    if head is None or head.next is None:
        return head  # @init
    sec_last, last = None, head
    while last.next:
        sec_last, last = last, last.next  # @walk
    sec_last.next = None  # @cut
    last.next = head  # @link
    return last  # @done`,
        java: `static Node moveToFront(Node head) {
    if (head == null || head.next == null) return head; // @init
    Node secLast = null, last = head;
    while (last.next != null) { secLast = last; last = last.next; } // @walk
    secLast.next = null; // @cut
    last.next = head; // @link
    return last; // @done
}`,
        cpp: `Node* moveToFront(Node* head) {
    if (!head || !head->next) return head; // @init
    Node *secLast = nullptr, *last = head;
    while (last->next) { secLast = last; last = last->next; } // @walk
    secLast->next = nullptr; // @cut
    last->next = head; // @link
    return last; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one walk to the tail.", spaceWhy: "two pointers.", ops: (n) => n },
      pros: ["two pointer changes."], cons: ["the walk is unavoidable without a tail pointer (or a doubly linked list)."],
      tracer: "ll-move-last",
    },
  ],
  input: { arrays: [listField()], defaults: { arr: [1, 2, 3, 4, 5] } },
  checkpoints: [
    { q: "why do we need secLast?", options: ["to count nodes", "to make it the new tail by setting its next to null", "to find the middle"], answer: 1, right: "right — without it the list would still end at the old tail.", wrong: "after moving the last node, which node must point to null?" },
    { q: "how many links change in total?", options: ["1", "2", "n"], answer: 1, right: "yes — secLast.next and last.next.", wrong: "count them: one cut, one new link." },
  ],
};

export const circularDelete: Problem = {
  slug: "delete-circular-list",
  topic: "linked-list",
  sheet: [19],
  title: "deletion from a circular linked list",
  sheetTitle: "Deletion from a Circular Linked List.",
  pattern: "ll-rewiring",
  difficulty: "medium",
  summary: "remove a node with a given value from a circular list.",
  intro: "in a circular linked list the last node points back to the head instead of to null. delete the first node holding a given key, keeping the circle intact — including the tricky cases of deleting the head or the only node.",
  example: { input: "2 → 5 → 7 → 8 → 10 → (back to 2), delete 8", output: "2 → 5 → 7 → 10 → (back to 2)", why: "7 now links straight to 10." },
  clues: ["there's no null to stop at — stop when you're back at the head.", "deleting the head also changes the tail's link.", "a one-node circle points to itself."],
  approaches: [
    {
      level: "optimal", name: "walk once, handle the head case", idea: "walk with prev/curr until curr holds the key (or you're back at the head). unlink it; if it was the head, the tail must point to the new head.",
      walkthrough: ["search, stopping if curr.next is the head without a match.", "only node → list becomes empty.", "deleting the head → find the tail, point it to head.next.", "otherwise prev.next = curr.next."],
      pseudocode: "curr ← head; prev ← null\nwhile curr.val ≠ key\n  if curr.next = head: return head   (not found)\n  prev ← curr; curr ← curr.next\nif curr is the only node: return null\nif curr = head: tail.next ← head.next; head ← head.next\nelse: prev.next ← curr.next",
      code: {
        js: `function deleteNode(head, key) {
  if (!head) return null; // @init
  let curr = head, prev = null;
  while (curr.val !== key) { // @search
    if (curr.next === head) return head; // @missing
    prev = curr; curr = curr.next; // @search
  }
  if (curr === head && curr.next === head) return null; // @only
  if (curr === head) {
    let tail = head; while (tail.next !== head) tail = tail.next; // @head
    head = curr.next; tail.next = head; // @head
  } else {
    prev.next = curr.next; // @unlink
  }
  return head; // @done
}`,
        py: `def delete_node(head, key):
    if head is None:
        return None  # @init
    curr, prev = head, None
    while curr.val != key:  # @search
        if curr.next is head:
            return head  # @missing
        prev, curr = curr, curr.next  # @search
    if curr is head and curr.next is head:
        return None  # @only
    if curr is head:
        tail = head
        while tail.next is not head: tail = tail.next  # @head
        head = curr.next; tail.next = head  # @head
    else:
        prev.next = curr.next  # @unlink
    return head  # @done`,
        java: `static Node deleteNode(Node head, int key) {
    if (head == null) return null; // @init
    Node curr = head, prev = null;
    while (curr.val != key) { // @search
        if (curr.next == head) return head; // @missing
        prev = curr; curr = curr.next; // @search
    }
    if (curr == head && curr.next == head) return null; // @only
    if (curr == head) {
        Node tail = head; while (tail.next != head) tail = tail.next; // @head
        head = curr.next; tail.next = head; // @head
    } else {
        prev.next = curr.next; // @unlink
    }
    return head; // @done
}`,
        cpp: `Node* deleteNode(Node* head, int key) {
    if (!head) return nullptr; // @init
    Node *curr = head, *prev = nullptr;
    while (curr->val != key) { // @search
        if (curr->next == head) return head; // @missing
        prev = curr; curr = curr->next; // @search
    }
    if (curr == head && curr->next == head) { delete curr; return nullptr; } // @only
    if (curr == head) {
        Node* tail = head; while (tail->next != head) tail = tail->next; // @head
        head = curr->next; tail->next = head; // @head
    } else {
        prev->next = curr->next; // @unlink
    }
    delete curr;
    return head; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "at most one lap to find the key, plus one lap to find the tail when deleting the head.", spaceWhy: "a few pointers.", ops: (n) => 2 * n },
      pros: ["handles every edge case explicitly."], cons: ["deleting the head costs an extra walk unless you also keep a tail pointer."],
      tracer: "ll-circular-delete",
    },
  ],
  input: { arrays: [listField(8)], scalars: [{ key: "target", label: "key to delete", min: -99, max: 99 }], defaults: { arr: [2, 5, 7, 8, 10], target: 8 } },
  checkpoints: [
    { q: "how do you know you've searched the whole circle?", options: ["curr becomes null", "curr.next is the head again", "after n steps"], answer: 1, right: "right — there's no null in a circle.", wrong: "a circular list never reaches null. what tells you you've come round?" },
    { q: "deleting the head: which other node's link must change?", options: ["the second node", "the tail", "none"], answer: 1, right: "yes — the tail pointed at the old head.", wrong: "who points at the head in a circular list?" },
  ],
};

export const reverseDLL: Problem = {
  slug: "reverse-doubly-linked-list",
  topic: "linked-list",
  sheet: [20],
  title: "reverse a doubly linked list",
  sheetTitle: "Reverse a Doubly Linked list.",
  pattern: "ll-rewiring",
  difficulty: "easy",
  summary: "swap every node's prev and next.",
  intro: "each node of a doubly linked list points both to the next node and to the previous one. reverse the list in place.",
  example: { input: "3 ⇄ 4 ⇄ 5", output: "5 ⇄ 4 ⇄ 3", why: "every node's two links trade places; 5 becomes the head." },
  clues: ["a doubly linked node already knows both neighbours.", "reversal = swapping each node's two pointers.", "after the swap, the old 'next' lives in prev — follow prev to continue."],
  approaches: [
    {
      level: "optimal", name: "swap prev and next", idea: "walk the list; at each node swap prev and next; move on via the (new) prev pointer; the last node visited is the new head.",
      walkthrough: ["curr = head.", "swap curr.prev and curr.next.", "last = curr; curr = curr.prev (the old next).", "return last."],
      pseudocode: "curr ← head; last ← null\nwhile curr\n  swap(curr.prev, curr.next)\n  last ← curr\n  curr ← curr.prev\nreturn last",
      code: {
        js: `function reverseDLL(head) {
  let curr = head, last = null; // @init
  while (curr) {
    [curr.prev, curr.next] = [curr.next, curr.prev]; // @swap
    last = curr;
    curr = curr.prev; // @advance
  }
  return last; // @done
}`,
        py: `def reverse_dll(head):
    curr, last = head, None  # @init
    while curr:
        curr.prev, curr.next = curr.next, curr.prev  # @swap
        last = curr
        curr = curr.prev  # @advance
    return last  # @done`,
        java: `static Node reverseDLL(Node head) {
    Node curr = head, last = null; // @init
    while (curr != null) {
        Node t = curr.prev; curr.prev = curr.next; curr.next = t; // @swap
        last = curr;
        curr = curr.prev; // @advance
    }
    return last; // @done
}`,
        cpp: `Node* reverseDLL(Node* head) {
    Node *curr = head, *last = nullptr; // @init
    while (curr) {
        swap(curr->prev, curr->next); // @swap
        last = curr;
        curr = curr->prev; // @advance
    }
    return last; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one pass.", spaceWhy: "two pointers.", ops: (n) => n },
      pros: ["no saved-next juggling — the node keeps both links."], cons: ["forgetting that 'forward' is now prev is the usual bug."],
      tracer: "ll-reverse-dll",
    },
  ],
  input: { arrays: [listField(8)], defaults: { arr: [3, 4, 5] } },
  checkpoints: [
    { q: "after swapping a node's pointers, how do you reach the rest of the list?", options: ["via next", "via prev", "you can't"], answer: 1, right: "right — the old next is now stored in prev.", wrong: "the swap moved the forward link. where did it go?" },
    { q: "what's the new head?", options: ["the old head", "the last node the loop visited", "null"], answer: 1, right: "yes — the old tail.", wrong: "which node is at the front once everything is reversed?" },
  ],
};

export const rotateDLL: Problem = {
  slug: "rotate-doubly-linked-list",
  topic: "linked-list",
  sheet: [24],
  title: "rotate a doubly linked list by n nodes",
  sheetTitle: "Rotate DoublyLinked list by N nodes.",
  pattern: "ll-rewiring",
  difficulty: "medium",
  summary: "move the first n nodes to the end.",
  intro: "rotate a doubly linked list counter-clockwise by n nodes: the first n nodes move, in order, to the end of the list. n is smaller than the list's length.",
  example: { input: "1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5 ⇄ 6, n = 2", output: "3 ⇄ 4 ⇄ 5 ⇄ 6 ⇄ 1 ⇄ 2", why: "1 and 2 moved behind 6." },
  clues: ["no node values change — only the ends move.", "join tail to head to make a circle, then break it after the nth node.", "a doubly linked list needs the prev links fixed at the cut and the join."],
  approaches: [
    {
      level: "optimal", name: "make a circle, cut after the nth node", idea: "walk to the nth node and to the tail; connect tail ⇄ head; the node after the nth becomes the head; cut after the nth node.",
      walkthrough: ["walk to the nth node.", "walk on to the tail.", "tail.next = head, head.prev = tail.", "head = nth.next; head.prev = null; nth.next = null."],
      pseudocode: "nth ← node n\ntail ← last node\ntail.next ← head; head.prev ← tail\nhead ← nth.next; head.prev ← null\nnth.next ← null",
      code: {
        js: `function rotate(head, n) {
  if (n === 0 || !head) return head; // @init
  let curr = head;
  for (let i = 1; i < n && curr; i++) curr = curr.next; // @walk
  if (!curr || !curr.next) return head; // @walk
  const nth = curr;
  let tail = nth; while (tail.next) tail = tail.next; // @tail
  tail.next = head; head.prev = tail; // @join
  head = nth.next; head.prev = null; // @cut
  nth.next = null; // @cut
  return head; // @done
}`,
        py: `def rotate(head, n):
    if n == 0 or head is None:
        return head  # @init
    curr = head
    for _ in range(n - 1):
        if curr is None: break
        curr = curr.next  # @walk
    if curr is None or curr.next is None:
        return head  # @walk
    nth, tail = curr, curr
    while tail.next: tail = tail.next  # @tail
    tail.next = head; head.prev = tail  # @join
    head = nth.next; head.prev = None  # @cut
    nth.next = None  # @cut
    return head  # @done`,
        java: `static Node rotate(Node head, int n) {
    if (n == 0 || head == null) return head; // @init
    Node curr = head;
    for (int i = 1; i < n && curr != null; i++) curr = curr.next; // @walk
    if (curr == null || curr.next == null) return head; // @walk
    Node nth = curr, tail = nth;
    while (tail.next != null) tail = tail.next; // @tail
    tail.next = head; head.prev = tail; // @join
    head = nth.next; head.prev = null; // @cut
    nth.next = null; // @cut
    return head; // @done
}`,
        cpp: `Node* rotate(Node* head, int n) {
    if (n == 0 || !head) return head; // @init
    Node* curr = head;
    for (int i = 1; i < n && curr; i++) curr = curr->next; // @walk
    if (!curr || !curr->next) return head; // @walk
    Node *nth = curr, *tail = nth;
    while (tail->next) tail = tail->next; // @tail
    tail->next = head; head->prev = tail; // @join
    head = nth->next; head->prev = nullptr; // @cut
    nth->next = nullptr; // @cut
    return head; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one walk to the tail.", spaceWhy: "a few pointers.", ops: (n) => n },
      pros: ["four link changes, no node moves."], cons: ["prev links at the join and the cut are easy to forget."],
      tracer: "ll-rotate-dll",
    },
  ],
  input: { arrays: [listField(9)], scalars: [{ key: "k", label: "rotate by n", min: 0, max: 8 }], defaults: { arr: [1, 2, 3, 4, 5, 6], k: 2 } },
  checkpoints: [
    { q: "rotating a 6-node list by 2: which node becomes the new tail?", options: ["the 2nd node", "the 6th node", "the 3rd node"], answer: 0, right: "right — nodes 1 and 2 move to the end, so 2 is last.", wrong: "the first two nodes move behind the old tail. which is last now?" },
    { q: "why is the list briefly a circle?", options: ["it's a bug", "joining tail to head lets us cut anywhere to rotate", "doubly linked lists are always circular"], answer: 1, right: "exactly — a rotation is just choosing where to cut the circle.", wrong: "think of the list as a loop of nodes. what does rotating do to it?" },
  ],
};

export const reverseDLLGroups: Problem = {
  slug: "reverse-dll-groups",
  topic: "linked-list",
  sheet: [25],
  title: "reverse a doubly linked list in groups of k",
  sheetTitle: "Rotate a Doubly Linked list in group of Given Size.[Very IMP]",
  pattern: "ll-rewiring",
  difficulty: "hard",
  summary: "k-group reversal on a list with both next and prev links.",
  intro: "reverse each consecutive group of k nodes of a doubly linked list (the last group may be smaller and is reversed too). both the next and the prev links must end up consistent.",
  example: { input: "10 ⇄ 8 ⇄ 4 ⇄ 2, k = 2", output: "8 ⇄ 10 ⇄ 2 ⇄ 4", why: "(10, 8) and (4, 2) are each reversed." },
  clues: ["same shape as singly linked k-group reversal.", "inside a group, each node's prev and next simply swap.", "at group boundaries, set both the next link of the previous group and the prev link of the new group front."],
  approaches: [
    {
      level: "optimal", name: "group-by-group swap", idea: "for each group, walk k nodes swapping next/prev; then connect the previous group's tail and this group's new front in both directions.",
      walkthrough: ["remember groupHead.", "for up to k nodes: next = curr.next; curr.next = prev; curr.prev = next.", "newFront (prev) .prev = previous group's tail; that tail's next = newFront.", "continue with the next group."],
      pseudocode: "same as k-group reversal, plus:\n  curr.prev ← next while flipping\n  newFront.prev ← prevTail",
      code: {
        js: `function reverseDLLGroups(head, k) {
  let newHead = null, prevTail = null, curr = head; // @init
  while (curr) {
    const groupHead = curr;
    let prev = null, count = 0;
    while (curr && count < k) {
      const next = curr.next; // @flip
      curr.next = prev; curr.prev = next; // @flip
      prev = curr; curr = next; count++; // @flip
    }
    prev.prev = prevTail; // @link
    if (!newHead) newHead = prev; // @link
    if (prevTail) prevTail.next = prev; // @link
    prevTail = groupHead;
  }
  return newHead; // @done
}`,
        py: `def reverse_dll_groups(head, k):
    new_head, prev_tail, curr = None, None, head  # @init
    while curr:
        group_head, prev, count = curr, None, 0
        while curr and count < k:
            nxt = curr.next  # @flip
            curr.next, curr.prev = prev, nxt  # @flip
            prev, curr, count = curr, nxt, count + 1  # @flip
        prev.prev = prev_tail  # @link
        if new_head is None: new_head = prev  # @link
        if prev_tail: prev_tail.next = prev  # @link
        prev_tail = group_head
    return new_head  # @done`,
        java: `static Node reverseDLLGroups(Node head, int k) {
    Node newHead = null, prevTail = null, curr = head; // @init
    while (curr != null) {
        Node groupHead = curr, prev = null; int count = 0;
        while (curr != null && count < k) {
            Node next = curr.next; // @flip
            curr.next = prev; curr.prev = next; // @flip
            prev = curr; curr = next; count++; // @flip
        }
        prev.prev = prevTail; // @link
        if (newHead == null) newHead = prev; // @link
        if (prevTail != null) prevTail.next = prev; // @link
        prevTail = groupHead;
    }
    return newHead; // @done
}`,
        cpp: `Node* reverseDLLGroups(Node* head, int k) {
    Node *newHead = nullptr, *prevTail = nullptr, *curr = head; // @init
    while (curr) {
        Node *groupHead = curr, *prev = nullptr; int count = 0;
        while (curr && count < k) {
            Node* next = curr->next; // @flip
            curr->next = prev; curr->prev = next; // @flip
            prev = curr; curr = next; count++; // @flip
        }
        prev->prev = prevTail; // @link
        if (!newHead) newHead = prev; // @link
        if (prevTail) prevTail->next = prev; // @link
        prevTail = groupHead;
    }
    return newHead; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "each node is touched once.", spaceWhy: "a few pointers.", ops: (n) => n },
      pros: ["one pass, in place."], cons: ["two links per node to keep consistent — test the boundaries."],
      tracer: "ll-reverse-dll-groups",
    },
  ],
  input: { arrays: [listField()], scalars: [{ key: "k", label: "group size k", min: 1, max: 9 }], defaults: { arr: [10, 8, 4, 2], k: 2 } },
  checkpoints: [
    { q: "inside a group, what does each node's prev become?", options: ["its old next", "its old prev", "null"], answer: 0, right: "right — the two links swap roles.", wrong: "after reversal, the node that used to come after it now comes before it…" },
    { q: "at a group boundary, which prev link must be set?", options: ["the new group front's prev → previous group's tail", "the old head's prev", "none"], answer: 0, right: "yes — otherwise walking backwards stops at the group edge.", wrong: "think about walking backwards across two groups." },
  ],
};

export const reverseUnderLinear: Problem = {
  slug: "reverse-less-than-linear",
  topic: "linked-list",
  sheet: [26],
  title: "can we reverse a linked list in less than O(n)?",
  sheetTitle: "Can we reverse a linked list in less than O(n) ?",
  pattern: "ll-rewiring",
  also: ["concept"],
  difficulty: "medium",
  summary: "not physically — but a doubly linked list with a direction flag can reverse its view in O(1).",
  intro: "a concept question. to physically reverse a singly linked list, every node's next pointer has to change, so you must touch all n nodes: Ω(n). but if the list is doubly linked and you keep both head and tail, you can 'reverse' it in O(1) by swapping the two ends and flipping a direction flag.",
  example: { input: "1 ⇄ 2 ⇄ 3 ⇄ 4 (with head and tail stored)", output: "reads as 4 → 3 → 2 → 1", why: "only head, tail and one boolean changed." },
  clues: ["ask: does every node have to change? for a singly linked list, yes.", "a lower bound of n is proven by 'every item must be touched'.", "changing how you read a structure can be cheaper than changing the structure."],
  approaches: [
    {
      level: "improved", name: "physical reversal — Θ(n)", idea: "flip every link with prev/curr/next. no algorithm can do better on a singly linked list, because each of the n next pointers must be rewritten.",
      walkthrough: ["every node's next must change.", "so at least n writes are needed.", "the three-pointer loop achieves exactly that."],
      pseudocode: "prev ← null; curr ← head\nwhile curr: next ← curr.next; curr.next ← prev; prev ← curr; curr ← next\nreturn prev",
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
      },
      complexity: { time: "Θ(n)", space: "O(1)", timeWhy: "n pointer writes, and that's also the lower bound.", spaceWhy: "three pointers.", ops: (n) => n },
      pros: ["really reverses the list; every reader sees it."], cons: ["can't be faster than n for a singly linked list."],
      tracer: "ll-reverse",
    },
    {
      level: "optimal", name: "logical reversal — O(1)", idea: "store head and tail of a doubly linked list plus a 'reversed' flag. reverse() swaps head/tail and toggles the flag; traversal follows prev instead of next when the flag is set.",
      walkthrough: ["keep both ends of a doubly linked list.", "reverse(): swap head and tail, flip the flag.", "next(node) returns node.prev when reversed, else node.next."],
      pseudocode: "reverse():\n  swap(head, tail)\n  reversed ← not reversed\nnext(node):\n  return reversed ? node.prev : node.next",
      code: {
        js: `class ReversibleList { // doubly linked, keeps both ends // @init
  reverse() {
    [this.head, this.tail] = [this.tail, this.head]; // @flip
    this.reversed = !this.reversed; // @flip
  }
  next(node) {
    return this.reversed ? node.prev : node.next; // @walk
  }
} // @done`,
        py: `class ReversibleList:  # doubly linked, keeps both ends  # @init
    def reverse(self):
        self.head, self.tail = self.tail, self.head  # @flip
        self.reversed = not self.reversed  # @flip

    def next(self, node):
        return node.prev if self.reversed else node.next  # @walk
# @done`,
        java: `class ReversibleList { // doubly linked, keeps both ends // @init
    Node head, tail; boolean reversed;
    void reverse() {
        Node t = head; head = tail; tail = t; // @flip
        reversed = !reversed; // @flip
    }
    Node next(Node node) {
        return reversed ? node.prev : node.next; // @walk
    }
} // @done`,
        cpp: `struct ReversibleList { // doubly linked, keeps both ends // @init
    Node *head = nullptr, *tail = nullptr; bool reversed = false;
    void reverse() {
        std::swap(head, tail); // @flip
        reversed = !reversed; // @flip
    }
    Node* next(Node* node) const {
        return reversed ? node->prev : node->next; // @walk
    }
}; // @done`,
      },
      complexity: { time: "O(1)", space: "O(1)", timeWhy: "two assignments and a boolean flip, whatever the length.", spaceWhy: "one flag.", ops: () => 1 },
      pros: ["constant time reversal — useful when reversals are frequent."], cons: ["needs a doubly linked list and a tail pointer.", "every traversal must respect the flag, so it's a design choice, not a trick on an existing singly linked list."],
      tracer: "ll-reverse-flag",
    },
  ],
  input: { arrays: [listField(8)], defaults: { arr: [1, 2, 3, 4] } },
  checkpoints: [
    { q: "why can't a singly linked list be physically reversed faster than O(n)?", options: ["because of recursion", "every one of the n next pointers must be rewritten", "because we need extra memory"], answer: 1, right: "exactly — n writes is a hard lower bound.", wrong: "count how many pointers differ between the original and the reversed list." },
    { q: "what makes the O(1) version possible?", options: ["prev pointers plus a stored tail", "a hash map", "sorting first"], answer: 0, right: "right — with both ends and both directions, 'reversed' is just a different reading order.", wrong: "to read backwards you need a way to step backwards and a place to start." },
  ],
};

export const sort012List: Problem = {
  slug: "sort-012-linked-list",
  topic: "linked-list",
  sheet: [29],
  title: "sort a linked list of 0s, 1s and 2s",
  sheetTitle: "Sort a LL of 0's, 1's and 2's",
  pattern: "ll-rewiring",
  also: ["dummy nodes"],
  difficulty: "easy",
  summary: "group the 0s, 1s and 2s of a list in one pass.",
  intro: "the list only contains 0, 1 and 2. rearrange it so all 0s come first, then 1s, then 2s.",
  example: { input: "1 → 2 → 2 → 1 → 2 → 0 → 2 → 2", output: "0 → 1 → 1 → 2 → 2 → 2 → 2 → 2", why: "the same values, grouped." },
  clues: ["only three distinct values.", "a list can be split into several lists and joined back cheaply.", "dummy heads remove the 'empty list' special cases."],
  approaches: [
    {
      level: "brute", name: "count and overwrite", idea: "count 0s, 1s and 2s, then walk again writing that many of each.",
      walkthrough: ["count each value.", "overwrite the nodes in order."], pseudocode: "count c0, c1, c2\nwrite c0 zeros, c1 ones, c2 twos",
      code: {
        js: `function sort012(head) {
  const c = [0, 0, 0];
  for (let n = head; n; n = n.next) c[n.val]++;
  let v = 0;
  for (let n = head; n; n = n.next) { while (!c[v]) v++; n.val = v; c[v]--; }
  return head;
}`,
        py: `def sort012(head):
    c = [0, 0, 0]
    n = head
    while n:
        c[n.val] += 1; n = n.next
    n, v = head, 0
    while n:
        while c[v] == 0: v += 1
        n.val = v; c[v] -= 1; n = n.next
    return head`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "two passes.", spaceWhy: "three counters.", ops: (n) => 2 * n },
      pros: ["simple."], cons: ["rewrites values — not allowed if nodes carry other data."],
    },
    {
      level: "optimal", name: "three lists, then join", idea: "walk once, appending every node to a 0-list, 1-list or 2-list (each with a dummy head), then join them.",
      walkthrough: ["three dummy heads and three tails.", "append each node to its list's tail.", "join: 0-tail → 1-list (or 2-list if empty), 1-tail → 2-list, 2-tail → null."],
      pseudocode: "for node in list: append node to list[node.val]\nzeroTail.next ← one.next or two.next\noneTail.next ← two.next\ntwoTail.next ← null",
      code: {
        js: `function sort012(head) {
  const zero = { next: null }, one = { next: null }, two = { next: null }; // @init
  let z = zero, o = one, t = two;
  for (let c = head; c; c = c.next) {
    if (c.val === 0) { z.next = c; z = c; } // @zero
    else if (c.val === 1) { o.next = c; o = c; } // @one
    else { t.next = c; t = c; } // @two
  }
  z.next = one.next ? one.next : two.next; // @join
  o.next = two.next; // @join
  t.next = null; // @join
  return zero.next || one.next || two.next;
}`,
        py: `def sort012(head):
    zero, one, two = Node(0), Node(0), Node(0)  # @init
    z, o, t = zero, one, two
    c = head
    while c:
        if c.val == 0: z.next = c; z = c  # @zero
        elif c.val == 1: o.next = c; o = c  # @one
        else: t.next = c; t = c  # @two
        c = c.next
    z.next = one.next or two.next  # @join
    o.next = two.next  # @join
    t.next = None  # @join
    return zero.next or one.next or two.next`,
        java: `static Node sort012(Node head) {
    Node zero = new Node(0), one = new Node(0), two = new Node(0); // @init
    Node z = zero, o = one, t = two;
    for (Node c = head; c != null; c = c.next) {
        if (c.val == 0) { z.next = c; z = c; } // @zero
        else if (c.val == 1) { o.next = c; o = c; } // @one
        else { t.next = c; t = c; } // @two
    }
    z.next = (one.next != null) ? one.next : two.next; // @join
    o.next = two.next; // @join
    t.next = null; // @join
    return zero.next != null ? zero.next : one.next != null ? one.next : two.next;
}`,
        cpp: `Node* sort012(Node* head) {
    Node zero(0), one(0), two(0); // @init
    Node *z = &zero, *o = &one, *t = &two;
    for (Node* c = head; c; c = c->next) {
        if (c->val == 0) { z->next = c; z = c; } // @zero
        else if (c->val == 1) { o->next = c; o = c; } // @one
        else { t->next = c; t = c; } // @two
    }
    z->next = one.next ? one.next : two.next; // @join
    o->next = two.next; // @join
    t->next = nullptr; // @join
    return zero.next ? zero.next : one.next ? one.next : two.next;
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one pass plus three link changes.", spaceWhy: "three dummy nodes.", ops: (n) => n },
      pros: ["moves real nodes, stable, one pass."], cons: ["the join has empty-list cases to get right."],
      tracer: "ll-sort-012",
    },
  ],
  input: { arrays: [{ key: "arr", label: "values (0, 1 or 2)", allowed: [0, 1, 2], minLen: 1, maxLen: 9 }], defaults: { arr: [1, 2, 2, 1, 2, 0, 2, 2] } },
  checkpoints: [
    { q: "why use dummy head nodes?", options: ["they store the counts", "appending never needs an 'is this list empty?' check", "they make it faster"], answer: 1, right: "exactly — every list always has a tail to append to.", wrong: "what would you do when appending the first 0 without a dummy?" },
    { q: "there are no 1s. what should the 0-list's tail point to?", options: ["null", "the first 2", "the dummy 1 node"], answer: 1, right: "right — skip the empty 1-list.", wrong: "the 1-list is empty, so what comes right after the 0s?" },
  ],
};

export const deleteGreaterRight: Problem = {
  slug: "delete-greater-on-right",
  topic: "linked-list",
  sheet: [33],
  title: "delete nodes which have a greater value on the right",
  sheetTitle: "Delete nodes which have a greater value on right side",
  pattern: "ll-rewiring",
  also: ["reverse", "running max"],
  difficulty: "medium",
  summary: "keep only nodes that are ≥ everything after them.",
  intro: "remove every node that has some node with a greater value anywhere to its right. what's left is a non-increasing list of 'leaders'.",
  example: { input: "12 → 15 → 10 → 11 → 5 → 6 → 2 → 3", output: "15 → 11 → 6 → 3", why: "12 has 15 to its right, 10 has 11, 5 has 6, 2 has 3." },
  clues: ["'greater on the right' = compare with the maximum of everything after a node.", "a running maximum is easy right-to-left, but a singly list only goes left-to-right…", "…so reverse it, scan, and reverse back."],
  approaches: [
    {
      level: "brute", name: "check everything to the right", idea: "for each node, scan all later nodes; delete it if any is bigger.",
      walkthrough: ["for each node, scan the rest of the list.", "delete it if a bigger value exists."], pseudocode: "for each node x\n  if some later node > x: delete x",
      code: {
        js: `function deleteGreaterRight(head) {
  const dummy = { next: head };
  let prev = dummy;
  while (prev.next) {
    const x = prev.next;
    let bigger = false;
    for (let c = x.next; c; c = c.next) if (c.val > x.val) { bigger = true; break; }
    if (bigger) prev.next = x.next; else prev = x;
  }
  return dummy.next;
}`,
        py: `def delete_greater_right(head):
    dummy = Node(0); dummy.next = head
    prev = dummy
    while prev.next:
        x, c, bigger = prev.next, prev.next.next, False
        while c:
            if c.val > x.val: bigger = True; break
            c = c.next
        if bigger: prev.next = x.next
        else: prev = x
    return dummy.next`,
      },
      complexity: { time: "O(n²)", space: "O(1)", timeWhy: "each node may scan the whole rest.", spaceWhy: "a few pointers.", ops: (n) => (n * n) / 2 },
      pros: ["direct translation of the problem."], cons: ["quadratic."],
    },
    {
      level: "optimal", name: "reverse, keep a running max, reverse back", idea: "after reversing, 'to the right' becomes 'already seen'. keep the max seen so far and unlink any node smaller than it. then reverse again.",
      walkthrough: ["reverse the list.", "maxNode = head; walk: if next < max → unlink next; else move on and update max.", "reverse again to restore the order."],
      pseudocode: "head ← reverse(head)\nmax ← head; curr ← head\nwhile curr.next\n  if curr.next.val < max.val: curr.next ← curr.next.next\n  else: curr ← curr.next; max ← curr\nreturn reverse(head)",
      code: {
        js: `function compute(head) {
  head = reverse(head); // @reverse
  let maxNode = head, curr = head; // @init
  while (curr && curr.next) {
    if (curr.next.val < maxNode.val) { // @check
      curr.next = curr.next.next; // @delete
    } else {
      curr = curr.next; maxNode = curr; // @keep
    }
  }
  return reverse(head); // @restore
}`,
        py: `def compute(head):
    head = reverse(head)  # @reverse
    max_node = curr = head  # @init
    while curr and curr.next:
        if curr.next.val < max_node.val:  # @check
            curr.next = curr.next.next  # @delete
        else:
            curr = curr.next; max_node = curr  # @keep
    return reverse(head)  # @restore`,
        java: `static Node compute(Node head) {
    head = reverse(head); // @reverse
    Node maxNode = head, curr = head; // @init
    while (curr != null && curr.next != null) {
        if (curr.next.val < maxNode.val) { // @check
            curr.next = curr.next.next; // @delete
        } else {
            curr = curr.next; maxNode = curr; // @keep
        }
    }
    return reverse(head); // @restore
}`,
        cpp: `Node* compute(Node* head) {
    head = reverse(head); // @reverse
    Node *maxNode = head, *curr = head; // @init
    while (curr && curr->next) {
        if (curr->next->val < maxNode->val) { // @check
            Node* d = curr->next; curr->next = d->next; delete d; // @delete
        } else {
            curr = curr->next; maxNode = curr; // @keep
        }
    }
    return reverse(head); // @restore
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "three linear passes (reverse, scan, reverse).", spaceWhy: "a few pointers.", ops: (n) => 3 * n },
      pros: ["linear, in place."], cons: ["two reversals — easy to forget the second one."],
      tracer: "ll-delete-greater-right",
    },
  ],
  input: { arrays: [listField(9)], defaults: { arr: [12, 15, 10, 11, 5, 6, 2, 3] } },
  checkpoints: [
    { q: "why reverse the list first?", options: ["so 'to the right' becomes 'already visited', where a running max works", "to sort it", "to find the middle"], answer: 0, right: "exactly — a running max only works over what you've already seen.", wrong: "a running maximum summarises the past. what must be 'the past' here?" },
    { q: "is the last node ever deleted?", options: ["yes, sometimes", "no — nothing is to its right"], answer: 1, right: "right — it always stays.", wrong: "can anything be greater to the right of the last node?" },
  ],
};

export const segregateEvenOdd: Problem = {
  slug: "segregate-even-odd",
  topic: "linked-list",
  sheet: [34],
  title: "segregate even and odd nodes",
  sheetTitle: "Segregate even and odd nodes in a Linked List",
  pattern: "ll-rewiring",
  also: ["dummy nodes"],
  difficulty: "medium",
  summary: "even values first, then odd values, keeping their order.",
  intro: "rearrange the list so all nodes with even values come before all nodes with odd values. the relative order inside the even group and inside the odd group must be preserved.",
  example: { input: "17 → 15 → 8 → 9 → 2 → 4 → 6", output: "8 → 2 → 4 → 6 → 17 → 15 → 9", why: "evens in their original order, then odds in theirs." },
  clues: ["a stable split into two groups.", "build two lists while walking once, then join them.", "dummy heads keep the code short."],
  approaches: [
    {
      level: "optimal", name: "two lists, then join", idea: "append each node to an even list or an odd list (keeping order), then point the even tail at the odd head.",
      walkthrough: ["two dummy heads.", "walk once, appending by parity.", "evenTail.next = odd head; oddTail.next = null."],
      pseudocode: "for node in list: append to even or odd list\nevenTail.next ← oddHead\noddTail.next ← null\nreturn evenHead (or oddHead if no evens)",
      code: {
        js: `function segregate(head) {
  const evenD = { next: null }, oddD = { next: null }; // @init
  let e = evenD, o = oddD;
  for (let c = head; c; c = c.next) {
    if (c.val % 2 === 0) { e.next = c; e = c; } // @even
    else { o.next = c; o = c; } // @odd
  }
  e.next = oddD.next; // @join
  o.next = null; // @join
  return evenD.next || oddD.next;
}`,
        py: `def segregate(head):
    even_d, odd_d = Node(0), Node(0)  # @init
    e, o, c = even_d, odd_d, head
    while c:
        if c.val % 2 == 0: e.next = c; e = c  # @even
        else: o.next = c; o = c  # @odd
        c = c.next
    e.next = odd_d.next  # @join
    o.next = None  # @join
    return even_d.next or odd_d.next`,
        java: `static Node segregate(Node head) {
    Node evenD = new Node(0), oddD = new Node(0); // @init
    Node e = evenD, o = oddD;
    for (Node c = head; c != null; c = c.next) {
        if (c.val % 2 == 0) { e.next = c; e = c; } // @even
        else { o.next = c; o = c; } // @odd
    }
    e.next = oddD.next; // @join
    o.next = null; // @join
    return evenD.next != null ? evenD.next : oddD.next;
}`,
        cpp: `Node* segregate(Node* head) {
    Node evenD(0), oddD(0); // @init
    Node *e = &evenD, *o = &oddD;
    for (Node* c = head; c; c = c->next) {
        if (c->val % 2 == 0) { e->next = c; e = c; } // @even
        else { o->next = c; o = c; } // @odd
    }
    e->next = oddD.next; // @join
    o->next = nullptr; // @join
    return evenD.next ? evenD.next : oddD.next;
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one pass.", spaceWhy: "two dummy nodes.", ops: (n) => n },
      pros: ["stable, in place, one pass."], cons: ["don't forget to end the odd list with null (it may still point into the old list)."],
      tracer: "ll-even-odd",
    },
  ],
  input: { arrays: [listField(9)], defaults: { arr: [17, 15, 8, 9, 2, 4, 6] } },
  checkpoints: [
    { q: "why must oddTail.next be set to null?", options: ["style", "it may still point at an old node, creating a cycle", "to free memory"], answer: 1, right: "exactly — the last odd node's link is stale.", wrong: "the last odd node was linked to whatever followed it originally…" },
    { q: "is this approach stable (keeps order within each group)?", options: ["yes", "no"], answer: 0, right: "right — nodes are appended in the order we meet them.", wrong: "we append each node to the end of its group as we walk…" },
  ],
};
