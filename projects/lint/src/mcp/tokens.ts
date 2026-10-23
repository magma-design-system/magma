/*
  The token tools: list the roles and tokens with what each one is for, find the role for a
  colour, explain a class. The data is the DTCG of design-tokens and of styles (the values,
  the descriptions, the aliases) and the consumption map of styles (how Tailwind reads each
  token): the light values of the base sets, the ones a role is matched on.
*/
import { loadPalette, readData } from '../core/data.js';
import { utilityOf } from '../core/checks.js';
import { readFileSync } from 'node:fs';
import { distance, parseColor, toHex, type Rgb } from './color.js';
import { resolvePackage, wordsOf, type ToolContext } from './context.js';
import { ToolError, type Tool } from './protocol.js';

interface DtcgToken {
  $type: string;
  $value: unknown;
  $description?: string;
  $deprecated?: string | boolean;
  $extensions?: Record<string, { css?: string; tier?: string }>;
}

export interface TokenEntry {
  css?: string;
  path: string;
  type: string;
  tier: string;
  description?: string;
  /** The description of its group, for a token described by its family. */
  group?: string;
  deprecated?: boolean;
  /** The light value, resolved through every alias, as CSS writes it. */
  value?: string;
  /** The light colour, for a colour token. */
  rgb?: Rgb;
}

interface Consumption {
  tokens: Record<
    string,
    {
      theme: string;
      namespace?: string;
      key?: string | null;
      description?: string;
      shadowed?: Record<string, string>;
    }
  >;
  keywords: Record<string, { value: string; namespace: string; key: string }>;
  namespaces: Record<string, { utilities?: string[]; variants?: string[] }>;
  spacing: { multiplier: string; value: string; utilities: string[] };
  utilities: Record<string, { apply?: string[]; tokens?: string[]; css?: string }>;
}

const NAMESPACE = 'it.maggioli.magma';

const isToken = (node: unknown): node is DtcgToken =>
  typeof node === 'object' && node !== null && '$value' in node;

const cssValue = (value: unknown): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value))
    return value.every((one) => typeof one === 'number')
      ? `cubic-bezier(${value.join(', ')})`
      : value.join(', ');
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    if (typeof object.hex === 'string') return object.hex;
    if ('value' in object && 'unit' in object) return `${object.value}${object.unit}`;
  }
  return undefined;
};

const indexCache = new WeakMap<object, TokenEntry[]>();

/** Every token of the base sets of design-tokens and styles, with its light value. */
export const tokensOf = (context: ToolContext): TokenEntry[] => {
  const base = readData<Record<string, unknown>>('tokens', context.settings);
  const cached = indexCache.get(base);
  if (cached) return cached;
  let globals: Record<string, unknown> = {};
  try {
    globals = readData<Record<string, unknown>>('globals', context.settings);
  } catch {
    // an older styles without its DTCG: the base set alone
  }
  const byPath = new Map<string, DtcgToken>();
  const entries: TokenEntry[] = [];
  const walk = (node: Record<string, unknown>, path: string[], group?: string) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$') && key !== '$root') continue;
      if (!child || typeof child !== 'object') continue;
      const at = [...path, key];
      if (isToken(child)) {
        byPath.set(at.join('.'), child);
        const extension = child.$extensions?.[NAMESPACE];
        entries.push({
          ...(extension?.css ? { css: extension.css } : {}),
          path: at.join('.'),
          type: child.$type,
          tier: extension?.tier ?? 'primitive',
          ...(child.$description ? { description: child.$description } : {}),
          ...(group ? { group } : {}),
          ...(child.$deprecated ? { deprecated: true } : {}),
        });
      } else
        walk(
          child as Record<string, unknown>,
          at,
          (child as { $description?: string }).$description ?? group,
        );
    }
  };
  walk(base, []);
  walk(globals, []);
  // the light value of each token: follow its aliases to the end
  const resolve = (value: unknown, depth = 0): unknown => {
    if (depth > 12 || typeof value !== 'string' || !/^\{.+\}$/.test(value)) return value;
    return resolve(byPath.get(value.slice(1, -1))?.$value, depth + 1);
  };
  for (const entry of entries) {
    const value = resolve(byPath.get(entry.path)!.$value);
    const text = cssValue(value);
    if (text) entry.value = text;
    const components = (value as { components?: number[] })?.components;
    if (entry.type === 'color' && Array.isArray(components))
      entry.rgb = components.slice(0, 3) as Rgb;
  }
  indexCache.set(base, entries);
  return entries;
};

