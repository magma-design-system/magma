import { labelFromName } from '@common/string';

describe('labelFromName', () => {
  it('capitalises a kebab-case name and turns its hyphens into spaces', () => {
    expect(labelFromName('default')).toBe('Default');
    expect(labelFromName('dark-blue')).toBe('Dark blue');
    expect(labelFromName('maggioli-editore-light')).toBe('Maggioli editore light');
  });
});
