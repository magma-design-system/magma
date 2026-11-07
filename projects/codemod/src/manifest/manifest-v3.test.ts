import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformCss } from '../surfaces/css.js';
import { transformHtml } from '../surfaces/html.js';
import { collectColorTokens } from './color-token-source.js';
import { colorTokenNames } from './color-tokens.generated.js';
import {
  LOGICAL_ROOTS,
  MEASURES,
  manifestV3,
  SIZE_ROOTS,
  SPACING_ROOTS,
  SPACING_STEPS,
} from './manifest-v3.js';
import { chainFrom, DEFAULT_FROM, JUMPS, supersededFlags } from './manifests.js';

const PROJECTS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DTCG = [
  join(PROJECTS, 'design-tokens', 'dist', 'dtcg'),
  join(PROJECTS, 'styles', 'dist', 'dtcg'),
];

describe('the generated colour list', () => {
  it('is sorted, unique and holds the colours of both packages', () => {
    expect([...colorTokenNames].sort()).toEqual(colorTokenNames);
    expect(new Set(colorTokenNames).size).toBe(colorTokenNames.length);
    // design-tokens: a primitive, a semantic role; styles: the backdrop globals
    for (const name of [
      'tone-neutral-09',
      'magma-surface-raised',
      'magma-backdrop-color',
      'magma-overlay-color',
      'magma-on-backdrop',
    ])
      expect(colorTokenNames).toContain(name);
    // not a colour: a spacing token, a duration
    expect(colorTokenNames.some((n) => n.startsWith('spacing') || n.includes('duration'))).toBe(
      false,
    );
  });

  // The committed list is the DTCG sets' when they are built (CI builds them
  // before the codemod tests): a tokens change that moves a colour fails here
  // until `nx run codemod:generate.colors` runs.
  const built = DTCG.every((dir) => existsSync(dir));
  (built ? it : it.skip)('matches the built DTCG sets of design-tokens and styles', () => {
    const files: Record<string, unknown> = {};
    for (const dir of DTCG)
      for (const name of readdirSync(dir).filter((f) => f.endsWith('.tokens.json')))
        files[name] = JSON.parse(readFileSync(join(dir, name), 'utf8'));
    const scan = collectColorTokens(files);
    expect(scan.missing).toEqual([]);
    expect(scan.names).toEqual(colorTokenNames);
  });

  it('reads the type a group gives its tokens, as DTCG says', () => {
    const scan = collectColorTokens({
      'a.tokens.json': {
        tone: {
          $type: 'color',
          one: { $value: '#000', $extensions: { 'it.maggioli.magma': { css: '--tone-one' } } },
          gap: {
            $type: 'dimension',
            $value: '1px',
            $extensions: { 'it.maggioli.magma': { css: '--gap' } },
          },
        },
        lost: { $type: 'color', $value: '#fff' },
      },
    });
    expect(scan.names).toEqual(['tone-one']);
    expect(scan.missing).toEqual(['a.tokens.json: lost']);
  });
});

describe('the v2 -> v3 manifest', () => {
  it('lists the colour properties that are not tokens by their v3 name', () => {
    const names = manifestV3.global.colorTokens!.names;
    for (const name of [
      'magma-field-fill',
      'mds-input-variant-color',
      'mds-input-date-variant-color',
      'mds-input-date-range-variant-color',
      'mds-input-select-variant-color',
      'mds-button-border-color',
      'mds-dropdown-drop-shadow-color',
      'mds-modal-overlay-color',
    ])
      expect(names).toContain(name);
    expect(names.some((n) => n.endsWith('-rgb'))).toBe(false);
  });

  it('migrates a v2 sheet end to end', () => {
    const v2 = [
      'mds-input-select { --mds-input-select-variant-color-rgb: 0 85 204; }',
      '.scrim { --magma-backdrop-color: 0 0 0; background: rgb(var(--magma-backdrop-color) / 0.4); }',
      '.brand { color: rgb(var(--brand-rgb)); }',
      'mds-button { --mds-button-border-color-rgb: var(--magma-accent-emphasis); }',
    ].join('\n');
    const result = transformCss(v2, manifestV3, { file: 'v2.css' });
    expect(result.output).toBe(
      [
        'mds-input-select { --mds-input-select-variant-color: rgb(0 85 204); }',
        '.scrim { --magma-backdrop-color: rgb(0 0 0); background: color-mix(in srgb, var(--magma-backdrop-color) 40%, transparent); }',
        '.brand { color: rgb(var(--brand-rgb)); }',
        'mds-button { --mds-button-border-color: var(--magma-accent-emphasis); }',
      ].join('\n'),
    );
    // the internal property is renamed, and flagged as internal
    expect(
      result.findings.some((f) => f.kind === 'flag' && f.message.includes('internal property')),
    ).toBe(true);
  });

  // #1218: the new default h6 is the change, so nothing is written and each item that leaves
  // typography out is reported with the attribute that keeps the Magma 2 look
  it('reports the items whose title moves to h6 and writes nothing', () => {
    const v2 = [
      '<mds-accordion>',
      '  <mds-accordion-item label="Uno"></mds-accordion-item>',
      '  <mds-accordion-item label="Due" typography="h6"></mds-accordion-item>',
      '</mds-accordion>',
      '<mds-accordion-timer>',
      '  <mds-accordion-timer-item description="Tre"></mds-accordion-timer-item>',
      '  <mds-accordion-timer-item description="Quattro" typography="h5"></mds-accordion-timer-item>',
      '</mds-accordion-timer>',
    ].join('\n');
    const result = transformHtml(v2, manifestV3, { file: 'faq.html' });
    expect(result.changed).toBe(false);
    expect(result.output).toBe(v2);
    expect(
      result.findings.map(({ kind, line, component, after }) => ({ kind, line, component, after })),
    ).toEqual([
      { kind: 'flag', line: 2, component: 'mds-accordion-item', after: 'typography="h5"' },
      { kind: 'flag', line: 6, component: 'mds-accordion-timer-item', after: 'typography="h5"' },
    ]);
  });
});