const consumptionOf = (context: ToolContext) =>
  readData<Consumption>('consumption', context.settings);

/** What a colour role paints, from its name: text, a border or a background. */
type Use = 'text' | 'border' | 'background';
const useOfRole = (css: string): Use =>
  /-(text|fg|on)(-|$)|on-emphasis|-on-/.test(css)
    ? 'text'
    : /border|outline/.test(css)
      ? 'border'
      : 'background';
/** What a colour utility paints, from its root. */
const useOfUtility = (root: string): Use =>
  /^(text|decoration|placeholder|caret|fill|stroke)$/.test(root)
    ? 'text'
    : /^(border|outline|ring|divide)/.test(root)
      ? 'border'
      : 'background';

/** A few classes that read a token, for the agent to write. */
const classesOf = (context: ToolContext, entry: TokenEntry): string[] => {
  const consumption = consumptionOf(context);
  const published = entry.css ? consumption.tokens[entry.css] : undefined;
  if (!published?.namespace || !published.key) return [];
  const namespace = consumption.namespaces[published.namespace];
  if (published.namespace === '--color') {
    const root = { text: 'text', border: 'border', background: 'bg' }[useOfRole(entry.css!)];
    return [`${root}-${published.key}`];
  }
  const PREFERRED = [
    'rounded',
    'shadow',
    'font',
    'leading',
    'ease',
    'aspect',
    'max-w',
    'p',
    'gap',
    'w',
  ];
  const roots = PREFERRED.filter((root) => namespace?.utilities?.includes(root)).slice(0, 2);
  if (roots.length) return roots.map((root) => `${root}-${published.key}`);
  if (namespace?.variants?.length) return [`${published.key}:`];
  return [];
};

const TIERS = ['semantic', 'primitive', 'all'];

export const listTokens = (context: ToolContext): Tool => ({
  name: 'list_tokens',
  title: 'List Magma roles and tokens',
  description:
    'The Magma roles and tokens of the installed version, each with what it is for, its CSS custom property, its light value and the Tailwind class that reads it. Search them in words ("secondary text", "card background", "radius"). By default only the semantic roles, what UI code paints with.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'What the token is for, or part of its name.' },
      tier: {
        type: 'string',
        enum: TIERS,
        description: 'semantic (default): the roles; primitive: the raw scales; all.',
      },
      limit: { type: 'number', description: 'How many to return, 30 by default.' },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      tokens: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            css: { type: 'string' },
            path: { type: 'string' },
            tier: { type: 'string' },
            type: { type: 'string' },
            description: { type: 'string' },
            value: { type: 'string' },
            classes: { type: 'array', items: { type: 'string' } },
          },
          required: ['path', 'tier', 'type', 'classes'],
        },
      },
      total: { type: 'number' },
    },
    required: ['tokens', 'total'],
  },
  run: ({ query, tier, limit }) => {
    const wanted = typeof tier === 'string' && TIERS.includes(tier) ? tier : 'semantic';
    const words = wordsOf(String(query ?? ''));
    const found = tokensOf(context)
      .filter((entry) => !entry.deprecated && entry.tier !== 'internal')
      .filter((entry) => wanted === 'all' || entry.tier === wanted)
      .map((entry) => {
        const text =
          `${entry.css ?? ''} ${entry.path} ${entry.description ?? ''} ${entry.group ?? ''}`.toLowerCase();
        const name = `${entry.css ?? ''} ${entry.path}`.toLowerCase();
        // the words of the need it covers first, then how many are in its name
        const covered = words.filter((word) => text.includes(word)).length;
        const named = words.filter((word) => name.includes(word)).length;
        const score = covered * 10 + named;
        return { entry, score };
      })
      .filter(({ score }) => !words.length || score > 0)
      // on a tie the shorter name first: the neutral role before its status variants
      .sort(
        (a, b) =>
          b.score - a.score ||
          (a.entry.css ?? a.entry.path).length - (b.entry.css ?? b.entry.path).length,
      );
    const max = typeof limit === 'number' && limit > 0 ? limit : 30;
    return {
      total: found.length,
      tokens: found.slice(0, max).map(({ entry }) => ({
        ...(entry.css ? { css: entry.css } : {}),
        path: entry.path,
        tier: entry.tier,
        type: entry.type,
        ...((entry.description ?? entry.group)
          ? { description: (entry.description ?? entry.group)! }
          : {}),
        ...(entry.value ? { value: entry.value } : {}),
        classes: classesOf(context, entry),
      })),
    };
  },
});

