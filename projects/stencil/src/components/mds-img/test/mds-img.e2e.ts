import { render } from '@stencil/vitest';
import hydrated from '../../../../../styles/dist/css/hydrated.css?raw';

// an image that loads in the test page, whose own server has no /assets
const PIXEL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
)}`;

// a picture of 1440 x 900, the size of the issue (#1409)
const PICTURE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900"/>',
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

  it('passes decoding on to the image, and leaves the choice to the browser by default', async () => {
    const { root } = await render(`<mds-img src="${PIXEL}" decoding="async"></mds-img>`);
    expect(root.shadowRoot!.querySelector('img')).toEqualAttribute('decoding', 'async');

    const plain = await render(`<mds-img src="${PIXEL}"></mds-img>`);
    expect(plain.root.shadowRoot!.querySelector('img')).not.toHaveAttribute('decoding');
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

      const { root, waitForChanges } = await render<HTMLMdsImgElement>(
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

  // on a page that does not render the components on the server, hydrated.css is all the page
  // has before the loader defines mds-img: an undefined element, inline and empty (#1409)
  describe('before it hydrates, on a page without server rendering', () => {
    const frames: HTMLIFrameElement[] = [];

    /**
     * A page of its own, where no loader ever defines mds-img: the moment before hydration,
     * held still. hydrated.css goes into `base`, as the styles README imports it.
     */
    const pageWithoutComponents = async (body: string): Promise<Document> => {
      const frame = document.createElement('iframe');
      frame.style.cssText = 'border: 0; height: 600px; width: 800px';
      frame.srcdoc = `<!doctype html><style>@layer base { ${hydrated} }</style><body style="margin: 0">${body}</body>`;
      const loaded = new Promise((resolve) =>
        frame.addEventListener('load', resolve, { once: true }),
      );
      document.body.append(frame);
      frames.push(frame);
      await loaded;
      return frame.contentDocument!;
    };

    const box = (element: Element): { width: number; height: number } => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    };

    afterEach(() => frames.splice(0).forEach((frame) => frame.remove()));

    it('takes the box of its picture from width and height, the box it keeps once hydrated', async () => {
      const markup = `<div style="width: 640px"><mds-img src="${PICTURE}" width="1440" height="900" alt="A picture"></mds-img></div>`;
      const page = await pageWithoutComponents(markup);
      const before = page.querySelector('mds-img')!;

      expect(page.defaultView!.customElements.get('mds-img')).toBeUndefined();
      expect(box(before)).toEqual({ width: 640, height: 400 });

      const { root } = await render(markup);
      const after = root.querySelector('mds-img')!;
      const image = after.shadowRoot!.querySelector('img')!;
      await new Promise((resolve) =>
        image.complete ? resolve(undefined) : image.addEventListener('load', resolve),
      );

      expect(box(after)).toEqual(box(before));
    });

    it('is as wide as its container without width and height, and as tall as nothing', async () => {
      const page = await pageWithoutComponents(
        `<div style="width: 640px"><mds-img src="${PICTURE}" alt="A picture"></mds-img></div>`,
      );

      expect(box(page.querySelector('mds-img')!)).toEqual({ width: 640, height: 0 });
    });

    it('hands the box back to the component once the host is flagged hydrated', async () => {
      const page = await pageWithoutComponents(
        `<div style="width: 640px"><mds-img width="1440" height="900"></mds-img><mds-img class="hydrated" width="1440" height="900"></mds-img></div>`,
      );
      const [attribute, className] = Array.from(page.querySelectorAll('mds-img'));
      attribute.setAttribute('hydrated', '');

      // an undefined element again: what is left of the box is the one the component gives
      for (const host of [attribute, className]) {
        const style = page.defaultView!.getComputedStyle(host);
        expect(style.display).toBe('inline');
        expect(style.aspectRatio).toBe('auto');
      }
    });
  });
});
