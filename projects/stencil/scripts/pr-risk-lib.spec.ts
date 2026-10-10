import { describe, expect, it } from 'vitest';
import {
  apiChanges,
  commitRelease,
  compatibleMembers,
  declaredRelease,
  fileTier,
  manifestReachesConsumers,
  memberKey,
  prTier,
  renderReport,
  REPORT_MARKER,
  requiredBump,
  semverOk,
  type RiskReport,
  waiveCompatible,
} from './pr-risk-lib';
import { inScope } from '../../../scripts/release/commit-scopes.mjs';

const MAGMA = 'magma|stencil|react|lit|storybook|mds-*';

describe('fileTier', () => {
  it.each([
    ['projects/stencil/src/components/mds-button/mds-button.tsx', 'behaviour'],
    ['projects/stencil/src/common/aria.ts', 'behaviour'],
    ['projects/stencil/stencil.config.ts', 'behaviour'],
    ['projects/stencil/scripts/postcss-token-fallbacks.ts', 'behaviour'],
    ['projects/stencil-angular/magma-angular/src/lib/value-accessor.ts', 'behaviour'],
    ['projects/codemod/src/transforms/classes.ts', 'behaviour'],
    ['projects/stencil/src/components/mds-button/mds-button.css', 'visual'],
    ['projects/stencil/src/globals.css', 'visual'],
    ['projects/styles/tailwind/theme.css', 'visual'],
    ['projects/design-tokens/semantic.config.ts', 'visual'],
    ['projects/design-tokens/src/lib/surface.mts', 'visual'],
    ['projects/svg-icons/svg/mi/baseline/add.svg', 'visual'],
    ['projects/identity/resources/logo.svg', 'visual'],
    ['projects/stencil/src/components/mds-button/test/mds-button.e2e.ts', 'low'],
    ['projects/stencil/src/components/mds-button/mds-button.stories.tsx', 'low'],
    ['projects/stencil/src/components/mds-button/usage/pattern.md', 'low'],
    ['projects/stencil/src/components/mds-button/readme.md', 'low'],
    ['projects/stencil/src/components.d.ts', 'low'],
    ['projects/stencil/magma.api.txt', 'low'],
    ['projects/stencil/src/storybook/preview-helpers.ts', 'low'],
    ['projects/stencil-react/src/components.ts', 'low'],
    ['projects/stencil-angular/magma-angular/src/stencil-generated/components.ts', 'low'],
    ['projects/design-tokens/test/surface.test.mts', 'low'],
    ['projects/design-tokens/playground/main.ts', 'low'],
    ['projects/codemod/fixtures/l/input.html', 'low'],
    ['projects/stencil/scripts/check-usage-docs.ts', 'low'],
    ['projects/stencil/project.json', 'low'],
    ['.github/workflows/stencil.yml', 'low'],
    ['package-lock.json', 'low'],
    ['docs/WORKFLOW.md', 'low'],
  ])('%s is %s', (path, tier) => {
    expect(fileTier(path)).toBe(tier);
  });

  it('counts a package manifest as behaviour only when the change reaches consumers', () => {
    expect(fileTier('projects/stencil/package.json', true)).toBe('behaviour');
    expect(fileTier('projects/stencil/package.json', false)).toBe('low');
    expect(fileTier('projects/stencil-angular/magma-angular/package.json', true)).toBe('behaviour');
  });
});

describe('manifestReachesConsumers', () => {
  const manifest = (extra: object) =>
    JSON.stringify({ name: 'x', version: '1.0.0', scripts: { build: 'a' }, ...extra });

  it('ignores scripts, devDependencies and version', () => {
    const before = manifest({ devDependencies: { a: '1' } });
    const after = JSON.stringify({
      ...JSON.parse(before),
      version: '2.0.0',
      scripts: { build: 'b', test: 'c' },
      devDependencies: { a: '2' },
    });
    expect(manifestReachesConsumers(before, after)).toBe(false);
  });

  it('sees exports, sideEffects and dependencies', () => {
    expect(manifestReachesConsumers(manifest({}), manifest({ sideEffects: false }))).toBe(true);
    expect(
      manifestReachesConsumers(
        manifest({ dependencies: { a: '1' } }),
        manifest({ dependencies: { a: '2' } }),
      ),
    ).toBe(true);
  });

  it('treats an added or deleted manifest as reaching consumers', () => {
    expect(manifestReachesConsumers(null, manifest({}))).toBe(true);
    expect(manifestReachesConsumers(manifest({}), null)).toBe(true);
  });
});

