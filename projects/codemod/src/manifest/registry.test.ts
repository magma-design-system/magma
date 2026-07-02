import {
  attrToProp,
  propToAttr,
  tagToReactName,
  eventToReactProp,
  rulesForComponent,
  ruleId,
} from './registry.js';
import { testManifest as manifest } from './test-manifest.js';

describe('name helpers', () => {
  it('converts prop ↔ attr', () => {
    expect(propToAttr('autoPlacement')).toBe('auto-placement');
    expect(propToAttr('hideArrow')).toBe('hide-arrow');
    expect(attrToProp('auto-placement')).toBe('autoPlacement');
    expect(attrToProp('hide-arrow')).toBe('hideArrow');
  });

  it('derives React component and event-handler names', () => {
    expect(tagToReactName('mds-dropdown')).toBe('MdsDropdown');
    expect(tagToReactName('mds-input-select')).toBe('MdsInputSelect');
    expect(eventToReactProp('mdsChange')).toBe('onMdsChange');
  });
});

describe('rulesForComponent (global resolution)', () => {
  it('adds the tone remap only for components that declare a tone set', () => {
    const banner = manifest.components['mds-banner']!;
    const rules = rulesForComponent(manifest, banner);
    expect(rules.some((r) => r.kind === 'enumRemap')).toBe(true);
  });

  it('does not add a tone remap for a component without a tone set', () => {
    const dropdown = manifest.components['mds-dropdown']!;
    const rules = rulesForComponent(manifest, dropdown);
    expect(rules.some((r) => r.kind === 'enumRemap')).toBe(false);
  });

  it('does not inject the default-slot removal (handled globally by surfaces)', () => {
    const banner = manifest.components['mds-banner']!;
    const rules = rulesForComponent(manifest, banner);
    expect(rules.some((r) => r.kind === 'slotRemove')).toBe(false);
  });
});

describe('ruleId', () => {
  it('builds stable identifiers', () => {
    const dropdown = manifest.components['mds-dropdown']!;
    const invert = dropdown.rules.find((r) => r.kind === 'booleanInvert')!;
    expect(ruleId('mds-dropdown', invert)).toBe('mds-dropdown/booleanInvert/arrow');
  });
});
