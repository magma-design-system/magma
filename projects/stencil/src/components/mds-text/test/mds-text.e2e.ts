import { render, vi } from '@stencil/vitest';
import { TypographyType } from '@type/typography';

describe('mds-text', () => {
  const titleTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'action'];
  const infoTypes = ['paragraph', 'detail', 'caption', 'label', 'option', 'tip'];
  const monoTypes = ['snippet', 'hack'];
  const typographies = [...titleTypes, ...infoTypes, ...monoTypes];

  const readVariants = ['detail', 'caption', 'paragraph'];

  const textContent = 'Test text';

  let element: HTMLMdsTextElement;
  let waitForChanges: () => Promise<void>;

  beforeEach(async () => {
    ({ root: element, waitForChanges } = await render<HTMLMdsTextElement>(
      `<mds-text>${textContent}</mds-text>`,
    ));
  });

  it('renders default', async () => {
    expect(element).toHaveAttribute('hydrated');
    expect(element).toEqualAttribute('typography', 'detail');
    expect(element.textContent).toEqual(textContent);
  });

  it.each(typographies)('renders typography %s', async (typography: TypographyType) => {
    element.typography = typography;
    await waitForChanges();

    expect(element).toEqualAttribute('typography', typography);
  });

  it.each(readVariants)(
    'renders typography %s in variant read',
    async (typography: TypographyType) => {
      element.typography = typography;
      element.variant = 'read';
      await waitForChanges();

      expect(element).toEqualAttribute('typography', typography);
      expect(element).toEqualAttribute('variant', 'read');
    },
  );

  it('falls back to the default tag for an unknown typography', async () => {
    const { root } = await render(`<mds-text typography="title">${textContent}</mds-text>`);

    expect(root).toHaveAttribute('hydrated');
    expect(root).toEqualAttribute('tag', 'p');
    expect(root.textContent).toEqual(textContent);
  });

  describe('the yugop animation', () => {
    /** Records what the animated element holds, frame by frame, while it resolves. */
    const recordFrames = async (
      host: HTMLMdsTextElement,
      frames: number,
    ): Promise<{ length: number; height: number }[]> => {
      const painted = host.shadowRoot!.querySelector('.text')!;
      const samples: { length: number; height: number }[] = [];
      for (let frame = 0; frame < frames; frame += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        samples.push({
          length: painted.textContent?.length ?? 0,
          height: painted.getBoundingClientRect().height,
        });
      }
      return samples;
    };

    /** Records what the animated element holds, frame by frame, until it holds `text`. */
    const recordUntil = async (
      host: HTMLMdsTextElement,
      text: string,
      limit = 200,
    ): Promise<string[]> => {
      const painted = host.shadowRoot!.querySelector('.text')!;
      const samples: string[] = [];
      while (samples.length < limit && samples[samples.length - 1] !== text) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        samples.push(painted.textContent ?? '');
      }
      return samples;
    };

    it('resolves a text that loaded before its host rendered the slot', async () => {
      // outside the flat tree every custom property reads "", the :host ones included: read at
      // load, the speed came out as 0 and the reveal froze on its first frame, forever
      const { root: host } = await render<HTMLDivElement>('<div></div>', {
        waitForReady: false,
      });
      host.attachShadow({ mode: 'open' });
      const text = document.createElement('mds-text');
      text.setAttribute('animation', 'yugop');
      text.setAttribute('text', 'Click to copy');
      host.append(text);
      await text.componentOnReady();

      host.shadowRoot!.innerHTML = '<slot></slot>';
      text.setAttribute('text', 'Copied');
      const samples = await recordUntil(text, 'Copied');

      expect(samples[samples.length - 1]).toBe('Copied');
      expect(samples.every((sample) => sample.length === 'Copied'.length)).toBe(true);
    });

    it('reads the speed when animation="yugop" is set after load', async () => {
      // the custom properties were read at load, and only if the animation was already on:
      // set later, it ran at a built-in speed and ignored --mds-text-animation-speed
      const { root, waitForChanges } = await render<HTMLMdsTextElement>(
        '<mds-text style="--mds-text-animation-speed: 1000"></mds-text>',
      );
      root.setAttribute('animation', 'yugop');
      await waitForChanges();

      const long = '0123456789'.repeat(12);
      root.text = long;
      const samples = await recordUntil(root, long);

      // every character starts on the first frame, so the text resolves in as many frames as
      // the farthest character is from its target (30 at most); at the built-in speed of 2 the
      // last character would not even start before frame 60
      expect(samples[samples.length - 1]).toBe(long);
      expect(samples.length).toBeLessThan(45);
    });

    it('pads with the placeholder character of its custom property, one per character', async () => {
      // a <string> custom property comes back quoted: '_' padded every character with three
      const { root } = await render<HTMLMdsTextElement>(
        `<mds-text animation="yugop" style="--mds-text-animation-placeholder-char: '_'"></mds-text>`,
      );

      const target = 'Copied to the clipboard';
      root.text = target;
      const samples = await recordUntil(root, target);

      expect(samples[samples.length - 1]).toBe(target);
      expect(samples.some((sample) => sample.includes('_'))).toBe(true);
      expect(samples.every((sample) => sample.length === target.length)).toBe(true);
    });

    it('paints a text holding markup as text, as the render does', async () => {
      // every frame went through innerHTML, so the last one turned the tag into an element
      const { root } = await render<HTMLMdsTextElement>('<mds-text animation="yugop"></mds-text>');

      root.text = '<b>bold</b>';
      const samples = await recordUntil(root, '<b>bold</b>');

      expect(samples[samples.length - 1]).toBe('<b>bold</b>');
      expect(root.shadowRoot!.querySelector('.text b')).toBeNull();
    });

    it('never paints fewer characters than the string it is resolving', async () => {
      // every frame used to start from a slice of the character array, so the first ones
      // came out empty: no line box, and everything around the text jumped by a line
      const { root, waitForChanges } = await render<HTMLMdsTextElement>(
        '<mds-text animation="yugop" typography="h2"></mds-text>',
      );

      root.text = '451';
      await waitForChanges();
      const samples = await recordFrames(root, 40);

      expect(samples.every((sample) => sample.length === 3)).toBe(true);
      expect(Math.min(...samples.map((sample) => sample.height))).toBe(
        Math.max(...samples.map((sample) => sample.height)),
      );
    });

    describe('with the animation preference set to reduce', () => {
      /** The controllers publish the choice as a class on <html>; the store follows it
       * through a MutationObserver, so give it a tick before rendering anything. */
      const chooseReduce = async (): Promise<void> => {
        document.documentElement.classList.add('pref-animation-reduce');
        await new Promise((resolve) => setTimeout(resolve, 50));
      };

      // the class lives on the document, so it would outlive this file and reach the
      // cases that run after it
      afterEach(() => {
        document.documentElement.classList.remove('pref-animation-reduce');
      });

      it('paints the text at once instead of resolving it', async () => {
        // the scramble is a rAF loop: the stylesheets never had a way to stop it, and
        // nothing in the components read the preference
        await chooseReduce();
        const { root, waitForChanges } = await render<HTMLMdsTextElement>(
          '<mds-text animation="yugop" typography="h2"></mds-text>',
        );

        root.text = 'Ciao mondo';
        await waitForChanges();
        const samples = await recordFrames(root, 20);

        expect(samples.every((sample) => sample.length === 'Ciao mondo'.length)).toBe(true);
        expect(root.shadowRoot!.querySelector('.text')!.textContent).toBe('Ciao mondo');
      });
    });

    it('keeps the whitespace of the placeholder, so the box does not breathe', async () => {
      // the placeholder is a space by default: collapsed, it would give back the width the
      // full-length string is there to hold
      const { root } = await render<HTMLMdsTextElement>(
        '<mds-text animation="yugop" text="451"></mds-text>',
      );

      expect(root).toHaveAttribute('animation', 'yugop');
      expect(getComputedStyle(root.shadowRoot!.querySelector('.text')!).whiteSpace).toBe(
        'pre-wrap',
      );
    });
  });

  it('shows the slotted text again once the text attribute is removed', async () => {
    element.setAttribute('text', 'Property text');
    await waitForChanges();
    expect(element.shadowRoot!.querySelector('slot')).toBeNull();

    element.removeAttribute('text');
    await waitForChanges();

    expect(element.shadowRoot!.querySelector('slot')).not.toBeNull();
  });

  describe('truncate with a typography trimmed to the cap height', () => {
    // label and option trim the box to the capitals (text-box), so accents and cedillas are
    // ink outside it: clipping the box vertically cut them off
    const LONG = 'PROPRIETA\u0300 SONO ATTRIBUTI SEMPLICI \u00c8 \u00c5 \u00c7, ANCHE MOLTO LUNGHI';

    // the truncated text next to the same text without truncate, the box it has to keep
    const renderPair = async (typography: TypographyType, truncate: string) => {
      const attributes = `typography="${typography}" style="--mds-text-line-clamp: 2"`;
      const plainStyle = truncate === 'word' ? ' style="white-space: nowrap"' : '';
      const { root } = await render<HTMLDivElement>(
        `<div style="width: 160px"><div${plainStyle}><mds-text ${attributes}>${LONG}</mds-text></div><mds-text ${attributes} truncate="${truncate}">${LONG}</mds-text></div>`,
      );
      const [plain, host] = Array.from(root.querySelectorAll('mds-text'));
      return { plain, host, inner: host.shadowRoot!.querySelector('.text') as HTMLElement };
    };

    it.each(['label', 'option'] as TypographyType[])(
      '%s: word clips only the inline end and keeps the trimmed box',
      async (typography) => {
        const { plain, host, inner } = await renderPair(typography, 'word');
        const style = getComputedStyle(inner);

        expect(style.overflowX).toBe('clip');
        expect(style.overflowY).toBe('visible');
        expect(style.textOverflow).toBe('ellipsis');
        expect(inner.scrollWidth).toBeGreaterThan(inner.clientWidth);
        expect(host.getBoundingClientRect().height).toBeCloseTo(
          plain.getBoundingClientRect().height,
          1,
        );
      },
    );

    it.each(['label', 'option'] as TypographyType[])(
      '%s: none wraps without clipping the lines vertically',
      async (typography) => {
        const { plain, host, inner } = await renderPair(typography, 'none');

        expect(getComputedStyle(inner).overflowY).toBe('visible');
        expect(host.getBoundingClientRect().height).toBeCloseTo(
          plain.getBoundingClientRect().height,
          1,
        );
      },
    );

    it.each(['label', 'option'] as TypographyType[])(
      '%s: all opens the clip above the first line, and only there',
      async (typography) => {
        const { inner } = await renderPair(typography, 'all');
        const style = getComputedStyle(inner);
        const halfLine = parseFloat(style.lineHeight) / 2;

        // overflow-clip-margin widens the clip on every side, clip-path closes the bottom
        // and the sides again: the lines after the clamp stay hidden
        expect(style.overflowY).toBe('clip');
        expect(parseFloat(style.overflowClipMargin)).toBeCloseTo(halfLine, 1);
        expect(style.clipPath).toMatch(/^inset\(-/);
        expect(style.clipPath).toMatch(/ 0px 0px\)$/);
      },
    );
  });

  it('does not throw when the typography attribute is removed after hydration', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    element.removeAttribute('typography');
    await waitForChanges();

    expect(consoleError).not.toHaveBeenCalled();
  });

  describe('with the animation preference set to reduce', () => {
    // the class lives on the document, so it would outlive this file
    afterEach(() => {
      document.documentElement.classList.remove('pref-animation-reduce');
    });

    it('holds back the transition of a code text', async () => {
      // the host reflected the preference, but the sheet that reads it was commented out in
      // the Tailwind 4 migration and then deleted with the comment (#1004)
      document.documentElement.classList.add('pref-animation-reduce');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const { root } = await render('<mds-text tag="code">const a = 1;</mds-text>');

      expect(root).toHaveAttribute('pref-animation', 'reduce');
      expect(getComputedStyle(root).transitionDuration).toBe('1e-05s');
    });
  });

  describe('the reading measure (#1204)', () => {
    /** The max-width of the host `html` renders, read before the next render replaces it. */
    const maxWidth = async (html: string): Promise<string> => {
      const { root } = await render(html);
      return getComputedStyle(root).maxWidth;
    };

    // next to a host of the same typography set at 56ch, so the ch is that of the same text
    it.each(['p', 'li', 'figcaption'])(
      'caps the host at 56ch of its own text with the tag %s',
      async (tag) => {
        for (const typography of ['detail', 'paragraph', 'h4']) {
          const capped = await maxWidth(
            `<mds-text tag="${tag}" typography="${typography}">${textContent}</mds-text>`,
          );
          const measure = await maxWidth(
            `<mds-text tag="span" typography="${typography}" style="max-width: 56ch">${textContent}</mds-text>`,
          );
          expect(capped, typography).toMatch(/px$/);
          expect(capped, typography).toBe(measure);
        }
      },
    );

    it('caps the default text, whose tag is p', async () => {
      const capped = await maxWidth(`<mds-text>${textContent}</mds-text>`);
      expect(capped).toBe(
        await maxWidth(`<mds-text tag="span" style="max-width: 56ch">${textContent}</mds-text>`),
      );
    });

    it.each(['span', 'div', 'h2', 'label', 'blockquote'])(
      'leaves the host free with the tag %s',
      async (tag) => {
        expect(await maxWidth(`<mds-text tag="${tag}">${textContent}</mds-text>`)).toBe('none');
      },
    );
  });
});
