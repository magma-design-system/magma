import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, sep } from 'node:path';
import stylelint from 'stylelint';

/*
  magma/host-knobs: the design decisions the Magma tokens feed into a component reach its rules
  from custom properties declared on :host, with the token as default, so the inspector shows
  which tokens reach the component and what to fix on the token side; their names say where they
  act (SPEC.md, Authoring rules, "The design decisions on :host", #1499). Reported:

    - a token of the families of FAMILIES (colour, radius, shadow, motion, z-index) read in a
      declaration that is not a custom property on a :host selector (`:host`,
      `:host([variant='info'])`, `:host-context(...)`, inside any at-rule): in a property of :host
      (`:host { border-radius: var(--magma-radius-md) }`) or below it (`.box { ... }`,
      `::slotted()`, `@keyframes`). Any custom property on :host may read it: a knob `--mds-*`, a
      `--private-*` (the palette of mds-button's variants), a role `--magma-*` declared again for
      what the component holds (mds-banner). Spacing, sizes and the rest of the geometry are free;
    - an `@apply` of a class of those families (APPLIED_FAMILIES): `ease-out`, `shadow-lg`,
      `rounded-md`; a class the component defines with @utility in its own sheets is checked
      where it is written;
    - a custom property declared that is neither a knob `--mds-*`, a `--private-*`, a role
      `--magma-*` nor an internal of Tailwind `--tw-*` (`--size`);
    - a knob `--mds-*` whose name starts with no component tag, does not end with a CSS property
      or a short form of one (SHORT_FORMS), so that its state comes before the property
      (`--mds-chip-selected-background`, not `--mds-chip-background-selected`), or is named by no
      `@prop`, neither of the component that declares it nor of the one that owns it: a parent may
      document the knob of its items (mds-tab sets and documents `--mds-tab-item-default-color`).

  Not reported: the axes of the system and of the page, which are no decision of the component
  (`corner-shape: var(--magma-corner-shape)`, the page gutter, the focus ring `--magma-outline-*`),
  and the behaviour of the system applied as a class (SYSTEM_CLASSES). The literals are
  magma/token-values' business.

  The document sheets, `css/<tag>-property.css` and `css/<tag>-pre-hydration.css`, are not
  shadow sheets: skipped.

  The baseline (option `pending`, the path of a JSON): a sheet that does not follow the rule yet
  is named there, relative to src/components, with the count of what the rule reports in it
  (`"mds-button/mds-button.css": 7`). A sheet at its count reports nothing; past it, it reports
  everything, the new among the rest; below it, it asks to lower the count, so the list only
  shrinks (decided on #1499). A sheet the baseline does not name, a new component's, is held at 0.
  What a stylelint-disable comment hides is not counted, as stylelint would not show it.
  `npm run list.host-knobs` lists what the rule reports, sheet by sheet, and lowers the counts.

  Where the families come from: a token is classified by its name, which the rule can read without
  a build; scripts/stylelint-host-knobs.spec.ts holds the names to the source on the real data,
  the roles of design-tokens/semantic.model.ts for the colours and the CSS that Tailwind writes
  for each class applied in the sheets, on the built theme.
*/

