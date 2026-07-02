/**
 * Minimal, dependency-free line-based unified diff (LCS backtrack + hunk
 * grouping with context). Consumer files are small, so the O(n·m) LCS table is
 * fine; for pathologically large inputs we fall back to a single whole-file
 * replacement hunk to avoid quadratic blow-up.
 */
type Op = { type: 'eq' | 'del' | 'add'; line: string };

const LARGE = 5000;

const diffLines = (a: string[], b: string[]): Op[] => {
  if (a.length > LARGE || b.length > LARGE) {
    return [
      ...a.map((line): Op => ({ type: 'del', line })),
      ...b.map((line): Op => ({ type: 'add', line })),
    ];
  }

  const n = a.length;
  const m = b.length;
  // lcs[i][j] = length of LCS of a[i:] and b[j:]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] =
        a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'eq', line: a[i]! });
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      ops.push({ type: 'del', line: a[i]! });
      i++;
    } else {
      ops.push({ type: 'add', line: b[j]! });
      j++;
    }
  }
  while (i < n) ops.push({ type: 'del', line: a[i++]! });
  while (j < m) ops.push({ type: 'add', line: b[j++]! });
  return ops;
};

/** Produce a unified diff for two strings, or `''` when they are identical. */
export const unifiedDiff = (
  fileName: string,
  before: string,
  after: string,
  context = 3,
): string => {
  if (before === after) return '';

  const ops = diffLines(before.split('\n'), after.split('\n'));

  // Indices of ops that are changes (non-eq).
  const changeIdx = ops.map((op, idx) => (op.type === 'eq' ? -1 : idx)).filter((idx) => idx >= 0);
  if (changeIdx.length === 0) return '';

  // Group changes into hunks, each padded by `context` equal lines and merged when they overlap.
  type Range = { start: number; end: number };
  const ranges: Range[] = [];
  for (const idx of changeIdx) {
    const start = Math.max(0, idx - context);
    const end = Math.min(ops.length - 1, idx + context);
    const last = ranges[ranges.length - 1];
    if (last && start <= last.end + 1) last.end = Math.max(last.end, end);
    else ranges.push({ start, end });
  }

  const lines: string[] = [`--- a/${fileName}`, `+++ b/${fileName}`];
  for (const range of ranges) {
    let aStart = 0;
    let bStart = 0;
    for (let k = 0; k < range.start; k++) {
      if (ops[k]!.type !== 'add') aStart++;
      if (ops[k]!.type !== 'del') bStart++;
    }
    let aLen = 0;
    let bLen = 0;
    const body: string[] = [];
    for (let k = range.start; k <= range.end; k++) {
      const op = ops[k]!;
      if (op.type === 'eq') {
        body.push(` ${op.line}`);
        aLen++;
        bLen++;
      } else if (op.type === 'del') {
        body.push(`-${op.line}`);
        aLen++;
      } else {
        body.push(`+${op.line}`);
        bLen++;
      }
    }
    lines.push(`@@ -${aStart + 1},${aLen} +${bStart + 1},${bLen} @@`);
    lines.push(...body);
  }
  return lines.join('\n');
};
