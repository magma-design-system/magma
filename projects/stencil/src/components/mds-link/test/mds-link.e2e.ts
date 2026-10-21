import { render, vi } from '@stencil/vitest';
import { page, userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';
import { useLanguage } from '@test/language';
import { NavigationService } from '@common/navigation';

// the host follows a click of its own on the next task: wait past it to see nothing happen
const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

// a synthetic click has to be cancelable, as a trusted one is, or preventDefault() is a no-op
const click = (init: MouseEventInit = {}) =>
  new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, ...init });

const linkOf = (root: HTMLElement): HTMLElement => root.shadowRoot!.querySelector('.link')!;

describe('mds-link', () => {
  afterEach(() => {
    NavigationService.setHandler(undefined);
    // the links are fragments, so the page stays: leave its URL as it was found
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  });

  it('renders with the default props, inline', async () => {
    const { root } = await render<HTMLMdsLinkElement>(
      '<mds-link href="#privacy">privacy policy</mds-link>',
    );

    expect(root).toHaveAttribute('hydrated');
    expect(root).toEqualAttributes({
      'icon-position': 'right',
      tone: 'strong',
      underline: 'solid',
      variant: 'primary',
    });
    expect(getComputedStyle(root).display).toBe('inline');
  });

  it('shows the label instead of the default slot when it is set', async () => {
    const { root } = await render<HTMLMdsLinkElement>(
      '<mds-link href="#privacy" label="privacy policy">ignored</mds-link>',
    );

    expect(linkOf(root).querySelector('slot')).toBeNull();
    expect(linkOf(root).textContent).toBe('privacy policy');
  });

  describe('with href', () => {
    const link = (attributes = '') =>
      render<HTMLMdsLinkElement>(`<mds-link href="#elsewhere" ${attributes}>Elsewhere</mds-link>`);

    it('renders a real anchor to the URL, which takes the focus', async () => {
      const { root } = await link();
      const anchor = linkOf(root);

      expect(anchor.tagName).toBe('A');
      expect(anchor).toEqualAttribute('href', '#elsewhere');
      expect(anchor).not.toHaveAttribute('target');
      expect(anchor).not.toHaveAttribute('rel');
      expect(anchor).not.toHaveAttribute('tabindex');
      await expect.element(page.getByRole('link', { name: 'Elsewhere' })).toBeInTheDocument();

      root.focus();
      expect(root.shadowRoot!.activeElement).toBe(anchor);
    });

    describe('and target blank', () => {
      useLanguage('en');

      it('opens a new tab without access to the page, and says so to the assistive technology', async () => {
        const { root } = await link('target="blank"');

        expect(linkOf(root)).toEqualAttributes({
          target: '_blank',
          rel: 'noopener noreferrer',
        });
        await expect
          .element(page.getByRole('link', { name: 'Elsewhere (opens in a new tab)' }))
          .toBeInTheDocument();
      });
    });

    it('follows the link on a click, when nobody cancels it', async () => {
      const { root } = await link();

      await userEvent.click(root);

      await vi.waitFor(() => expect(window.location.hash).toBe('#elsewhere'));
    });

    it('lets a click listener on the host cancel the navigation, as a router does', async () => {
      const { root } = await link();
      const clicks: MouseEvent[] = [];
      root.addEventListener('click', (event) => {
        clicks.push(event);
        event.preventDefault();
      });

      await userEvent.click(root);
      await settle();

      expect(clicks).toHaveLength(1);
      expect(window.location.hash).toBe('');
    });

    it('follows the link on Enter from the keyboard', async () => {
      const { root } = await link();

      root.focus();
      await userEvent.keyboard('{Enter}');

      await vi.waitFor(() => expect(window.location.hash).toBe('#elsewhere'));
    });

    it('follows the link on a click from a script, unless a listener cancels it', async () => {
      const { root } = await link();
      const cancel = (event: Event) => event.preventDefault();
      root.addEventListener('click', cancel);

      root.click();
      await settle();

      expect(window.location.hash).toBe('');

      root.removeEventListener('click', cancel);
      root.click();

      await vi.waitFor(() => expect(window.location.hash).toBe('#elsewhere'));
    });

    it('opens a new tab from a script for target blank, without access to the page', async () => {
      const open = vi.spyOn(window, 'open').mockImplementation(() => null);
      const { root } = await link('target="blank"');

      root.click();

      await vi.waitFor(() =>
        expect(open).toHaveBeenCalledWith('#elsewhere', '_blank', 'noopener,noreferrer'),
      );
      open.mockRestore();
    });

    it('hands a plain click to the router, with the navigation already cancelled', async () => {
      const router = vi.fn();
      NavigationService.setHandler(router);
      const { root } = await link();

      await userEvent.click(root);
      await settle();

      expect(router).toHaveBeenCalledTimes(1);
      const [href, event] = router.mock.calls[0] as [string, MouseEvent];
      expect(href).toBe('#elsewhere');
      expect(event.defaultPrevented).toBe(true);
      expect(window.location.hash).toBe('');
    });

    it('loads the link itself when the router declines it', async () => {
      NavigationService.setHandler(() => false);
      const { root } = await link();

      await userEvent.click(root);

      await vi.waitFor(() => expect(window.location.hash).toBe('#elsewhere'));
    });

    it('leaves a modifier click and a target blank to the browser, not to the router', async () => {
      const router = vi.fn();
      NavigationService.setHandler(router);
      // a real Ctrl-click opens a tab the test runner cannot have: the document stands in for
      // the browser, which gets the click uncancelled and takes it from there
      const cancelled: boolean[] = [];
      const browser = (event: MouseEvent) => {
        cancelled.push(event.defaultPrevented);
        event.preventDefault();
      };

      const { root } = await link();
      document.addEventListener('click', browser, { once: true });
      linkOf(root).dispatchEvent(click({ ctrlKey: true }));

      const blank = await link('target="blank"');
      document.addEventListener('click', browser, { once: true });
      linkOf(blank.root).dispatchEvent(click());
      await settle();

      expect(router).not.toHaveBeenCalled();
      expect(cancelled).toEqual([false, false]);
      expect(window.location.hash).toBe('');
    });
  });

  describe('without href, an inline button', () => {
    it('renders a focusable button and no anchor', async () => {
      const { root } = await render<HTMLMdsLinkElement>('<mds-link>Ask for help</mds-link>');

      expect(root.shadowRoot!.querySelector('a')).toBeNull();
      expect(linkOf(root)).toEqualAttributes({ role: 'button', tabindex: '0' });
      await expect.element(page.getByRole('button', { name: 'Ask for help' })).toBeInTheDocument();
    });

    it('clicks on a click, on Enter and on Space, once each', async () => {
      const { root } = await render<HTMLMdsLinkElement>('<mds-link>Ask for help</mds-link>');
      const onClick = vi.fn();
      root.addEventListener('click', onClick);

      await userEvent.click(root);
      root.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('never submits the form it sits in', async () => {
      const form = document.createElement('form');
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      form.addEventListener('submit', onSubmit);
      form.innerHTML = '<input name="q"><mds-link>Ask for help</mds-link>';
      document.body.appendChild(form);
      const root = form.querySelector('mds-link')!;
      await vi.waitFor(() => expect(root).toHaveAttribute('hydrated'));

      await userEvent.click(root);
      root.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await settle();

      expect(onSubmit).not.toHaveBeenCalled();
      form.remove();
    });

    it('becomes a link when href is set later, and the keys no longer click twice', async () => {
      const { root, waitForChanges } = await render<HTMLMdsLinkElement>(
        '<mds-link>Elsewhere</mds-link>',
      );
      const onClick = vi.fn((event: Event) => event.preventDefault());
      root.addEventListener('click', onClick);

      root.setAttribute('href', '#elsewhere');
      await waitForChanges();
      root.focus();
      await userEvent.keyboard('{Enter}');

      expect(linkOf(root).tagName).toBe('A');
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('the icon', () => {
    beforeEach(() => {
      mockIconFetch();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('sits after the text by default, and before it on the left, hidden from the assistive technology', async () => {
      const { root, waitForChanges } = await render<HTMLMdsLinkElement>(
        '<mds-link href="#report" icon="mi/baseline/open-in-new">Report</mds-link>',
      );
      const icon = () => root.shadowRoot!.querySelector('mds-icon')!;

      expect(icon()).toEqualAttributes({
        name: 'mi/baseline/open-in-new',
        'aria-hidden': 'true',
        part: 'icon',
      });
      expect(linkOf(root).lastElementChild!.contains(icon())).toBe(true);

      root.iconPosition = 'left';
      await waitForChanges();

      expect(linkOf(root).firstElementChild!.contains(icon())).toBe(true);
    });

    it('takes the size of the scale by default, and --mds-link-icon-size from outside', async () => {
      const { root } = await render<HTMLMdsLinkElement>(
        '<mds-link href="#report" icon="mi/baseline/open-in-new">Report</mds-link>',
      );
      const icon = () => root.shadowRoot!.querySelector('mds-icon')!.getBoundingClientRect();

      expect(icon().width).toBe(16);
      expect(icon().height).toBe(16);

      root.style.setProperty('--mds-link-icon-size', '30px');

      expect(icon().width).toBe(30);
      expect(icon().height).toBe(30);
    });

    // the line is exactly as wide as the text: there is no room for the icon, which must take
    // the last word with it to the next line instead of wrapping alone
    it('never wraps to a line of its own', async () => {
      const { root } = await render<HTMLMdsLinkElement>(
        '<div style="width: max-content"><mds-link href="#report">one two three</mds-link></div>',
      );
      const link = root.querySelector('mds-link')!;
      const text = link.firstChild!;
      const range = document.createRange();
      range.selectNodeContents(text);
      root.style.width = `${Math.ceil(range.getBoundingClientRect().width)}px`;

      link.icon = 'mi/baseline/open-in-new';
      await vi.waitFor(() => expect(link.shadowRoot!.querySelector('mds-icon')).not.toBeNull());

      const lines = Array.from(range.getClientRects());
      const lastLine = lines[lines.length - 1];
      const icon = link.shadowRoot!.querySelector('mds-icon')!.getBoundingClientRect();
      const iconMiddle = icon.top + icon.height / 2;

      expect(lines.length).toBeGreaterThan(1);
      expect(iconMiddle).toBeGreaterThan(lastLine.top);
      expect(iconMiddle).toBeLessThan(lastLine.bottom);
      expect(icon.left).toBeGreaterThanOrEqual(lastLine.right);
    });
  });

  // the link has no typography of its own: it is a word of the text it sits in
  describe.each(['h3', 'paragraph', 'caption'])('inside an mds-text %s', (typography) => {
    it('takes the font of the text', async () => {
      const { root } = await render<HTMLMdsTextElement>(
        `<mds-text typography="${typography}">Read the <mds-link href="#privacy">privacy policy</mds-link>.</mds-text>`,
      );
      const text = getComputedStyle(root.shadowRoot!.querySelector('.text')!);
      const link = getComputedStyle(linkOf(root.querySelector('mds-link')!));

      expect(link.fontFamily).toBe(text.fontFamily);
      expect(link.fontSize).toBe(text.fontSize);
      expect(link.fontWeight).toBe(text.fontWeight);
      expect(link.lineHeight).toBe(text.lineHeight);
      expect(link.letterSpacing).toBe(text.letterSpacing);
    });
  });

  it('takes the color of the text around it with variant inherit', async () => {
    const { root } = await render(
      '<p style="color: rgb(200, 0, 0)">Card declined. <mds-link href="#card" variant="inherit">Update it</mds-link></p>',
    );

    expect(getComputedStyle(linkOf(root.querySelector('mds-link')!)).color).toBe('rgb(200, 0, 0)');
  });

  describe('with the animation preference set to reduce', () => {
    // the class lives on the document, so it would outlive this file
    afterEach(() => {
      document.documentElement.classList.remove('pref-animation-reduce');
    });

    it('closes the focus ring in at once', async () => {
      document.documentElement.classList.add('pref-animation-reduce');
      await settle();

      const { root } = await render<HTMLMdsLinkElement>(
        '<mds-link href="#privacy">privacy policy</mds-link>',
      );

      expect(root).toEqualAttribute('pref-animation', 'reduce');
      expect(parseFloat(getComputedStyle(linkOf(root)).transitionDuration)).toBeLessThan(0.001);
    });
  });
});
