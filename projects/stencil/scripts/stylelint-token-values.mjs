import stylelint from 'stylelint';

/*
  magma/token-values: a component sheet takes its lengths, durations and colours from the tokens
  (SPEC.md, Authoring rules, "Values come from the tokens"), so a px, rem, s or ms literal in a
  declaration value is an error, and so is a colour written as a literal: a hex, or an rgb() or
  hsl() whose channels are numbers. A colour is a role in the RGB wrapper,
  `rgb(var(--magma-text-muted) / 0.5)`, whose alpha may be a literal. em and ex are already
  rejected by unit-disallowed-list, named colours by color-named.

  Not reported:
    - 0, which no token needs to say (and a <time> cannot drop its unit: `0s` stays);
    - the 1px hairline, which must not grow with the root font size, and the 1px floors of
      `minmax(1px, 1fr)` and `min-width: 1px`;
    - the colours of a mask (`mask`, `mask-image`), which reads only their alpha;
    - url() and at-rule conditions: var() is not allowed in a @media or @container condition.

  A value that no token can say (a duration off the scale) keeps its literal under
  `stylelint-disable-next-line magma/token-values -- <the reason>`.
*/

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'magma/token-values';

const messages = ruleMessages(ruleName, {
  rejected: (literal, hint) => `Unexpected literal "${literal}": ${hint}`,
});

const meta = {
  url: 'https://github.com/magma-design-system/magma/blob/main/docs/CODING_STANDARDS.md',
};

// a number with one of the units the tokens replace, not part of an identifier (--duration-300,
// --magma-radius-2xs) nor of a hex colour
const DIMENSION = /(?<![\w.#-])([+-]?(?:\d+\.?\d*|\.\d+))(px|rem|ms|s)(?![\w%-])/gi;

// comments, strings and url() never carry a token: blanked, so that the offsets still point
// into the declaration
const UNCHECKED = /\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\([^)]*\)/gi;

const TIME_UNITS = new Set(['ms', 's']);

// the steps of --duration-*, from design-tokens/tokens/css/transitions/duration.json
const DURATION_STEPS = new Set([75, 100, 150, 200, 300, 500, 700, 1000]);

// --spacing(N) is N * 0.0025rem: 25 steps per px, 400 per rem
const SPACING_STEPS_PER_UNIT = { px: 25, rem: 400 };

// a hex colour, or the opening of an rgb() / hsl() whose first channel is a number: the token
// wrapper rgb(var(--magma-*) / a) starts with var() and passes
const COLOR = /#[0-9a-f]{3,8}(?![\w-])|\b(?:rgba?|hsla?)\(\s*(?=[+-]?[\d.])/gi;

// a mask reads only the alpha of its colours: no role to name there
const MASK = /^(?:-webkit-)?mask(?:-image)?$/i;

// where a black is a shadow, the role is the shadow ink
const SHADOW = /shadow|filter/i;

const round = (number) => parseFloat(number.toFixed(4));

/**
 * The whole literal colour that starts at `index`: the hex, or the function up to its
 * closing parenthesis.
 */
const colorAt = (value, index, opening) => {
  if (opening.startsWith('#')) {
    return opening;
  }
  let depth = 0;
  for (let i = index; i < value.length; i++) {
    if (value[i] === '(') depth++;
    else if (value[i] === ')' && --depth === 0) return value.slice(index, i + 1);
  }
  return value.slice(index);
};

/**
 * The role to use instead of a literal colour, as a hint for the message.
 */
const colorHint = (prop, literal) =>
  SHADOW.test(prop) && /^rgba?\(\s*0[\s,]+0[\s,]+0\b/i.test(literal)
    ? 'a shadow is rgb(var(--magma-shadow-ink) / <alpha>)'
    : 'paint with a role, rgb(var(--magma-*) / <alpha>)';

/**
 * The token that says a literal, as a hint for the message.
 */
const hint = (prop, number, unit) => {
  if (TIME_UNITS.has(unit)) {
    const ms = round(unit === 's' ? number * 1000 : number);
    return DURATION_STEPS.has(ms)
      ? `use var(--duration-${ms})`
      : `no --duration-* step says ${ms}ms: pick one, or keep the literal under stylelint-disable-next-line with the reason`;
  }
  if (/radius/i.test(prop)) {
    return 'use a var(--magma-radius-*) step';
  }
  return `use --spacing(${round(number * SPACING_STEPS_PER_UNIT[unit])})`;
};

/** @type {import('stylelint').Rule} */
const ruleFunction = (primary) => (root, result) => {
  const validOptions = validateOptions(result, ruleName, { actual: primary, possible: [true] });
  if (!validOptions) {
    return;
  }

  root.walkDecls((decl) => {
    const valueIndex = decl.prop.length + (decl.raws.between ?? ':').length;
    const value = decl.value.replace(UNCHECKED, (match) => ' '.repeat(match.length));

    for (const match of value.matchAll(DIMENSION)) {
      const [literal, count, rawUnit] = match;
      const unit = rawUnit.toLowerCase();
      const number = Number(count);
      if (number === 0 || (unit === 'px' && Math.abs(number) === 1)) {
        continue;
      }
      report({
        endIndex: valueIndex + match.index + literal.length,
        index: valueIndex + match.index,
        message: messages.rejected(literal, hint(decl.prop, number, unit)),
        node: decl,
        result,
        ruleName,
      });
    }

    if (MASK.test(decl.prop)) {
      return;
    }
    for (const match of value.matchAll(COLOR)) {
      const literal = colorAt(value, match.index, match[0]);
      report({
        endIndex: valueIndex + match.index + literal.length,
        index: valueIndex + match.index,
        message: messages.rejected(literal, colorHint(decl.prop, literal)),
        node: decl,
        result,
        ruleName,
      });
    }
  });
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
