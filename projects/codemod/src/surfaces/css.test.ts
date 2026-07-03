import { transformCss } from './css.js';
import { testManifest as manifest } from '../manifest/test-manifest.js';

const ctx = { file: 'x.css' };

describe('transformCss', () => {
  it('renames custom-property definitions and var() references', () => {
    const source = [
      '.a {',
      '  --mds-button-ghost-background-color: red;',
      '  background: var(--mds-button-ghost-background-color);',
      '}',
    ].join('\n');
    const { output, changed, findings } = transformCss(source, manifest, ctx);
    expect(changed).toBe(true);
    expect(output).toContain('--mds-button-outline-background-color: red;');
    expect(output).toContain('var(--mds-button-outline-background-color)');
    expect(output).not.toContain('ghost');
    expect(findings.filter((f) => f.kind === 'change').length).toBe(2);
  });

  it('flags a value-format change (hex → rgb channels)', () => {
    const source = ':root { --mds-banner-color: #ffffff; }';
    const { output, findings } = transformCss(source, manifest, ctx);
    expect(output).toContain('--mds-banner-color-rgb: #ffffff;');
    expect(findings.some((f) => f.kind === 'flag')).toBe(true);
  });

  it('renames shadow parts in ::part() selectors', () => {
    const source = 'mds-button::part(label) { color: red; }';
    const { output } = transformCss(source, manifest, ctx);
    expect(output).toContain('::part(content)');
  });

  it('leaves unrelated custom properties untouched', () => {
    const source = '.a { --my-color: blue; color: var(--my-color); }';
    const { output, changed } = transformCss(source, manifest, ctx);
    expect(changed).toBe(false);
    expect(output).toBe(source);
  });

  it('is idempotent', () => {
    const source = '.a { --mds-button-ghost-background-color: red; }';
    const once = transformCss(source, manifest, ctx).output;
    const twice = transformCss(once, manifest, ctx);
    expect(twice.changed).toBe(false);
    expect(twice.output).toBe(once);
  });

  it('honours --skip', () => {
    const source = '.a { --mds-button-ghost-background-color: red; }';
    const { changed } = transformCss(source, manifest, {
      ...ctx,
      skip: new Set(['mds-button/cssVarRename/mds-button-ghost-background-color']),
    });
    expect(changed).toBe(false);
  });

  it('warns on definitions and references of removed custom properties, without rewriting', () => {
    const source = '.a { --mds-banner-gap: 4px; gap: var(--mds-banner-gap); }';
    const { output, changed, findings } = transformCss(source, manifest, ctx);
    expect(changed).toBe(false);
    expect(output).toBe(source);
    expect(findings.filter((f) => f.kind === 'warn').length).toBe(2);
    expect(findings[0]!.message).toContain('--mds-banner-gap');
  });
});
