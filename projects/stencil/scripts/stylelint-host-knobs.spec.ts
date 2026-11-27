import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import postcss from 'postcss';
import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';
import { semanticModel } from '../../design-tokens/semantic.model';
import {
  SYSTEM_CLASSES,
  baseClass,
  classFamilyOf,
  familyOf,
  isHostSelector,
} from './stylelint-host-knobs.mjs';

const PROJECT = resolve(__dirname, '..');
const PLUGIN = resolve(__dirname, 'stylelint-host-knobs.mjs');
const COMPONENTS = join(PROJECT, 'src/components');

/**
 * A folder of components on disk, so that the rule can read the tags and the @prop of each: by
 * tag, the sheets of the component relative to its folder.
 */
const fixture = (components: Record<string, Record<string, string>>): string => {
  const root = join(mkdtempSync(join(tmpdir(), 'host-knobs-')), 'src/components');
  for (const [tag, sheets] of Object.entries(components)) {
    for (const [name, css] of Object.entries(sheets)) {
      mkdirSync(dirname(join(root, tag, name)), { recursive: true });
      writeFileSync(join(root, tag, name), css);
    }
  }
  return root;
};

/**
 * The messages magma/host-knobs reports for a stylesheet, as the sheet of a component when
 * `file` is given.
 */
const lint = async (code: string, file?: string, pending?: string): Promise<string[]> => {
  const { results } = await stylelint.lint({
    code,
    codeFilename: file,
    config: {
      plugins: [PLUGIN],
      rules: { 'magma/host-knobs': pending ? [true, { pending }] : true },
    },
  });
  return results[0].warnings.map((warning) => warning.text.replace(/ \(magma\/host-knobs\)$/, ''));
};

const read = (token: string, family: string, where: string, knob = '--mds-<tag>-*') =>
  `Unexpected var(${token}) ${where}: a ${family} is a design decision, declare it on :host as a knob ${knob} with this token as default and read the knob here`;

/** Every sheet of the components. */
const sheets = (dir = COMPONENTS): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sheets(path);
    return name.endsWith('.css') ? [path] : [];
  });

describe('magma/host-knobs: the design decisions on :host', () => {
  it('lets any custom property on :host read a token, in any state and at-rule', async () => {
    const css = `
:host {
  --mds-a-background: rgb(var(--magma-surface-raised));
  --mds-a-radius: var(--magma-radius-md);
  --mds-a-shadow: var(--shadow-md);
  --mds-a-transition-duration: var(--duration-200);
  --mds-a-z-index: var(--magma-modal-z-index);
  --private-a-fill: var(--magma-accent-emphasis);
  --magma-surface-default: var(--magma-surface-overlay);
  background-color: var(--mds-a-background);
}

:host([variant='info']), :host-context(.dark):hover {
  --private-a-fill: var(--magma-info-emphasis);
}

@media (width < 1024px) {
  :host(:not([dock='none'])) {
    &[zoomed] {
      --mds-a-shadow: var(--shadow-2xl);
    }
  }
}

.box {
  background-color: rgb(var(--private-a-fill));
  border-radius: var(--mds-a-radius);
}`;

    expect(await lint(css)).toEqual([]);
  });

  it('reports a colour, a radius, a shadow, a motion and a z-index read anywhere else', async () => {
    const css = `
:host {
  color: rgb(var(--magma-text-default));
  z-index: var(--magma-modal-z-index);

  .box {
    --mds-a-color: rgb(var(--magma-text-muted));
  }
}

::slotted(*) {
  box-shadow: var(--shadow-ring);
}

@keyframes pulse {
  to { border-radius: var(--magma-radius-full); }
}

.frame {
  transition-duration: var(--duration-200);
  transition-timing-function: var(--ease-out);
  background-color: var(--tone-neutral-04);
}`;

    expect(await lint(css)).toEqual([
      read('--magma-text-default', 'colour', 'in a property of :host'),
      read('--magma-modal-z-index', 'z-index', 'in a property of :host'),
      read('--magma-text-muted', 'colour', 'below :host'),
      read('--shadow-ring', 'shadow', 'below :host'),
      read('--magma-radius-full', 'radius', 'below :host'),
      read('--duration-200', 'motion', 'below :host'),
      read('--ease-out', 'motion', 'below :host'),
      read('--tone-neutral-04', 'colour', 'below :host'),
    ]);
  });

  it('leaves free the spacing, the sizes, the text and the axes of the system and of the page', async () => {
    const css = `
:host {
  gap: --spacing(600);
  padding: var(--magma-rhythm-inset);
}

.box {
  aspect-ratio: var(--aspect-video);
  border-width: 1px;
  corner-shape: var(--magma-corner-shape);
  font-size: var(--text-size-info-detail);
  max-width: var(--magma-width-dialog);
  outline: var(--magma-outline-blur);
  right: var(--magma-width-page-gutter);
  width: --theme(--container-2xs);
}`;

    expect(await lint(css)).toEqual([]);
  });

  it('skips comments, strings, url(), @property and the document sheets', async () => {
    const css = `
@property --mds-a-color { syntax: '<color>'; inherits: true; initial-value: transparent; }
.box {
  /* var(--magma-text-muted) */
  content: 'var(--magma-text-muted)';
  background-image: url('var(--magma-x).svg');
}`;
    const root = fixture({ 'mds-a': { 'mds-a.css': '' } });

    expect(await lint(css)).toEqual([]);
    expect(
      await lint(
        '.box { color: var(--magma-text-muted); }',
        join(root, 'mds-a/css/mds-a-pre-hydration.css'),
      ),
    ).toEqual([]);
    expect(
      await lint(
        '.box { color: var(--magma-text-muted); }',
        join(root, 'mds-a/css/mds-a-property.css'),
      ),
    ).toEqual([]);
  });
});

