import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { NavigationService } from '@common/navigation';

const strip = `<mds-tab>
  <mds-tab-item href="#a" label="A" selected></mds-tab-item>
  <mds-tab-item href="#b" label="B"></mds-tab-item>
</mds-tab>`;

const buttonsOf = (root: HTMLElement): HTMLMdsButtonElement[] =>
  Array.from(root.querySelectorAll('mds-tab-item')).map((item) =>
    item.shadowRoot!.querySelector('mds-button')!,
  );

describe('mds-tab-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tab-item></mds-tab-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('names an icon-only tab after the host title', async () => {
    const { root } = await render('<mds-tab-item title="Dark mode"></mds-tab-item>');
    const tab = root.shadowRoot!.querySelector('mds-button')!;

    expect(tab).toEqualAttributes({ role: 'tab', title: 'Dark mode' });
  });

  it('leaves the tab unnamed by title when the host has none', async () => {
    const { root } = await render('<mds-tab-item label="First"></mds-tab-item>');

    expect(root.shadowRoot!.querySelector('mds-button')).not.toHaveAttribute('title');
  });

  it('puts the state of the popup it opens on the tab, not on its own host', async () => {
    const { root } = await render('<mds-tab-item label="First" expanded></mds-tab-item>');

    // the host is generic and accepts none of the attributes of a caller
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root.shadowRoot!.querySelector('mds-button')).toEqualAttribute('aria-expanded', 'true');
  });

  it('says nothing about a popup on a tab that opens none', async () => {
    const { root } = await render('<mds-tab-item label="First"></mds-tab-item>');

    expect(root.shadowRoot!.querySelector('mds-button')).not.toHaveAttribute('aria-expanded');
  });

  // a tab with href used to be a tab that loaded a page on click, whatever the page decided (#806)
  describe('with href, as a link', () => {
    afterEach(() => {
      // the links are fragments, so the page stays: leave its URL as it was found
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    });

    it('is announced as a link, the selected one as the current one', async () => {
      const { root } = await render(strip);
      const [a, b] = buttonsOf(root);

      expect(a).toEqualAttributes({ role: 'link', 'aria-current': 'true' });
      expect(b).toEqualAttribute('role', 'link');
      expect(b).not.toHaveAttribute('aria-current');
    });

    it('moves the selection, and aria-current, on a click', async () => {
      const { root } = await render(strip);
      const [a, b] = buttonsOf(root);

      await userEvent.click(b);

      await vi.waitFor(() => expect(b).toEqualAttribute('aria-current', 'true'));
      expect(a).not.toHaveAttribute('aria-current');
      expect(root.querySelector('mds-tab-item[selected]')).toBe(
        (b.getRootNode() as ShadowRoot).host,
      );
    });

    it('leaves the selection alone on a modifier click, which opens the link elsewhere', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(strip);
      const select = spyOnEvent('mdsTabItemSelect');
      const [, b] = buttonsOf(root);
      // the browser would open a new tab, which the test runner cannot have: the document
      // stands in for it and cancels the click once the strip had its say (a synthetic click
      // has to be cancelable for that, as a trusted one is)
      document.addEventListener('click', (event) => event.preventDefault(), { once: true });

      b.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, ctrlKey: true }),
      );
      await waitForChanges();

      expect(select).toHaveReceivedEventTimes(0);
      expect(root.querySelector('mds-tab-item[selected]')).toEqualAttribute('label', 'A');
    });

    it('hands a click to the router registered through NavigationService, and moves the selection', async () => {
      const router = vi.fn();
      NavigationService.setHandler(router);
      try {
        const { root } = await render(strip);
        const [a, b] = buttonsOf(root);

        await userEvent.click(b);

        await vi.waitFor(() => expect(router).toHaveBeenCalledWith('#b', expect.any(MouseEvent)));
        await vi.waitFor(() => expect(b).toEqualAttribute('aria-current', 'true'));
        expect(a).not.toHaveAttribute('aria-current');
        expect(window.location.hash).toBe('');
      } finally {
        NavigationService.setHandler(undefined);
      }
    });
  });

  // #988: the tab documented a default and a hover shadow for its items, and only the selected
  // item read one
  describe('shadows', () => {
    const fadeStrip = (style: string) =>
      render(`<mds-tab animation="fade" style="${style}">
        <mds-tab-item label="A" selected></mds-tab-item>
        <mds-tab-item label="B"></mds-tab-item>
      </mds-tab>`);

    // the button fades its shadow: read it once the transition is over
    const shadowOf = async (button: Element): Promise<string> => {
      await Promise.all(
        button
          .getAnimations()
          .filter((animation) => animation instanceof CSSTransition)
          .map((animation) => animation.finished),
      );
      return getComputedStyle(button).boxShadow;
    };

    it('gives the items that are not selected the default shadow', async () => {
      const { root } = await fadeStrip('--mds-tab-item-default-shadow: 0 0 0 3px rgb(1 2 3)');
      const [selected, other] = buttonsOf(root);

      expect(await shadowOf(other)).toContain('rgb(1, 2, 3)');
      expect(await shadowOf(selected)).not.toContain('rgb(1, 2, 3)');
    });

    it('gives a hovered item the hover shadow', async () => {
      const { root } = await fadeStrip(
        '--mds-tab-item-default-shadow: 0 0 0 3px rgb(1 2 3); --mds-tab-item-hover-shadow: 0 0 0 3px rgb(4 5 6)',
      );
      const [, other] = buttonsOf(root);

      await userEvent.hover(other);

      expect(await shadowOf(other)).toContain('rgb(4, 5, 6)');
      await userEvent.unhover(other);
    });

    it('keeps the default shadow on a hovered item when the hover shadow is not set', async () => {
      const { root } = await fadeStrip('--mds-tab-item-default-shadow: 0 0 0 3px rgb(1 2 3)');
      const [, other] = buttonsOf(root);

      await userEvent.hover(other);

      expect(await shadowOf(other)).toContain('rgb(1, 2, 3)');
      await userEvent.unhover(other);
    });

    it('leaves the items without a shadow of their own when the tab slides', async () => {
      // the slider paints the selection, and the items stay transparent over it
      const { root } = await render(`<mds-tab style="--mds-tab-item-default-shadow: 0 0 0 3px rgb(1 2 3)">
        <mds-tab-item label="A" selected></mds-tab-item>
        <mds-tab-item label="B"></mds-tab-item>
      </mds-tab>`);
      const [, other] = buttonsOf(root);

      expect(await shadowOf(other)).not.toContain('rgb(1, 2, 3)');
    });
  });
});
