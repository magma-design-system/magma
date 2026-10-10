import { testManifest as manifest } from '../../manifest/test-manifest.js';
import { manifest as realManifest } from '../../manifest/manifest.js';
import { transformCss } from '../css.js';
import { type ClassFinding } from './semantic-ops.js';
import { classRulesOf, rewriteClassList } from './class-ops.js';

const run = (value: string, m = manifest) => {
  const findings: ClassFinding[] = [];
  const renamed: Array<[string, string]> = [];
  const result = rewriteClassList(
    value,
    classRulesOf(m),
    () => true,
    (_e, before, after) => renamed.push([before, after]),
    () => undefined,
    { emit: (f) => findings.push(f) },
  );
  return { ...result, findings, renamed };
};

describe('category M: responsive variants', () => {
  it('renames a v1 variant segment anywhere in the prefix', () => {
    expect(run('mobile:px-400 md:mobile:hover:hidden tablet-max:grid-cols-1').value).toBe(
      'max-tablet:px-400 md:max-tablet:hover:hidden max-desktop:grid-cols-1',
    );
  });

  it('reports each rename with the v1 media query', () => {
    const { findings } = run('mobile:p-0');
    expect(findings).toEqual([
      expect.objectContaining({
        kind: 'change',
        ruleId: 'global/variantRename/mobile',
        before: 'mobile:p-0',
        after: 'max-tablet:p-0',
        message: expect.stringContaining('(max-width: 767px)'),
      }),
    ]);
  });

  it('never touches a utility, an arbitrary variant or a lookalike name', () => {
    const value = 'mobile [&:mobile]:p-0 max-mobile:p-0 mobile-menu:p-0 group-hover/mobile:p-0';
    expect(run(value).value).toBe(value);
  });

  it('composes with a class rename on the same token', () => {
    expect(run('mobile:mx-2/12').value).toBe('max-tablet:mx-[16.666667%]');
  });

  it('reports the Tailwind 3 CSS forms of a renamed screen', () => {
    const source = [
      '@screen mobile { .a { display: none; } }',
      '@media screen(tablet-max) { .b { display: none; } }',
      '.c { max-width: theme(screens.mobile); }',
      '@screen desktop { .d { display: none; } }',
    ].join('\n');
    const { findings, changed } = transformCss(
      source,
      manifest,
      { file: 'x.css' },
      { scss: false },
    );
    expect(changed).toBe(false);
    expect(findings.map((f) => [f.line, f.token])).toEqual([
      [1, '@screen mobile'],
      [2, 'screen(tablet-max)'],
      [3, 'theme(screens.mobile)'],
    ]);
    expect(findings[0]!.message).toContain('`@variant max-tablet { ... }`');
  });
});

describe('fractions (J)', () => {
  it('rewrites a v1 spacing fraction to its exact percentage, not as an opacity modifier', () => {
    const { value, renamed } = run('wide:mx-2/12 hover:-mt-1/2');
    expect(value).toBe('wide:mx-[16.666667%] hover:-mt-[50%]');
    expect(renamed).toEqual([
      ['wide:mx-2/12', 'wide:mx-[16.666667%]'],
      ['hover:-mt-1/2', 'hover:-mt-[50%]'],
    ]);
  });

  it('leaves the fractions Tailwind 4 resolves natively alone', () => {
    const value = 'w-1/2 min-w-2/3 basis-1/3 translate-x-1/2 inset-1/4';
    expect(run(value, realManifest).value).toBe(value);
  });

  it('ships the v1 percentages in the real manifest', () => {
    const rules = classRulesOf(realManifest).renames;
    expect(rules.get('mx-2/12')?.rule.to).toBe('mx-[16.666667%]');
    expect(rules.get('-space-y-1/3')?.rule.to).toBe('-space-y-[33.333333%]');
    expect(rules.get('gap-x-11/12')?.rule.to).toBe('gap-x-[91.666667%]');
    expect(rules.has('w-1/2')).toBe(false);
  });
});
