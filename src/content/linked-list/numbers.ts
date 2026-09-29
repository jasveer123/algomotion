import type { Problem } from "@/lib/types";

const digits = (key: "arr" | "arr2", label: string, maxLen = 7) => ({ key, label, min: 0, max: 9, minLen: 1, maxLen });

export const addOne: Problem = {
  slug: "add-one-to-list",
  topic: "linked-list",
  sheet: [9],
  title: "add 1 to a number represented as a linked list",
  sheetTitle: "Add “1” to a number represented as a Linked List.",
  pattern: "ll-numbers",
  difficulty: "easy",
  summary: "increment a number stored one digit per node, most significant first.",
  intro: "each node holds one digit, with the most significant digit at the head (4 → 5 → 6 is 456). add 1 to the number and return the head of the result.",
  example: { input: "1 → 9 → 9", output: "2 → 0 → 0", why: "199 + 1 = 200: the 9s roll over and the 1 becomes 2." },
  clues: ["adding 1 only affects the trailing 9s and the digit just before them.", "you can't walk backwards to propagate a carry…", "…so remember the last digit that isn't 9."],
  approaches: [
    {
      level: "brute", name: "reverse, add, reverse back", idea: "reverse the list so the ones digit is first, add 1 with a carry, then reverse back.",
      walkthrough: ["reverse the list.", "add 1 to the first node and propagate the carry.", "append a node if a carry is left.", "reverse back."], pseudocode: "reverse\ncarry ← 1; for each node: sum ← val + carry; val ← sum mod 10; carry ← sum div 10\nif carry: append 1\nreverse",
      code: { js: `function addOne(head) {\n  head = reverse(head);\n  let carry = 1, c = head, last = null;\n  while (c) { const s = c.val + carry; c.val = s % 10; carry = Math.floor(s / 10); last = c; c = c.next; }\n  if (carry) last.next = { val: carry, next: null };\n  return reverse(head);\n}`, py: `def add_one(head):\n    head = reverse(head)\n    carry, c, last = 1, head, None\n    while c:\n        s = c.val + carry\n        c.val, carry = s % 10, s // 10\n        last, c = c, c.next\n    if carry: last.next = Node(carry)\n    return reverse(head)` },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "three passes.", spaceWhy: "in place.", ops: (n) => 3 * n },
      pros: ["the general 'add with carry' pattern."], cons: ["two reversals for a +1."],
    },
    {
      level: "optimal", name: "remember the last non-9", idea: "walk once, remembering the last node whose digit isn't 9. increment it and zero everything after it. if every digit is 9, all become 0 and a new 1 goes in front.",
      walkthrough: ["scan: lastNotNine = last node with val ≠ 9.", "none found → set all to 0 and prepend 1.", "else lastNotNine.val++.", "set every later digit to 0."],
      pseudocode: "lastNotNine ← last node with val ≠ 9\nif none: all ← 0; prepend 1\nelse: lastNotNine.val++; zero every node after it",
      code: {
        js: `function addOne(head) {
  let lastNotNine = null; // @init
  for (let c = head; c; c = c.next) if (c.val !== 9) lastNotNine = c; // @scan
  if (!lastNotNine) { // @allNine
    for (let c = head; c; c = c.next) c.val = 0; // @allNine
    return { val: 1, next: head }; // @allNine
  }
  lastNotNine.val++; // @bump
  for (let c = lastNotNine.next; c; c = c.next) c.val = 0; // @zero
  return head; // @done
}`,
        py: `def add_one(head):
    last_not_nine = None  # @init
    c = head
    while c:
        if c.val != 9: last_not_nine = c  # @scan
        c = c.next
    if last_not_nine is None:  # @allNine
        c = head
        while c: c.val = 0; c = c.next  # @allNine
        n = Node(1); n.next = head
        return n  # @allNine
    last_not_nine.val += 1  # @bump
    c = last_not_nine.next
    while c: c.val = 0; c = c.next  # @zero
    return head  # @done`,
        java: `static Node addOne(Node head) {
    Node lastNotNine = null; // @init
    for (Node c = head; c != null; c = c.next) if (c.val != 9) lastNotNine = c; // @scan
    if (lastNotNine == null) { // @allNine
        for (Node c = head; c != null; c = c.next) c.val = 0; // @allNine
        Node n = new Node(1); n.next = head; return n; // @allNine
    }
    lastNotNine.val++; // @bump
    for (Node c = lastNotNine.next; c != null; c = c.next) c.val = 0; // @zero
    return head; // @done
}`,
        cpp: `Node* addOne(Node* head) {
    Node* lastNotNine = nullptr; // @init
    for (Node* c = head; c; c = c->next) if (c->val != 9) lastNotNine = c; // @scan
    if (!lastNotNine) { // @allNine
        for (Node* c = head; c; c = c->next) c->val = 0; // @allNine
        Node* n = new Node(1); n->next = head; return n; // @allNine
    }
    lastNotNine->val++; // @bump
    for (Node* c = lastNotNine->next; c; c = c->next) c->val = 0; // @zero
    return head; // @done
}`,
      },
      complexity: { time: "O(n)", space: "O(1)", timeWhy: "one scan plus a short pass over the trailing 9s.", spaceWhy: "one pointer.", ops: (n) => n },
      pros: ["no reversal, no recursion."], cons: ["specific to +1 — adding a general number needs a real carry walk."],
      tracer: "ll-add-one",
    },
  ],
  input: { arrays: [digits("arr", "digits (most significant first)", 8)], defaults: { arr: [1, 9, 9] } },
  checkpoints: [
    { q: "4 → 5 → 9 → 9 plus 1: which node is 'last not nine'?", options: ["4", "5", "the last 9"], answer: 1, right: "right — it becomes 6 and the 9s become 0s: 4600.", wrong: "scan for the rightmost digit that isn't 9…" },
    { q: "9 → 9 → 9 plus 1 gives…", options: ["0 → 0 → 0", "1 → 0 → 0 → 0", "1 → 0 → 0"], answer: 1, right: "yes — a new leading 1.", wrong: "999 + 1 = 1000. how many digits?" },
  ],
};

