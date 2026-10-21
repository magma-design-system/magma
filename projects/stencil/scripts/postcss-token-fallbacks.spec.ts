import { describe, expect, it } from 'vitest';
import tokenFallbackPlugin from './postcss-token-fallbacks';

// reads the built token sheets, as the build does: needs design-tokens and styles built
const inject = async (css: string): Promise<string> =>
  (await tokenFallbackPlugin({ failOnMissing: true, checkPrefixes: ['magma-'] }).transform(
    css,
    'mds-test.css',
  ))!.code;

describe('tokenFallbackPlugin', () => {
  it('falls back from a semantic role to the design token behind it, then to its value', async () => {
    const css = await inject('a{color:rgb(var(--magma-accent-emphasis))}');

    expect(css).toMatch(
      /^a\{color:rgb\(var\(--magma-accent-emphasis, var\(--variant-primary-\d+, \d+ \d+ \d+\)\)\)\}$/,
    );
  });

  // the tint is declared by the same sheet as the role on its :root: it is defined only where
  // the role is, so it never resolves, and a pre-rendered page repeated it in every shadow root
  it('skips the tint a role points to, a link of the same sheet', async () => {
    const css = await inject('a{color:rgb(var(--magma-text-on-emphasis))}');

    expect(css).not.toContain('--magma-tint-');
    expect(css).toContain('var(--magma-text-on-emphasis, ');
  });

  it('keeps the tint a stylesheet reads itself', async () => {
    const css = await inject('a{color:rgb(var(--magma-tint-accent-emphasis))}');

    expect(css).toMatch(/^a\{color:rgb\(var\(--magma-tint-accent-emphasis, var\(--variant-/);
  });

  it('resolves a global token to the value globals.css declares', async () => {
    const css = await inject('a{z-index:var(--magma-modal-z-index)}');

    expect(css).toMatch(/^a\{z-index:var\(--magma-modal-z-index, \d+\)\}$/);
  });
});
