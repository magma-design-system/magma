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

  it('lifts mds-button slotted text into `label`', () => {
    expect(rulesOf('mds-button')).toContainEqual(
      expect.objectContaining({
        kind: 'slotToAttr',
        slot: 'default',
        to: { attr: 'label', prop: 'label' },
      }),
    );
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
    expect(rulesOf('mds-banner')).toContainEqual(
      expect.objectContaining({ kind: 'cssVarRemove', name: 'mds-banner-gap' }),
    );
    const removals = Object.values(manifest.components).flatMap((c) =>
      c.rules.filter((r) => r.kind === 'cssVarRemove'),
    );
    expect(removals.length).toBeGreaterThanOrEqual(20);
  });
});
