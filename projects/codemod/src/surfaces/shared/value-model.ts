/**
 * Surface-agnostic model of an attribute / prop value.
 *
 * Every surface (HTML, React, Angular) parses its own syntax into one of these
 * shapes so the shared transformation core (`attribute-ops`) can reason about
 * values without knowing whether it is looking at `arrow`, `arrow={x}` or
 * `[arrow]="x"`.
 */
export type AttrValue =
  /** Shorthand presence: HTML `arrow`, JSX `arrow`, Angular `arrow` → logically `true`. */
  | { kind: 'bareTrue' }
  /** A boolean literal: JSX `arrow={true}`, Angular `[arrow]="false"`. */
  | { kind: 'boolLiteral'; value: boolean }
  /** A static string value: HTML `tone="ghost"`, JSX `tone="ghost"`. */
  | { kind: 'stringLiteral'; value: string }
  /** A dynamic expression whose text is preserved verbatim: JSX `arrow={x && y}`, Angular `[arrow]="x && y"`. */
  | { kind: 'dynamic'; expr: string };

export const bareTrue = (): AttrValue => ({ kind: 'bareTrue' });
export const boolLiteral = (value: boolean): AttrValue => ({ kind: 'boolLiteral', value });
export const stringLiteral = (value: string): AttrValue => ({ kind: 'stringLiteral', value });
export const dynamic = (expr: string): AttrValue => ({ kind: 'dynamic', expr });

/** True when the value is known at codemod time (not a runtime expression). */
export const isStatic = (value: AttrValue): boolean => value.kind !== 'dynamic';

/**
 * Coerce a value to a boolean interpretation when the prop is boolean-typed.
 * Returns the literal boolean, or the raw expression text when dynamic.
 *
 * String semantics follow Stencil's boolean prop parsing: the string `"false"`
 * is `false`, every other present string is `true`.
 */
export type ResolvedBool = { kind: 'literal'; value: boolean } | { kind: 'expr'; expr: string };

export const resolveBoolean = (value: AttrValue): ResolvedBool => {
  switch (value.kind) {
    case 'bareTrue':
      return { kind: 'literal', value: true };
    case 'boolLiteral':
      return { kind: 'literal', value: value.value };
    case 'stringLiteral':
      return { kind: 'literal', value: value.value !== 'false' };
    case 'dynamic':
      return { kind: 'expr', expr: value.expr };
  }
};
