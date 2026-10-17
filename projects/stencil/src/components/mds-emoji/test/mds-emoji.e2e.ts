import { render, vi } from '@stencil/vitest';

describe('mds-emoji', () => {
  it('renders', async () => {
    const { root } = await render('<mds-emoji></mds-emoji>');

    expect(root).toHaveAttribute('hydrated');
  });

  // the expressions animated whatever the animation preference, while blinking and following
  // the pointer already held back (#821)
  describe('expressions with reduced motion', () => {
    afterEach(() => {
      document.documentElement.classList.remove('pref-animation-reduce');
    });

    const stage = async () => {
      document.documentElement.classList.add('pref-animation-reduce');
      await new Promise((resolve) => setTimeout(resolve, 50));
      const { root } = await render<HTMLMdsEmojiElement>('<mds-emoji></mds-emoji>');
      const part = (id: string) => root.shadowRoot!.querySelector<SVGElement>(`[id='${id}']`)!;
      return { root, part };
    };

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    it('smiles without moving, then hands the face back', async () => {
      const { root, part } = await stage();

      const at = () => root.getBoundingClientRect().toJSON();
      const smiling = root.smile();
      await wait(100);
      const early = at();
      expect(part('mouth-smile').style.visibility).toBe('visible');
      expect(part('eyes-closed').style.visibility).toBe('visible');

      // the bounce would have lifted and squeezed the face by now
      await wait(300);
      expect(at()).toEqual(early);

      await smiling;
      await vi.waitFor(() => expect(part('mouth-default').style.visibility).toBe('visible'));
      expect(part('eyes-default').style.visibility).toBe('visible');
    });

    it('frowns for the length of the disagreement, then smiles again', async () => {
      const { root, part } = await stage();

      const disagreeing = root.disagree();
      await wait(100);
      expect(part('mouth-serious').style.visibility).toBe('visible');

      await disagreeing;
      await vi.waitFor(() => expect(part('mouth-default').style.visibility).toBe('visible'));
    });

    it('shows the thinking hand at once, already in place', async () => {
      const { root, part } = await stage();

      await root.startThinking(0.5);

      expect(part('hand-think').style.visibility).toBe('visible');
      expect(part('mouth-serious').style.visibility).toBe('visible');
    });
  });
});
