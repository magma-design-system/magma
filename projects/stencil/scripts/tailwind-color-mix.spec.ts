import postcss from 'postcss';
import tailwindPostcss from '@tailwindcss/postcss';
import { describe, expect, it } from 'vitest';
import {
  dropColorMixPolyfillPlugin,
  getMinifyPlugins,
} from './tailwind-plugin/src/helpers/postcss';

// a color-mix() over a var(), overridden by a later rule of the same selector (#918: the arrow
// of mds-input-select)
const source = `@reference "tailwindcss/theme.css";
:host { --tint: red; --arrow: color-mix(in srgb, var(--tint) 50%, transparent); }
.icon { fill: var(--arrow); }
:host { --arrow: blue; }
`;

const build = async (optimize: boolean | { minify: boolean }, drop: boolean) => {
  const tailwind = await postcss([
    tailwindPostcss({ optimize, base: process.cwd() }),
    ...(drop ? [dropColorMixPolyfillPlugin()] : []),
  ]).process(source, { from: `${process.cwd()}/mds-test.css` });
  // the stage that merges the rules of the component sheets after Tailwind
  return (await postcss(getMinifyPlugins()).process(tailwind.css, { from: undefined })).css;
};

/** The value of `prop` that wins on :host: the last one declared. */
const winner = (css: string, prop: string): string | undefined => {
  let last: string | undefined;
  postcss.parse(css).walkDecls(prop, (decl) => {
    if ((decl.parent as { selector?: string }).selector === ':host') last = decl.value;
  });
  return last;
};

describe('dropColorMixPolyfillPlugin', () => {
  it('shows why: with the polyfill the merged rule loses its override', async () => {
    const css = await build({ minify: true }, false);

    expect(css).toContain('color-mix(in lab,red,red)');
    expect(winner(css, '--arrow')).toMatch(/^color-mix\(/);
  });

  it('puts the color-mix() back in place of its fallback, so the later rule wins', async () => {
    const css = await build({ minify: true }, true);

    expect(css).not.toContain('@supports');
    expect(winner(css, '--arrow')).toBe('blue');
    expect(css).toMatch(/--arrow:color-mix\(in srgb,var\(--tint\) 50%,(transparent|#0000)\)/);
  });

  it('reads the nested form Tailwind writes without optimize', async () => {
    const css = await build(false, true);

    expect(css).not.toContain('@supports');
    expect(winner(css, '--arrow')).toBe('blue');
  });

  it('fails the build when the fallback is missing', async () => {
    const orphan = '@supports (color: color-mix(in lab, red, red)) { :host { --a: red; } }';

    await expect(
      postcss([dropColorMixPolyfillPlugin()]).process(orphan, { from: undefined }),
    ).rejects.toThrow(/No fallback of --a/);
  });
});
