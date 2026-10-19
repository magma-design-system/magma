import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-details', () => {
  it('renders', async () => {
    const { root } = await render('<mds-details></mds-details>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('exposes the header as a disclosure button instead of a banner landmark', async () => {
    const { root, waitForChanges } = await render(
      '<mds-details><span slot="title">Vision</span>Details</mds-details>',
    );
    const header = root.shadowRoot!.querySelector('.header')!;

    expect(header.tagName).toBe('DIV');
    expect(header).toEqualAttributes({ role: 'button', 'aria-expanded': 'false', tabindex: '0' });

    await userEvent.click(header);
    await waitForChanges();

    expect(header).toEqualAttribute('aria-expanded', 'true');
  });

  // a user toggle changed only an inner state: opened went stale, and assigning the value it
  // still held did nothing (#823)
  it('writes the user toggle into opened, so code can reopen what the user closed', async () => {
    const { root, waitForChanges } = await render<HTMLMdsDetailsElement>(
      '<mds-details opened><span slot="title">Vision</span>Details</mds-details>',
    );
    const header = root.shadowRoot!.querySelector<HTMLElement>('.header')!;

    header.click();
    await waitForChanges();
    expect(root.opened).toBe(false);
    expect(root).not.toHaveAttribute('opened');

    root.opened = true;
    await waitForChanges();
    expect(header).toEqualAttribute('aria-expanded', 'true');
  });

  // the header toggled with Enter only, and the closed content was only transparent: its links
  // and buttons stayed in the tab order and in the accessibility tree (#820)
  describe('the keyboard', () => {
    const details = async (attributes = '') => {
      const rendered = await render(
        `<div><mds-details ${attributes}><span slot="title">Vision</span><a href="#inside">Inside</a></mds-details><button>After</button></div>`,
      );
      const root = rendered.root.querySelector('mds-details')!;
      return {
        ...rendered,
        details: root,
        header: root.shadowRoot!.querySelector<HTMLElement>('.header')!,
      };
    };

    it('toggles with Space as with Enter, on the release of Space', async () => {
      const { header, waitForChanges } = await details();

      header.focus();
      await userEvent.keyboard('{Space>}');
      await waitForChanges();
      expect(header).toEqualAttribute('aria-expanded', 'false');

      await userEvent.keyboard('{/Space}');
      await waitForChanges();
      expect(header).toEqualAttribute('aria-expanded', 'true');

      await userEvent.keyboard('{Enter}');
      await waitForChanges();
      expect(header).toEqualAttribute('aria-expanded', 'false');
    });

    it('leaves the closed content out of the tab order', async () => {
      const { root, header } = await details('style="--mds-details-duration: 0s"');

      header.focus();
      await userEvent.keyboard('{Tab}');

      expect(document.activeElement).toBe(root.querySelector('button'));
      expect(getComputedStyle(root.querySelector('a')!).visibility).toBe('hidden');
    });

    it('keeps an open details hidden inside a closed one', async () => {
      const { root } = await render(
        `<mds-details style="--mds-details-duration: 0s"><span slot="title">Outer</span><mds-details opened style="--mds-details-duration: 0s"><span slot="title">Inner</span><a href="#deep">Deep</a></mds-details></mds-details>`,
      );

      expect(getComputedStyle(root.querySelector('a')!).visibility).toBe('hidden');
    });

    it('puts the open content in the tab order', async () => {
      const { root, header } = await details('opened style="--mds-details-duration: 0s"');

      header.focus();
      await userEvent.keyboard('{Tab}');

      expect(document.activeElement).toBe(root.querySelector('a'));
    });
  });
});
