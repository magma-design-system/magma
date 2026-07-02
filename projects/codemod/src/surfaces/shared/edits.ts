/**
 * Offset-based text edits. Surfaces that edit source by character range (HTML
 * via parse5 locations) collect {@link Edit}s and apply them all at once;
 * applying right-to-left keeps earlier offsets valid.
 */
export interface Edit {
  start: number;
  end: number;
  text: string;
}

/** Apply edits to `source`. Non-overlapping edits are assumed; ties break by widest-first. */
export const applyEdits = (source: string, edits: readonly Edit[]): string => {
  const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  let out = source;
  for (const edit of sorted) out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  return out;
};

/** 1-based line/column for a character offset. */
export const offsetToLineCol = (
  source: string,
  offset: number,
): { line: number; column: number } => {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') {
      line++;
      lineStart = i + 1;
    }
  }
  return { line, column: offset - lineStart + 1 };
};

/** The leading whitespace of the line containing `offset` (used to indent injected comments). */
export const lineIndentAt = (source: string, offset: number): string => {
  let start = offset;
  while (start > 0 && source[start - 1] !== '\n') start--;
  let end = start;
  while (end < source.length && (source[end] === ' ' || source[end] === '\t')) end++;
  return source.slice(start, end);
};
