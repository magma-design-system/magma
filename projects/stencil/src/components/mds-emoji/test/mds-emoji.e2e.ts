import { render, vi } from '@stencil/vitest';

describe('mds-emoji', () => {
  it('renders', async () => {
    const { root } = await render('<mds-emoji></mds-emoji>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #825: a name outside the dictionary threw a TypeError
  describe('an unknown name', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('draws no face on load, and the pointer moves nothing', async () => {
      const consoleError = vi.spyOn(console, 'error');

      const { root } = await render('<mds-emoji name="nobody"></mds-emoji>');
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(consoleError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"nobody"'));
      expect(root.shadowRoot!.querySelector('svg')).toBeNull();
    });

    it('set after load leaves the face it shows', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const { root, waitForChanges } = await render('<mds-emoji name="simi"></mds-emoji>');

      root.setAttribute('name', 'nobody');
      await waitForChanges();

      expect(consoleError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"nobody"'));
      expect(root).toEqualAttribute('name', 'simi');
      expect(root.name).toBe('simi');
      expect(root.shadowRoot!.querySelector('svg')).not.toBeNull();
    });
  });
});
