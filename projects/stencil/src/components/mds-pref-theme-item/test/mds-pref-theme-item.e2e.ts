import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { childOpacityBeforeHydration, hostOpacityBeforeHydration } from '@test/fouc';

describe('mds-pref-theme-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-theme-item></mds-pref-theme-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  // its FOUC sheet was written and never imported (#1004)
  it('stays hidden until it hydrates, and so does its button', async () => {
    const { root } = await render('<mds-pref-theme-item></mds-pref-theme-item>');

    expect(await hostOpacityBeforeHydration(root)).toBe('0');
    expect(childOpacityBeforeHydration(root, 'mds-button')).toBe('0');
  });

  it('builds the label from the name once the label attribute is removed', async () => {
    const { root, waitForChanges } = await render<HTMLMdsPrefThemeItemElement>(
      '<mds-pref-theme-item name="dark-blue" label="Custom"></mds-pref-theme-item>',
    );

    root.removeAttribute('label');
    await waitForChanges();

    expect(root.label).toBe('Dark blue');
  });

  describe('the color preview', () => {
    // it sat in the default slot of mds-button, which takes text only: the button read its
    // label from it and the preview was gone, a 0x0 box, so every theme looked the same
    const markup =
      '<mds-pref-theme-item name="cool" label="Freddo" style="--mds-pref-theme-item-color-background: rgb(1, 2, 3)"></mds-pref-theme-item>';

    it('is on screen next to the label of the button', async () => {
      const { root } = await render<HTMLMdsPrefThemeItemElement>(markup);
      const preview = root.shadowRoot!.querySelector('.theme-preview')!;
      const { width, height } = preview.getBoundingClientRect();

      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(root.shadowRoot!.querySelector('mds-button')!.label).toBe('Freddo');
      expect(preview).toHaveAttribute('aria-hidden', 'true');
    });

    it('paints the theme through its custom properties', async () => {
      const { root } = await render<HTMLMdsPrefThemeItemElement>(markup);

      expect(
        getComputedStyle(root.shadowRoot!.querySelector('.theme-preview')!).backgroundColor,
      ).toBe('rgb(1, 2, 3)');
    });

    it('selects the theme when clicked, as the label does', async () => {
      const { root, spyOnEvent, waitForChanges } =
        await render<HTMLMdsPrefThemeItemElement>(markup);
      const select = spyOnEvent('mdsPrefThemeItemSelect');

      await userEvent.click(root.shadowRoot!.querySelector('.theme-preview')!);
      await waitForChanges();

      expect(select).toHaveReceivedEventDetail({ name: 'cool', scheme: 'all' });
    });

    it('puts no markup in the text-only slot of mds-button', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await render<HTMLMdsPrefThemeItemElement>(markup);

      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining('markup inside the default slot'),
      );
    });
  });
});