const {
  createPlugin,
  utils: { report: stylelintReport, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'magma/host-knobs';

const messages = ruleMessages(ruleName, {
  read: (read, family, where, knob) =>
    `Unexpected ${read} ${where}: a ${family} is a design decision, declare it on :host as a knob ${knob} with this token as default and read the knob here`,
  apply: (name, family, knob) =>
    `Unexpected @apply ${name}: a ${family} is a design decision, declare it on :host as a knob ${knob} with the token as default and read the knob here`,
  unprefixed: (name, knob) =>
    `Unexpected ${name}: a component declares a knob ${knob}, a --private-* or a role --magma-*`,
  unowned: (name) => `Unexpected ${name}: its name starts with no component tag`,
  order: (name) =>
    `Unexpected ${name}: a knob ends with the CSS property it sets, its part, variant and state before it (--mds-<tag>[-<part>][-<variant>][-<state>]-<property>; radius, shadow and background stand for border-radius, box-shadow and background-color)`,
  undocumented: (name, owner) => `Undocumented knob ${name}: name it in an @prop of ${owner}`,
  over: (count, allowed) =>
    `${count} reported in this sheet, ${allowed} allowed by its count in scripts/host-knobs-pending.json: the new ones are among them`,
  lower: (count, allowed) =>
    `${count} reported in this sheet, ${allowed} still allowed by scripts/host-knobs-pending.json: lower its count (npm run list.host-knobs -- --lower)`,
});

const meta = {
  url: 'https://github.com/magma-design-system/magma/blob/main/projects/stencil/SPEC.md#authoring-rules',
};

/*
  The families of the design decisions (decided on #1499), by the name of the token, without its
  `--`. The colours are the roles of the semantic layer (`--magma-surface-raised`), every other
  `--magma-*` name but those of NOT_COLOUR, and the palette steps (`--tone-*`, `--label-*`,
  `--color-*`); the spec holds the roles to design-tokens/semantic.model.ts.
*/
export const FAMILIES = [
  ['radius', /^(?:magma-)?radius-/],
  ['shadow', /^(?:magma-shadow-|shadow-|inset-shadow-|drop-shadow-)/],
  ['motion', /^(?:duration-|ease-|default-transition-|animate-)|^magma-.*-duration$/],
  ['z-index', /^magma-.*z-index$/],
  ['colour', /^(?:color|tone|variant|status|label)-/],
];

/*
  The `--magma-*` names that are no colour: the families above, the spacing and the widths
  (`--magma-rhythm-*`, `--magma-width-*`), the axes of the system (SYSTEM_TOKENS), and the
  opacities, blurs and offsets of styles/css/globals.css (`--magma-overlay-opacity`)
*/
const NOT_COLOUR =
  /^magma-(?:radius-|shadow-|rhythm-|width-|corner-|outline-|spacing-|view-transition-)|-(?:z-index|duration|opacity|blur|offset)$/;

/*
  The axes of the system and of the page, read anywhere (decided on #1499): the corner shape of
  the theme, the gutter of the page a component aligns to, the focus ring of the system
*/
export const SYSTEM_TOKENS = /^magma-(?:corner-|width-page-gutter$|outline-)/;

/*
  The behaviour of the system, the same in every component, applied anywhere: the focus
  indicator, and the hiding of an inner component before it hydrates (the fouc sheets)
*/
export const SYSTEM_CLASSES = new Set(['focus-bounce', 'focus-bounce--focused', 'not-hydrated']);

/*
  The classes of the families, by their Tailwind namespace: what they write reads a token of the
  family (`ease-out` is `transition-timing-function: var(--ease-out)`). A colour class
  (`bg-surface-raised`) shares its namespace with classes that are no colour (`bg-cover`,
  `text-info-detail`): the spec compiles every class applied in the sheets and fails on one this
  list misses or misnames.
*/
export const APPLIED_FAMILIES = [
  ['motion', /^(?:ease-|duration-|animate-|transition(?:-(?!none$|discrete$|normal$)|$))/],
  ['shadow', /^(?:shadow|inset-shadow|drop-shadow|ring|inset-ring)(?:-|$)/],
  ['radius', /^rounded(?:-|$)/],
  ['z-index', /^-?z-/],
  [
    'colour',
    /^(?:bg|fill|stroke|from|via|to|accent|caret)-(?!clip-|origin-|cover$|contain$|fixed$|local$|scroll$|repeat|no-repeat|center|top|bottom|left|right|none$|linear-|radial-|conic-|blend-)/,
  ],
];

/* the short forms of a property a knob may end with, as mds-banner and mds-modal write them */
export const SHORT_FORMS = new Map([
  ['background', 'background-color'],
  ['radius', 'border-radius'],
  ['shadow', 'box-shadow'],
]);

/*
  The CSS properties a knob may end with: the list stylelint itself reads for
  property-no-unknown, resolved from stylelint so that the two never disagree
*/
const require = createRequire(import.meta.url);
const CSS_PROPERTIES = new Set(
  createRequire(require.resolve('stylelint'))('known-css-properties').all,
);

/* the document sheets of a component, collected into the global ones: not shadow sheets */
const DOCUMENT_SHEET = /-(?:property|pre-hydration)\.css$/;

// comments, strings and url() never carry a read: blanked, so that the offsets still point
// into the declaration
const UNCHECKED = /\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\([^)]*\)/gi;

const VAR = /var\(\s*--([\w-]+)/g;

const PROP = /@prop\s+(--[\w-]+)/g;

const UTILITY = /@utility\s+([\w-]+)/g;

/**
 * The class an @apply names, its variants and the important mark taken away.
 */
export const baseClass = (name) => {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < name.length; i++) {
    if (name[i] === '[' || name[i] === '(') depth++;
    else if (name[i] === ']' || name[i] === ')') depth--;
    else if (name[i] === ':' && depth === 0) start = i + 1;
  }
  return name.slice(start).replace(/^!|!$/g, '');
};

/**
 * The family of design decisions a token belongs to, by its name without the `--`; undefined
 * for the rest (spacing, sizes, text, the axes of the system, the knobs and the plumbing).
 */
export const familyOf = (name) => {
  if (/^(?:mds|private|tw)-/.test(name) || SYSTEM_TOKENS.test(name)) return undefined;
  for (const [family, pattern] of FAMILIES) if (pattern.test(name)) return family;
  if (name.startsWith('magma-') && !NOT_COLOUR.test(name)) return 'colour';
  return undefined;
};

/**
 * The family of design decisions a class sets, after its variants; undefined for the rest.
 */
export const classFamilyOf = (name) => {
  const base = baseClass(name);
  if (SYSTEM_CLASSES.has(base)) return undefined;
  for (const [family, pattern] of APPLIED_FAMILIES) if (pattern.test(base)) return family;
  return undefined;
};

/**
 * Whether the name of a knob ends with a CSS property, or one of its short forms, after the tag
 * of the component that owns it.
 */
export const endsWithProperty = (name, owner) => {
  const words = name.slice(owner.length + 3).split('-');
  for (let start = 0; start < words.length; start++) {
    const tail = words.slice(start).join('-');
    if (CSS_PROPERTIES.has(tail)) return true;
    if (start === words.length - 1 && SHORT_FORMS.has(tail)) return true;
  }
  return false;
};

/**
 * The parts of a selector list, split on its top-level commas.
 */
const splitList = (selector) => {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of selector) {
    if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts;
};

/**
 * The selectors a nested rule stands for, its parents' resolved into it (`&`, or a descendant
 * when it has none). An at-rule between them changes no selector.
 */
export const resolveSelectors = (rule) => {
  const chain = [];
  for (let node = rule; node && node.type !== 'root'; node = node.parent) {
    if (node.type === 'rule') chain.unshift(node.selector);
  }
  let selectors = [''];
  for (const selector of chain) {
    selectors = selectors.flatMap((parent) =>
      splitList(selector).map((part) => {
        if (part.includes('&')) return part.replaceAll('&', parent);
        return parent ? `${parent} ${part}` : part;
      }),
    );
  }
  return selectors;
};

/**
 * Whether a selector matches the host itself: `:host` or `:host-context()` with its states, no
 * combinator and no pseudo-element after it.
 */
export const isHostSelector = (selector) => {
  if (!/^:host(?:-context)?(?![\w-])/.test(selector)) return false;
  let depth = 0;
  for (const char of selector) {
    if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    else if (depth === 0 && /[\s>+~]/.test(char)) return false;
  }
  return !selector.includes('::');
};

/**
 * Where a declaration sits: on the host, below it, or nowhere the rule looks (a @property, a
 * @font-face).
 */
const placeOf = (decl) => {
  for (let node = decl.parent; node && node.type !== 'root'; node = node.parent) {
    if (node.type === 'atrule') {
      const name = node.name.toLowerCase();
      if (name === 'property' || name === 'font-face') return 'none';
      if (name.endsWith('keyframes')) return 'below';
    }
  }
  if (decl.parent.type !== 'rule') return 'none';
  return resolveSelectors(decl.parent).every(isHostSelector) ? 'host' : 'below';
};

/**
 * The component tag and the folder of the components, from the path of the sheet.
 */
const componentOf = (file) => {
  const match = file
    ?.split(sep)
    .join('/')
    .match(/^(.*\/src\/components)\/(mds-[^/]+)\//);
  return match ? { components: match[1], tag: match[2] } : null;
};

/**
 * Every .css under a folder.
 */
const sheetsIn = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sheetsIn(path);
    return name.endsWith('.css') ? [path] : [];
  });

