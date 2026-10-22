import { describe, expect, it } from 'vitest';
import {
  checkUsageDoc,
  handWrittenReadme,
  incorrectLines,
  rawHtmlMembers,
  README_INTRO,
  splitMarkdown,
  undescribedMembers,
  type ApiComponent,
  type DescribedComponent,
  type UsageModel,
} from './usage-docs-lib';

const button: ApiComponent = {
  tag: 'mds-button',
  props: [
    {
      name: 'variant',
      attr: 'variant',
      values: [
        { type: 'string', value: 'primary' },
        { type: 'string', value: 'error' },
        { type: 'undefined' },
      ],
    },
    { name: 'disabled', attr: 'disabled', values: [{ type: 'boolean' }, { type: 'undefined' }] },
    { name: 'icon', attr: 'icon', values: [{ type: 'string' }, { type: 'undefined' }] },
    { name: 'label', attr: 'label', values: [{ type: 'string' }, { type: 'undefined' }] },
  ],
  events: [],
  slots: [{ name: '' }, { name: 'notification' }],
  parts: [{ name: 'icon' }],
  styles: [{ name: '--mds-button-radius' }],
};
const input: ApiComponent = {
  tag: 'mds-input',
  props: [{ name: 'value', attr: 'value', values: [{ type: 'string' }] }],
  events: [{ event: 'mdsInputChange' }],
  slots: [],
  parts: [],
  styles: [],
};

const model: UsageModel = {
  components: new Map([
    ['mds-button', button],
    ['mds-input', input],
  ]),
  formAssociated: new Set(['mds-input']),
  tokens: new Set([
    '--magma-accent-emphasis',
    '--magma-radius-md',
    '--tone-neutral-03',
    '--radius-md',
  ]),
  privateVars: new Set(['--mds-button-private']),
  icons: new Set(['mi/baseline/email']),
};

const kinds = (md: string): string[] => checkUsageDoc(md, model).map((f) => f.kind);
const fence = (lang: string, body: string): string => `\`\`\`${lang}\n${body}\n\`\`\``;

describe('splitMarkdown', () => {
  it('separates prose from fenced code, with 1-based start lines', () => {
    const blocks = splitMarkdown(
      ['# Title', '', 'Some text', 'more', '', '```html', '<a></a>', '```', 'after'].join('\n'),
    );
    expect(blocks).toEqual([
      { type: 'prose', line: 1, text: '# Title' },
      { type: 'prose', line: 3, text: 'Some text\nmore' },
      { type: 'code', line: 6, lang: 'html', text: '<a></a>' },
      { type: 'prose', line: 9, text: 'after' },
    ]);
  });

  it('reads a fence nested in a list item as code, without the list indentation', () => {
    const blocks = splitMarkdown(['- item', '  ```css', '  a { b: c; }', '  ```'].join('\n'));
    expect(blocks[1]).toEqual({ type: 'code', line: 2, lang: 'css', text: 'a { b: c; }' });
  });
});

describe('incorrectLines', () => {
  it('covers the lines from an INCORRECT marker to the next CORRECT one', () => {
    const wrong = incorrectLines(
      ['<!-- INCORRECT -->', '<a>', '<!-- CORRECT -->', '<b>'].join('\n'),
    );
    expect([...wrong]).toEqual([0, 1]);
  });
});

