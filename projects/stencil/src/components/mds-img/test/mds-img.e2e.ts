import { render } from '@stencil/vitest';

// an image that loads in the test page, whose own server has no /assets
const PIXEL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
)}`;

describe('mds-img', () => {
  it('renders', async () => {
    const { root } = await render('<mds-img></mds-img>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('sets crossorigin and referrerpolicy on the image', async () => {
    const { root } = await render(
      `<mds-img src="${PIXEL}" crossorigin="anonymous" referrerpolicy="no-referrer"></mds-img>`,
    );
    const img = root.shadowRoot!.querySelector('img')!;

    expect(img.crossOrigin).toBe('anonymous');
    expect(img.referrerPolicy).toBe('no-referrer');
  });

  // a CORS request by default would fail every image of a site that sends no CORS headers
  it('fetches the image without CORS and with the policy of the page by default', async () => {
    const { root } = await render(`<mds-img src="${PIXEL}"></mds-img>`);
    const img = root.shadowRoot!.querySelector('img')!;

    expect(img.hasAttribute('crossorigin')).toBe(false);
    expect(img.hasAttribute('referrerpolicy')).toBe(false);
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

  // an explicit empty alt was replaced by the file name, so an image could never be
  // decorative (#821)
  describe('the accessible name', () => {
    it('names the image after its alt', async () => {
      const { root } = await render(
        '<mds-img src="/assets/images/logo.svg" alt="Logo Maggioli"></mds-img>',
      );

      expect(root).toEqualAttributes({ role: 'img', 'aria-label': 'Logo Maggioli' });
    });

    it('leaves a decorative image out with an empty alt', async () => {
      const { root } = await render('<mds-img src="/assets/images/logo.svg" alt=""></mds-img>');

      expect(root).toEqualAttributes({ role: 'presentation', alt: '' });
      expect(root).not.toHaveAttribute('aria-label');
    });

    it('takes an empty alt set by a framework before the first render as decorative too', async () => {
      const img = document.createElement('mds-img');
      img.src = '/assets/images/logo.svg';
      img.alt = '';
      document.body.appendChild(img);
      await vi.waitFor(() => expect(img).toHaveAttribute('hydrated'));

      expect(img).toEqualAttribute('role', 'presentation');
      img.remove();
    });
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

  // #825: an entry without its level read the level of nothing and threw, so did a trailing comma
  describe('srcset-consumption', () => {
    it('skips an image without its level, with a warning, and an empty entry', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleError = vi.spyOn(console, 'error');

      const { root, waitForChanges } = await render(
        '<mds-img src="/assets/images/logo.svg" srcset-consumption="/low.svg low, /medium.svg, /high.svg  high,"></mds-img>',
      );
      root.srcsetConsumption = '/medium.svg medium';
      await waitForChanges();

      expect(consoleError).not.toHaveBeenCalled();
      const warnings = warn.mock.calls.filter(([message]) =>
        String(message).startsWith('mds-img:'),
      );
      expect(warnings).toHaveLength(1);
      expect(warnings[0][0]).toContain('"/medium.svg"');
    });

    it('takes a value removed after load for no value', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const { root, waitForChanges } = await render(
        '<mds-img src="/assets/images/logo.svg" srcset-consumption="/low.svg low"></mds-img>',
      );

      (root as { srcsetConsumption?: string | null }).srcsetConsumption = null;
      await waitForChanges();

      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});
