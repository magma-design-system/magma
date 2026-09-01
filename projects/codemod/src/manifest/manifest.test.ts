/**
 * Tests for the curated corrections layered on top of the generated manifest
 * (`manifest.ts`) and for the bundled manifest's alignment with the real
 * v1.12 → v2 breaking changes.
 */
import { manifest } from './manifest.js';

const rulesOf = (tag: string) => manifest.components[tag]?.rules ?? [];

describe('curated manifest', () => {
  it('replaces the generated per-component tone remaps with the global rule', () => {
    expect(manifest.global.tone?.map).toEqual({ ghost: 'outline', quiet: 'weak' });
    for (const component of Object.values(manifest.components)) {
      expect(component.rules.some((r) => r.kind === 'enumRemap' && r.prop.prop === 'tone')).toBe(
        false,
      );
    }
  });

  it('adds the global semantic-color CSS-var migrations (seed rename + surface reports)', () => {
    const globalVars = manifest.global.cssVars ?? [];
    for (const family of ['porcelain', 'kaolin', 'neutral', 'fireclay', 'bisque']) {
      expect(globalVars).toContainEqual(
        expect.objectContaining({
          kind: 'cssVarRename',
          from: `tone-${family}`,
          to: `tone-${family}-seed`,
        }),
      );
    }
    // the bare token and every neutral scale step are reported as surface
    // candidates when used as a background (report-only, never rewritten)
    for (const from of ['tone-neutral', 'tone-neutral-01', 'tone-neutral-09', 'tone-neutral-10']) {
      expect(globalVars).toContainEqual(
        expect.objectContaining({ kind: 'cssVarSurfaceReport', from }),
      );
    }
  });

  it('overrides `quiet → text` on the three components whose v2 tone set has `text`', () => {
    const quietToText = { ghost: 'outline', quiet: 'text' };
    expect(manifest.global.tone?.overrides).toEqual({
      'mds-button': quietToText,
      'mds-radial-menu': quietToText,
      'mds-radial-menu-item': quietToText,
    });
    for (const tag of Object.keys(manifest.global.tone?.overrides ?? {})) {
      expect(manifest.components[tag]?.v2EnumSets?.tone).toContain('text');
    }
  });

  it('renames mds-label `labelAction` to `label` instead of removing it', () => {
    expect(rulesOf('mds-label')).toContainEqual(
      expect.objectContaining({
        kind: 'propRename',
        from: { attr: 'label-action', prop: 'labelAction' },
        to: { attr: 'label', prop: 'label' },
      }),
    );
    expect(
      rulesOf('mds-label').some((r) => r.kind === 'propRemove' && r.prop.prop === 'labelAction'),
    ).toBe(false);
  });

  it('inverts mds-accordion `closable` into `disableClose` instead of removing it', () => {
    expect(rulesOf('mds-accordion')).toContainEqual(
      expect.objectContaining({
        kind: 'booleanInvert',
        from: { attr: 'closable', prop: 'closable' },
        to: { attr: 'disable-close', prop: 'disableClose' },
        oldDefault: true,
        newDefault: false,
      }),
    );
    expect(
      rulesOf('mds-accordion').some((r) => r.kind === 'propRemove' && r.prop.prop === 'closable'),
    ).toBe(false);
  });

  it('inverts mds-notification `visible` into `dismissed` instead of removing it', () => {
    expect(rulesOf('mds-notification')).toContainEqual(
      expect.objectContaining({
        kind: 'booleanInvert',
        from: { attr: 'visible', prop: 'visible' },
        to: { attr: 'dismissed', prop: 'dismissed' },
        oldDefault: true,
        newDefault: false,
      }),
    );
    expect(
      rulesOf('mds-notification').some((r) => r.kind === 'propRemove' && r.prop.prop === 'visible'),
    ).toBe(false);
  });

  it('inverts mds-tooltip `arrow` into `hideArrow` (missing from the docs diff)', () => {
    expect(rulesOf('mds-tooltip')).toContainEqual(
      expect.objectContaining({
        kind: 'booleanInvert',
        from: { attr: 'arrow', prop: 'arrow' },
        to: { attr: 'hide-arrow', prop: 'hideArrow' },
        oldDefault: true,
        newDefault: false,
      }),
    );
  });

  it('guards the mds-dropdown auto-placement default flip', () => {
    expect(rulesOf('mds-dropdown')).toContainEqual(
      expect.objectContaining({
        kind: 'ensureAttr',
        attr: { attr: 'disable-auto-placement', prop: 'disableAutoPlacement' },
      }),
    );
  });

  it('guards the mds-push-notification-item `deletable` default flip (true → false)', () => {
    expect(rulesOf('mds-push-notification-item')).toContainEqual(
      expect.objectContaining({
        kind: 'ensureAttr',
        attr: { attr: 'deletable', prop: 'deletable' },
        unless: [{ attr: 'deletable', prop: 'deletable' }],
      }),
    );
  });

  it('guards the flipped visual defaults (banner variant, label truncate)', () => {
    expect(rulesOf('mds-banner')).toContainEqual(
      expect.objectContaining({
        kind: 'ensureAttr',
        attr: { attr: 'variant', prop: 'variant' },
        value: 'light',
      }),
    );
    expect(rulesOf('mds-label')).toContainEqual(
      expect.objectContaining({
        kind: 'ensureAttr',
        attr: { attr: 'truncate', prop: 'truncate' },
        value: 'none',
      }),
    );
  });

  it('lifts slotted text into `label` (button preferred; breadcrumb-item and tab-item lost their slot)', () => {
    for (const tag of ['mds-breadcrumb-item', 'mds-button', 'mds-tab-item']) {
      expect(rulesOf(tag)).toContainEqual(
        expect.objectContaining({
          kind: 'slotToAttr',
          slot: 'default',
          to: { attr: 'label', prop: 'label' },
        }),
      );
    }
  });

  it('rewrites the CSS custom properties the docs diff recorded as removals but that are renames', () => {
    const expected: Array<[string, string, string]> = [
      ['mds-banner', 'mds-banner-gap', 'mds-banner-content-gap'],
      ['mds-filter', 'mds-filter-wrapper-shodow-opacity', 'mds-filter-wrapper-shadow-opacity'],
      [
        'mds-filter-item',
        '-mds-filter-item-count-background-selected',
        'mds-filter-item-count-background-selected',
      ],
      [
        'mds-filter-item',
        '-mds-filter-item-count-color-default',
        'mds-filter-item-count-color-default',
      ],
      [
        'mds-filter-item',
        '-mds-filter-item-count-color-selected',
        'mds-filter-item-count-color-selected',
      ],
      ['mds-header', 'mds-header-backdrop-filter', 'mds-header-backdrop-blur-strength'],
      ['mds-tab', 'mds-tab-item-transition-duration', 'mds-tab-transition-duration'],
      ['mds-tab', 'mds-tab-item-transition-timing-function', 'mds-tab-transition-timing-function'],
    ];
    for (const [tag, from, to] of expected) {
      expect(rulesOf(tag)).toContainEqual(
        expect.objectContaining({ kind: 'cssVarRename', from, to }),
      );
      expect(rulesOf(tag).some((r) => r.kind === 'cssVarRemove' && r.name === from)).toBe(false);
    }
    // The value cannot be carried over verbatim for these two.
    expect(rulesOf('mds-banner')).toContainEqual(
      expect.objectContaining({
        kind: 'cssVarRename',
        from: 'mds-banner-gap',
        valueFormatChanged: true,
      }),
    );
    expect(rulesOf('mds-header')).toContainEqual(
      expect.objectContaining({
        kind: 'cssVarRename',
        from: 'mds-header-backdrop-filter',
        valueFormatChanged: true,
      }),
    );
  });

  it("renames the typo'd CSS custom properties corrected in v2 (#566)", () => {
    expect(rulesOf('mds-video-wall')).toContainEqual({
      kind: 'cssVarRename',
      from: 'mds-video-wall-noise-fitler',
      to: 'mds-video-wall-noise-filter',
    });
    expect(rulesOf('mds-file')).toContainEqual({
      kind: 'cssVarRename',
      from: 'mds-file-preview-icon-bacground',
      to: 'mds-file-preview-icon-background',
    });
    // The generated removal is stale: the correctly-spelled name exists in v2
    // now that the typo is fixed.
    for (const tag of ['mds-video-wall', 'mds-file']) {
      expect(
        rulesOf(tag).some((r) => r.kind === 'cssVarRemove' && r.name.includes('noise-fi')),
      ).toBe(false);
      expect(
        rulesOf(tag).some((r) => r.kind === 'cssVarRemove' && r.name.includes('preview-icon-ba')),
      ).toBe(false);
    }
    // The stepper duration typo was corrected after the v2.0.0-beta docs
    // snapshot (while registering the properties from globals.css, #328), so
    // only the curated layer can see it.
    expect(rulesOf('mds-stepper-bar-item')).toContainEqual({
      kind: 'cssVarRename',
      from: 'mds-stepper-bar-item-duaration',
      to: 'mds-stepper-bar-item-duration',
    });
  });

  it('migrates the utility classes whose token contract changed (J)', () => {
    const classes = manifest.global.classes ?? [];
    const renames = classes.filter((r) => r.kind === 'classRename');
    const reports = classes.filter((r) => r.kind === 'classReport');
    const renameMap = new Map(renames.map((r) => [r.from, r.to]));

    // Shadows: ring family back under width/alpha names; sm slid to xs;
    // DEFAULT/sharp/md/lg/xl/2xl are value-stable and must NOT be renamed.
    expect(renameMap.get('shadow-outline')).toBe('shadow-ring');
    expect(renameMap.get('shadow-outline-light-50')).toBe('shadow-ring-weak-2');
    expect(renameMap.get('shadow-outline-strong-100')).toBe('shadow-ring-strong-4');
    expect(renameMap.get('shadow-sm')).toBe('shadow-xs');
    expect(renameMap.get('shadow-inner')).toBe('shadow-inset-sm');
    for (const stable of ['shadow', 'shadow-sharp', 'shadow-md', 'shadow-2xl', 'shadow-none'])
      expect(renameMap.has(stable)).toBe(false);
    // No-equivalent ring widths are report-only — the name collision above all.
    for (const name of ['shadow-outline-strong', 'shadow-outline-75', 'shadow-outline-light-100'])
      expect(reports.some((r) => r.name === name)).toBe(true);

    // Radius: value-preserving scale shift, expanded over corner variants;
    // `sm` (2px, no v2 step) is report-only; `none`/`full` are stable.
    expect(renameMap.get('rounded')).toBe('rounded-3xs');
    expect(renameMap.get('rounded-md')).toBe('rounded-2xs');
    expect(renameMap.get('rounded-3xl')).toBe('rounded-2xl');
    expect(renameMap.get('rounded-tl-xl')).toBe('rounded-tl-md');
    expect(renameMap.get('rounded-t-2xl')).toBe('rounded-t-lg');
    expect(reports.some((r) => r.name === 'rounded-sm')).toBe(true);
    expect(reports.some((r) => r.name === 'rounded-b-sm')).toBe(true);
    for (const stable of ['rounded-none', 'rounded-full'])
      expect(renameMap.has(stable)).toBe(false);

    // Border widths: retuned named steps land on value-stable names; the bare
    // `border` (1px DEFAULT) is unchanged.
    expect(renameMap.get('border-md')).toBe('border-sm');
    expect(renameMap.get('border-lg')).toBe('border-200');
    expect(renameMap.get('border-x-xl')).toBe('border-x-800');
    expect(renameMap.has('border')).toBe(false);

    // Gap: only the bare DEFAULT and the 3xl step changed value.
    expect(renameMap.get('gap')).toBe('gap-lg');
    expect(renameMap.get('gap-y-3xl')).toBe('gap-y-2000');
    for (const stable of ['gap-xs', 'gap-md', 'gap-2xl', 'gap-400'])
      expect(renameMap.has(stable)).toBe(false);
  });
});

