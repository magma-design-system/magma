import { testManifest as manifest } from '../../manifest/test-manifest.js';
import { manifest as realManifest } from '../../manifest/manifest.js';
import { semanticTable } from '../../semantic/semantic.generated.js';
import { type ClassFinding, type SemanticOptions } from './semantic-ops.js';
import { classRulesOf, rewriteClassList, splitClassToken } from './class-ops.js';

const run = (
  value: string,
  options: Partial<SemanticOptions> = {},
): { value: string; changed: boolean; findings: ClassFinding[] } => {
  const findings: ClassFinding[] = [];
  const result = rewriteClassList(
    value,
    classRulesOf(manifest),
    () => true,
    () => undefined,
    () => undefined,
    {
      options: { accept: 'none', keepDarkOverrides: false, ...options },
      emit: (f) => findings.push(f),
    },
  );
  return { ...result, findings };
};

describe('category L: raw palette utilities -> semantic roles', () => {
  it('suggests an exact match without writing it by default', () => {
    const { value, changed, findings } = run('p-4 bg-tone-neutral-09');
    expect(changed).toBe(false);
    expect(value).toBe('p-4 bg-tone-neutral-09');
    expect(findings).toHaveLength(1);
    expect(findings[0]!.kind).toBe('flag');
    expect(findings[0]!.message).toContain('`bg-wash-base`');
    expect(findings[0]!.message).toContain('--accept-semantic=exact');
  });

  it('writes an exact match and drops its dark override, keeping the spacing', () => {
    const { value, findings } = run('p-4 bg-tone-neutral-09 dark:bg-tone-neutral-08 rounded', {
      accept: 'exact',
    });
    expect(value).toBe('p-4 bg-wash-base rounded');
    const change = findings.find((f) => f.kind === 'change')!;
    expect(change.before).toBe('bg-tone-neutral-09 dark:bg-tone-neutral-08');
    expect(change.after).toBe('bg-wash-base');
    expect(change.message).toContain('dark override dropped');
    // the override painted step 08 in dark; the role paints step 09
    expect(change.message).toContain('in dark the role is dE');
  });

  it('keeps the outer whitespace when the first or last token goes', () => {
    expect(run(' dark:bg-tone-neutral-08 bg-tone-neutral-09 ', { accept: 'exact' }).value).toBe(
      ' bg-wash-base ',
    );
    expect(run('bg-tone-neutral-09\n  dark:bg-tone-neutral-08', { accept: 'exact' }).value).toBe(
      'bg-wash-base',
    );
  });

  it('writes a near match only when near is accepted', () => {
    // step 09 as a border is dE 1.8 from border-muted
    expect(run('border-tone-neutral-09', { accept: 'exact' }).value).toBe('border-tone-neutral-09');
    expect(run('border-tone-neutral-09', { accept: 'near' }).value).toBe('border-border-muted');
  });

  it('pairs the override across variant order and keeps variants and modifiers', () => {
    for (const dark of ['dark:hover:bg-tone-neutral-08', 'hover:dark:bg-tone-neutral-08'])
      expect(run(`hover:bg-tone-neutral-09/60 ${dark}`, { accept: 'exact' }).value).toBe(
        'hover:bg-wash-base/60',
      );
    // `md:` is another group: its override does not pair with `hover:`, it is
    // a dark-only override of its own
    const { findings } = run('hover:bg-tone-neutral-09 md:dark:bg-tone-neutral-08');
    expect(findings.map((f) => [f.kind, f.message.slice(0, 40)])).toEqual([
      ['flag', 'suggested semantic role (exact, dE 0.0):'],
      ['flag', 'dark-only override `md:dark:bg-tone-neut'],
    ]);
    expect(findings[0]!.message).toContain('`hover:bg-tone-neutral-09` -> `hover:bg-wash-base`');
  });

  it('reports two dark values for one utility instead of picking one', () => {
    const { value, findings } = run(
      'bg-tone-neutral-09 dark:bg-tone-neutral-07 dark:bg-tone-neutral-08',
      { accept: 'near' },
    );
    expect(value).toBe('bg-tone-neutral-09 dark:bg-tone-neutral-07 dark:bg-tone-neutral-08');
    expect(findings[0]!.kind).toBe('dynamic');
  });

  it('never offers a fill role to a text colour of the same value', () => {
    // status-error-04 IS danger-emphasis by value, but emphasis is a background role
    const { value, findings } = run('text-status-error-04', { accept: 'near' });
    expect(value).toBe('text-status-error-04');
    expect(findings[0]!.kind).toBe('dynamic');
    expect(findings[0]!.message).not.toContain('emphasis');
    expect(findings[0]!.message).toContain('`text-danger-fg-');
  });

  it('reports two roles the light value cannot tell apart', () => {
    // step 10 = wash-soft exactly, surface-muted is dE 0.6 away and far apart in dark
    const { value, findings } = run('bg-tone-neutral-10', { accept: 'near' });
    expect(value).toBe('bg-tone-neutral-10');
    expect(findings[0]!.kind).toBe('dynamic');
    expect(findings[0]!.message).toContain('cannot tell these roles apart');
  });

  it('reports the seed as a background as contextual, after the seed rename', () => {
    const { value, findings } = run('bg-tone-neutral/80', { accept: 'near' });
    expect(value).toBe('bg-tone-neutral-seed/80');
    const report = findings.find((f) => f.kind === 'dynamic')!;
    expect(report.message).toContain('role is contextual');
    expect(report.message).toContain('`bg-surface-overlay/80`');
  });

  it('reports a dark-only override and drops it only with --accept-semantic', () => {
    expect(run('p-2 dark:bg-tone-neutral-09').findings[0]!.kind).toBe('flag');
    expect(run('p-2 dark:bg-tone-neutral-09', { accept: 'exact' }).value).toBe('p-2');
  });

  it('leaves a dark override alone when its utility has another light class', () => {
    const { value, findings } = run('bg-white dark:bg-tone-neutral-09', { accept: 'near' });
    expect(value).toBe('bg-white dark:bg-tone-neutral-09');
    expect(findings).toHaveLength(0);
  });

  it('matches on both modes with keepDarkOverrides', () => {
    const keep = { accept: 'near', keepDarkOverrides: true } as const;
    // light wash-base / dark wash-strong: no single role
    const paired = run('bg-tone-neutral-09 dark:bg-tone-neutral-08', keep);
    expect(paired.value).toBe('bg-tone-neutral-09 dark:bg-tone-neutral-08');
    expect(paired.findings[0]!.kind).toBe('dynamic');
    // no override: the step flips exactly like the role
    expect(run('bg-tone-neutral-09', keep).value).toBe('bg-wash-base');
  });

  it('reports a colour v2 removed, with its nearest v2 colours', () => {
    const { value, findings } = run('bg-tone-slate-08', { accept: 'near' });
    expect(value).toBe('bg-tone-slate-08');
    expect(findings[0]!.kind).toBe('warn');
    expect(findings[0]!.message).toContain('v2 removed `tone-slate-08`');
    expect(findings[0]!.message).toMatch(/nearest v2 colours `bg-tone-[a-z]+-\d\d`/);
  });

  it('reports a step that never existed', () => {
    const { findings } = run('text-tone-neutral-600');
    expect(findings[0]!.kind).toBe('warn');
    expect(findings[0]!.message).toContain('has never painted anything');
  });

  it('honours --skip on the channel rule', () => {
    const findings: ClassFinding[] = [];
    const result = rewriteClassList(
      'bg-tone-neutral-09',
      classRulesOf(manifest),
      (id) => id !== 'global/classSemantic/background',
      () => undefined,
      () => undefined,
      { options: { accept: 'exact', keepDarkOverrides: false }, emit: (f) => findings.push(f) },
    );
    expect(result.changed).toBe(false);
    expect(findings).toHaveLength(0);
  });
});

