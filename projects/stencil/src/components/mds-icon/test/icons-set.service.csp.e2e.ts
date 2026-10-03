import { vi } from '@stencil/vitest';
import { IconsSetService } from '../services/icons-set.service';

// The policy of a site that allows requests to its own origin only: `fetch` is governed by
// `connect-src` (by `default-src` when it is missing). A <meta> policy applies to the whole
// document from its insertion on; this file runs in its own frame, so no other test file is
// affected.
const policy = document.createElement('meta');
policy.httpEquiv = 'Content-Security-Policy';
policy.content = "connect-src 'self'";
document.head.append(policy);

const violations: string[] = [];
document.addEventListener('securitypolicyviolation', (event) => violations.push(event.blockedURI));

// A missing icon is not cached, so every call sends its own request; the response does not
// matter, only whether the request leaves the page: the policy makes `fetch` reject.
const requestIcon = async (svgPath: string): Promise<string> => {
  const fetchSpy = vi.spyOn(window, 'fetch');
  IconsSetService.setSvgPath(svgPath);

  expect(await IconsSetService.fetchSvg('csp/missing')).toBe('');
  expect(fetchSpy).toHaveBeenCalledOnce();
  return fetchSpy.mock.settledResults[0].type;
};

describe('IconsSetService under a same-origin Content Security Policy', () => {
  beforeEach(() => {
    violations.splice(0);
    // fetchSvg reports the missing icon
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it.each(['/icons-csp/', 'icons-csp/', `${location.origin}/icons-csp/`])(
    'sends the request for the path %s',
    async (svgPath) => {
      expect(await requestIcon(svgPath)).toBe('fulfilled');
      // the URL `fetch` requests, a stored path resolved against the document base URL
      expect(new URL(IconsSetService.getSvgPath(), document.baseURI).origin).toBe(location.origin);
      expect(violations).toEqual([]);
    },
  );

  it('blocks the request for another origin, which the policy must allow explicitly', async () => {
    expect(await requestIcon('https://cdn.example.com/svg/')).toBe('rejected');
    await vi.waitFor(() =>
      expect(violations).toEqual([expect.stringMatching(/^https:\/\/cdn\.example\.com\//)]),
    );
  });
});