/**
 * The custom properties a component names in an @prop of its sheets.
 */
const documentedIn = (components, tag) => {
  const dir = join(components, tag);
  if (!existsSync(dir)) return new Set();
  return new Set(
    sheetsIn(dir).flatMap((path) =>
      [...readFileSync(path, 'utf8').matchAll(PROP)].map((match) => match[1]),
    ),
  );
};

/**
 * The classes a component defines with @utility in its own sheets (mds-toast's `animate-intro`):
 * the rule checks their declarations where they are written, not where they are applied.
 */
const utilitiesIn = (components, tag) => {
  const dir = join(components, tag);
  if (!existsSync(dir)) return new Set();
  return new Set(
    sheetsIn(dir).flatMap((path) =>
      [...readFileSync(path, 'utf8').matchAll(UTILITY)].map((match) => match[1]),
    ),
  );
};

/**
 * The component a knob belongs to: the longest tag its name starts with.
 */
export const ownerOf = (name, tags) => {
  let owner = null;
  for (const tag of tags) {
    const owns = name === `--${tag}` || name.startsWith(`--${tag}-`);
    if (owns && (!owner || tag.length > owner.length)) owner = tag;
  }
  return owner;
};

/**
 * Whether a stylelint-disable comment hides a line from the rule, as stylelint's own report()
 * decides (lib/utils/report.mjs, isDisabledOnLine).
 */
