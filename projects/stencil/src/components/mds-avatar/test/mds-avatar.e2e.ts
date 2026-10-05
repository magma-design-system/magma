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
});
