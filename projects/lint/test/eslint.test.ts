// The template rules on each parser they support, against fixtures cut from the real data
// (test/fixtures: a few components of documentation.json, a few palette tokens).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as angular from '@angular-eslint/template-parser';
import * as html from '@html-eslint/parser';
import { RuleTester, type Linter } from 'eslint';
import { describe, expect, it, test } from 'vitest';

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
};
const tester = (parser: keyof typeof parsers) => new RuleTester(parsers[parser]);
const filename = { html: 'page.html', angular: 'page.component.html', jsx: 'page.jsx' };

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
    valid: [{ code: '<div class="bg-surface-raised"></div>', filename: filename.angular }],
    invalid: [{ code: '<div class="bg-white"></div>', filename: filename.angular, errors: 1 }],
  });
  tester('jsx').run('jsx', rule, {
    valid: [
      { code: '<div className={styles} />', filename: filename.jsx },
      { code: '<div className="bg-surface-raised" />', filename: filename.jsx },
    ],
    invalid: [
      { code: '<div className="bg-white" />', filename: filename.jsx, errors: 1 },
      {
        code: '<div className={`p-400 ${a} text-tone-neutral-01`} />',
        filename: filename.jsx,
        errors: 1,
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
});
