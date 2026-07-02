import { transformHtml } from './html.js';
import { testManifest as manifest, ensureAttrManifest } from '../manifest/test-manifest.js';

const ctx = { file: 'x.html' };
const run = (src: string) => transformHtml(src, manifest, ctx);

describe('transformHtml — boolean inversion', () => {
  it('omits the inverted prop when the old value was true (bare)', () => {
    expect(run('<mds-dropdown arrow></mds-dropdown>').output).toBe('<mds-dropdown></mds-dropdown>');
  });

  it('uses the shorthand of the new prop when the old value was "false"', () => {
    expect(run('<mds-dropdown arrow="false"></mds-dropdown>').output).toBe(
      '<mds-dropdown hide-arrow></mds-dropdown>',
    );
    expect(run('<mds-dropdown auto-placement="false"></mds-dropdown>').output).toBe(
      '<mds-dropdown disable-auto-placement></mds-dropdown>',
    );
  });
});

describe('transformHtml — enum remap (tone)', () => {
  it('remaps a value present in the v2 set', () => {
    expect(run('<mds-button tone="ghost"></mds-button>').output).toBe(
      '<mds-button tone="outline"></mds-button>',
    );
  });

  it('flags a value absent from the component v2 set (banner has no "text")', () => {
    const { changed, findings } = run('<mds-banner tone="quiet"></mds-banner>');
    expect(changed).toBe(false);
    expect(findings.some((f) => f.kind === 'flag')).toBe(true);
  });
});

describe('transformHtml — slot="default" removal', () => {
  it('removes the default slot attribute on any element', () => {
    expect(run('<span slot="default">x</span>').output).toBe('<span>x</span>');
  });
});

describe('transformHtml — slotToAttr (mds-button text → label)', () => {
  it('lifts plain text content into label', () => {
    expect(run('<mds-button>Save</mds-button>').output).toBe(
      '<mds-button label="Save"></mds-button>',
    );
  });

  it('collapses surrounding whitespace and escapes quotes', () => {
    expect(run('<mds-button>\n  Save now\n</mds-button>').output).toBe(
      '<mds-button label="Save now"></mds-button>',
    );
    expect(run('<mds-button>Say "hi"</mds-button>').output).toBe(
      '<mds-button label="Say &quot;hi&quot;"></mds-button>',
    );
  });

  it('flags content with markup instead of lifting it', () => {
    const { changed, findings } = run(
      '<mds-button><mds-icon name="save"></mds-icon> Save</mds-button>',
    );
    expect(changed).toBe(false);
    expect(findings.some((f) => f.kind === 'dynamic')).toBe(true);
  });

  it('leaves the element alone when label is already set', () => {
    const src = '<mds-button label="Save">ignored</mds-button>';
    expect(run(src).output).toBe(src);
  });
});

describe('transformHtml — prop rename / remove', () => {
  it('renames labelAction → label on mds-label', () => {
    expect(run('<mds-label label-action="edit"></mds-label>').output).toBe(
      '<mds-label label="edit"></mds-label>',
    );
  });

  it('removes hasText and injects a warning comment', () => {
    const { output, findings } = run('<mds-button has-text></mds-button>');
    expect(output).toContain('TODO magma v2');
    expect(output).not.toContain('has-text');
    expect(findings.some((f) => f.kind === 'warn')).toBe(true);
  });
});

describe('transformHtml — ensureAttr (preserve v1 auto-placement default)', () => {
  const runE = (src: string) => transformHtml(src, ensureAttrManifest, ctx);

  it('adds disable-auto-placement when neither prop is present', () => {
    expect(runE('<mds-dropdown></mds-dropdown>').output).toBe(
      '<mds-dropdown disable-auto-placement></mds-dropdown>',
    );
  });

  it('does not add it when auto-placement is already present', () => {
    const src = '<mds-dropdown auto-placement></mds-dropdown>';
    expect(runE(src)).toMatchObject({ changed: false, output: src });
  });

  it('is idempotent (no second insertion)', () => {
    const src = '<mds-dropdown disable-auto-placement></mds-dropdown>';
    expect(runE(src)).toMatchObject({ changed: false, output: src });
  });

  it('adds a valued attribute when the rule carries a value', () => {
    expect(runE('<mds-banner>x</mds-banner>').output).toBe(
      '<mds-banner variant="light">x</mds-banner>',
    );
  });

  it('does not add the valued attribute when it is already set', () => {
    const src = '<mds-banner variant="dark">x</mds-banner>';
    expect(runE(src)).toMatchObject({ changed: false, output: src });
  });
});

describe('transformHtml — slotRemove (removed named slots)', () => {
  it('warns for children using a removed slot, without rewriting', () => {
    const src =
      '<mds-push-notification><div slot="top">t</div><div slot="bottom">b</div></mds-push-notification>';
    const { changed, output, findings } = run(src);
    expect(changed).toBe(false);
    expect(output).toBe(src);
    const warns = findings.filter((f) => f.kind === 'warn');
    expect(warns.length).toBe(2);
    expect(warns[0]!.message).toContain('`top` slot');
  });

  it('does not warn for other slots or other components', () => {
    expect(
      run('<mds-push-notification><div slot="other">x</div></mds-push-notification>').findings,
    ).toEqual([]);
    expect(
      run('<mds-button><div slot="top">x</div></mds-button>').findings.filter(
        (f) => f.kind === 'warn',
      ),
    ).toEqual([]);
  });
});

describe('transformHtml — safety', () => {
  it('leaves non-magma elements untouched', () => {
    const src = '<button arrow="false">x</button>';
    expect(run(src)).toMatchObject({ changed: false, output: src });
  });

  it('is idempotent', () => {
    const once = run('<mds-button tone="ghost">Save</mds-button>').output;
    const twice = run(once);
    expect(twice.changed).toBe(false);
    expect(twice.output).toBe(once);
  });
});