/** The colour of Tailwind's own palette (`gray-100`), from the theme the project installed. */
const tailwindColor = (context: ToolContext, key: string): Rgb | undefined => {
  const theme = resolvePackage(context, 'tailwindcss/theme.css');
  if (!theme) return undefined;
  const match = new RegExp(`--color-${key}:\\s*([^;]+);`).exec(readFileSync(theme, 'utf8'));
  return match ? parseColor(match[1]!) : undefined;
};

export const suggestRole = (context: ToolContext): Tool => ({
  name: 'suggest_role',
  title: 'Find the Magma role for a colour',
  description:
    'The semantic role to use instead of a raw colour: a literal (#f5f5f5, rgb(...), oklch(...)), a Tailwind class (bg-gray-100, text-tone-neutral-03) or a palette step (--tone-neutral-09). Returns the nearest roles by their light value, for the use the class or the hint says (text, border, background).',
  inputSchema: {
    type: 'object',
    properties: {
      color: { type: 'string', description: 'The colour, class or custom property to replace.' },
      use: {
        type: 'string',
        enum: ['text', 'border', 'background'],
        description: 'What it paints; read from the class when there is one.',
      },
    },
    required: ['color'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      input: { type: 'string' },
      use: { type: 'string' },
      value: { type: 'string' },
      roles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            css: { type: 'string' },
            class: { type: 'string' },
            description: { type: 'string' },
            value: { type: 'string' },
            distance: { type: 'number' },
          },
          required: ['css', 'class', 'value', 'distance'],
        },
      },
    },
    required: ['input', 'use', 'value', 'roles'],
  },
  run: ({ color, use }) => {
    const input = String(color ?? '').trim();
    if (!input) throw new ToolError('Give the colour, class or custom property to replace.');
    const tokens = tokensOf(context);
    const byCss = new Map(tokens.filter((entry) => entry.css).map((entry) => [entry.css!, entry]));
    const consumption = consumptionOf(context);
    let rgb: Rgb | undefined;
    let kind: Use | undefined = ['text', 'border', 'background'].includes(String(use))
      ? (use as Use)
      : undefined;

    const variable = /--[a-z0-9-]+/.exec(input)?.[0];
    if (variable) rgb = byCss.get(variable)?.rgb;
    else rgb = parseColor(input);
    if (!rgb && /^[a-z!-]/.test(input) && !variable) {
      // a class: its root says the use, its key the colour
      const utility = utilityOf(input);
      const { colorUtilities } = loadPalette(context.settings);
      const root = colorUtilities.find((one) => utility.startsWith(`${one}-`));
      if (root) {
        kind ??= useOfUtility(root);
        const key = utility.slice(root.length + 1);
        const css = Object.entries(consumption.tokens).find(
          ([, token]) => token.namespace === '--color' && token.key === key,
        )?.[0];
        rgb = (css && byCss.get(css)?.rgb) || tailwindColor(context, key);
      }
    }
    if (!rgb)
      throw new ToolError(
        `Cannot read a colour from "${input}": give a literal (#f5f5f5), a colour class (bg-gray-100) or a custom property (--tone-neutral-09).`,
      );
    const target = kind ?? 'background';
    const roles = tokens
      .filter(
        (entry) =>
          entry.tier === 'semantic' &&
          entry.type === 'color' &&
          entry.rgb &&
          entry.css &&
          !entry.deprecated,
      )
      .filter(
        (entry) => !/shadow-ink|outline|focus/.test(entry.css!) && useOfRole(entry.css!) === target,
      )
      .map((entry) => ({ entry, gap: distance(rgb!, entry.rgb!) }))
      .sort((a, b) => a.gap - b.gap)
      .slice(0, 3)
      .map(({ entry, gap }) => ({
        css: entry.css!,
        class: classesOf(context, entry)[0] ?? '',
        ...(entry.description ? { description: entry.description } : {}),
        value: entry.value ?? toHex(entry.rgb!),
        distance: Math.round(gap * 1000) / 1000,
      }));
    return { input, use: target, value: toHex(rgb), roles };
  },
});