const isDisabledOnLine = (result, line) => {
  const { config, disabledRanges = {} } = result.stylelint;
  if (config?.ignoreDisables) return false;
  const ranges = disabledRanges[ruleName] ?? disabledRanges.all ?? [];
  return ranges.some(
    (range) =>
      range.start <= line &&
      (range.end === undefined || range.end >= line) &&
      (!range.rules || range.rules.includes(ruleName)),
  );
};

/**
 * The count the baseline allows a sheet, 0 when it does not name it.
 */
const allowedFor = (pending, key) => {
  if (!pending || !key || !existsSync(pending)) return 0;
  return JSON.parse(readFileSync(pending, 'utf8'))[key] ?? 0;
};

/** @type {import('stylelint').Rule} */
const ruleFunction = (primary, secondary) => (root, result) => {
  const validOptions = validateOptions(
    result,
    ruleName,
    { actual: primary, possible: [true] },
    {
      actual: secondary,
      possible: { pending: [(value) => typeof value === 'string'] },
      optional: true,
    },
  );
  const file = root.source?.input.file;
  if (!validOptions || (file && DOCUMENT_SHEET.test(file))) {
    return;
  }

  // reported at the end, once the count of the sheet is known
  const problems = [];
  const report = (problem) => problems.push({ ...problem, result, ruleName });

  const component = componentOf(file);
  const knob = `--${component?.tag ?? 'mds-<tag>'}-*`;
  const tags = component
    ? readdirSync(component.components).filter((name) => name.startsWith('mds-'))
    : [];
  const documented = new Map();
  const isDocumented = (tag, name) => {
    if (!documented.has(tag)) documented.set(tag, documentedIn(component.components, tag));
    return documented.get(tag).has(name);
  };

  root.walkDecls((decl) => {
    const place = placeOf(decl);
    if (place === 'none') return;
    const custom = decl.prop.startsWith('--');

    if (custom && !/^--(?:mds|private|magma|tw)-/.test(decl.prop)) {
      report({ message: messages.unprefixed(decl.prop, knob), node: decl, word: decl.prop });
    }
    if (custom && decl.prop.startsWith('--mds-') && component) {
      const owner = ownerOf(decl.prop, tags);
      if (!owner) {
        report({ message: messages.unowned(decl.prop), node: decl, word: decl.prop });
      } else {
        if (!endsWithProperty(decl.prop, owner)) {
          report({ message: messages.order(decl.prop), node: decl, word: decl.prop });
        }
        if (!isDocumented(component.tag, decl.prop) && !isDocumented(owner, decl.prop)) {
          report({ message: messages.undocumented(decl.prop, owner), node: decl, word: decl.prop });
        }
      }
    }

    if (place === 'host' && custom) return;

    const valueIndex = decl.prop.length + (decl.raws.between ?? ':').length;
    const value = decl.value.replace(UNCHECKED, (match) => ' '.repeat(match.length));
    const where = place === 'host' ? 'in a property of :host' : 'below :host';
    for (const match of value.matchAll(VAR)) {
      const family = familyOf(match[1]);
      if (!family) continue;
      report({
        endIndex: valueIndex + match.index + match[0].length,
        index: valueIndex + match.index,
        message: messages.read(`var(--${match[1]})`, family, where, knob),
        node: decl,
      });
    }
  });

  const own = new Set([
    ...(component ? utilitiesIn(component.components, component.tag) : []),
    ...[...root.toString().matchAll(UTILITY)].map((match) => match[1]),
  ]);
  root.walkAtRules('apply', (atRule) => {
    for (const name of atRule.params.split(/\s+/).filter(Boolean)) {
      if (own.has(baseClass(name))) continue;
      const family = classFamilyOf(name);
      if (family) report({ message: messages.apply(name, family, knob), node: atRule, word: name });
    }
  });

  const shown = problems.filter(
    (problem) =>
      !isDisabledOnLine(
        result,
        problem.node.rangeBy({ endIndex: problem.endIndex, index: problem.index }).start.line,
      ),
  );
  const key =
    component &&
    file
      .split(sep)
      .join('/')
      .slice(component.components.length + 1);
  const allowed = allowedFor(secondary?.pending, key);
  const summary = (message) =>
    stylelintReport({ endIndex: 0, index: 0, message, node: root, result, ruleName });
  if (shown.length < allowed) {
    summary(messages.lower(shown.length, allowed));
  } else if (shown.length > allowed) {
    if (allowed > 0) summary(messages.over(shown.length, allowed));
    for (const problem of problems) stylelintReport(problem);
  }
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
