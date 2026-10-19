import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

const initialsText = (root: HTMLElement): string | null | undefined =>
  root.shadowRoot!.querySelector('.initials-text')?.textContent;

const hasFallbackIcon = (root: HTMLElement): boolean =>
  root.shadowRoot!.querySelector('.fallback-icon') !== null;

describe('mds-avatar', () => {
  beforeEach(() => {
    mockIconFetch();
  });

  it('renders the initials', async () => {
    const { root } = await render('<mds-avatar initials="NT"></mds-avatar>');

    expect(initialsText(root)).toBe('NT');
    expect(hasFallbackIcon(root)).toBe(false);
  });

  // Angular and Vue bind null for a missing value
  it('keeps the initials when the src property is null', async () => {
    const { root, waitForChanges } = await render<HTMLMdsAvatarElement>(
      '<mds-avatar initials="NT"></mds-avatar>',
    );

    (root as { src?: string | null }).src = null;
    await waitForChanges();

    expect(initialsText(root)).toBe('NT');
    expect(root.shadowRoot!.querySelector('mds-img')).toBeNull();
  });

  it('shows the fallback icon when the icon property is null', async () => {
    const { root, waitForChanges } = await render<HTMLMdsAvatarElement>(
      '<mds-avatar icon="mdi/alien"></mds-avatar>',
    );

    (root as { icon?: string | null }).icon = null;
    await waitForChanges();

    expect(root.shadowRoot!.querySelector('mds-icon')).toBeNull();
    expect(hasFallbackIcon(root)).toBe(true);
  });

  it('shows the initials again once the count attribute is removed', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { root, waitForChanges } = await render(
      '<mds-avatar initials="NT" count="3"></mds-avatar>',
    );
    expect(initialsText(root)).toBe('+3');

    root.removeAttribute('count');
    await waitForChanges();

    expect(initialsText(root)).toBe('NT');
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('shows the fallback icon once the initials attribute is removed', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { root, waitForChanges } = await render('<mds-avatar initials="NT"></mds-avatar>');

    root.removeAttribute('initials');
    await waitForChanges();

    expect(initialsText(root)).toBeUndefined();
    expect(hasFallbackIcon(root)).toBe(true);
    expect(consoleError).not.toHaveBeenCalled();
  });

  // the sources resolve in one order: count, image, initials, icon, person glyph
  it('shows the count over an image', async () => {
    const { root } = await render(
      '<mds-avatar src="https://example.com/foto.jpg" count="3"></mds-avatar>',
    );

    expect(initialsText(root)).toBe('+3');
    expect(root.shadowRoot!.querySelector('mds-img')).toBeNull();
  });

  it('shows the image over the initials and the icon', async () => {
    const { root } = await render(
      '<mds-avatar src="https://example.com/foto.jpg" initials="NT" icon="mdi/alien"></mds-avatar>',
    );

    expect(root.shadowRoot!.querySelector('mds-img')).not.toBeNull();
    expect(initialsText(root)).toBeUndefined();
    expect(root.shadowRoot!.querySelector('mds-icon')).toBeNull();
  });

  it('shows the initials over the icon', async () => {
    const { root } = await render('<mds-avatar initials="NT" icon="mdi/alien"></mds-avatar>');

    expect(initialsText(root)).toBe('NT');
    expect(root.shadowRoot!.querySelector('mds-icon')).toBeNull();
  });

  it('shows the initials when the image fails to load', async () => {
    const { root } = await render('<mds-avatar src="data:," initials="NT"></mds-avatar>');

    await expect.poll(() => initialsText(root)).toBe('NT');
    expect(root.shadowRoot!.querySelector('mds-img')).toBeNull();
    expect(hasFallbackIcon(root)).toBe(false);
  });

  // #825: the initials picked a slot out of 17 in a list of 15 colors, and the last two slots gave
  // no variant at all
  it.each([
    ['AB', 'orchid'],
    ['AI', 'amaranth'],
    ['AJ', 'aqua'],
  ])('colors the initials %s with %s', async (initials, variant) => {
    const { root } = await render(`<mds-avatar initials="${initials}"></mds-avatar>`);

    expect(root).toEqualAttribute('variant', variant);
  });
});