describe('category P: the t-shirt names leave spacing (#1061)', () => {
  const classes = manifestV3.global.classes!;
  const renames = new Map(
    classes.flatMap((rule) => (rule.kind === 'classRename' ? [[rule.from, rule.to]] : [])),
  );
  const reports = new Set(
    classes.flatMap((rule) => (rule.kind === 'classReport' ? [rule.name] : [])),
  );

  it('rewrites a spacing utility to the step of the same value, and leaves the container sizes', () => {
    expect(renames.get('p-md')).toBe('p-400');
    expect(renames.get('gap-y-3xl')).toBe('gap-y-1600');
    expect(renames.get('-m-xs')).toBe('-m-100');
    expect(renames.get('h-lg')).toBe('h-600');
    expect(renames.get('w-none')).toBe('w-0');
    expect(renames.get('inline-none')).toBe('inline-0');
    for (const name of ['w-xs', 'max-w-2xl', 'basis-md', 'max-w-none', 'leading-md', 'max-w-text'])
      expect(renames.has(name) || reports.has(name)).toBe(false);
    for (const to of renames.values()) expect(to).toMatch(/^-?[a-z-]+-\d+$/);
  });

  it('reports what changes value', () => {
    for (const name of [
      'inline-2xl',
      'min-inline-sm',
      'max-inline-xs',
      'max-inline-none',
      'leading-none',
      'p-prose',
      'gap-text',
      '-m-title',
    ])
      expect(reports.has(name)).toBe(true);
    expect(reports.has('w-prose')).toBe(false);
  });

  it('renames the custom properties of the measures', () => {
    const v2 =
      '.article { max-width: var(--spacing-text); --spacing-prose: 60ch; gap: var(--spacing-md); }';
    expect(transformCss(v2, manifestV3, { file: 'v2.css' }).output).toBe(
      '.article { max-width: var(--container-text); --container-prose: 60ch; gap: var(--spacing-md); }',
    );
  });

  // The roots and their partition come from the consumption map of styles (CI builds it
  // before the codemod tests): a Tailwind or theme change that moves them fails here.
  const MAP = join(PROJECTS, 'styles', 'dist', 'tailwind', 'consumption.json');
  (existsSync(MAP) ? it : it.skip)('matches the consumption map of the built theme', () => {
    const map = JSON.parse(readFileSync(MAP, 'utf8')) as {
      tokens: Record<string, { namespace: string | null; key?: string | null }>;
      namespaces: Record<string, { utilities: string[] }>;
      spacing: { utilities: string[]; keys: string[] };
    };
    expect([...SPACING_ROOTS].sort()).toEqual([...map.namespaces['--spacing']!.utilities].sort());
    // no named step of spacing, no measure, is a theme key any more
    const gone: string[] = [...Object.keys(SPACING_STEPS), ...MEASURES];
    expect(map.spacing.keys.filter((key) => gone.includes(key))).toEqual([]);
    // every step written is a class of the theme
    for (const to of renames.values())
      expect(map.spacing.utilities).toContain(to.slice(0, to.lastIndexOf('-')));
    // the size roots are the container's, the leading scale has every t-shirt key
    const roots: readonly string[] = SPACING_ROOTS;
    expect(
      map.namespaces['--container']!.utilities.filter((root) => roots.includes(root)).sort(),
    ).toEqual([...SIZE_ROOTS, ...LOGICAL_ROOTS].sort());
    const leading = Object.values(map.tokens).flatMap(({ namespace, key }) =>
      namespace === '--leading' && key ? [key] : [],
    );
    expect(leading).toEqual(expect.arrayContaining(Object.keys(SPACING_STEPS).slice(1)));
  });
});

describe('the jumps', () => {
  it('starts from Magma 2 unless told otherwise', () => {
    expect(DEFAULT_FROM).toBe(2);
    expect(chainFrom(2)).toEqual([JUMPS[2]]);
    expect(chainFrom(1)).toEqual([JUMPS[1], JUMPS[2]]);
  });

  it('knows which v1 -> v2 channel flags the v2 -> v3 renames make moot', () => {
    expect([...supersededFlags(chainFrom(1))].sort()).toEqual([
      'mds-button/cssVarRename/mds-button-border-color',
      'mds-input-date-range/cssVarRename/mds-input-date-range-variant-color',
      'mds-input-date/cssVarRename/mds-input-date-variant-color',
      'mds-input/cssVarRename/mds-input-variant-color',
    ]);
    expect(supersededFlags(chainFrom(2)).size).toBe(0);
  });
});