export const addTwo: Problem = {
  slug: "add-two-numbers-lists",
  topic: "linked-list",
  sheet: [10],
  title: "add two numbers represented by linked lists",
  sheetTitle: "Add two numbers represented by linked lists.",
  pattern: "ll-numbers",
  also: ["reverse"],
  difficulty: "medium",
  summary: "digit-by-digit addition with a carry, most significant digit first.",
  intro: "two numbers are stored as linked lists, one digit per node, most significant digit first. return their sum as a linked list in the same format.",
  example: { input: "4 → 5 and 3 → 4 → 5", output: "3 → 9 → 0", why: "45 + 345 = 390." },
  clues: ["addition starts from the ones digits, which are at the tails.", "reverse both lists (or use stacks) to reach the ones digits first.", "prepending result digits keeps the answer most-significant-first without a final reversal."],
  approaches: [
    {
      level: "brute", name: "stacks", idea: "push the digits of both lists onto stacks; pop from both, adding with a carry, and prepend each result digit.",
      walkthrough: ["push digits onto two stacks.", "pop, add with carry, prepend a node.", "continue while digits or carry remain."], pseudocode: "stacks a, b\nwhile a or b or carry: s ← pop(a) + pop(b) + carry; prepend s mod 10; carry ← s div 10",
      code: { js: `function addTwo(a, b) {\n  const s1 = [], s2 = [];\n  for (let c = a; c; c = c.next) s1.push(c.val);\n  for (let c = b; c; c = c.next) s2.push(c.val);\n  let carry = 0, result = null;\n  while (s1.length || s2.length || carry) {\n    const s = (s1.pop() || 0) + (s2.pop() || 0) + carry;\n    carry = Math.floor(s / 10);\n    result = { val: s % 10, next: result };\n  }\n  return result;\n}`, py: `def add_two(a, b):\n    s1, s2 = [], []\n    while a: s1.append(a.val); a = a.next\n    while b: s2.append(b.val); b = b.next\n    carry, result = 0, None\n    while s1 or s2 or carry:\n        s = (s1.pop() if s1 else 0) + (s2.pop() if s2 else 0) + carry\n        carry = s // 10\n        n = Node(s % 10); n.next = result; result = n\n    return result` },
      complexity: { time: "O(n + m)", space: "O(n + m)", timeWhy: "each digit pushed and popped once.", spaceWhy: "two stacks.", ops: (n) => 3 * n },
      pros: ["input lists untouched."], cons: ["extra memory."],
    },
    {
      level: "optimal", name: "reverse both, add, prepend", idea: "reverse both lists so the ones digits come first, add digit by digit with a carry, and prepend each new digit to the result.",
      walkthrough: ["reverse a and b.", "sum = digit a + digit b + carry.", "prepend sum mod 10, carry = sum div 10.", "continue while digits or a carry remain."],
      pseudocode: "a ← reverse(a); b ← reverse(b)\nwhile a or b or carry\n  s ← (a?) + (b?) + carry\n  prepend s mod 10; carry ← s div 10",
      code: {
        js: `function addTwo(a, b) {
  a = reverse(a); b = reverse(b); // @reverse
  let carry = 0, result = null;
  while (a || b || carry) {
    const sum = (a ? a.val : 0) + (b ? b.val : 0) + carry; // @prepend
    carry = Math.floor(sum / 10); // @prepend
    result = { val: sum % 10, next: result }; // @prepend
    if (a) a = a.next; if (b) b = b.next;
  }
  return result; // @done
}`,
        py: `def add_two(a, b):
    a, b = reverse(a), reverse(b)  # @reverse
    carry, result = 0, None
    while a or b or carry:
        s = (a.val if a else 0) + (b.val if b else 0) + carry  # @prepend
        carry = s // 10  # @prepend
        n = Node(s % 10); n.next = result; result = n  # @prepend
        a = a.next if a else None
        b = b.next if b else None
    return result  # @done`,
        java: `static Node addTwo(Node a, Node b) {
    a = reverse(a); b = reverse(b); // @reverse
    int carry = 0; Node result = null;
    while (a != null || b != null || carry != 0) {
        int sum = (a != null ? a.val : 0) + (b != null ? b.val : 0) + carry; // @prepend
        carry = sum / 10; // @prepend
        Node n = new Node(sum % 10); n.next = result; result = n; // @prepend
        if (a != null) a = a.next; if (b != null) b = b.next;
    }
    return result; // @done
}`,
        cpp: `Node* addTwo(Node* a, Node* b) {
    a = reverse(a); b = reverse(b); // @reverse
    int carry = 0; Node* result = nullptr;
    while (a || b || carry) {
        int sum = (a ? a->val : 0) + (b ? b->val : 0) + carry; // @prepend
        carry = sum / 10; // @prepend
        Node* n = new Node(sum % 10); n->next = result; result = n; // @prepend
        if (a) a = a->next; if (b) b = b->next;
    }
    return result; // @done
}`,
      },
      complexity: { time: "O(n + m)", space: "O(1) extra", timeWhy: "two reversals and one addition pass.", spaceWhy: "only the result nodes.", ops: (n) => 3 * n },
      pros: ["constant extra memory."], cons: ["modifies the input lists (reverse them back if needed)."],
      tracer: "ll-add-two",
    },
  ],
  input: { arrays: [digits("arr", "first number's digits"), digits("arr2", "second number's digits")], defaults: { arr: [4, 5], arr2: [3, 4, 5] } },
  checkpoints: [
    { q: "why prepend result digits instead of appending?", options: ["it's faster", "we produce the ones digit first, but the answer must start with the most significant digit", "to save memory"], answer: 1, right: "exactly — prepending reverses the order for free.", wrong: "which digit do we compute first, and where must it end up?" },
    { q: "99 + 1: when does the loop stop?", options: ["when both lists run out", "when both lists run out AND the carry is 0", "after 2 steps"], answer: 1, right: "right — the final carry adds the leading 1: 100.", wrong: "after both lists end, is there anything left to write?" },
  ],
};