describe('prTier', () => {
  const files = [
    { path: 'docs/a.md', tier: 'low' as const },
    { path: 'x.css', tier: 'visual' as const },
    { path: 'a.tsx', tier: 'behaviour' as const },
    { path: 'b.tsx', tier: 'behaviour' as const },
  ];

  it('takes the highest level and names the files that set it', () => {
    expect(prTier(files, false)).toEqual({ tier: 'behaviour', because: ['a.tsx', 'b.tsx'] });
    expect(prTier(files.slice(0, 2), false)).toEqual({ tier: 'visual', because: ['x.css'] });
    expect(prTier([], false)).toEqual({ tier: 'low', because: [] });
  });

  it('is contract whenever the API snapshot changes', () => {
    expect(prTier(files, true).tier).toBe('contract');
  });
});

describe('memberKey', () => {
  it.each([
    ['mds-button prop size (attr size) [reflect]: "md" | "sm" = \'md\'', 'mds-button prop size'],
    ['mds-tab event mdsTabChange: string [bubbles]', 'mds-tab event mdsTabChange'],
    ['mds-tab method select(index: number) => Promise<void>', 'mds-tab method select'],
    ['mds-tab slot (default)', 'mds-tab slot (default)'],
    ['mds-tab css --mds-tab-gap', 'mds-tab css --mds-tab-gap'],
    ['mds-tab encapsulation shadow DEPRECATED', 'mds-tab encapsulation'],
    ['type Size = "md" | "sm"', 'type Size'],
    ['interface Detail { id: string; }', 'type Detail'],
  ])('%s', (line, key) => {
    expect(memberKey(line)).toBe(key);
  });
});

