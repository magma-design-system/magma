import {
  diffComponent,
  generateCandidateManifest,
  type DocsComponent,
  type JsonDocs,
} from './diff-docs.js';

const v1Dropdown: DocsComponent = {
  tag: 'mds-dropdown',
  props: [
    { name: 'arrow', attr: 'arrow', type: 'boolean', default: 'true' },
    {
      name: 'tone',
      attr: 'tone',
      type: 'string',
      values: [
        { value: 'ghost', type: 'string' },
        { value: 'strong', type: 'string' },
      ],
    },
  ],
  styles: [{ name: '--mds-dropdown-color' }],
  parts: [{ name: 'label' }],
  slots: [{ name: 'default' }],
  events: [{ event: 'mdsClose' }],
};

const v2Dropdown: DocsComponent = {
  tag: 'mds-dropdown',
  props: [
    { name: 'hideArrow', attr: 'hide-arrow', type: 'boolean', default: 'false' },
    {
      name: 'tone',
      attr: 'tone',
      type: 'string',
      values: [
        { value: 'outline', type: 'string' },
        { value: 'strong', type: 'string' },
      ],
    },
  ],
  styles: [{ name: '--mds-dropdown-color-rgb' }],
  parts: [{ name: 'content' }],
  slots: [],
  events: [{ event: 'mdsDismiss' }],
};

describe('diffComponent', () => {
  const c = diffComponent(v1Dropdown, v2Dropdown);

  it('detects a boolean inversion (arrow → hideArrow)', () => {
    expect(c.rules).toContainEqual(
      expect.objectContaining({
        kind: 'booleanInvert',
        from: { attr: 'arrow', prop: 'arrow' },
        to: { attr: 'hide-arrow', prop: 'hideArrow' },
        oldDefault: true,
        newDefault: false,
      }),
    );
  });

  it('captures the v2 enum set and a remap candidate for removed values', () => {
    expect(c.v2EnumSets?.tone).toEqual(['outline', 'strong']);
    expect(c.rules).toContainEqual(
      expect.objectContaining({ kind: 'enumRemap', map: { ghost: null }, v2set: 'tone' }),
    );
  });

  it('detects a hex → rgb CSS variable rename', () => {
    expect(c.rules).toContainEqual(
      expect.objectContaining({
        kind: 'cssVarRename',
        from: 'mds-dropdown-color',
        to: 'mds-dropdown-color-rgb',
        valueFormatChanged: true,
      }),
    );
  });

  it('pairs a single removed/added part and event', () => {
    expect(c.rules).toContainEqual({ kind: 'partRename', from: 'label', to: 'content' });
    expect(c.rules).toContainEqual({ kind: 'eventRename', from: 'mdsClose', to: 'mdsDismiss' });
  });

  it('derives the React name', () => {
    expect(c.react).toBe('MdsDropdown');
  });
});

describe('diffComponent (boolean inversion pairing)', () => {
  const diff = (v1Props: DocsComponent['props'], v2Props: DocsComponent['props']) =>
    diffComponent({ tag: 'mds-x', props: v1Props }, { tag: 'mds-x', props: v2Props });

  it('pairs optional booleans (Stencil emits `boolean | undefined`)', () => {
    const c = diff(
      [{ name: 'cockade', attr: 'cockade', type: 'boolean | undefined', default: 'true' }],
      [
        {
          name: 'hideCockade',
          attr: 'hide-cockade',
          type: 'boolean | undefined',
          default: 'false',
        },
      ],
    );
    expect(c.rules).toContainEqual(
      expect.objectContaining({
        kind: 'booleanInvert',
        from: { attr: 'cockade', prop: 'cockade' },
        to: { attr: 'hide-cockade', prop: 'hideCockade' },
        oldDefault: true,
        newDefault: false,
      }),
    );
  });

  it('pairs `showX` → `hideX` (the `show` drops, the negation flips)', () => {
    const c = diff(
      [
        {
          name: 'showDownloadedIcon',
          attr: 'show-downloaded-icon',
          type: 'boolean | undefined',
          default: 'true',
        },
      ],
      [
        {
          name: 'hideDownloadedIcon',
          attr: 'hide-downloaded-icon',
          type: 'boolean | undefined',
          default: 'false',
        },
      ],
    );
    expect(c.rules).toContainEqual(
      expect.objectContaining({
        kind: 'booleanInvert',
        from: expect.objectContaining({ prop: 'showDownloadedIcon' }),
        to: expect.objectContaining({ prop: 'hideDownloadedIcon' }),
      }),
    );
  });

  it('pairs `hideX` → `x` (stripping a negative prefix flips the polarity)', () => {
    const c = diff(
      [{ name: 'hideArrow', attr: 'hide-arrow', type: 'boolean', default: 'false' }],
      [{ name: 'arrow', attr: 'arrow', type: 'boolean', default: 'true' }],
    );
    expect(c.rules).toContainEqual(
      expect.objectContaining({
        kind: 'booleanInvert',
        from: expect.objectContaining({ prop: 'hideArrow' }),
        to: expect.objectContaining({ prop: 'arrow' }),
      }),
    );
  });

  it('does NOT pair `showX` → `x` as an inversion (same polarity)', () => {
    const c = diff(
      [{ name: 'showArrow', attr: 'show-arrow', type: 'boolean', default: 'true' }],
      [{ name: 'arrow', attr: 'arrow', type: 'boolean', default: 'true' }],
    );
    expect(c.rules.some((r) => r.kind === 'booleanInvert')).toBe(false);
    expect(c.rules).toContainEqual(
      expect.objectContaining({
        kind: 'propRemove',
        prop: expect.objectContaining({ prop: 'showArrow' }),
      }),
    );
  });
});

describe('diffComponent (removed css vars and named slots)', () => {
  it('emits cssVarRemove for a removed property with no rename target', () => {
    const c = diffComponent(
      { tag: 'mds-x', styles: [{ name: '--mds-x-gap' }] },
      { tag: 'mds-x', styles: [] },
    );
    expect(c.rules).toContainEqual(
      expect.objectContaining({ kind: 'cssVarRemove', name: 'mds-x-gap' }),
    );
  });

  it('emits slotRemove for removed named slots but not for the default slot', () => {
    const c = diffComponent(
      { tag: 'mds-x', slots: [{ name: 'default' }, { name: 'top' }, { name: 'bottom' }] },
      { tag: 'mds-x', slots: [{ name: 'bottom' }] },
    );
    expect(c.rules).toContainEqual({ kind: 'slotRemove', from: 'top' });
    expect(c.rules.filter((r) => r.kind === 'slotRemove').length).toBe(1);
  });
});

describe('generateCandidateManifest', () => {
  it('assembles global rules and skips brand-new components', () => {
    const v1: JsonDocs = { components: [v1Dropdown] };
    const v2: JsonDocs = { components: [v2Dropdown, { tag: 'mds-new', props: [] }] };
    const manifest = generateCandidateManifest(v1, v2, {
      fromVersion: '1.12.0',
      toVersion: '2.0.0',
    });

    expect(manifest.fromVersion).toBe('1.12.0');
    expect(manifest.global.removeDefaultSlot).toBe(true);
    expect(manifest.global.tone).toBeDefined();
    expect(Object.keys(manifest.components)).toEqual(['mds-dropdown']); // mds-new has no v1 counterpart
  });
});
