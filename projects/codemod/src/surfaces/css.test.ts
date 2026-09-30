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

  it('flags a rename that carries a note, on the definition site only', () => {
    const source = [
      '.a {',
      '  --mds-button-ghost-background-color: red;',
      '  background: var(--mds-button-ghost-background-color);',
      '}',
    ].join('\n');
    const { findings } = transformCss(source, manifest, ctx);
    const flags = findings.filter((f) => f.kind === 'flag');
    expect(flags.length).toBe(1);
    expect(flags[0]!.message).toContain('never shipped');
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

  it('seed-renames a bare tone off a background, but reports (not rewrites) it on a background', () => {
    const source = [
      '.a {',
      '  color: rgb(var(--tone-neutral));',
      '  background: rgb(var(--tone-neutral));',
      '}',
    ].join('\n');
    const { output, changed, findings } = transformCss(source, manifest, ctx);
    expect(changed).toBe(true);
    expect(output).toContain('color: rgb(var(--tone-neutral-seed));');
    expect(output).toContain('background: rgb(var(--tone-neutral));');
    expect(
      findings.some(
        (f) => f.kind === 'warn' && f.ruleId === 'global/cssVarSurfaceReport/tone-neutral',
      ),
    ).toBe(true);
  });

  it('reports a neutral scale step used as a background, without rewriting it', () => {
    const source = '.a { background-color: rgb(var(--tone-neutral-09)); }';
    const { output, changed, findings } = transformCss(source, manifest, ctx);
    expect(changed).toBe(false);
    expect(output).toBe(source);
    expect(
      findings.some(
        (f) => f.kind === 'warn' && f.ruleId === 'global/cssVarSurfaceReport/tone-neutral-09',
      ),
    ).toBe(true);
  });

  it('reports a neutral step in a --*-background* custom property (component token)', () => {
    const source = '.a { --mds-separator-background: rgb(var(--tone-neutral-09)); }';
    const { changed, findings } = transformCss(source, manifest, ctx);
    expect(changed).toBe(false);
    expect(
      findings.some(
        (f) => f.kind === 'warn' && f.ruleId === 'global/cssVarSurfaceReport/tone-neutral-09',
      ),
    ).toBe(true);
  });

  it('does not report a neutral step used outside a background (e.g. color)', () => {
    const source = '.a { color: rgb(var(--tone-neutral-09)); }';
    const { output, changed, findings } = transformCss(source, manifest, ctx);
    expect(changed).toBe(false);
    expect(output).toBe(source);
    expect(findings.length).toBe(0);
  });

  it('is idempotent on seed-renamed + reported output', () => {
    const source = [
      '.a {',
      '  color: rgb(var(--tone-neutral));',
      '  background: rgb(var(--tone-neutral));',
      '}',
    ].join('\n');
    const once = transformCss(source, manifest, ctx).output;
    const twice = transformCss(once, manifest, ctx);
    expect(twice.changed).toBe(false);
    expect(twice.output).toBe(once);
  });

  it('renames utility classes in @apply, preserving variants and untouched tokens', () => {
    const source = '.card { @apply p-4 shadow-outline-light hover:rounded-xl; }';
    const { output, changed } = transformCss(source, manifest, ctx);
    expect(changed).toBe(true);
    expect(output).toBe('.card { @apply p-4 shadow-ring-weak hover:rounded-md; }');
  });

  it('reports a no-equivalent class in @apply without rewriting', () => {
    const source = '.card { @apply shadow-outline-strong; }';
    const { output, changed, findings } = transformCss(source, manifest, ctx);
    expect(changed).toBe(false);
    expect(output).toBe(source);
    expect(
      findings.some(
        (f) => f.kind === 'warn' && f.ruleId === 'global/classReport/shadow-outline-strong',
      ),
    ).toBe(true);
  });

  it('handles @apply in SCSS sources', () => {
    const source = '.card {\n  @apply rounded-md;\n}';
    const { output } = transformCss(source, manifest, ctx, { scss: true });
    expect(output).toBe('.card {\n  @apply rounded-2xs;\n}');
  });
});
