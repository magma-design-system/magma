import { resolve } from 'node:path';
import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';

const PLUGIN = resolve(__dirname, 'stylelint-token-values.mjs');

/**
 * The messages magma/token-values reports for a stylesheet.
 */
const lint = async (code: string): Promise<string[]> => {
  const { results } = await stylelint.lint({
    code,
    config: { plugins: [PLUGIN], rules: { 'magma/token-values': true } },
  });
  return results[0].warnings.map((warning) => warning.text);
};

describe('magma/token-values', () => {
  it('names the spacing step of a px or rem length', async () => {
    expect(await lint(':host { gap: 16px; margin: -0.125rem 3px; }')).toEqual([
      'Unexpected literal "16px": use --spacing(400) (magma/token-values)',
      'Unexpected literal "-0.125rem": use --spacing(-50) (magma/token-values)',
      'Unexpected literal "3px": use --spacing(75) (magma/token-values)',
    ]);
  });

  it('names the duration token of a time on the scale, and says when there is none', async () => {
    expect(
      await lint(':host { --mds-a-duration: 0.5s; transition: color 300ms; --b: 250ms; }'),
    ).toEqual([
      'Unexpected literal "0.5s": use var(--duration-500) (magma/token-values)',
      'Unexpected literal "300ms": use var(--duration-300) (magma/token-values)',
      'Unexpected literal "250ms": no --duration-* step says 250ms: pick one, or keep the literal under stylelint-disable-next-line with the reason (magma/token-values)',
    ]);
  });

  it('points a radius at the radius scale', async () => {
    expect(await lint(':host { border-radius: 8px; }')).toEqual([
      'Unexpected literal "8px": use a var(--magma-radius-*) step (magma/token-values)',
    ]);
  });

  it('checks custom properties, @property defaults and nested functions', async () => {
    const css = `
@property --mds-a-size { syntax: '<length>'; inherits: true; initial-value: 20px; }
:host { --mds-a-shadow: drop-shadow(0 4px 3px rgb(0 0 0 / 0.1)); width: calc(var(--x, 2rem) * 2); }`;

    const literals = (await lint(css)).map((message) => message.match(/"(.+?)"/)?.[1]);

    expect(literals).toEqual(['20px', '4px', '3px', 'rgb(0 0 0 / 0.1)', '2rem']);
  });

  it('rejects a literal colour, and points a black shadow at the shadow ink', async () => {
    const css = `:host {
  --mds-a-light: 0 1px 0 0 rgb(255 255 255 / var(--o, 0.5)) inset;
  background-color: rgb(73 73 73);
  border-color: hsl(0 0% 50% / 0.5);
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.1);
  color: #100;
}`;

    expect(await lint(css)).toEqual([
      'Unexpected literal "rgb(255 255 255 / var(--o, 0.5))": paint with a role, rgb(var(--magma-*) / <alpha>) (magma/token-values)',
      'Unexpected literal "rgb(73 73 73)": paint with a role, rgb(var(--magma-*) / <alpha>) (magma/token-values)',
      'Unexpected literal "hsl(0 0% 50% / 0.5)": paint with a role, rgb(var(--magma-*) / <alpha>) (magma/token-values)',
      'Unexpected literal "rgb(0 0 0 / 0.1)": a shadow is rgb(var(--magma-shadow-ink) / <alpha>) (magma/token-values)',
      'Unexpected literal "#100": paint with a role, rgb(var(--magma-*) / <alpha>) (magma/token-values)',
    ]);
  });

  it('lets through a role in the RGB wrapper, colour keywords and the colours of a mask', async () => {
    const css = `:host {
  background-color: transparent;
  color: rgb(var(--magma-text-muted) / 0.5);
  fill: currentColor;
  mask-image: linear-gradient(rgb(0 0 0 / 1), transparent);
  -webkit-mask-image: linear-gradient(#000000, transparent);
}`;

    expect(await lint(css)).toEqual([]);
  });

  it('lets through zero, the 1px hairline, tokens and the units it does not own', async () => {
    const css = `:host {
  --mds-a-duration: 0s;
  border: 1px solid rgb(var(--magma-border-default));
  grid-template-columns: repeat(auto-fit, minmax(1px, 1fr));
  margin: 0 --spacing(400) --spacing(-200);
  translate: 0 -1px;
  transition-duration: var(--duration-300);
  width: calc(100% - 50vw);
  height: 1lh;
  rotate: 45deg;
  inset: 0px;
}`;

    expect(await lint(css)).toEqual([]);
  });

  it('skips identifiers, strings, url() and at-rule conditions', async () => {
    const css = `@media (width <= 480px) {
  :host {
    --mds-a-radius: var(--magma-radius-2xs);
    content: '12px';
    background-image: url('icon-16px.svg');
  }
}

@container (max-width: 47px) {
  :host { display: none; }
}`;

    expect(await lint(css)).toEqual([]);
  });

  it('honours a stylelint-disable comment with its reason', async () => {
    const css = `:host {
  /* stylelint-disable-next-line magma/token-values -- 725ms, one turn of the spinner */
  --mds-a-duration: 0.725s;
}`;

    expect(await lint(css)).toEqual([]);
  });
});
