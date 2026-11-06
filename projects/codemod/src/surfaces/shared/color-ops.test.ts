import { testManifestV3 } from '../../manifest/test-manifest.js';
import {
  colorRulesOf,
  convertColorDefinition,
  readsColorToken,
  rewriteArbitraryColor,
  rewriteColorReads,
} from './color-ops.js';
import { type ClassFinding } from './semantic-ops.js';

const rules = colorRulesOf(testManifestV3)!;

const reads = (value: string): { value: string; found: ClassFinding[] } => {
  const found: ClassFinding[] = [];
  return { value: rewriteColorReads(value, rules, (f) => found.push(f)).value, found };
};

describe('rewriteColorReads', () => {
  it('writes an alpha as the percentage color-mix() takes, without float noise', () => {
    expect(reads('rgb(var(--magma-accent) / 0.333)').value).toBe(
      'color-mix(in srgb, var(--magma-accent) 33.3%, transparent)',
    );
    expect(reads('rgb(var(--magma-accent) / 0.07)').value).toBe(
      'color-mix(in srgb, var(--magma-accent) 7%, transparent)',
    );
  });

  it('only reads rgb( as a function name', () => {
    expect(reads('myrgb(var(--magma-accent))').value).toBe('myrgb(var(--magma-accent))');
    expect(reads('--x-rgb(var(--magma-accent))').value).toBe('--x-rgb(var(--magma-accent))');
  });

  it('leaves a literal colour and a product variable alone, silently', () => {
    const result = reads('rgb(0 0 0 / 0.5) rgb(var(--mine) / 0.2)');
    expect(result.value).toBe('rgb(0 0 0 / 0.5) rgb(var(--mine) / 0.2)');
    expect(result.found).toEqual([]);
  });

  it('is a no-op on what it wrote', () => {
    const once = reads(
      'rgb(var(--magma-accent, var(--magma-shadow-ink, 1 2 3)) / calc(1 - var(--a)))',
    );
    expect(reads(once.value)).toEqual({ value: once.value, found: [] });
  });
});

describe('readsColorToken', () => {
  it('tells a listed colour from a product variable', () => {
    expect(readsColorToken(rules, "'rgb(var(--magma-accent))'")).toBe(true);
    expect(readsColorToken(rules, "'rgb(var(--brand))'")).toBe(false);
    expect(readsColorToken(rules, 'bg-[rgb(_var(--magma-accent))]')).toBe(true);
  });
});

describe('convertColorDefinition', () => {
  const define = (value: string): string =>
    convertColorDefinition('magma-backdrop-color', value, rules, () => undefined).value;

  it('converts channels and keeps what is already a colour', () => {
    expect(define('0 0 0')).toBe('rgb(0 0 0)');
    expect(define(' 0 0 0 !important')).toBe(' rgb(0 0 0) !important');
    expect(define('100% 0% 0%')).toBe('rgb(100% 0% 0%)');
    expect(define('#000')).toBe('#000');
    expect(define('color-mix(in srgb, red 50%, blue)')).toBe('color-mix(in srgb, red 50%, blue)');
    expect(define('transparent')).toBe('transparent');
  });
});

describe('rewriteArbitraryColor', () => {
  const arbitrary = (token: string): string | null =>
    rewriteArbitraryColor(token, rules, () => undefined);

  it('hints the shadow utilities, where Tailwind 4 reads a bare var() as the whole shadow', () => {
    expect(arbitrary('shadow-[rgb(var(--magma-shadow-ink))]')).toBe(
      'shadow-[color:var(--magma-shadow-ink)]',
    );
    expect(arbitrary('text-shadow-[rgb(var(--magma-shadow-ink))]')).toBe(
      'text-shadow-[color:var(--magma-shadow-ink)]',
    );
    expect(arbitrary('drop-shadow-[rgb(var(--magma-shadow-ink))]')).toBe(
      'drop-shadow-[color:var(--magma-shadow-ink)]',
    );
    // color-mix() is a colour for both Tailwinds: no hint
    expect(arbitrary('shadow-[rgb(var(--magma-shadow-ink)/0.2)]')).toBe(
      'shadow-[color-mix(in_srgb,var(--magma-shadow-ink)_20%,transparent)]',
    );
    // the other colour utilities read a bare var() as a colour
    expect(arbitrary('text-[rgb(var(--magma-accent))]')).toBe('text-[var(--magma-accent)]');
  });

  it('keeps the hint, the opacity modifier and a value around the colour', () => {
    expect(arbitrary('bg-[color:rgb(var(--magma-accent))]')).toBe('bg-[color:var(--magma-accent)]');
    expect(arbitrary('bg-[rgb(var(--magma-accent))]/[0.3]')).toBe('bg-[var(--magma-accent)]/[0.3]');
    expect(arbitrary('shadow-[inset_0_1px_rgb(var(--magma-accent))]')).toBe(
      'shadow-[inset_0_1px_var(--magma-accent)]',
    );
  });

  it('leaves a product variable and a non-colour class alone', () => {
    expect(arbitrary('bg-[rgb(var(--brand))]')).toBeNull();
    expect(arbitrary('bg-surface-raised')).toBeNull();
    expect(arbitrary('w-[calc(100%-2rem)]')).toBeNull();
  });

  it('reports what it cannot write, and leaves the class', () => {
    const found: ClassFinding[] = [];
    expect(
      rewriteArbitraryColor('bg-[rgba(var(--magma-accent),0.5)]', rules, (f) => found.push(f)),
    ).toBeNull();
    expect(found.map((f) => f.kind)).toEqual(['dynamic']);
  });
});
