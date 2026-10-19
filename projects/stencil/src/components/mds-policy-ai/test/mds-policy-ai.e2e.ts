import { render, vi } from '@stencil/vitest';

describe('mds-policy-ai', () => {
  it('renders', async () => {
    const { root } = await render('<mds-policy-ai></mds-policy-ai>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #802: the chip part sat on the wrapper of the chip and of its dropdown
  describe('the chip variant', () => {
    it('puts the chip part on the mds-chip, and the chip-wrapper part on its wrapper', async () => {
      const { root } = await render('<mds-policy-ai variant="chip"></mds-policy-ai>');

      expect(root.shadowRoot!.querySelector('[part~="chip"]')!.tagName).toBe('MDS-CHIP');
      expect(root.shadowRoot!.querySelector('[part~="chip-wrapper"]')).toHaveClass('chip-wrapper');
    });

    it('lets ::part(chip) style the chip and nothing else', async () => {
      const { root } = await render(
        `<div>
           <style>mds-policy-ai::part(chip) { outline: 7px dotted red; }</style>
           <mds-policy-ai variant="chip"></mds-policy-ai>
         </div>`,
      );
      const policy = root.querySelector('mds-policy-ai')!;
      await vi.waitFor(() => expect(policy).toHaveAttribute('hydrated'));

      const outline = (selector: string): string => {
        const style = getComputedStyle(policy.shadowRoot!.querySelector(selector)!);
        return `${style.outlineStyle} ${style.outlineWidth}`;
      };
      expect(outline('mds-chip')).toBe('dotted 7px');
      expect(outline('.chip-wrapper')).not.toContain('dotted');
    });
  });
});