/** Tailwind's own palette: white, black and the steps of its hues. */
const TAILWIND_PALETTE =
  /^(?:black|white|(?:slate|gray|zinc|neutral|stone|taupe|mauve|mist|olive|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950))$/;

/** The steps of Tailwind's default spacing scale, read by Magma as hundredths of a rem. */
const TAILWIND_STEPS = new Set([
  '0.5',
  '1',
  '1.5',
  '2',
  '2.5',
  '3',
  '3.5',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '14',
  '16',
  '20',
  '24',
  '28',
  '32',
  '36',
  '40',
  '44',
  '48',
  '52',
  '56',
  '60',
  '64',
  '72',
  '80',
  '96',
]);

const KINDS = [
  'magma-utility',
  'token',
  'spacing-step',
  'raw-palette',
  'tailwind-palette',
  'arbitrary',
  'keyword',
  'other',
];

export const explainClass = (context: ToolContext): Tool => ({
  name: 'explain_class',
  title: 'Explain a class in Magma',
  description:
    'What a Tailwind class does with the Magma theme: the token it reads and its value, the Magma utility it is, or the trap it falls in (p-4 is 0.01rem in Magma, not 16px; bg-white ignores the theme). Variants, ! and opacity are read through.',
  inputSchema: {
    type: 'object',
    properties: {
      class: {
        type: 'string',
        description: 'One class, such as "p-4", "bg-surface-raised" or "md:text-title-h3".',
      },
    },
    required: ['class'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      class: { type: 'string' },
      utility: { type: 'string' },
      kind: { type: 'string', enum: KINDS },
      description: { type: 'string' },
      tokens: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            css: { type: 'string' },
            value: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['css'],
        },
      },
      value: { type: 'string' },
      suggestion: { type: 'string' },
    },
    required: ['class', 'utility', 'kind', 'description', 'tokens'],
  },
  run: ({ class: name }) => {
    const input = String(name ?? '').trim();
    if (!input || /\s/.test(input)) throw new ToolError('Give one class, such as "p-4".');
    const consumption = consumptionOf(context);
    const byCss = new Map(
      tokensOf(context)
        .filter((entry) => entry.css)
        .map((entry) => [entry.css!, entry]),
    );
    const tokenInfo = (css: string) => {
      const entry = byCss.get(css);
      const described = entry?.description ?? consumption.tokens[css]?.description;
      return {
        css,
        ...(entry?.value ? { value: entry.value } : {}),
        ...(described ? { description: described } : {}),
      };
    };
    const utility = utilityOf(input);
    const bare = utility.replace(/^-/, '');
    const base = { class: input, utility };

    if (/\[|\(/.test(utility))
      return {
        ...base,
        kind: 'arbitrary',
        description:
          'An arbitrary value, written in the class: it reads no token, so it follows no theme, mode or preference.',
        tokens: [],
        suggestion: 'Use a token: list_tokens finds the one for the need.',
      };

    const own = consumption.utilities[bare];
    if (own)
      return {
        ...base,
        kind: 'magma-utility',
        description: `A Magma utility${own.apply?.length ? `: ${own.apply.join(' ')}` : ''}.`,
        tokens: (own.tokens ?? []).map(tokenInfo),
        ...(own.css ? { value: own.css.replace(/\s+/g, ' ').trim() } : {}),
      };

    // a numeric step of a spacing utility: the step times --spacing
    const roots = [...consumption.spacing.utilities].sort((a, b) => b.length - a.length);
    const spacingRoot = roots.find(
      (root) =>
        utility.startsWith(`${root}-`) && /^\d+(\.\d+)?$/.test(utility.slice(root.length + 1)),
    );
    if (spacingRoot) {
      const step = utility.slice(spacingRoot.length + 1);
      const rem = Number(step) * Number.parseFloat(consumption.spacing.value);
      const px = Math.round(rem * 16 * 1000) / 1000;
      const sizes = new Set(
        tokensOf(context)
          .filter((entry) => entry.path.startsWith('size.'))
          .map((entry) => entry.path.slice('size.'.length)),
      );
      const trap = TAILWIND_STEPS.has(step) && !sizes.has(step);
      return {
        ...base,
        kind: 'spacing-step',
        description: `${spacingRoot}-${step}: ${step} times --spacing (${consumption.spacing.value}), that is ${Math.round(rem * 10000) / 10000}rem = ${px}px.`,
        tokens: [tokenInfo(consumption.spacing.multiplier)],
        value: `calc(var(${consumption.spacing.multiplier}) * ${step})`,
        ...(trap
          ? {
              suggestion: `In Magma a step is a hundredth of a Tailwind step: ${spacingRoot}-${step} is ${px}px. For ${Number(step) * 4}px write ${spacingRoot}-${Number(step) * 100}.`,
            }
          : {}),
      };
    }

    const keyword = Object.entries(consumption.keywords).find(([, entry]) =>
      consumption.namespaces[entry.namespace]?.utilities?.some(
        (root) => bare === `${root}-${entry.key}`,
      ),
    );
    if (keyword)
      return {
        ...base,
        kind: 'keyword',
        description: `${bare} sets the CSS keyword ${keyword[1].value}.`,
        tokens: [],
        value: keyword[1].value,
      };

    // a token of a namespace: the longest utility root that leaves a known key
    for (const [namespace, { utilities = [] }] of Object.entries(consumption.namespaces)) {
      for (const root of [...utilities].sort((a, b) => b.length - a.length)) {
        if (!bare.startsWith(`${root}-`)) continue;
        const key = bare.slice(root.length + 1);
        const hit = Object.entries(consumption.tokens).find(
          ([, token]) => token.namespace === namespace && token.key === key,
        );
        if (hit) {
          const [css, token] = hit;
          const shadowed = token.shadowed?.[root];
          if (namespace === '--color' && loadPalette(context.settings).rawKeys.has(key))
            return {
              ...base,
              kind: 'raw-palette',
              description: `${bare} paints with ${css}, a raw palette step: it follows the mode only, not the named theme nor the contrast preference.`,
              tokens: [tokenInfo(css)],
              suggestion: 'Paint with a role: suggest_role finds the one with the nearest value.',
            };
          return {
            ...base,
            kind: 'token',
            description: shadowed
              ? `${bare} reads ${shadowed}, not ${css}: for ${root} the ${namespace.slice(2)} scale is shadowed.`
              : `${bare} reads ${css}${token.description ? `: ${token.description}` : '.'}`,
            tokens: [tokenInfo(css)],
          };
        }
        if (namespace === '--color' && TAILWIND_PALETTE.test(key))
          return {
            ...base,
            kind: 'tailwind-palette',
            description: `${bare} paints with Tailwind's palette, which ignores Magma's mode, themes and contrast.`,
            tokens: [],
            suggestion: 'Paint with a role: suggest_role finds the one with the nearest value.',
          };
      }
    }
    return {
      ...base,
      kind: 'other',
      description: `${bare} reads no Magma token: a Tailwind utility with a fixed value, or a class the Magma theme does not define.`,
      tokens: [],
    };
  },
});
