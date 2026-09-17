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

  it('does not throw when the typography attribute is removed after hydration', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    element.removeAttribute('typography');
    await waitForChanges();

    expect(consoleError).not.toHaveBeenCalled();
  });
});