describe('apiChanges', () => {
  const prop = (rest: string) => `mds-x prop size ${rest}`;
  const one = (before: string, after: string) => {
    const changes = apiChanges(before, after);
    expect(changes).toHaveLength(1);
    return { bump: changes[0].bump, why: changes[0].why };
  };

  it('finds nothing when only the header differs', () => {
    expect(apiChanges('# a\nmds-x part icon\n', '# b\nmds-x part icon\n')).toEqual([]);
  });

  it('needs a major for a removal and a minor for an addition', () => {
    expect(one('mds-x part icon\nmds-x part label', 'mds-x part icon')).toEqual({
      bump: 'major',
      why: 'removed',
    });
    expect(one('mds-x part icon', 'mds-x part icon\nmds-x css --mds-x-gap')).toEqual({
      bump: 'minor',
      why: 'added',
    });
  });

  it('needs a major for a new required prop', () => {
    expect(one('', 'mds-x prop id (attr id) [required]: string')).toEqual({
      bump: 'major',
      why: 'added as required',
    });
  });

  it('weighs a prop type by its values: widening is minor, narrowing major', () => {
    const md = prop('(attr size) [reflect]: "md" | "sm" = \'md\'');
    expect(one(md, prop('(attr size) [reflect]: "lg" | "md" | "sm" = \'md\''))).toEqual({
      bump: 'minor',
      why: 'the type also has "lg"',
    });
    expect(one(md, prop('(attr size) [reflect]: "md" = \'md\''))).toEqual({
      bump: 'major',
      why: 'the type no longer has "sm"',
    });
  });

  it('needs a major for a new default, a lost reflect or a renamed attribute', () => {
    const md = prop('(attr size) [reflect]: "md" | "sm" = \'md\'');
    expect(one(md, prop('(attr size) [reflect]: "md" | "sm" = \'sm\'')).bump).toBe('major');
    expect(one(md, prop('(attr size): "md" | "sm" = \'md\''))).toEqual({
      bump: 'major',
      why: 'no longer reflect',
    });
    expect(one(md, prop('(attr dimension) [reflect]: "md" | "sm" = \'md\'')).bump).toBe('major');
  });

  it('needs a minor for a new attribute, a new reflect or a deprecation, a patch for mutable', () => {
    expect(one(prop('(no attr): string'), prop('(attr size): string')).bump).toBe('minor');
    expect(one(prop('(attr size): string'), prop('(attr size) [reflect]: string')).bump).toBe(
      'minor',
    );
    expect(one(prop('(attr size): string'), prop('(attr size): string DEPRECATED'))).toEqual({
      bump: 'minor',
      why: 'deprecated',
    });
    expect(one(prop('(attr size): string'), prop('(attr size) [mutable]: string')).bump).toBe(
      'patch',
    );
  });

  it('needs a major when an event changes its detail or stops bubbling', () => {
    const event = 'mds-x event mdsXChange: string [bubbles, composed]';
    expect(one(event, 'mds-x event mdsXChange: number [bubbles, composed]').bump).toBe('major');
    expect(one(event, 'mds-x event mdsXChange: string [composed]')).toEqual({
      bump: 'major',
      why: 'no longer bubbles',
    });
    expect(one(event, 'mds-x event mdsXChange: string [bubbles, cancelable, composed]').bump).toBe(
      'minor',
    );
  });

  it('needs a minor when an event detail becomes a type that extends the old one', () => {
    const event = (detail: string) => `mds-x event mdsXChange: ${detail} [bubbles, composed]`;
    const types = [
      'interface D { id: string; }',
      'interface E extends D { ids: string[]; }',
      'interface F<T> extends E { open: T; }',
    ].join('\n');
    const api = (detail: string) => `${event(detail)}\n${types}`;

    expect(one(api('D'), api('E'))).toEqual({
      bump: 'minor',
      why: 'the detail is now E, which extends D',
    });
    /* through the types it extends, generic ones too */
    expect(one(api('D'), api('F<boolean>')).bump).toBe('minor');
    /* the other way round, a listener loses the fields it read */
    expect(one(api('E'), api('D')).bump).toBe('major');
  });

  it('needs a major for a new method signature or encapsulation', () => {
    expect(
      one('mds-x method open() => Promise<void>', 'mds-x method open(id: string) => Promise<void>')
        .bump,
    ).toBe('major');
    expect(one('mds-x encapsulation shadow', 'mds-x encapsulation scoped').bump).toBe('major');
  });

  it('weighs a declared type by its members', () => {
    expect(
      one('interface D { id: string; }', 'interface D { id: string; open: boolean; }'),
    ).toEqual({
      bump: 'minor',
      why: 'the interface also has open: boolean',
    });
    expect(one('interface D { id: string; }', 'interface D { id: number; }').bump).toBe('major');
    expect(one('type S = "a" | "b"', 'type S = "a" | "b" | "c"').bump).toBe('minor');
    expect(one('type S = "a" | "b"', 'type S = "a"').bump).toBe('major');
  });

  it('weighs the types an interface extends, not the JSDoc of its fields', () => {
    const e = 'interface E extends D { ids: string[]; }';
    expect(one(e, 'interface E extends D { ids: string[]; open: boolean; }')).toEqual({
      bump: 'minor',
      why: 'the interface also has open: boolean',
    });
    expect(one(e, 'interface E { ids: string[]; }')).toEqual({
      bump: 'major',
      why: 'no longer extends D',
    });
    expect(one(e, 'interface E extends D, C<string, number> { ids: string[]; }')).toEqual({
      bump: 'minor',
      why: 'now extends C<string, number>',
    });
    expect(
      one(
        'interface E { /** The ids. */ ids: string[]; }',
        'interface E { /** * Every id, in order. */ ids: string[]; }',
      ),
    ).toEqual({ bump: 'patch', why: 'reformatted' });
  });

  it('splits unions only at the top level', () => {
    const fn = (type: string) => `mds-x prop check (no attr): ${type}`;
    expect(
      apiChanges(
        fn('((a: string | number) => boolean) | undefined'),
        fn('((a: string | number) => boolean) | undefined'),
      ),
    ).toEqual([]);
    expect(
      one(
        fn('((a: string) => boolean) | undefined'),
        fn('((a: string | number) => boolean) | undefined'),
      ).bump,
    ).toBe('major');
  });

  it('lists the majors first', () => {
    const changes = apiChanges('mds-x part a\nmds-x part b', 'mds-x part a\nmds-x part c');
    expect(changes.map((c) => c.bump)).toEqual(['major', 'minor']);
    expect(requiredBump(changes)).toBe('major');
    expect(requiredBump([])).toBeNull();
  });
});

describe('commitRelease', () => {
  it.each([
    ['feat(mds-button): add tone', 'minor'],
    ['fix(mds-modal): close on escape', 'patch'],
    ['perf(stencil): skip a reflow', 'patch'],
    ['docs(stencil): reword', null],
    ['build(stencil): snapshot', null],
    ['feat(mds-button)!: drop hasText', 'major'],
    ['refactor(stencil)!: move the loader', 'major'],
    ['fix(mds-input): trim\n\nBREAKING CHANGE: the value is trimmed', 'major'],
    ['fix(mds-input): trim\n\nBREAKING-CHANGE: the value is trimmed', 'major'],
    ['revert: feat(mds-button): add tone', 'patch'],
    ['Revert "feat(mds-button): add tone"', 'patch'],
    ["Merge branch 'dev' into 843-stencil-api-snapshot", null],
  ])('%s -> %s', (message, release) => {
    expect(commitRelease(message)).toBe(release);
  });

  it('declares the highest release of the commits', () => {
    expect(declaredRelease(['docs(stencil): a', 'fix(mds-x): b', 'feat(mds-x): c'])).toBe('minor');
    expect(declaredRelease(['docs(stencil): a'])).toBeNull();
  });
});

