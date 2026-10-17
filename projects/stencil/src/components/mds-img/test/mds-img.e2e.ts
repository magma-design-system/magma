import { render } from '@stencil/vitest';

describe('mds-img', () => {
  it('renders', async () => {
    const { root } = await render('<mds-img></mds-img>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('does not crash and keeps an empty alt when src is missing', async () => {
    const { root } = await render('<mds-img></mds-img>');

    expect(root).toHaveAttribute('hydrated');
    expect(root).toEqualAttribute('alt', '');
  });

  it('derives the alt from the src file name when alt is not provided', async () => {
    const { root } = await render('<mds-img src="/assets/images/logo.svg"></mds-img>');

    expect(root).toHaveAttribute('hydrated');
    expect(root).toEqualAttribute('alt', 'logo.svg');
  });

  // Angular and Vue bind null for a missing value, before the first render
  describe('with null properties', () => {
    const mountImg = async (
      setup: (img: HTMLMdsImgElement) => void,
    ): Promise<HTMLMdsImgElement> => {
      const img = document.createElement('mds-img');
      img.src = '/assets/images/logo.svg';
      setup(img);
      document.body.appendChild(img);
      await vi.waitFor(() => expect(img).toHaveAttribute('hydrated'));
      return img;
    };

    afterEach(() => {
      document.querySelectorAll('body > mds-img').forEach((img) => img.remove());
    });

    it('derives the alt from the src file name when alt is null', async () => {
      const img = await mountImg((el) => {
        (el as { alt: string | null }).alt = null;
      });

      expect(img).toEqualAttribute('alt', 'logo.svg');
    });

    it('loads without errors when srcset-consumption is null', async () => {
      const consoleError = vi.spyOn(console, 'error');
      await mountImg((el) => {
        (el as { srcsetConsumption?: string | null }).srcsetConsumption = null;
      });

      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  // #826: the consumption was read once, on load, from the storage, and never from the preference
  // the page applies
  describe('the consumption preference', () => {
    const setConsumption = (mode?: string): void => {
      const { classList } = document.documentElement;
      ['low', 'medium', 'high'].forEach((level) => classList.remove(`pref-consumption-${level}`));
      if (mode) classList.add(`pref-consumption-${mode}`);
    };

    afterEach(() => {
      setConsumption();
    });

    // images that load: a missing file would show the error state, which has no img
    const image = (): string =>
      URL.createObjectURL(
        new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"></svg>'], {
          type: 'image/svg+xml',
        }),
      );

    it('follows the consumption the page applies, also after load', async () => {
      const [low, high] = [image(), image()];
      setConsumption('low');
      const { root } = await render(
        `<mds-img src="${high}" alt="Logo" srcset-consumption="${low} low, ${high} high"></mds-img>`,
      );
      expect(root.shadowRoot!.querySelector('.click-to-load')).not.toBeNull();

      setConsumption('high');

      await vi.waitFor(() =>
        expect(root.shadowRoot!.querySelector('img')).toEqualAttribute('src', high),
      );
      expect(root.shadowRoot!.querySelector('.click-to-load')).toBeNull();
    });
  });
});
