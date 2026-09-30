/**
 * Build the logical negation of an expression's source text, with light,
 * always-safe simplification. When in doubt the expression is wrapped in
 * parentheses — over-parenthesising never changes meaning.
 *
 *   negateExprText('x')          === '!x'
 *   negateExprText('a && b')     === '!(a && b)'
 *   negateExprText('!x')         === 'x'
 *   negateExprText('!(a && b)')  === '(a && b)'
 *   negateExprText('true')       === 'false'
 *   negateExprText('foo.bar()')  === '!foo.bar()'
 */
export const negateExprText = (expr: string): string => {
  const t = expr.trim();

  if (t === 'true') return 'false';
  if (t === 'false') return 'true';

  // Strip a leading `!` when it negates the whole expression (double negation).
  if (t.startsWith('!')) {
    const rest = t.slice(1).trim();
    if (isAtomic(rest) || isFullyParenthesized(rest)) return rest;
  }

  return isAtomic(t) || isFullyParenthesized(t) ? `!${t}` : `!(${t})`;
};

/**
 * A simple expression with no top-level operators: an identifier optionally
 * followed by member access, calls or index chains (e.g. `a`, `a.b`, `a.b()`,
 * `a[0].b`). These can be negated with a bare `!` prefix.
 */
const ATOMIC = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\([^()]*\)|\[[^[\]]*\])*$/;

const isAtomic = (s: string): boolean => ATOMIC.test(s.trim());

/** True when the string is a single parenthesised group spanning its whole length, e.g. `(a && b)`. */
const isFullyParenthesized = (s: string): boolean => {
  const t = s.trim();
  if (t.length < 2 || t[0] !== '(' || t[t.length - 1] !== ')') return false;
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '(') depth++;
    else if (t[i] === ')') {
      depth--;
      // Closed the opening paren before the end → not a single enclosing group.
      if (depth === 0 && i !== t.length - 1) return false;
    }
  }
  return depth === 0;
};