describe('semverOk', () => {
  it('passes when the commits declare at least what the API change needs', () => {
    expect(semverOk(null, null)).toBe(true);
    expect(semverOk('minor', 'minor')).toBe(true);
    expect(semverOk('minor', 'major')).toBe(true);
    expect(semverOk('major', 'minor')).toBe(false);
    expect(semverOk('minor', 'patch')).toBe(false);
    expect(semverOk('patch', null)).toBe(false);
  });
});

describe('API-Compatible footer', () => {
  const defaultType = (value: string) =>
    `mds-x prop type (attr type) [reflect]: "button" | "submit" = '${value}'`;

  it('reads every member a footer declares, with its reason', () => {
    const declared = compatibleMembers([
      'feat(mds-x): add name\n\nAPI-Compatible: mds-x prop type: the old default had no effect',
      'build(stencil): snapshot\n\nAPI-Compatible: mds-y event mdsYChange: never fired\nRefs #1',
      'fix(mds-z): mention API-Compatible: in the middle of a line',
    ]);

    expect([...declared]).toEqual([
      ['mds-x prop type', 'the old default had no effect'],
      ['mds-y event mdsYChange', 'never fired'],
    ]);
  });

  it('rates a declared break as minor and keeps the reason in the report', () => {
    const changes = apiChanges(`${defaultType('submit')}\nmds-x part icon`, defaultType('button'));
    const waived = waiveCompatible(
      changes,
      new Map([['mds-x prop type', 'the old default had no effect']]),
    );

    expect(waived.map((c) => [c.key, c.bump, c.why])).toEqual([
      ['mds-x part icon', 'major', 'removed'],
      [
        'mds-x prop type',
        'minor',
        "default 'submit' became 'button'; declared compatible: the old default had no effect",
      ],
    ]);
    expect(requiredBump(waived)).toBe('major');
  });

  it('leaves a change that is no break as it is', () => {
    const changes = apiChanges('', 'mds-x part icon');
    expect(waiveCompatible(changes, new Map([['mds-x part icon', 'why not']]))).toEqual(changes);
  });
});

describe('release scope (scripts/release/commit-scopes.mjs)', () => {
  it.each([
    ['feat(mds-button): a', true],
    ['fix(stencil,styles): a', true],
    ['feat(design-tokens,styles): a', false],
    ['docs(magma): a', true],
    ['feat: no scope', false],
    ['revert: feat(mds-button): a', true],
  ])('%s counts for magma: %s', (message, counts) => {
    expect(inScope(message, MAGMA)).toBe(counts);
  });
});

describe('renderReport', () => {
  const base: RiskReport = {
    tier: 'low',
    because: [],
    changes: [],
    required: null,
    declared: null,
    scope: MAGMA,
  };

  it('starts with the marker the CI finds its comment by', () => {
    expect(renderReport(base).split('\n')[0]).toBe(REPORT_MARKER);
  });

  it('names the files that set a behaviour or visual level, not a low one', () => {
    expect(renderReport({ ...base, tier: 'behaviour', because: ['a.tsx'] })).toContain('- `a.tsx`');
    expect(renderReport({ ...base, because: ['a.md'] })).not.toContain('a.md');
  });

  it('says when there is no snapshot to compare with', () => {
    expect(renderReport({ ...base, changes: null })).toContain(
      'the API and release checks are skipped',
    );
  });

  it('fails a break the commits do not declare, and says how to declare it', () => {
    const changes = apiChanges('mds-x part icon', '');
    const text = renderReport({
      ...base,
      tier: 'contract',
      changes,
      required: 'major',
      declared: 'minor',
    });
    expect(text).toContain('- **major** `mds-x part icon`: removed');
    expect(text).toContain('- mds-x part icon');
    expect(text).toContain('**Release: FAILS.**');
    expect(text).toContain('BREAKING CHANGE:');
    expect(text).toContain('API-Compatible: <member>: <reason>');
  });

  it('passes a change the commits declare', () => {
    const changes = apiChanges('', 'mds-x part icon');
    const text = renderReport({
      ...base,
      tier: 'contract',
      changes,
      required: 'minor',
      declared: 'minor',
    });
    expect(text).toContain('needs minor, the commits in scope declare minor. OK.');
  });
});
