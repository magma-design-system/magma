import { render } from '@stencil/vitest';

const spinDuration = (root: HTMLElement): string =>
  getComputedStyle(root.shadowRoot!.querySelector('.await-icon')!).animationDuration;

describe('mds-spinner', () => {
  it('renders', async () => {
    const { root } = await render('<mds-spinner></mds-spinner>');

    expect(root).toHaveAttribute('hydrated');
  });

  // the spinner followed only the OS media query, ignoring the Magma preference, and a
  // --mds-spinner-duration set from outside cancelled the slowdown (#821)
  describe('with the animation preference', () => {
    const preferring = async (choice: string): Promise<void> => {
      document.documentElement.classList.add(`pref-animation-${choice}`);
      await new Promise((resolve) => setTimeout(resolve, 50));
    };

    afterEach(() => {
      document.documentElement.classList.remove(
        'pref-animation-reduce',
        'pref-animation-no-preference',
      );
    });

    it('turns at its own speed with no preference', async () => {
      await preferring('no-preference');
      const { root } = await render('<mds-spinner running></mds-spinner>');

      expect(root).toEqualAttribute('pref-animation', 'no-preference');
      expect(spinDuration(root)).toBe('0.725s');
    });

    it('slows down when motion is reduced, even with a duration set from outside', async () => {
      await preferring('reduce');
      const { root } = await render(
        '<mds-spinner running style="--mds-spinner-duration: 1s"></mds-spinner>',
      );

      expect(root).toEqualAttribute('pref-animation', 'reduce');
      expect(spinDuration(root)).toBe('8s');
    });
  });
});