describe('splitClassToken: opacity modifier', () => {
  it('splits a numeric or bracketed modifier off the utility', () => {
    expect(splitClassToken('hover:bg-tone-neutral/80!')).toMatchObject({
      prefix: 'hover:',
      base: 'bg-tone-neutral',
      modifier: '/80',
      trailingBang: '!',
    });
    expect(splitClassToken('bg-x/[0.3]').modifier).toBe('/[0.3]');
  });

  it('never splits inside an arbitrary value', () => {
    expect(splitClassToken('bg-[url(a/b)]')).toMatchObject({ base: 'bg-[url(a/b)]', modifier: '' });
  });
});

describe('category L: generated colour table and manifest', () => {
  it('holds the step/role identities the exact tier relies on', () => {
    const role = (name: string) => semanticTable.roles[name]!;
    const step = (name: string) => semanticTable.primitives[name]!;
    for (const [s, r] of [
      ['tone-neutral-09', 'wash-base'],
      ['tone-neutral-01', 'fg-default'],
      ['status-error-09', 'danger-wash-base'],
      ['variant-primary-10', 'accent-surface-subtle'],
    ] as const) {
      expect(role(r).light).toEqual(step(s)[0]);
      expect(role(r).dark).toEqual(step(s)[1]);
    }
  });

  it('maps every semantic family of the real manifest onto primitives and roles', () => {
    const config = realManifest.global.semanticClasses!;
    const hues = new Set(Object.values(semanticTable.roles).map((r) => r.hue));
    for (const rule of config.rules) {
      if (rule.kind !== 'classSemantic') continue;
      for (const [family, hue] of Object.entries(rule.families)) {
        expect(hues.has(hue)).toBe(true);
        expect(Object.keys(semanticTable.primitives).some((p) => p.startsWith(`${family}-`))).toBe(
          true,
        );
      }
    }
  });
});
