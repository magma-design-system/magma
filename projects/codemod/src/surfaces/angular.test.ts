import { transformAngular } from './angular.js';
import { testManifest as manifest, ensureAttrManifest } from '../manifest/test-manifest.js';

const ctx = { file: 'x.html' };
const run = (src: string) => transformAngular(src, manifest, ctx);

describe('transformAngular — boolean inversion', () => {
  it('omits a true static attribute', () => {
    expect(run('<mds-dropdown arrow></mds-dropdown>').output).toBe('<mds-dropdown></mds-dropdown>');
  });

  it('shorthands the new attribute for static "false"', () => {
    expect(run('<mds-dropdown arrow="false"></mds-dropdown>').output).toBe(
      '<mds-dropdown hide-arrow></mds-dropdown>',
    );
  });

  it('negates a property binding', () => {
    expect(run('<mds-dropdown [arrow]="open"></mds-dropdown>').output).toBe(
      '<mds-dropdown [hideArrow]="!open"></mds-dropdown>',
    );
  });

  it('collapses [arrow]="false" to the shorthand', () => {
    expect(run('<mds-dropdown [arrow]="false"></mds-dropdown>').output).toBe(
      '<mds-dropdown hide-arrow></mds-dropdown>',
    );
  });
});

describe('transformAngular — enum remap', () => {
  it('remaps a static tone value', () => {
    expect(run('<mds-button tone="ghost"></mds-button>').output).toBe(
      '<mds-button tone="outline"></mds-button>',
    );
  });

  it('flags a value absent from the v2 set', () => {
    expect(
      run('<mds-banner tone="quiet"></mds-banner>').findings.some((f) => f.kind === 'flag'),
    ).toBe(true);
  });

  it('flags a dynamic bound tone', () => {
    expect(
      run('<mds-button [tone]="t"></mds-button>').findings.some((f) => f.kind === 'dynamic'),
    ).toBe(true);
  });
});

describe('transformAngular — slots', () => {
  it('removes slot="default"', () => {
    expect(run('<span slot="default">x</span>').output).toBe('<span>x</span>');
  });

  it('lifts plain text into label', () => {
    expect(run('<mds-button>Save</mds-button>').output).toBe(
      '<mds-button label="Save"></mds-button>',
    );
  });

  it('lifts a single interpolation into [label]', () => {
    expect(run('<mds-button>{{ title }}</mds-button>').output).toBe(
      '<mds-button [label]="title"></mds-button>',
    );
  });

  it('flags markup content', () => {
    expect(run('<mds-button><mds-icon></mds-icon> Save</mds-button>')).toMatchObject({
      changed: false,
    });
  });
});

describe('transformAngular — ensureAttr (preserve v1 auto-placement default)', () => {
  const runE = (src: string) => transformAngular(src, ensureAttrManifest, ctx);

  it('adds disable-auto-placement when neither prop is present', () => {
    expect(runE('<mds-dropdown></mds-dropdown>').output).toBe(
      '<mds-dropdown disable-auto-placement></mds-dropdown>',
    );
  });

  it('does not add it when an [autoPlacement] binding is present', () => {
    const src = '<mds-dropdown [autoPlacement]="x"></mds-dropdown>';
    expect(runE(src)).toMatchObject({ changed: false, output: src });
  });

  it('adds a valued attribute when the rule carries a value', () => {
    expect(runE('<mds-banner>x</mds-banner>').output).toBe(
      '<mds-banner variant="light">x</mds-banner>',
    );
  });

  it('does not add the valued attribute when a [variant] binding is present', () => {
    const src = '<mds-banner [variant]="v">x</mds-banner>';
    expect(runE(src)).toMatchObject({ changed: false, output: src });
  });
});

describe('transformAngular — slotRemove (removed named slots)', () => {
  it('warns for children using a removed slot, without rewriting', () => {
    const src = '<mds-push-notification><div slot="top">t</div></mds-push-notification>';
    const { changed, output, findings } = run(src);
    expect(changed).toBe(false);
    expect(output).toBe(src);
    expect(findings.filter((f) => f.kind === 'warn').length).toBe(1);
    expect(findings[0]!.message).toContain('`top` slot');
  });
});

describe('transformAngular — rename / remove / safety', () => {
  it('renames a static labelAction → label', () => {
    expect(run('<mds-label label-action="edit"></mds-label>').output).toBe(
      '<mds-label label="edit"></mds-label>',
    );
  });

  it('removes hasText with a warning', () => {
    const { output, findings } = run('<mds-button has-text></mds-button>');
    expect(output).toBe('<mds-button></mds-button>');
    expect(findings.some((f) => f.kind === 'warn')).toBe(true);
  });

  it('leaves non-magma elements untouched', () => {
    const src = '<div tone="ghost">x</div>';
    expect(run(src)).toMatchObject({ changed: false, output: src });
  });

  it('is idempotent', () => {
    const once = run('<mds-button tone="ghost">Save</mds-button>').output;
    const twice = run(once);
    expect(twice.changed).toBe(false);
    expect(twice.output).toBe(once);
  });
});
