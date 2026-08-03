/**
 * Surface-agnostic transformation core. These functions take a parsed value
 * (see {@link AttrValue}) plus the primitive parameters of a manifest rule and
 * return an *outcome* describing what the surface should render — they never
 * touch a concrete AST, so the logic is written and tested once.
 */
import { type AttrValue, resolveBoolean } from './value-model.js';
import { negateExprText } from './negate.js';

/** What to do with the renamed boolean prop after inverting its value. */
export type InvertOutcome =
  /** New value equals the v2 default → drop the prop entirely. */
  | { action: 'omit' }
  /** New value is `true` → emit the prop in shorthand form. */
  | { action: 'shorthandTrue' }
  /** New value is `false` but the v2 default is `true` → emit an explicit `false`. */
  | { action: 'explicitFalse' }
  /** New value is dynamic → emit the prop with the negated expression text. */
  | { action: 'expr'; expr: string };

/**
 * Invert a boolean prop's value (category B). The new prop's value is the
 * logical negation of the old one; `newDefault` decides whether that value can
 * be omitted. `oldDefault` is intentionally unused — for a boolean prop the
 * shorthand always means `true` regardless of the declared default.
 */
export const invertBoolean = (current: AttrValue, newDefault: boolean): InvertOutcome => {
  const resolved = resolveBoolean(current);

  if (resolved.kind === 'literal') {
    return outcomeForLiteral(!resolved.value, newDefault);
  }

  const negated = negateExprText(resolved.expr);
  // The negation may collapse to a literal (e.g. the expr was `true`/`false`).
  if (negated === 'true') return outcomeForLiteral(true, newDefault);
  if (negated === 'false') return outcomeForLiteral(false, newDefault);
  return { action: 'expr', expr: negated };
};

const outcomeForLiteral = (value: boolean, newDefault: boolean): InvertOutcome => {
  if (value === newDefault) return { action: 'omit' };
  return value ? { action: 'shorthandTrue' } : { action: 'explicitFalse' };
};

/** Outcome of remapping an enum value (categories A and E). */
export type EnumRemapOutcome =
  /** Map the literal to a new v2 value. */
  | { action: 'rename'; value: string }
  /** The value is already a valid v2 literal not covered by the map → leave it. */
  | { action: 'keep' }
  /** Cannot transform safely; surface should report it for manual review. */
  | { action: 'flag'; reason: string };

/**
 * Remap an enum literal, validating the target against the component's v2 enum
 * set when available. Dynamic values, map targets that are `null` (no 1:1
 * replacement) and literals absent from the v2 set are flagged for the report
 * instead of being rewritten blindly.
 */
export const remapEnum = (
  current: AttrValue,
  map: Record<string, string | null>,
  v2set?: readonly string[],
): EnumRemapOutcome => {
  if (current.kind === 'dynamic') {
    return { action: 'flag', reason: 'dynamic value, cannot remap enum' };
  }
  if (current.kind !== 'stringLiteral') {
    return { action: 'flag', reason: `non-string value for enum prop (${current.kind})` };
  }

  const value = current.value;

  if (Object.prototype.hasOwnProperty.call(map, value)) {
    const target = map[value];
    if (target === null || target === undefined) {
      return { action: 'flag', reason: `"${value}" has no v2 equivalent, migrate manually` };
    }
    if (v2set && !v2set.includes(target)) {
      return { action: 'flag', reason: `mapped target "${target}" is not in the v2 set` };
    }
    return { action: 'rename', value: target };
  }

  // Not in the map: keep it if it is already a valid v2 value, otherwise flag.
  if (v2set && !v2set.includes(value)) {
    return { action: 'flag', reason: `"${value}" is not a valid v2 value for this prop` };
  }
  return { action: 'keep' };
};