describe('checkUsageDoc', () => {
  it('accepts a doc that matches the API and the token layer', () => {
    const md = [
      'Use `<mds-button>` with `--mds-button-radius`.',
      '',
      fence(
        'html',
        '<mds-button variant="primary" icon="mi/baseline/email" class="w-full">Save</mds-button>\n<mds-input name="q"></mds-input>',
      ),
      '',
      fence(
        'css',
        'mds-button {\n  --mds-button-radius: var(--magma-radius-md);\n  --mds-button-private: 1px;\n}\nmds-button::part(icon) { fill: rgb(var(--magma-accent-emphasis)); }',
      ),
      '',
      fence('javascript', "el.addEventListener('mdsInputChange', () => {});"),
    ].join('\n');
    expect(checkUsageDoc(md, model)).toEqual([]);
  });

  it('reports tags, attributes, values, booleans and slots that do not exist', () => {
    const md = fence(
      'html',
      [
        '<mds-nope></mds-nope>',
        '<mds-button size="sm" variant="secondary" disabled="false"></mds-button>',
        '<mds-button><span slot="footer">x</span></mds-button>',
        '<mds-input label="Name"></mds-input>',
      ].join('\n'),
    );
    expect(checkUsageDoc(md, model)).toEqual([
      { line: 2, kind: 'unknown-tag', what: 'mds-nope' },
      { line: 3, kind: 'unknown-attribute', what: '<mds-button size>' },
      {
        line: 3,
        kind: 'invalid-value',
        what: '<mds-button variant="secondary"> (allowed: primary, error)',
      },
      { line: 3, kind: 'false-boolean', what: '<mds-button disabled="false">' },
      { line: 4, kind: 'unknown-slot', what: '<mds-button> has no slot "footer"' },
      { line: 5, kind: 'unknown-attribute', what: '<mds-input label>' },
    ]);
  });

  // mds-book takes `${number}x${number}`, which Stencil lists as a type with no value
  it('accepts the values of a template literal type, and names it among the allowed ones', () => {
    const book: ApiComponent = {
      tag: 'mds-book',
      props: [
        {
          name: 'format',
          attr: 'format',
          values: [{ type: 'string', value: 'auto' }, { type: '`${number}x${number}`' }],
        },
      ],
      events: [],
      slots: [],
      parts: [],
      styles: [],
    };
    const withBook: UsageModel = {
      ...model,
      components: new Map([...model.components, ['mds-book', book]]),
    };
    const md = fence(
      'html',
      [
        '<mds-book format="auto"></mds-book>',
        '<mds-book format="29.7x21"></mds-book>',
        '<mds-book format="pocket"></mds-book>',
      ].join('\n'),
    );

    expect(checkUsageDoc(md, withBook)).toEqual([
      {
        line: 4,
        kind: 'invalid-value',
        what: '<mds-book format="pocket"> (allowed: auto, `${number}x${number}`)',
      },
    ]);
  });

  it('allows `name` only on form-associated components', () => {
    expect(kinds(fence('html', '<mds-input name="a"></mds-input>'))).toEqual([]);
    expect(kinds(fence('html', '<mds-button name="a"></mds-button>'))).toEqual([
      'unknown-attribute',
    ]);
  });

  it('reports self-closed custom elements, which HTML leaves open', () => {
    expect(kinds(fence('html', '<mds-button label="a" />'))).toContain('self-closing-element');
  });

  it('checks icon slugs and accepts inline markup and data URIs', () => {
    expect(kinds(fence('html', '<mds-button icon="action-email-send"></mds-button>'))).toEqual([
      'unknown-icon',
    ]);
    expect(kinds(fence('html', '<mds-button icon="mi/baseline/nope"></mds-button>'))).toEqual([
      'unknown-icon',
    ]);
    expect(
      kinds(fence('html', '<mds-button icon="data:image/svg+xml;base64,AA"></mds-button>')),
    ).toEqual([]);
  });

  it('reports palette steps, raw radii, unknown tokens and unknown component properties in CSS', () => {
    const css = [
      'mds-button {',
      '  --mds-button-radius: var(--radius-md);',
      '  --mds-button-nope: rgb(var(--tone-neutral-03));',
      '  color: rgb(var(--tone-neutral));',
      '}',
    ].join('\n');
    expect(kinds(fence('css', css))).toEqual([
      'raw-radius',
      'unknown-css-var',
      'palette-color',
      'unknown-token',
    ]);
  });

  it('accepts a custom property the example declares itself', () => {
    expect(kinds(fence('css', '.card { --gap: 4px; gap: var(--gap); }'))).toEqual([]);
  });

  it('reports undocumented parts, shadow piercing and preference media queries', () => {
    const css =
      'mds-button::part(label) {}\nmds-button >>> .x {}\n@media (prefers-color-scheme: dark) {}';
    expect(kinds(fence('css', css))).toEqual([
      'unknown-part',
      'shadow-piercing',
      'pref-media-query',
    ]);
  });

  it('reports palette and dark: classes', () => {
    expect(
      kinds(
        fence(
          'html',
          '<div class="bg-tone-neutral-09 text-gray-700 dark:bg-surface-raised"></div>',
        ),
      ),
    ).toEqual(['palette-color', 'palette-color', 'dark-variant']);
  });

  it('reports events that no component emits', () => {
    expect(
      kinds(
        fence(
          'javascript',
          "el.addEventListener('mdsButtonClick', f);\n<MdsInput onMdsInputChange={f} />",
        ),
      ),
    ).toEqual(['unknown-event']);
  });

  it('skips the INCORRECT half of an example', () => {
    const html = [
      '<!-- INCORRECT -->',
      '<mds-button disabled="false" size="sm"></mds-button>',
      '<!-- CORRECT -->',
      '<mds-button></mds-button>',
    ];
    expect(kinds(fence('html', html.join('\n')))).toEqual([]);
    const css = [
      '/* INCORRECT */',
      'mds-button >>> .x { color: rgb(var(--tone-neutral-03)); }',
      '/* CORRECT */',
      'mds-button {}',
    ];
    expect(kinds(fence('css', css.join('\n')))).toEqual([]);
  });

  it('checks names in prose, but not prefixes and families', () => {
    const md =
      'See `<mds-nope>`, `--mds-button-nope`, `--magma-nope`, `--mds-button-*`, `--magma-<hue>-fg`.';
    expect(kinds(md)).toEqual(['unknown-tag', 'unknown-css-var', 'unknown-token']);
  });

  it('requires a language on every fence and no emoji', () => {
    expect(kinds('```\n<mds-button></mds-button>\n```')).toEqual(['fence-without-language']);
    expect(kinds('<!-- \u{1F6AB} INCORRECT -->')).toEqual(['emoji']);
  });
});