export const multiplyLists: Problem = {
  slug: "multiply-two-lists",
  topic: "linked-list",
  sheet: [32],
  title: "multiply two numbers represented by linked lists",
  sheetTitle: "Multiply 2 no. represented by LL",
  pattern: "ll-numbers",
  also: ["modular arithmetic"],
  difficulty: "easy",
  summary: "read both lists as numbers (mod 10⁹ + 7) and multiply.",
  intro: "two numbers are stored as linked lists, most significant digit first. return their product modulo 10⁹ + 7 (the lists can be long, so the numbers themselves can overflow).",
  example: { input: "9 → 4 → 6 and 8 → 4", output: "79464", why: "946 × 84 = 79464." },
  clues: ["building a number from digits: x = x · 10 + digit.", "keep the running value modulo 10⁹ + 7 to avoid overflow.", "(a · b) mod m = ((a mod m) · (b mod m)) mod m."],
  approaches: [
    {
      level: "optimal", name: "read with a running modulus", idea: "walk each list once, building its value modulo 10⁹ + 7; multiply the two results modulo 10⁹ + 7.",
      walkthrough: ["x = 0; for each digit: x = (x·10 + d) mod M.", "same for y.", "return (x·y) mod M."],
      pseudocode: "x ← 0; for d in a: x ← (x·10 + d) mod M\ny ← 0; for d in b: y ← (y·10 + d) mod M\nreturn (x·y) mod M",
      code: {
        js: `function multiply(a, b) {
  const MOD = 1000000007n;
  let x = 0n, y = 0n; // @init
  for (let c = a; c; c = c.next) x = (x * 10n + BigInt(c.val)) % MOD; // @readA
  for (let c = b; c; c = c.next) y = (y * 10n + BigInt(c.val)) % MOD; // @readB
  return (x * y) % MOD; // @done
}`,
        py: `def multiply(a, b):
    MOD = 10**9 + 7
    x = y = 0  # @init
    while a:
        x = (x * 10 + a.val) % MOD; a = a.next  # @readA
    while b:
        y = (y * 10 + b.val) % MOD; b = b.next  # @readB
    return (x * y) % MOD  # @done`,
        java: `static long multiply(Node a, Node b) {
    final long MOD = 1_000_000_007L;
    long x = 0, y = 0; // @init
    for (Node c = a; c != null; c = c.next) x = (x * 10 + c.val) % MOD; // @readA
    for (Node c = b; c != null; c = c.next) y = (y * 10 + c.val) % MOD; // @readB
    return (x * y) % MOD; // @done
}`,
        cpp: `long long multiply(Node* a, Node* b) {
    const long long MOD = 1000000007LL;
    long long x = 0, y = 0; // @init
    for (Node* c = a; c; c = c->next) x = (x * 10 + c->val) % MOD; // @readA
    for (Node* c = b; c; c = c->next) y = (y * 10 + c->val) % MOD; // @readB
    return (x * y) % MOD; // @done
}`,
      },
      complexity: { time: "O(n + m)", space: "O(1)", timeWhy: "one pass over each list.", spaceWhy: "two running values.", ops: (n) => n },
      pros: ["tiny and overflow-safe."], cons: ["gives the product modulo M, not the full digits (for full digits, use digit-array multiplication as in 'factorial of a large number')."],
      tracer: "ll-multiply",
    },
  ],
  input: { arrays: [digits("arr", "first number's digits"), digits("arr2", "second number's digits")], defaults: { arr: [9, 4, 6], arr2: [8, 4] } },
  checkpoints: [
    { q: "reading 9 → 4 → 6: what's x after the second digit?", options: ["13", "94", "49"], answer: 1, right: "right — 9·10 + 4.", wrong: "x = x·10 + digit. start with 9…" },
    { q: "why take the modulus after every step, not just at the end?", options: ["style", "the running value would overflow 64-bit integers for long lists", "it changes the answer"], answer: 1, right: "exactly — and the modular result is the same.", wrong: "a 30-digit list is a 30-digit number…" },
  ],
};
