import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformCss } from '../surfaces/css.js';
import { transformHtml } from '../surfaces/html.js';
import { collectColorTokens } from './color-token-source.js';
import { colorTokenNames } from './color-tokens.generated.js';
import { manifestV3 } from './manifest-v3.js';
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
