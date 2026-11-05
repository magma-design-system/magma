import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { COLOR_MODES_PROPERTY, lockedSchemeOf } from '../preference';

// The block of a theme in themes.css says the one mode it can be used in (#1274); mds-pref-theme
// reads it back on <html>. Producer: design-tokens/semantic.model.ts (docs/CONTRACTS.md).
describe('the colour modes a theme declares', () => {
  it('are read under the name design-tokens prints them with', () => {
    const producer = readFileSync(
      join(__dirname, '../../../../design-tokens/semantic.model.ts'),
      'utf8',
    );
    expect(producer).toContain(`export const COLOR_MODES_PROPERTY = '${COLOR_MODES_PROPERTY}';`);
  });

  it('lock the theme to the one mode they name', () => {
    expect(lockedSchemeOf('dark')).toBe('dark');
    expect(lockedSchemeOf(' light ')).toBe('light');
  });

  it('lock nothing when they name both modes, none, or one the format does not have', () => {
    expect(lockedSchemeOf('')).toBeUndefined();
    expect(lockedSchemeOf('light dark')).toBeUndefined();
    expect(lockedSchemeOf('dark light')).toBeUndefined();
    expect(lockedSchemeOf('only dark')).toBeUndefined();
    expect(lockedSchemeOf('sepia')).toBeUndefined();
  });
});
