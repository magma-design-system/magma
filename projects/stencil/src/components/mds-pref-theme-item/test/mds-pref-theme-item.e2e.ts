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
      '<mds-pref-theme-item name="ocean" label="Freddo" style="--mds-pref-theme-item-color-background: rgb(1, 2, 3)"></mds-pref-theme-item>';

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

    // it painted the active theme, so every item of the picker looked the same (#692)
    describe('of the theme it names', () => {
      // the active theme, and the preview the styles of editorial publish, with values of their own
      const page = document.createElement('style');
      page.textContent = `:root {
        --magma-wash-base: rgb(7 8 9);
        --magma-accent-emphasis: rgb(10 11 12);
        --magma-preview-editorial-wash: rgb(1 2 3);
        --magma-preview-editorial-accent: rgb(4 5 6);
      }`;
      beforeAll(() => document.head.append(page));
      afterAll(() => page.remove());

      const colors = (root: HTMLElement) => ({
        wash: getComputedStyle(root.shadowRoot!.querySelector('.theme-preview')!).backgroundColor,
        accent: getComputedStyle(root.shadowRoot!.querySelector('.theme-color--variant-primary')!)
          .backgroundColor,
      });

      it('shows its wash and its accent, not the ones of the active theme', async () => {
        const { root } = await render<HTMLMdsPrefThemeItemElement>(
          '<mds-pref-theme-item name="editorial"></mds-pref-theme-item>',
        );

        expect(colors(root)).toEqual({ wash: 'rgb(1, 2, 3)', accent: 'rgb(4, 5, 6)' });
      });

      it('shows the active theme for a theme that publishes no preview', async () => {
        const { root } = await render<HTMLMdsPrefThemeItemElement>(
          '<mds-pref-theme-item name="neon"></mds-pref-theme-item>',
        );

        expect(colors(root)).toEqual({ wash: 'rgb(7, 8, 9)', accent: 'rgb(10, 11, 12)' });
      });

      it('follows a new name', async () => {
        const { root, waitForChanges } = await render<HTMLMdsPrefThemeItemElement>(
          '<mds-pref-theme-item name="neon"></mds-pref-theme-item>',
        );

        root.setAttribute('name', 'editorial');
        await waitForChanges();

        expect(colors(root)).toEqual({ wash: 'rgb(1, 2, 3)', accent: 'rgb(4, 5, 6)' });
      });
    });

    it('selects the theme when clicked, as the label does', async () => {
      const { root, spyOnEvent, waitForChanges } =
        await render<HTMLMdsPrefThemeItemElement>(markup);
      const select = spyOnEvent('mdsPrefThemeItemSelect');

      await userEvent.click(root.shadowRoot!.querySelector('.theme-preview')!);
      await waitForChanges();

      expect(select).toHaveReceivedEventDetail({ name: 'ocean', scheme: 'all' });
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
