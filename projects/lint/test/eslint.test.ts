// The template rules on each parser they support, against fixtures cut from the real data
// (test/fixtures: a few components of documentation.json, a few palette tokens).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as angular from '@angular-eslint/template-parser';
import * as html from '@html-eslint/parser';
import * as tsx from '@typescript-eslint/parser';
import { RuleTester, type Linter } from 'eslint';
import { describe, expect, it, test } from 'vitest';

import { lintGuideUrl, shippedVersion } from '../src/core/data.js';
import plugin, { rules } from '../src/eslint/index.js';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const settings = {
  magma: {
    documentation: path.join(fixtures, 'magma/data/documentation.json'),
    tokens: path.join(fixtures, 'design-tokens/base.tokens.json'),
    consumption: path.join(fixtures, 'styles/consumption.json'),
  },
};

const parsers: Record<string, Linter.Config> = {
  html: { languageOptions: { parser: html as Linter.Parser }, settings },
  angular: { languageOptions: { parser: angular as Linter.Parser }, settings },
  jsx: {
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    settings,
  },
  // the parser of a TypeScript project, whose nodes carry its types too
  tsx: {
    languageOptions: {
      parser: tsx as Linter.Parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings,
  },
};
const tester = (parser: keyof typeof parsers) => new RuleTester(parsers[parser]);
const filename = {
  html: 'page.html',
  angular: 'page.component.html',
  jsx: 'page.jsx',
  tsx: 'page.tsx',
};

describe('valid-attribute-values', () => {
  const rule = rules['valid-attribute-values']!;
  tester('html').run('html', rule, {
    valid: [
      { code: '<mds-banner tone="weak"></mds-banner>', filename: filename.html },
      { code: '<mds-button variant="primary" label="Save"></mds-button>', filename: filename.html },
      // an open string prop takes anything
      { code: '<mds-button label="anything"></mds-button>', filename: filename.html },
      // not a Magma component
      { code: '<x-banner tone="outline"></x-banner>', filename: filename.html },
    ],
    invalid: [
      {
        code: '<mds-banner tone="outline"></mds-banner>',
        filename: filename.html,
        errors: [
          {
            message:
              /"outline" is not a value of tone on <mds-banner>: use "box", "strong", "weak"/,
          },
        ],
      },
    ],
  });
  tester('angular').run('angular', rule, {
    valid: [
      { code: '<mds-banner [tone]="tone"></mds-banner>', filename: filename.angular },
      { code: `<mds-banner [tone]="'box'"></mds-banner>`, filename: filename.angular },
    ],
    invalid: [
      { code: '<mds-banner tone="outline"></mds-banner>', filename: filename.angular, errors: 1 },
      {
        code: `<mds-banner [tone]="'outline'"></mds-banner>`,
        filename: filename.angular,
        errors: 1,
      },
    ],
  });
  tester('jsx').run('jsx', rule, {
    valid: [
      { code: '<MdsBanner tone="strong" />', filename: filename.jsx },
      { code: '<MdsBanner tone={tone} />', filename: filename.jsx },
    ],
    invalid: [
      { code: '<MdsBanner tone="outline" />', filename: filename.jsx, errors: 1 },
      { code: '<mds-banner tone={"outline"} />', filename: filename.jsx, errors: 1 },
    ],
  });
});

describe('no-false-boolean', () => {
  const rule = rules['no-false-boolean']!;
  tester('html').run('html', rule, {
    valid: [
      { code: '<mds-button disabled></mds-button>', filename: filename.html },
      { code: '<mds-button></mds-button>', filename: filename.html },
      // label is a string prop: "false" is a label
      { code: '<mds-button label="false"></mds-button>', filename: filename.html },
    ],
    invalid: [
      {
        code: '<mds-button disabled="false"></mds-button>',
        filename: filename.html,
        errors: [
          {
            message: /disabled="false" on <mds-button>: remove the attribute to turn disabled off/,
          },
        ],
      },
    ],
  });
  tester('angular').run('angular', rule, {
    valid: [
      { code: '<mds-button [disabled]="false"></mds-button>', filename: filename.angular },
      { code: '<mds-button [attr.disabled]="null"></mds-button>', filename: filename.angular },
    ],
    invalid: [
      { code: '<mds-button disabled="false"></mds-button>', filename: filename.angular, errors: 1 },
      // an attribute binding writes the attribute "false"
      {
        code: '<mds-button [attr.disabled]="false"></mds-button>',
        filename: filename.angular,
        errors: 1,
      },
    ],
  });
  tester('jsx').run('jsx', rule, {
    valid: [{ code: '<MdsButton disabled={false} />', filename: filename.jsx }],
    invalid: [{ code: '<MdsButton disabled="false" />', filename: filename.jsx, errors: 1 }],
  });
});

describe('accessible-name', () => {
  const rule = rules['accessible-name']!;
  tester('html').run('html', rule, {
    valid: [
      {
        code: '<mds-button icon="mi/baseline/send" label="Send"></mds-button>',
        filename: filename.html,
      },
      {
        code: '<mds-button icon="mi/baseline/send" aria-label="Send"></mds-button>',
        filename: filename.html,
      },
      { code: '<mds-button icon="mi/baseline/send">Send</mds-button>', filename: filename.html },
      { code: '<mds-button>Send</mds-button>', filename: filename.html },
      // mds-input takes an icon but has no label nor default slot: its name is the field's
      { code: '<mds-input icon="mi/baseline/search"></mds-input>', filename: filename.html },
      { code: '<mds-img src="a.png" alt=""></mds-img>', filename: filename.html },
      // named from outside: a tooltip with relation="label" points at the id
      {
        code: '<mds-button id="del" icon="mi/baseline/delete"></mds-button><mds-tooltip target="#del" relation="label">Delete</mds-tooltip>',
        filename: filename.html,
      },
    ],
    invalid: [
      {
        code: '<mds-button icon="mi/baseline/send"></mds-button>',
        filename: filename.html,
        errors: [{ message: /<mds-button> shows only its icon and has no accessible name/ }],
      },
      // a named slot is not the default slot
      {
        code: '<mds-button icon="mi/baseline/send"><mds-notification slot="notification"></mds-notification></mds-button>',
        filename: filename.html,
        errors: 1,
      },
      { code: '<mds-chip icon="mi/baseline/tag"></mds-chip>', filename: filename.html, errors: 1 },
      {
        code: '<mds-img src="a.png"></mds-img>',
        filename: filename.html,
        errors: [{ message: /<mds-img> has a src and no alt, so it is named after its file/ }],
      },
    ],
  });
  tester('angular').run('angular', rule, {
    valid: [
      { code: '<mds-button icon="mi/x" [label]="label"></mds-button>', filename: filename.angular },
      {
        code: '<mds-button icon="mi/x" [attr.aria-label]="name"></mds-button>',
        filename: filename.angular,
      },
      { code: '<mds-button icon="mi/x">{{ name }}</mds-button>', filename: filename.angular },
    ],
    invalid: [
      { code: '<mds-button icon="mi/x"></mds-button>', filename: filename.angular, errors: 1 },
    ],
  });
  tester('jsx').run('jsx', rule, {
    valid: [
      { code: '<MdsButton icon="mi/x" label={t("send")} />', filename: filename.jsx },
      { code: '<MdsButton icon="mi/x">{t("send")}</MdsButton>', filename: filename.jsx },
      // a spread may carry the label: nothing is sure
      { code: '<MdsButton icon="mi/x" {...props} />', filename: filename.jsx },
    ],
    invalid: [
      { code: '<MdsButton icon="mi/x" />', filename: filename.jsx, errors: 1 },
      {
        code: '<MdsButton icon="mi/x">{/* later */}</MdsButton>',
        filename: filename.jsx,
        errors: 1,
      },
    ],
  });
});

describe('no-deprecated', () => {
  const rule = rules['no-deprecated']!;
  tester('html').run('html', rule, {
    valid: [
      { code: '<mds-banner dismissible>Saved</mds-banner>', filename: filename.html },
      // deletable is right on a chip, which removes a value: only the banner's is deprecated
      { code: '<mds-chip label="Tag" deletable></mds-chip>', filename: filename.html },
    ],
    invalid: [
      {
        code: '<mds-banner deletable>Saved</mds-banner>',
        filename: filename.html,
        errors: [
          {
            // the @deprecated text, on one line
            message:
              'deletable on <mds-banner> is deprecated: Use `dismissible`: the button dismisses the message, it deletes nothing. Goes in the next major.',
          },
        ],
      },
    ],
  });
  tester('angular').run('angular', rule, {
    valid: [{ code: '<mds-banner [dismissible]="true"></mds-banner>', filename: filename.angular }],
    invalid: [
      {
        code: '<mds-banner [deletable]="true"></mds-banner>',
        filename: filename.angular,
        errors: 1,
      },
    ],
  });
  tester('jsx').run('jsx', rule, {
    valid: [{ code: '<MdsBanner dismissible={open} />', filename: filename.jsx }],
    invalid: [{ code: '<MdsBanner deletable={true} />', filename: filename.jsx, errors: 1 }],
  });
});

describe('no-raw-palette-classes', () => {
  const rule = rules['no-raw-palette-classes']!;
  tester('html').run('html', rule, {
    valid: [
      {
        code: '<div class="bg-surface-raised text-fg-muted p-400"></div>',
        filename: filename.html,
      },
      // data colours and the seed are legitimate
      {
        code: '<span class="bg-label-sky-09 text-brand-maggioli-04 bg-tone-neutral-seed"></span>',
        filename: filename.html,
      },
      // not a colour utility
      { code: '<div class="text-title-h3 border-2"></div>', filename: filename.html },
    ],
    invalid: [
      {
        code: '<div class="bg-white text-gray-700"></div>',
        filename: filename.html,
        errors: [
          { message: /bg-white paints with Tailwind's palette/ },
          { message: /text-gray-700 paints with Tailwind's palette/ },
        ],
      },
      {
        code: '<div class="hover:bg-tone-neutral-03 dark:text-status-error-04/50 border-surface-neutral-default"></div>',
        filename: filename.html,
        errors: [
          { message: /hover:bg-tone-neutral-03 paints with a raw Magma step/ },
          { message: /dark:text-status-error-04\/50 paints with a raw Magma step/ },
          { message: /border-surface-neutral-default paints with a raw Magma step/ },
        ],
      },
    ],
  });
  tester('angular').run('angular', rule, {
    valid: [
      { code: '<div class="bg-surface-raised"></div>', filename: filename.angular },
      // the bindings the codemod reads, with roles; an unquoted key is a word, never a palette class
      {
        code: `<div [ngClass]="{ 'bg-surface-raised p-400': active, muted: m }" [class.text-fg-muted]="m"></div>`,
        filename: filename.angular,
      },
      // not a class binding
      { code: `<mds-button [label]="'bg-white'"></mds-button>`, filename: filename.angular },
    ],
    invalid: [
      { code: '<div class="bg-white"></div>', filename: filename.angular, errors: 1 },
      // the string literals of [ngClass], [class] and [attr.class], as the codemod reads them
      {
        code: `<div [ngClass]="{ 'p-400 bg-white': active }"></div>`,
        filename: filename.angular,
        errors: [{ message: /bg-white paints with Tailwind's palette/ }],
      },
      {
        code: `<div [ngClass]="['p-400', muted ? 'text-gray-700' : 'text-fg-default']"></div>`,
        filename: filename.angular,
        errors: [{ message: /text-gray-700 paints with Tailwind's palette/ }],
      },
      {
        code: `<div [class]="active ? 'bg-tone-neutral-03' : ''"></div>`,
        filename: filename.angular,
        errors: [{ message: /bg-tone-neutral-03 paints with a raw Magma step/ }],
      },
      {
        code: `<div [attr.class]="'dark:bg-white/50'"></div>`,
        filename: filename.angular,
        errors: 1,
      },
      // the class in the key of [class.x]
      {
        code: '<div [class.hover:bg-white]="active"></div>',
        filename: filename.angular,
        errors: [{ message: /hover:bg-white paints with Tailwind's palette/ }],
      },
    ],
  });
  tester('jsx').run('jsx', rule, {
    valid: [
      { code: '<div className={styles} />', filename: filename.jsx },
      { code: '<div className="bg-surface-raised" />', filename: filename.jsx },
      {
        code: "<div className={clsx('p-400', active && 'bg-surface-raised')} />",
        filename: filename.jsx,
      },
      // a string compared in a condition is read too, and is no class of the palette
      {
        code: "<div className={tone === 'white' ? 'bg-surface-raised' : 'bg-surface-default'} />",
        filename: filename.jsx,
      },
      // not a class attribute
      { code: "<div title={clsx('bg-white')} />", filename: filename.jsx },
    ],
    invalid: [
      { code: '<div className="bg-white" />', filename: filename.jsx, errors: 1 },
      {
        code: '<div className={`p-400 ${a} text-tone-neutral-01`} />',
        filename: filename.jsx,
        errors: 1,
      },
      // every string literal of the expression, as the codemod reads them
      {
        code: "<div className={clsx('p-400', active && 'bg-white')} />",
        filename: filename.jsx,
        errors: [{ message: /bg-white paints with Tailwind's palette/ }],
      },
      {
        code: "<div className={classnames({ 'text-gray-700': muted }, 'p-400')} />",
        filename: filename.jsx,
        errors: [{ message: /text-gray-700 paints with Tailwind's palette/ }],
      },
      {
        code: "<div className={active ? 'bg-tone-neutral-03' : 'bg-surface-raised'} />",
        filename: filename.jsx,
        errors: [{ message: /bg-tone-neutral-03 paints with a raw Magma step/ }],
      },
      {
        code: "<div className={extra || 'dark:bg-white/50'} />",
        filename: filename.jsx,
        errors: 1,
      },
      // the fixed parts of a template literal inside a call, and a string inside its holes
      {
        code: "<div className={cn(`bg-white ${size}`, `p-400 ${on ? 'text-gray-700' : ''}`)} />",
        filename: filename.jsx,
        errors: [
          { message: /bg-white paints with Tailwind's palette/ },
          { message: /text-gray-700 paints with Tailwind's palette/ },
        ],
      },
      { code: "<MdsButton class={['bg-white'].join(' ')} />", filename: filename.jsx, errors: 1 },
    ],
  });
  tester('tsx').run('tsx', rule, {
    valid: [
      {
        code: "<div className={cn<string>('p-400', (on as boolean) && 'bg-surface-raised')} />",
        filename: filename.tsx,
      },
    ],
    invalid: [
      {
        code: "<div className={clsx({ 'bg-white': on satisfies boolean }, tone ?? ('text-gray-700' as const))} />",
        filename: filename.tsx,
        errors: [
          { message: /bg-white paints with Tailwind's palette/ },
          { message: /text-gray-700 paints with Tailwind's palette/ },
        ],
      },
    ],
  });
});

describe('no-internal-tokens', () => {
  const rule = rules['no-internal-tokens']!;
  const internal =
    /"--mds-chip-icon-color" is an internal custom property of <mds-chip>: it may change in any release/;
  tester('html').run('html', rule, {
    valid: [
      {
        code: '<mds-book style="--mds-book-spine-color: #123a6b"></mds-book>',
        filename: filename.html,
      },
      { code: '<div style="--gap: 4px; color: red"></div>', filename: filename.html },
      // a Tailwind class that sets a public one, or no custom property at all
      {
        code: '<mds-text class="md:[--mds-text-line-clamp:2]"></mds-text>',
        filename: filename.html,
      },
      { code: '<div class="[--gap:4px] bg-surface-raised p-400"></div>', filename: filename.html },
    ],
    invalid: [
      {
        code: '<div style="--mds-chip-icon-color: rgb(var(--magma-accent-fg))"></div>',
        filename: filename.html,
        errors: [{ message: internal }],
      },
      // the arbitrary property of Tailwind sets it as an inline style does
      {
        code: '<mds-chip label="y" class="[--mds-chip-icon-color:red]"></mds-chip>',
        filename: filename.html,
        errors: [{ message: internal }],
      },
      // through variants and !, on a parent that sets it for its descendants
      {
        code: '<ul class="flex dark:hover:![--mds-chip-icon-color:red]"><li></li></ul>',
        filename: filename.html,
        errors: [{ message: internal }],
      },
      // an arbitrary value reads it, in both spellings
      {
        code: '<div class="bg-(--mds-chip-icon-color) text-[var(--mds-chip-nope)]"></div>',
        filename: filename.html,
        errors: [
          { message: internal },
          { message: /"--mds-chip-nope" is not a custom property any Magma component promises/ },
        ],
      },
      {
        code: '<mds-chip style="margin: var(--mds-chip-nope)"></mds-chip>',
        filename: filename.html,
        errors: [
          { message: /"--mds-chip-nope" is not a custom property any Magma component promises/ },
        ],
      },
    ],
  });
  tester('angular').run('angular', rule, {
    valid: [
      {
        code: '<mds-text [style.--mds-text-line-clamp]="lines"></mds-text>',
        filename: filename.angular,
      },
    ],
    invalid: [
      {
        code: '<mds-chip [style.--mds-chip-icon-color]="color"></mds-chip>',
        filename: filename.angular,
        errors: [{ message: internal }],
      },
      {
        code: '<mds-chip style="--mds-chip-icon-color: red"></mds-chip>',
        filename: filename.angular,
        errors: [{ message: internal }],
      },
      {
        code: '<mds-chip class="[--mds-chip-icon-color:red]"></mds-chip>',
        filename: filename.angular,
        errors: [{ message: internal }],
      },
      // the classes of the bindings, as no-raw-palette-classes reads them
      {
        code: `<mds-chip [ngClass]="{ '[--mds-chip-icon-color:red]': on }"></mds-chip>`,
        filename: filename.angular,
        errors: [{ message: internal }],
      },
      {
        code: `<ul [class]="on ? 'md:[--mds-chip-icon-color:red]' : ''"></ul>`,
        filename: filename.angular,
        errors: [{ message: internal }],
      },
    ],
  });
  tester('jsx').run('jsx', rule, {
    valid: [
      { code: "<MdsText style={{ '--mds-text-line-clamp': 2 }} />", filename: filename.jsx },
      { code: '<div style={styles} />', filename: filename.jsx },
      {
        code: "<MdsText className={clsx(lines && 'md:[--mds-text-line-clamp:2]')} />",
        filename: filename.jsx,
      },
    ],
    invalid: [
      {
        code: "<MdsChip style={{ '--mds-chip-icon-color': 'red' }} />",
        filename: filename.jsx,
        errors: [{ message: internal }],
      },
      {
        code: "<div style={{ color: 'var(--mds-chip-icon-color)' }} />",
        filename: filename.jsx,
        errors: [{ message: internal }],
      },
      {
        code: '<MdsChip className="[--mds-chip-icon-color:red]" />',
        filename: filename.jsx,
        errors: [{ message: internal }],
      },
      {
        code: '<ul className={`md:[--mds-chip-icon-color:red] ${extra}`} />',
        filename: filename.jsx,
        errors: [{ message: internal }],
      },
      // the classes of the expression, as no-raw-palette-classes reads them
      {
        code: "<MdsChip className={clsx('p-400', on && '[--mds-chip-icon-color:red]')} />",
        filename: filename.jsx,
        errors: [{ message: internal }],
      },
      {
        code: "<div className={dark ? 'bg-(--mds-chip-icon-color)' : undefined} />",
        filename: filename.jsx,
        errors: [{ message: internal }],
      },
    ],
  });
  tester('tsx').run('tsx', rule, {
    valid: [
      {
        code: "<MdsText className={cn(lines! > 1 && ('[--mds-text-line-clamp:2]' as const))} />",
        filename: filename.tsx,
      },
    ],
    invalid: [
      {
        code: "<MdsChip className={cn(on && ('[--mds-chip-icon-color:red]' as string))} />",
        filename: filename.tsx,
        errors: [{ message: internal }],
      },
    ],
  });
});

test('the presets name every rule, as errors in strict', () => {
  expect(Object.keys(plugin.configs.recommended.rules ?? {}).sort()).toEqual(
    Object.keys(rules)
      .map((rule) => `magma/${rule}`)
      .sort(),
  );
  expect(Object.values(plugin.configs.strict.rules ?? {})).toEqual(
    Object.keys(rules).map(() => 'error'),
  );
  expect(plugin.configs.recommended.rules?.['magma/no-raw-palette-classes']).toBe('warn');
  expect(plugin.configs.recommended.rules?.['magma/no-internal-tokens']).toBe('warn');
});

/** The headings of docs/agents/lint.md, as GitHub anchors them. */
const guideAnchors = () =>
  [
    ...readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../docs/agents/lint.md'),
      'utf8',
    ).matchAll(/^#+ (.+)$/gm),
  ].map(([, heading]) =>
    heading!
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/ /g, '-'),
  );

test('every rule describes itself and links its section of the guide, at the installed release', () => {
  const anchors = guideAnchors();
  for (const [name, rule] of Object.entries(rules)) {
    expect(rule.meta?.docs?.description, name).toMatch(/^[A-Z].+\.$/);
    expect(rule.meta?.docs?.url, name).toBe(lintGuideUrl(name));
    expect(anchors, name).toContain(name);
  }
  // the sources belong to no release: main; inside magma, its tag
  expect(shippedVersion()).toBeUndefined();
  expect(lintGuideUrl('no-false-boolean')).toBe(
    'https://github.com/magma-design-system/magma/blob/main/docs/agents/lint.md#no-false-boolean',
  );
  expect(lintGuideUrl('no-false-boolean', '2.6.0')).toBe(
    'https://github.com/magma-design-system/magma/blob/magma@2.6.0/docs/agents/lint.md#no-false-boolean',
  );
});
