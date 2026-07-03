import { transformReact } from './react.js';
import { testManifest as manifest, ensureAttrManifest } from '../manifest/test-manifest.js';

const ctx = { file: 'x.tsx' };
const run = (src: string) => transformReact(src, manifest, ctx);

describe('transformReact — boolean inversion', () => {
  it('omits the prop when the old value was true (bare / {true})', () => {
    expect(run('<MdsDropdown arrow />').output).toBe('<MdsDropdown />');
    expect(run('<MdsDropdown arrow={true} />').output).toBe('<MdsDropdown />');
  });

  it('uses shorthand of the new prop when old value was {false}', () => {
    expect(run('<MdsDropdown arrow={false} />').output).toBe('<MdsDropdown hideArrow />');
  });

  it('negates a dynamic expression', () => {
    expect(run('<MdsDropdown arrow={open} />').output).toBe('<MdsDropdown hideArrow={!open} />');
    expect(run('<MdsDropdown arrow={a && b} />').output).toBe(
      '<MdsDropdown hideArrow={!(a && b)} />',
    );
  });
});

describe('transformReact — slotRemove (removed named slots)', () => {
  it('warns for children using a removed slot, without rewriting', () => {
    const src =
      '<MdsPushNotification><div slot="top">t</div><div slot="bottom">b</div></MdsPushNotification>';
    const { changed, output, findings } = run(src);
    expect(changed).toBe(false);
    expect(output).toBe(src);
    expect(findings.filter((f) => f.kind === 'warn').length).toBe(2);
  });

  it('does not warn for other slots', () => {
    const { findings } = run(
      '<MdsPushNotification><div slot="other">x</div></MdsPushNotification>',
    );
    expect(findings.filter((f) => f.kind === 'warn')).toEqual([]);
  });
});

describe('transformReact — ensureAttr with value', () => {
  it('adds the valued prop when missing and skips when present', () => {
    const runE = (src: string) => transformReact(src, ensureAttrManifest, ctx);
    expect(runE('<MdsBanner>x</MdsBanner>').output).toBe(
      '<MdsBanner variant="light">x</MdsBanner>',
    );
    const src = '<MdsBanner variant={v}>x</MdsBanner>';
    expect(runE(src)).toMatchObject({ changed: false, output: src });
  });
});

describe('transformReact — slotToAttr (children → label)', () => {
  it('lifts plain text into a string attribute and self-closes', () => {
    expect(run('<MdsButton>Save</MdsButton>').output).toBe('<MdsButton label="Save" />');
  });

  it('lifts a single expression into an expression attribute', () => {
    expect(run('<MdsButton>{title}</MdsButton>').output).toBe('<MdsButton label={title} />');
  });

  it('uses an expression for text needing escaping', () => {
    expect(run('<MdsButton>Say "hi"</MdsButton>').output).toBe(
      '<MdsButton label={"Say \\"hi\\""} />',
    );
  });

  it('flags element or mixed content', () => {
    expect(run('<MdsButton><Icon /> Save</MdsButton>')).toMatchObject({ changed: false });
    expect(run('<MdsButton>Hi {name}</MdsButton>')).toMatchObject({ changed: false });
    expect(
      run('<MdsButton><Icon /> Save</MdsButton>').findings.some((f) => f.kind === 'dynamic'),
    ).toBe(true);
  });

  it('skips when label is already present', () => {
    const src = '<MdsButton label="x">Save</MdsButton>';
    expect(run(src).output).toBe(src);
  });
});

describe('transformReact — enum / rename / remove', () => {
  it('remaps tone', () => {
    expect(run('<MdsButton tone="ghost" />').output).toBe('<MdsButton tone="outline" />');
  });

  it('flags a dynamic enum value', () => {
    const { changed, findings } = run('<MdsButton tone={t} />');
    expect(changed).toBe(false);
    expect(findings.some((f) => f.kind === 'dynamic')).toBe(true);
  });

  it('renames labelAction → label', () => {
    expect(run('<MdsLabel labelAction="edit" />').output).toBe('<MdsLabel label="edit" />');
  });

  it('removes hasText with a warning', () => {
    const { output, findings } = run('<MdsButton hasText />');
    expect(output).toBe('<MdsButton />');
    expect(findings.some((f) => f.kind === 'warn')).toBe(true);
  });
});

describe('transformReact — ensureAttr (preserve v1 auto-placement default)', () => {
  const runE = (src: string) => transformReact(src, ensureAttrManifest, ctx);

  it('adds disableAutoPlacement when neither prop is present', () => {
    expect(runE('<MdsDropdown />').output).toBe('<MdsDropdown disableAutoPlacement />');
  });

  it('does not add it when autoPlacement is already present', () => {
    const src = '<MdsDropdown autoPlacement />';
    expect(runE(src)).toMatchObject({ changed: false, output: src });
  });

  it('skips when spread props are present', () => {
    const src = '<MdsDropdown {...props} />';
    expect(runE(src)).toMatchObject({ changed: false, output: src });
  });
});

describe('transformReact — dynamic & safety', () => {
  it('reports spread props but still rewrites explicit ones', () => {
    const { output, findings } = run('<MdsButton {...props} tone="ghost" />');
    expect(output).toContain('tone="outline"');
    expect(findings.some((f) => f.kind === 'dynamic')).toBe(true);
  });

  it('leaves non-magma elements untouched', () => {
    const src = '<div arrow="false">x</div>';
    expect(run(src)).toMatchObject({ changed: false, output: src });
  });

  it('is idempotent', () => {
    const once = run('<MdsButton tone="ghost">Save</MdsButton>').output;
    const twice = run(once);
    expect(twice.changed).toBe(false);
    expect(twice.output).toBe(once);
  });
});