describe('magma/host-knobs: @apply', () => {
  it('reports a class of the families', async () => {
    const messages = await lint(
      '.box { @apply ease-out shadow-lg rounded-md z-10 bg-surface-raised desktop:transition-colors; }',
    );

    expect(messages.map((message) => message.match(/@apply (\S+): a (\S+)/)?.slice(1))).toEqual([
      ['ease-out', 'motion'],
      ['shadow-lg', 'shadow'],
      ['rounded-md', 'radius'],
      ['z-10', 'z-index'],
      ['bg-surface-raised', 'colour'],
      ['desktop:transition-colors', 'motion'],
    ]);
  });

  it('lets through the text, the geometry and the behaviour of the system', async () => {
    const css = `
:host {
  @apply focus-bounce;
}

.label {
  @apply text-info-detail font-bold antialiased truncate grid-cols-full not-hydrated bg-cover transition-none desktop:hidden;
}`;

    expect(await lint(css)).toEqual([]);
  });

  it('decides on the class after its variants', () => {
    expect(baseClass('desktop:hidden')).toBe('hidden');
    expect(baseClass('max-tablet:[&>svg]:flex!')).toBe('flex');
    expect(classFamilyOf('dark:shadow-ring')).toBe('shadow');
  });
});

describe('magma/host-knobs: the names of the knobs', () => {
  const root = fixture({
    'mds-a': {
      'mds-a.css': `/**
 * @prop --mds-a-gap: Public. The gap
 * @prop --mds-a-selected-background: The background when selected
 * @prop --mds-a-background-selected: The background when selected, the state after
 * @prop --mds-a-transition-duration: The duration
 * @prop --mds-a-duration: The duration, bare
 * @prop --mds-a-window-max-height: The height of the window
 * @prop --mds-a-radius: The radius
 * @prop --mds-a-item-default-color: The colour of the items
 */`,
    },
    'mds-a-item': { 'mds-a-item.css': '/**\n * @prop --mds-a-item-gap: The gap\n */' },
  });
  const file = join(root, 'mds-a/css/mds-a-variant.css');

  it('wants the property at the end, its state before it, or a short form', async () => {
    const css = `
:host {
  --mds-a-gap: 0;
  --mds-a-selected-background: transparent;
  --mds-a-transition-duration: 0s;
  --mds-a-window-max-height: 100%;
  --mds-a-radius: 0;
  --mds-a-background-selected: transparent;
  --mds-a-duration: 0s;
}`;

    expect(await lint(css, file)).toEqual([
      expect.stringMatching(
        /^Unexpected --mds-a-background-selected: a knob ends with the CSS property/,
      ),
      expect.stringMatching(/^Unexpected --mds-a-duration: a knob ends with the CSS property/),
    ]);
  });

  it('wants a prefix, a component tag and an @prop of the component or of the one that sets it', async () => {
    const css = `
:host {
  --mds-a-item-default-color: transparent;
  --mds-a-item-gap: 0;
  --mds-a-padding: 0;
  --mds-b-width: 0;
  --size: 0;
}`;

    expect(await lint(css, file)).toEqual([
      'Undocumented knob --mds-a-padding: name it in an @prop of mds-a',
      'Unexpected --mds-b-width: its name starts with no component tag',
      'Unexpected --size: a component declares a knob --mds-a-*, a --private-* or a role --magma-*',
    ]);
  });
});

