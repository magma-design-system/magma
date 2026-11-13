import { downloadAttribute } from '@common/navigation';

// the download prop of mds-link and mds-button, read as the attribute of a native anchor (#1407)
describe('downloadAttribute', () => {
  it('saves under the name the server gives for true and for the attribute with no value', () => {
    expect(downloadAttribute(true)).toBe('');
    expect(downloadAttribute('')).toBe('');
  });

  it('names the saved file with any other string, "false" included', () => {
    expect(downloadAttribute('colors.xml')).toBe('colors.xml');
    expect(downloadAttribute('false')).toBe('false');
  });

  it('leaves a plain link for false, null and undefined', () => {
    expect(downloadAttribute(false)).toBeUndefined();
    expect(downloadAttribute(null)).toBeUndefined();
    expect(downloadAttribute(undefined)).toBeUndefined();
  });
});