describe('generated manifest alignment (v1.12 tip vs dev tip)', () => {
  it('rewrites the hide/disable renames as boolean inversions, not removals', () => {
    const expected: Array<[string, string, string]> = [
      ['mds-banner', 'cockade', 'hideCockade'],
      ['mds-breadcrumb', 'back', 'hideBack'],
      ['mds-file', 'showDownloadedIcon', 'hideDownloadedIcon'],
      ['mds-header', 'backdrop', 'hideBackdrop'],
      ['mds-help', 'autoPlacement', 'disableAutoPlacement'],
      ['mds-modal', 'backdrop', 'hideBackdrop'],
    ];
    for (const [tag, from, to] of expected) {
      expect(rulesOf(tag)).toContainEqual(
        expect.objectContaining({
          kind: 'booleanInvert',
          from: expect.objectContaining({ prop: from }),
          to: expect.objectContaining({ prop: to }),
        }),
      );
      expect(rulesOf(tag).some((r) => r.kind === 'propRemove' && r.prop.prop === from)).toBe(false);
    }
  });

  it('reports the mds-modal `animating` removal (dropped with the native-dialog rewrite)', () => {
    expect(rulesOf('mds-modal')).toContainEqual(
      expect.objectContaining({
        kind: 'propRemove',
        prop: expect.objectContaining({ prop: 'animating' }),
      }),
    );
  });

  it('reports the removed mds-push-notification named slots (top, bottom)', () => {
    expect(rulesOf('mds-push-notification')).toContainEqual({ kind: 'slotRemove', from: 'top' });
    expect(rulesOf('mds-push-notification')).toContainEqual({ kind: 'slotRemove', from: 'bottom' });
  });

  it('reports the CSS custom properties removed with no replacement', () => {
    expect(rulesOf('mds-entity')).toContainEqual(
      expect.objectContaining({ kind: 'cssVarRemove', name: 'mds-entity-shadow' }),
    );
    const removals = Object.values(manifest.components).flatMap((c) =>
      c.rules.filter((r) => r.kind === 'cssVarRemove'),
    );
    // 20 in the generated manifest, minus the 9 the curation converts to renames.
    expect(removals.length).toBeGreaterThanOrEqual(11);
  });
});