describe('handWrittenReadme', () => {
  const generated = '<!-- Auto Generated Below -->\n\n## Properties\n';

  it('finds nothing in a readme with the title and the generic intro only', () => {
    expect(
      handWrittenReadme('mds-badge', `# mds-badge\n\n\n\n${README_INTRO}\n\n${generated}`),
    ).toBe('');
    expect(handWrittenReadme('mds-avatar-stack', `# mds-avatar-stack\n\n\n\n${generated}`)).toBe(
      '',
    );
  });

  it('returns a section written above the marker, wherever it sits', () => {
    // the sections #842 removed: Magma 1 install steps, a migration note under the intro
    expect(
      handWrittenReadme(
        'mds-button',
        `# mds-button\n\n${README_INTRO}\n\n## Magma 2.0 migration guide\n\n- labels\n\n${generated}`,
      ),
    ).toBe('## Magma 2.0 migration guide\n\n- labels');
  });

  it('ignores the generated part', () => {
    expect(handWrittenReadme('mds-chip', `# mds-chip\n\n${generated}## Usage\n\ntext`)).toBe('');
  });
});

describe('undescribedMembers', () => {
  const described: DescribedComponent = {
    tag: 'mds-button',
    props: [{ name: 'label', docs: 'The text of the button' }],
    events: [{ event: 'mdsButtonClick', docs: 'Emits on click' }],
    methods: [{ name: 'focusButton', docs: 'Moves the focus to the button' }],
    slots: [{ name: '', docs: 'The text of the button' }],
    parts: [{ name: 'icon', docs: 'The icon inside the component' }],
    styles: [{ name: '--mds-button-radius', docs: 'The radius of the button' }],
  };

  it('finds nothing when every member has a description', () => {
    expect(undescribedMembers(described)).toEqual([]);
  });

  it('names each member without one as magma.api.txt does', () => {
    expect(
      undescribedMembers({
        tag: 'mds-button',
        props: [{ name: 'label', docs: '' }],
        events: [{ event: 'mdsButtonClick', docs: ' ' }],
        methods: [{ name: 'agree', docs: '' }],
        slots: [
          { name: '', docs: '' },
          { name: 'notification', docs: '' },
        ],
        // a part render() sets without an @part comes with empty docs
        parts: [
          { name: 'icon', docs: 'The icon inside the component' },
          { name: 'label', docs: '' },
        ],
        styles: [{ name: '--mds-button-radius', docs: '' }],
      }),
    ).toEqual([
      'prop label',
      'event mdsButtonClick',
      'method agree',
      'slot (default)',
      'slot notification',
      'part label',
      'css --mds-button-radius',
    ]);
  });
});

describe('rawHtmlMembers', () => {
  const component = (docs: string): DescribedComponent => ({
    tag: 'mds-input-switch',
    props: [{ name: 'name', docs }],
    events: [],
    methods: [],
    slots: [],
    parts: [],
    styles: [],
  });

  it('finds a tag written outside inline code', () => {
    expect(rawHtmlMembers(component('Specifies the name of an <input> element'))).toEqual([
      'prop name',
    ]);
    expect(rawHtmlMembers(component('Wraps it in a <mds-text variant="info">'))).toEqual([
      'prop name',
    ]);
    expect(rawHtmlMembers(component('Ends with </a>'))).toEqual(['prop name']);
  });

  it('accepts the tag written as code, and a bare angle bracket', () => {
    expect(rawHtmlMembers(component('Specifies the name of an `<input>` element'))).toEqual([]);
    expect(rawHtmlMembers(component('For `type="checkbox"` or `<input type="radio">`'))).toEqual(
      [],
    );
    expect(rawHtmlMembers(component('Shown when 0 < value < 10'))).toEqual([]);
  });

  it('names each member as magma.api.txt does', () => {
    expect(
      rawHtmlMembers({
        tag: 'mds-button',
        props: [{ name: 'label', docs: 'The <b>text</b>' }],
        events: [{ event: 'mdsButtonClick', docs: 'Emits on <button> click' }],
        methods: [],
        slots: [{ name: '', docs: 'A <span>' }],
        parts: [{ name: 'icon', docs: 'The `<svg>` of the icon' }],
        styles: [{ name: '--mds-button-radius', docs: 'The radius of the <button>' }],
      }),
    ).toEqual(['prop label', 'event mdsButtonClick', 'slot (default)', 'css --mds-button-radius']);
  });
});