describe('magma/host-knobs: the baseline', () => {
  const root = fixture({ 'mds-a': { 'mds-a.css': '' } });
  const file = join(root, 'mds-a/mds-a.css');
  const pending = join(root, 'pending.json');
  const css =
    ':host { color: var(--magma-text-default); }\n.box { border-radius: var(--magma-radius-md); }';

  it('says nothing for a sheet at its count', async () => {
    writeFileSync(pending, JSON.stringify({ 'mds-a/mds-a.css': 2 }));

    expect(await lint(css, file, pending)).toEqual([]);
  });

  it('reports everything past the count, and asks to lower a count above what it reports', async () => {
    writeFileSync(pending, JSON.stringify({ 'mds-a/mds-a.css': 1 }));
    const over = await lint(css, file, pending);
    writeFileSync(pending, JSON.stringify({ 'mds-a/mds-a.css': 3 }));
    const under = await lint(css, file, pending);

    expect(over).toEqual([
      '2 reported in this sheet, 1 allowed by its count in scripts/host-knobs-pending.json: the new ones are among them',
      read('--magma-text-default', 'colour', 'in a property of :host', '--mds-a-*'),
      read('--magma-radius-md', 'radius', 'below :host', '--mds-a-*'),
    ]);
    expect(under).toEqual([
      '2 reported in this sheet, 3 still allowed by scripts/host-knobs-pending.json: lower its count (npm run list.host-knobs -- --lower)',
    ]);
  });

  it('holds a sheet it does not name at 0, and does not count what a disable comment hides', async () => {
    writeFileSync(pending, JSON.stringify({}));
    const disabled = `:host { color: var(--magma-text-default); }
.box {
  /* stylelint-disable-next-line magma/host-knobs -- a reason */
  border-radius: var(--magma-radius-md);
}`;

    expect(await lint(css, file, pending)).toHaveLength(2);
    expect(await lint(disabled, file, pending)).toEqual([
      read('--magma-text-default', 'colour', 'in a property of :host', '--mds-a-*'),
    ]);
  });
});

describe('magma/host-knobs: the selectors of the host', () => {
  it('takes the host with its states, not what is below it', () => {
    expect(isHostSelector(':host')).toBe(true);
    expect(isHostSelector(":host([variant='info'], [tone='a b'])")).toBe(true);
    expect(isHostSelector(':host-context(.dark):hover')).toBe(true);
    expect(isHostSelector(':host .box')).toBe(false);
    expect(isHostSelector(':host>.box')).toBe(false);
    expect(isHostSelector(':host::before')).toBe(false);
    expect(isHostSelector('::slotted(*)')).toBe(false);
    expect(isHostSelector(':hostile')).toBe(false);
  });
});

