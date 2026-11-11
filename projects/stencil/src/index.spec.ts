// @vitest-environment node
// A server imports the package root too (Next.js, Angular SSR, a renderToString page): the
// module of the services loads without `window`, and a path set there stores nothing.
describe('the package root on a server', () => {
  it('loads without window, and a path set there waits for the browser', async () => {
    expect(typeof window).toBe('undefined');

    const { IconsSetService, NavigationService } = await import('./index');

    expect(IconsSetService.getSvgPath()).toBe('');
    expect(() => IconsSetService.setSvgPath('/svg/')).not.toThrow();
    expect(IconsSetService.getSvgPath()).toBe('');
    expect(NavigationService.setHandler).toBeTypeOf('function');
  });
});
