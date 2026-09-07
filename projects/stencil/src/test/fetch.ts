import { vi } from '@stencil/vitest';

/**
 * Answers every fetch (the icon SVG requests) with an empty SVG so that the tests
 * do not depend on the network. Call it inside `beforeEach`: `restoreMocks` resets it.
 */
export const mockIconFetch = (): void => {
  vi.spyOn(window, 'fetch').mockResolvedValue(
    new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>', {
      status: 200,
      headers: { 'content-type': 'image/svg+xml' },
    }),
  );
};