describe('magma/host-knobs: on the real data', () => {
  it('keeps a baseline of sheets that exist, sorted, with a count above 0', () => {
    const pending = JSON.parse(
      readFileSync(join(__dirname, 'host-knobs-pending.json'), 'utf8'),
    ) as Record<string, number>;
    const names = Object.keys(pending);

    expect(names.filter((sheet) => !existsSync(join(COMPONENTS, sheet)))).toEqual([]);
    expect(names).toEqual([...names].sort());
    expect(Object.values(pending).filter((count) => !Number.isInteger(count) || count < 1)).toEqual(
      [],
    );
  });

  /*
    The colours, by their name: a `--magma-*` the sheets read is a colour for the rule exactly when
    it is one at its source: a role of the semantic layer (design-tokens/semantic.model.ts, every
    block: base, dark, contrast, the named themes), or a name whose every declaration, in
    styles/css/globals.css or in a component that passes it down (`--magma-field-fill`), holds a
    colour (an RGB triple, an rgb(), transparent, a palette step or another colour). The shadow ink
    is a role of the shadow family.
  */
  it('calls colour the colours of their source, and only them', () => {
    const model = semanticModel();
    const roles = new Set(
      [
        ...model.base.flatMap((section) => section.decls),
        ...model.dark,
        ...model.contrast,
        ...model.themes.flatMap((theme) => [...theme.decls, ...theme.contrast, ...theme.preview]),
      ].map((decl) => decl.name),
    );
    const readInSheets = new Set(
      sheets().flatMap((path) =>
        [...readFileSync(path, 'utf8').matchAll(/var\(\s*--(magma-[\w-]+)/g)].map(
          (match) => match[1],
        ),
      ),
    );
    const declared = new Map<string, string[]>();
    for (const path of [join(PROJECT, '../styles/css/globals.css'), ...sheets()]) {
      for (const [, name, value] of readFileSync(path, 'utf8').matchAll(
        /(?<![\w-])--(magma-[\w-]+)\s*:\s*([^;{}]+);/g,
      )) {
        declared.set(name, [...(declared.get(name) ?? []), value.trim()]);
      }
    }
    const isColour = (name: string, seen = new Set<string>()): boolean => {
      if (roles.has(name)) return true;
      const values = declared.get(name) ?? [];
      return (
        values.length > 0 &&
        values.every((value) => {
          const inner = value.match(/^var\(--(magma-[\w-]+)\)$/)?.[1];
          if (inner) return !seen.has(inner) && isColour(inner, new Set([...seen, name]));
          return /^(?:\d+ \d+ \d+|rgb\(.*\)|transparent|var\(--(?:label|tone|variant|status|color)-.*\))$/.test(
            value,
          );
        })
      );
    };
    const misnamed = [...readInSheets].filter((name) => {
      const family = familyOf(name);
      if (isColour(name)) return family !== 'colour' && family !== 'shadow';
      return family === 'colour';
    });

    expect(misnamed).toEqual([]);
  });

  /*
    The classes, by their namespace: for every class an @apply of the sheets names, the rule gives
    it a family exactly when the CSS Tailwind writes for it, on the theme the stencil build
    compiles the sheets with (the preamble of stencil.config.ts, its references imported so that
    the classes are written out), reads a token of a family. Needs the build of design-tokens and
    styles, as the test job of CI has.
  */
  it('gives a family to the classes the sheets apply exactly when their CSS reads a token of it', async () => {
    const require = createRequire(join(PROJECT, 'package.json'));
    const { compile } = require('@tailwindcss/node') as typeof import('@tailwindcss/node');
    const preamble = `@import "tailwindcss/theme.css" layer(theme);
@import "@maggioli-design-system/styles/dist/tailwind/theme.css";
@import "@maggioli-design-system/styles/dist/tailwind/typography.css";
@import "@maggioli-design-system/styles/dist/css/animations.css";
@import "${join(PROJECT, 'src/tailwind/utilities.css')}";
@import "tailwindcss/utilities.css" layer(utilities);`;
    const applied = new Set<string>();
    // a class a component defines with @utility in its own sheets is checked where it is written
    const own = new Set<string>();
    for (const path of sheets()) {
      const root = postcss.parse(readFileSync(path, 'utf8'));
      root.walkAtRules('utility', (atRule) => {
        own.add(atRule.params.trim());
      });
      root.walkAtRules('apply', (atRule) => {
        atRule.params
          .split(/\s+/)
          .filter(Boolean)
          .forEach((name) => applied.add(name));
      });
    }

    const disagree: string[] = [];
    for (const name of applied) {
      if (SYSTEM_CLASSES.has(baseClass(name)) || own.has(baseClass(name))) continue;
      const compiler = await compile(preamble, { base: PROJECT, onDependency: () => {} });
      const families = new Set<string>();
      postcss.parse(compiler.build([name])).walkAtRules('layer', (layer) => {
        if (layer.params !== 'utilities') return;
        layer.walkDecls((decl) => {
          for (const match of decl.value.matchAll(/var\(\s*--([\w-]+)/g)) {
            const family = familyOf(match[1]);
            if (family) families.add(family);
          }
        });
      });
      const said = classFamilyOf(name);
      if (said === undefined ? families.size > 0 : !families.has(said)) {
        disagree.push(
          `${name}: the rule says ${said ?? 'none'}, its CSS reads ${[...families].join(', ') || 'none'}`,
        );
      }
    }

    expect(applied.size).toBeGreaterThan(0);
    expect(disagree).toEqual([]);
  });
});
