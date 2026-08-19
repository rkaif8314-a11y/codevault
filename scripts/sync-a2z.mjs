import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SOURCE = 'https://raw.githubusercontent.com/septilex/a2z-tracker/main/dsa_tracker/a2z_problems_simple.json';
const OUT = 'public/a2z-problems.json';

const fallback = [
  { id: 37, problem_name: 'Reverse a number', topic: 'Learn the basics', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/reverse-integer/', youtube_url: 'https://youtu.be/1xNbjMdbjug?t=930' },
  { id: 38, problem_name: 'Palindrome Number', topic: 'Learn the basics', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/palindrome-number/', youtube_url: 'https://youtu.be/1xNbjMdbjug?t=1230' },
  { id: 40, problem_name: 'Check if the Number is Armstrong', topic: 'Learn the basics', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/armstrong-number/', youtube_url: 'https://youtu.be/1xNbjMdbjug?t=1418' },
  { id: 50, problem_name: 'Check if String is Palindrome or Not', topic: 'Learn the basics', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/valid-palindrome/', youtube_url: 'https://www.youtube.com/watch?v=twuC1F6gLI8&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=4' },
  { id: 51, problem_name: 'Fibonacci Number', topic: 'Learn the basics', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/fibonacci-number/', youtube_url: 'https://www.youtube.com/watch?v=kvRjNm4rVBE&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=5' },
  { id: 101, problem_name: 'Two Sum', topic: 'Arrays', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/two-sum/', youtube_url: '' },
  { id: 102, problem_name: 'Best Time to Buy and Sell Stock', topic: 'Arrays', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', youtube_url: '' },
  { id: 103, problem_name: 'Maximum Subarray', topic: 'Arrays', difficulty: 'Medium', leetcode_url: 'https://leetcode.com/problems/maximum-subarray/', youtube_url: '' },
  { id: 104, problem_name: 'Container With Most Water', topic: 'Arrays', difficulty: 'Medium', leetcode_url: 'https://leetcode.com/problems/container-with-most-water/', youtube_url: '' },
  { id: 105, problem_name: 'Product of Array Except Self', topic: 'Arrays', difficulty: 'Medium', leetcode_url: 'https://leetcode.com/problems/product-of-array-except-self/', youtube_url: '' },
  { id: 106, problem_name: 'Binary Search', topic: 'Binary Search', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/binary-search/', youtube_url: '' },
  { id: 107, problem_name: 'Search Insert Position', topic: 'Binary Search', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/search-insert-position/', youtube_url: '' },
  { id: 108, problem_name: 'Valid Parentheses', topic: 'Stack / Queues', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/valid-parentheses/', youtube_url: '' },
  { id: 109, problem_name: 'Reverse Linked List', topic: 'Linked-List', difficulty: 'Easy', leetcode_url: 'https://leetcode.com/problems/reverse-linked-list/', youtube_url: '' },
];

function normalize(rows) {
  return rows.map((row, index) => ({
    id: Number(row.id ?? index + 1),
    title: String(row.problem_name ?? '').trim(),
    topic: String(row.topic ?? 'Other').trim(),
    difficulty: ['Easy', 'Medium', 'Hard'].includes(row.difficulty) ? row.difficulty : 'Easy',
    questionUrl: String(row.leetcode_url ?? '').trim(),
    materialUrl: String(row.youtube_url ?? '').trim(),
    source: row.leetcode_url ? 'LeetCode' : 'Striver / TUF',
  })).filter((row) => row.title);
}

await mkdir('public', { recursive: true });
let rows = fallback;
try {
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  rows = await response.json();
  console.log(`CodeVault: synced ${rows.length} A2Z records from the public dataset.`);
} catch (error) {
  if (existsSync(OUT)) {
    console.warn(`CodeVault: A2Z sync failed (${error.message}); keeping existing generated catalog.`);
    process.exit(0);
  }
  console.warn(`CodeVault: A2Z sync failed (${error.message}); using fallback catalog.`);
}

await writeFile(OUT, JSON.stringify(normalize(rows), null, 2), 'utf8');
console.log(`CodeVault: wrote ${OUT}`);
