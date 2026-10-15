import { describe, expect, it } from 'vitest';
import autoprefixPlugin, { readSupportedBrowsers } from './postcss-autoprefix';

const prefix = async (css: string): Promise<string> =>
  (await autoprefixPlugin().transform(css, 'mds-test.css'))!.code;

describe('autoprefixPlugin', () => {
  it('reads the browsers of the root .browserslistrc, without the comments', () => {
    const browsers = readSupportedBrowsers();

    expect(browsers).toContain('Safari >= 16.5');
    expect(browsers.some((query) => query.includes('#'))).toBe(false);
  });

  // Stencil's pass prefixed for iOS 9 and IE 11: a pre-rendered page repeated these in every
  // declarative shadow root (#831)
  it('leaves out the prefixes no supported browser reads', async () => {
    const css = await prefix(
      'a{box-shadow:0 0 1px red;transform:none;transition-duration:1s;display:flex}',
    );

    expect(css).not.toMatch(/-webkit-|-ms-|-moz-/);
  });

  it('keeps the prefixes a supported Safari still needs', async () => {
    const css = await prefix('a{user-select:none;backdrop-filter:blur(2px)}');

    expect(css).toContain('-webkit-user-select:none');
    expect(css).toContain('-webkit-backdrop-filter:blur(2px)');
  });

  it('keeps the prefixes written in the sources', async () => {
    const css = await prefix(
      'a{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
    );

    expect(css).toContain('display:-webkit-box');
    expect(css).toContain('-webkit-line-clamp:2');
  });
});
