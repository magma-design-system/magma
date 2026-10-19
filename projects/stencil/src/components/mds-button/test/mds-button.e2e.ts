import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';
import { createSlottedChild, itReadsTheSlottedLabelWhenLabelIsNull } from '@test/slot';
import { NavigationService } from '@common/navigation';
import { renderToString } from '@test/ssr';

/**
 * The awaiting spinner slides in over --duration-300 and the button's own width follows it,
 * so a box read right after the attribute lands catches the animation halfway. Sit the
 * transition out, then poll until the box stops moving.
 */
/**
 * Creates a button, lets `setup` assign its properties before the first render (as a
 * framework binding does) and waits until it has loaded.
 */
const mountButton = async (
  setup: (button: HTMLMdsButtonElement) => void,
  parent: HTMLElement = document.body,
): Promise<HTMLMdsButtonElement> => {
  const button = document.createElement('mds-button');
  setup(button);
  parent.appendChild(button);
  await vi.waitFor(() => expect(button).toHaveAttribute('hydrated'));
  return button;
};

/**
 * Records each submit of `form` as the receiver gets it: the submitter and the form data
 * built with it, which is what the browser sends.
 */
const recordSubmits = (form: HTMLFormElement) => {
  const submits: { submitter: HTMLButtonElement | null; data: FormData }[] = [];
  form.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault();
    submits.push({
      submitter: event.submitter as HTMLButtonElement | null,
      data: new FormData(form, event.submitter),
    });
  });
  return submits;
};

const settledBox = async (element: Element): Promise<DOMRect> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  let previous = '';
  let box = element.getBoundingClientRect();
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    box = element.getBoundingClientRect();
    const current = `${box.width}x${box.height}`;
    if (current === previous) return box;
    previous = current;
  }

  return box;
};

describe('mds-button', () => {
  it('renders', async () => {
    const { root } = await render('<mds-button></mds-button>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('the label', () => {
    const LONG = 'A label far longer than the width the button is given';

    /** The font of the label next to the one of an mds-text in the typography it should take. */
    const fontsOf = async (button: string, typography: string) => {
      const { root } = await render(
        `<div>${button}<mds-text typography="${typography}" tag="span">Label</mds-text></div>`,
      );
      await vi.waitFor(() => expect(root.querySelectorAll('[hydrated]')).toHaveLength(2));
      const font = (element: Element) => {
        const { fontFamily, fontSize, fontWeight, lineHeight } = getComputedStyle(element);
        return { fontFamily, fontSize, fontWeight, lineHeight };
      };
      return {
        label: font(root.querySelector('mds-button')!.shadowRoot!.querySelector('.text')!),
        expected: font(root.querySelector('mds-text')!),
      };
    };

    // every nested component is one more stylesheet in each declarative shadow root and one
    // more component to hydrate: mds-text was 13KB of every pre-rendered button (#831)
    it('is painted by the button itself, without a nested mds-text', async () => {
      const { root } = await render('<mds-button label="Save"></mds-button>');

      const label = root.shadowRoot!.querySelector('.text')!;
      expect(label.localName).toBe('span');
      expect(label).toHaveTextContent('Save');
      expect(root.shadowRoot!.querySelector('mds-text')).toBeNull();
    });

    it('keeps mds-text for the animated label, which is the one that scrambles it', async () => {
      const { root } = await render('<mds-button label="Save" animation="yugop"></mds-button>');

      expect(root.shadowRoot!.querySelector('mds-text')).toEqualAttribute('animation', 'yugop');
    });

    it.each([
      ['md', 'action'],
      ['lg', 'h6'],
      ['xl', 'h5'],
    ])('takes the typography of its size: %s is %s', async (size, typography) => {
      const { label, expected } = await fontsOf(
        `<mds-button size="${size}" label="Label"></mds-button>`,
        typography,
      );

      expect(label).toEqual(expected);
    });

    it('takes the action typography in medium weight at the small size', async () => {
      const { label, expected } = await fontsOf(
        '<mds-button size="sm" label="Label"></mds-button>',
        'action',
      );

      expect(label.fontSize).toBe(expected.fontSize);
      expect(label.lineHeight).toBe(expected.lineHeight);
      expect(label.fontWeight).toBe('500');
    });

    it('falls back to the md typography for an unknown size', async () => {
      const { label, expected } = await fontsOf(
        '<mds-button size="" label="Label"></mds-button>',
        'action',
      );

      expect(label).toEqual(expected);
    });

    it.each(['word', 'all'])(
      'keeps a long label on one line with truncate %s',
      async (truncate) => {
        const { root } = await render(
          `<div><mds-button label="Save"></mds-button><mds-button style="width: 160px" label="${LONG}" truncate="${truncate}"></mds-button></div>`,
        );
        const [short, long] = [...root.querySelectorAll('mds-button')];
        await vi.waitFor(() => expect(long).toHaveAttribute('hydrated'));

        expect(long.getBoundingClientRect().height).toBe(short.getBoundingClientRect().height);
        expect(long.getBoundingClientRect().width).toBe(160);
      },
    );

    it('wraps a long label onto more lines with truncate none', async () => {
      const { root } = await render(
        `<div><mds-button label="Save"></mds-button><mds-button style="width: 160px" label="${LONG}" truncate="none"></mds-button></div>`,
      );
      const [short, long] = [...root.querySelectorAll('mds-button')];
      await vi.waitFor(() => expect(long).toHaveAttribute('hydrated'));

      expect(long.getBoundingClientRect().height).toBeGreaterThan(
        short.getBoundingClientRect().height,
      );
    });

    // #799: a name or an identifier is shown as written, `rdsysadmin` not `Rdsysadmin`
    describe('the first letter', () => {
      const label = (button: Element): HTMLElement =>
        button.shadowRoot!.querySelector<HTMLElement>('.text')!;
      const firstLetter = (button: Element): string =>
        getComputedStyle(label(button), '::first-letter').textTransform;

      it('is uppercased by default, and kept as written with --mds-button-label-transform: none', async () => {
        const { root } = await render(
          `<div>
             <mds-button label="rdsysadmin"></mds-button>
             <mds-button label="rdsysadmin" style="--mds-button-label-transform: none"></mds-button>
           </div>`,
        );
        const [upper, asWritten] = [...root.querySelectorAll('mds-button')];
        await vi.waitFor(() => expect(asWritten).toHaveAttribute('hydrated'));

        expect(firstLetter(upper)).toBe('uppercase');
        expect(firstLetter(asWritten)).toBe('none');
        // rendered, not only computed: an r is narrower than an R
        expect(label(asWritten).offsetWidth).toBeLessThan(label(upper).offsetWidth);
      });

      it('takes the value from an ancestor, through the shadow root of mds-button-dropdown', async () => {
        const { root } = await render(
          `<div style="--mds-button-label-transform: none">
             <mds-button label="rdsysadmin"></mds-button>
             <mds-button-dropdown label="rdsysadmin"></mds-button-dropdown>
           </div>`,
        );
        const dropdown = root.querySelector('mds-button-dropdown')!;
        await vi.waitFor(() => expect(dropdown).toHaveAttribute('hydrated'));
        const primary = dropdown.shadowRoot!.querySelector('.dropdown-primary-action')!;

        expect(firstLetter(root.querySelector('mds-button')!)).toBe('none');
        expect(firstLetter(primary)).toBe('none');
      });
    });
  });

  describe('the awaiting state', () => {
    // the spinner was rendered in every button, awaiting or not: one more component to hydrate
    // and its stylesheet in each declarative shadow root (#831)
    it('renders no spinner until it awaits', async () => {
      const { root, waitForChanges } = await render('<mds-button label="Save"></mds-button>');

      expect(root.shadowRoot!.querySelector('mds-spinner')).toBeNull();

      (root as HTMLMdsButtonElement).await = true;
      await waitForChanges();

      expect(root.shadowRoot!.querySelector('mds-spinner')).toHaveAttribute('running');
    });

    it('keeps the spinner, stopped, while it slides out', async () => {
      const { root, waitForChanges } = await render('<mds-button label="Save" await></mds-button>');

      (root as HTMLMdsButtonElement).await = false;
      await waitForChanges();

      const spinner = root.shadowRoot!.querySelector('mds-spinner');
      expect(spinner).not.toBeNull();
      expect(spinner).not.toHaveAttribute('running');
    });

    it('keeps the box of a button that has no label', async () => {
      // the button with no label is a square, so letting the spinner in beside the icon
      // grew it in BOTH axes - 36 to 56 - and pushed the line it sits in
      const { root, waitForChanges } = await render(
        '<mds-button icon="mi/baseline/keyboard" title="Test"></mds-button>',
      );
      const before = await settledBox(root);

      (root as HTMLMdsButtonElement).await = true;
      await waitForChanges();
      const after = await settledBox(root);

      expect(after.width).toBe(before.width);
      expect(after.height).toBe(before.height);
    });

    it('puts the spinner where the icon was, on a button that has no label', async () => {
      const { root, waitForChanges } = await render(
        '<mds-button icon="mi/baseline/keyboard" title="Test"></mds-button>',
      );

      (root as HTMLMdsButtonElement).await = true;
      await waitForChanges();
      await settledBox(root);

      const icon = root.shadowRoot!.querySelector('.icon')!;
      expect(getComputedStyle(icon).display).toBe('none');
    });

    it('keeps the spinner inside the button at every size', async () => {
      // the small size scaled the spinner by scale(75) - 7500%, not 75% - which painted
      // it 1800px wide, off the button and over the page
      const { root, waitForChanges } = await render(
        '<mds-button size="sm" icon="mi/baseline/keyboard" title="Test"></mds-button>',
      );

      (root as HTMLMdsButtonElement).await = true;
      await waitForChanges();
      const button = await settledBox(root);
      const spinner = await settledBox(root.shadowRoot!.querySelector('.await')!);

      expect(spinner.width).toBeGreaterThan(0);
      expect(spinner.width).toBeLessThanOrEqual(button.width);
      expect(spinner.height).toBeLessThanOrEqual(button.height);
    });

    it('still makes room for the spinner when there is a label', async () => {
      // the room is the point of the animation: only the square case had to stop growing
      const { root, waitForChanges } = await render('<mds-button label="Salva"></mds-button>');
      const before = await settledBox(root);

      (root as HTMLMdsButtonElement).await = true;
      await waitForChanges();
      const after = await settledBox(root);

      expect(after.width).toBeGreaterThan(before.width);
      expect(after.height).toBe(before.height);
    });
  });

  describe('with the animation preference set to reduce', () => {
    // the class lives on the document, so it would outlive this file
    afterEach(() => {
      document.documentElement.classList.remove('pref-animation-reduce');
    });

    it('holds back its own transition, not only the ones on a private duration', async () => {
      // the preference sheets zero the private durations the base CSS reads, and the
      // host's own transition read --duration-200 straight: the button kept animating
      document.documentElement.classList.add('pref-animation-reduce');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const { root } = await render('<mds-button label="Salva"></mds-button>');

      expect(root).toHaveAttribute('pref-animation', 'reduce');
      expect(getComputedStyle(root).transitionDuration).toBe('1e-05s');
    });
  });

  // a custom element cannot be a submitter, so a click submitted the form without telling
  // the receiver which button it was (#849)
  describe('submitting a form, like a native submit button', () => {
    const composer = `<form>
      <input name="subject" value="Hello">
      <mds-button name="action" value="send" label="Send"></mds-button>
      <mds-button name="action" value="draft" label="Save as draft"></mds-button>
    </form>`;

    it('sends its name and value, so the receiver tells the buttons apart', async () => {
      const { root } = await render<HTMLFormElement>(composer);
      const submits = recordSubmits(root);
      const [send, draft] = Array.from(root.querySelectorAll('mds-button'));

      draft.click();
      send.click();

      expect(submits.map(({ data }) => data.getAll('action'))).toEqual([['draft'], ['send']]);
      expect(submits[0].data.get('subject')).toBe('Hello');
      expect(submits[0].submitter).toMatchObject({ name: 'action', value: 'draft' });
    });

    it('leaves its value out of the form data built without the submitter', async () => {
      const { root } = await render<HTMLFormElement>(composer);
      let data: FormData | undefined;
      root.addEventListener('submit', (event) => {
        event.preventDefault();
        data = new FormData(root);
      });

      root.querySelector('mds-button')!.click();

      expect(data!.get('subject')).toBe('Hello');
      expect(data!.has('action')).toBe(false);
    });

    it('sends no entry without a name, but still names a submitter', async () => {
      const { root } = await render<HTMLFormElement>(
        '<form><input name="subject" value="Hello"><mds-button value="send" label="Send"></mds-button></form>',
      );
      const submits = recordSubmits(root);

      root.querySelector('mds-button')!.click();

      expect(submits).toHaveLength(1);
      expect(submits[0].submitter).not.toBeNull();
      expect(Array.from(submits[0].data.keys())).toEqual(['subject']);
    });

    it('leaves nothing in the form, whether the submit goes through or is stopped', async () => {
      const { root } = await render<HTMLFormElement>(composer);
      const submits = recordSubmits(root);
      const send = root.querySelector('mds-button')!;

      send.click();
      root.querySelector('input')!.required = true;
      root.querySelector('input')!.value = '';
      send.click();

      expect(submits).toHaveLength(1);
      expect(root.querySelectorAll('button')).toHaveLength(0);
      expect(root.children).toHaveLength(3);
    });

    it('does not send its value when it resets the form', async () => {
      const { root } = await render<HTMLFormElement>(
        '<form><input name="subject" value="Hello"><mds-button type="reset" name="action" value="clear"></mds-button></form>',
      );
      const submits = recordSubmits(root);
      const input = root.querySelector('input')!;
      input.value = 'Changed';

      root.querySelector('mds-button')!.click();

      expect(submits).toHaveLength(0);
      expect(input.value).toBe('Hello');
    });

    // a disabled fieldset disables the form controls in it, a native button included: the
    // browser blocked the clicks, but the button did not look disabled
    it('neither submits nor takes the pointer in a disabled fieldset, until it is enabled', async () => {
      const { root } = await render<HTMLFormElement>(
        '<form><fieldset disabled><mds-button name="action" value="send" label="Send"></mds-button></fieldset></form>',
      );
      const submits = recordSubmits(root);
      const button = root.querySelector('mds-button')!;

      await userEvent.click(button, { force: true });
      await userEvent.click(button.shadowRoot!.querySelector('.text')!, { force: true });
      button.click();

      expect(submits).toHaveLength(0);
      expect(getComputedStyle(button).pointerEvents).toBe('none');

      root.querySelector('fieldset')!.disabled = false;
      await userEvent.click(button);

      expect(submits.map(({ data }) => data.get('action'))).toEqual(['send']);
    });
  });

  // the href used to be followed by a listener on the host, whatever the page decided (#806): a
  // client-side router could not cancel the click, a modifier click landed in the same tab and
  // the context menu had no link in it
  describe('as a link, when href is set', () => {
    // the host follows a click of its own on the next task: wait past it to see nothing happen
    const settle = () => new Promise((resolve) => setTimeout(resolve, 50));
    const link = (attributes = '') =>
      render<HTMLMdsButtonElement>(
        `<mds-button href="#elsewhere" label="Elsewhere" ${attributes}></mds-button>`,
      );

    afterEach(() => {
      // the links are fragments, so the page stays: leave its URL as it was found
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    });

    it('renders a real anchor to the URL, hidden behind the host that keeps the focus and the name', async () => {
      const { root } = await link();
      const anchor = root.shadowRoot!.querySelector('a')!;

      expect(anchor).toEqualAttributes({
        href: '#elsewhere',
        'aria-hidden': 'true',
        tabindex: '-1',
      });
      expect(anchor).not.toHaveAttribute('target');
      expect(root).toEqualAttribute('role', 'link');
    });

    it('opens in a new tab through the anchor when target is blank', async () => {
      const { root } = await link('target="blank"');

      expect(root.shadowRoot!.querySelector('a')).toEqualAttribute('target', '_blank');
    });

    it('renders no anchor and stays a button without href', async () => {
      const { root } = await render('<mds-button label="Elsewhere"></mds-button>');

      expect(root.shadowRoot!.querySelector('a')).toBeNull();
      expect(root).toEqualAttribute('role', 'button');
    });

    it('puts the anchor under the pointer, over the whole button', async () => {
      const { root } = await link();
      const anchor = root.shadowRoot!.querySelector('a')!;
      const { left, top, width, height } = root.getBoundingClientRect();

      // the corners are rounded: look a quarter in, and at the middle
      [0.25, 0.5, 0.75].forEach((fraction) => {
        const hit = root.shadowRoot!.elementFromPoint(
          left + width * fraction,
          top + height * fraction,
        );
        expect(hit).toBe(anchor);
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

    it('leaves a modifier click to the browser, which opens the link elsewhere', async () => {
      const { root } = await link();
      const anchor = root.shadowRoot!.querySelector('a')!;
      // a real Ctrl-click opens a tab the test runner cannot have: the document stands in for the
      // browser, which gets the click uncancelled and takes it from there. A trusted click is
      // cancelable; a synthetic one has to say so, or preventDefault() is a no-op
      let cancelled: boolean | undefined;
      document.addEventListener(
        'click',
        (event) => {
          cancelled = event.defaultPrevented;
          event.preventDefault();
        },
        { once: true },
      );

      const open = vi.spyOn(window, 'open').mockImplementation(() => null);
      anchor.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, ctrlKey: true }),
      );
      await settle();

      expect(open).not.toHaveBeenCalled();
      expect(cancelled).toBe(false);
      expect(window.location.hash).toBe('');
    });

    it('follows the link on Enter from the keyboard', async () => {
      const { root } = await link();

      root.focus();
      await userEvent.keyboard('{Enter}');

      await vi.waitFor(() => expect(window.location.hash).toBe('#elsewhere'));
    });

    // the click of a script, or of an assistive technology activating the host
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

    it('opens a new tab from a script for target blank, and for a modifier click', async () => {
      const open = vi.spyOn(window, 'open').mockImplementation(() => null);
      const { root } = await link('target="blank"');

      root.click();

      await vi.waitFor(() => expect(open).toHaveBeenCalledWith('#elsewhere', '_blank'));

      const plain = await link();
      plain.root.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
      );

      await vi.waitFor(() => expect(open).toHaveBeenCalledTimes(2));
      expect(window.location.hash).toBe('');
    });

    it('does not follow the link while disabled', async () => {
      const { root } = await link('disabled');

      root.click();
      await settle();

      expect(window.location.hash).toBe('');
    });

    it('is the only tab stop: the anchor hands back the focus it gets', async () => {
      const { root } = await link();

      root.shadowRoot!.querySelector('a')!.focus();

      expect(document.activeElement).toBe(root);
      expect(root.shadowRoot!.activeElement).toBeNull();
    });

    it('becomes a link when href is set later, and a button again when it is removed', async () => {
      const { root, waitForChanges } = await render<HTMLMdsButtonElement>(
        '<mds-button label="Elsewhere"></mds-button>',
      );

      root.href = '#elsewhere';
      await waitForChanges();

      expect(root).toEqualAttribute('role', 'link');
      expect(root.shadowRoot!.querySelector('a')).toEqualAttribute('href', '#elsewhere');

      root.href = undefined;
      await waitForChanges();

      expect(root).toEqualAttribute('role', 'button');
      expect(root.shadowRoot!.querySelector('a')).toBeNull();
    });

    it('leaves a role set by the caller alone', async () => {
      const { root, waitForChanges } = await render<HTMLMdsButtonElement>(
        '<mds-button role="tab" label="Elsewhere"></mds-button>',
      );

      root.href = '#elsewhere';
      await waitForChanges();

      expect(root).toEqualAttribute('role', 'tab');
    });
  });

  // the router of a single-page app registers once through NavigationService and takes the
  // links over, with no click listener on every button (#806)
  describe('as a link, with a router registered through NavigationService', () => {
    // the host follows a click of its own on the next task: wait past it to see nothing happen
    const settle = () => new Promise((resolve) => setTimeout(resolve, 50));
    const link = (attributes = '') =>
      render<HTMLMdsButtonElement>(
        `<mds-button href="#elsewhere" label="Elsewhere" ${attributes}></mds-button>`,
      );
    // a synthetic click has to be cancelable, as a trusted one is, or preventDefault() is a no-op
    const click = (init: MouseEventInit = {}) =>
      new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, ...init });

    afterEach(() => {
      NavigationService.setHandler(undefined);
      // the links are fragments, so the page stays: leave its URL as it was found
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
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

    it('hands the keyboard and a script to the router too', async () => {
      const router = vi.fn();
      NavigationService.setHandler(router);
      const { root } = await link();

      root.focus();
      await userEvent.keyboard('{Enter}');
      await vi.waitFor(() => expect(router).toHaveBeenCalledTimes(1));

      root.click();
      await vi.waitFor(() => expect(router).toHaveBeenCalledTimes(2));
      await settle();

      expect(router).toHaveBeenLastCalledWith('#elsewhere', expect.any(MouseEvent));
      expect(window.location.hash).toBe('');
    });

    it('leaves a modifier click, another origin and a target blank to the browser', async () => {
      const router = vi.fn();
      NavigationService.setHandler(router);
      const open = vi.spyOn(window, 'open').mockImplementation(() => null);
      // a real Ctrl-click opens a tab the test runner cannot have, a link to another origin
      // would take the page away: the document stands in for the browser, which gets the click
      // uncancelled and takes it from there
      const cancelled: boolean[] = [];
      const browser = (event: MouseEvent) => {
        cancelled.push(event.defaultPrevented);
        event.preventDefault();
      };

      const { root } = await link();
      document.addEventListener('click', browser, { once: true });
      root.shadowRoot!.querySelector('a')!.dispatchEvent(click({ ctrlKey: true }));

      const external = await render<HTMLMdsButtonElement>(
        '<mds-button href="https://example.com/" label="Elsewhere"></mds-button>',
      );
      document.addEventListener('click', browser, { once: true });
      external.root.shadowRoot!.querySelector('a')!.dispatchEvent(click());

      const blank = await link('target="blank"');
      blank.root.click();
      await vi.waitFor(() => expect(open).toHaveBeenCalledWith('#elsewhere', '_blank'));
      await settle();

      expect(router).not.toHaveBeenCalled();
      expect(cancelled).toEqual([false, false]);
      expect(window.location.hash).toBe('');
    });

    it('removes the router with the function setHandler returns', async () => {
      const router = vi.fn();
      const remove = NavigationService.setHandler(router);
      const { root } = await link();
      remove();

      await userEvent.click(root);

      await vi.waitFor(() => expect(window.location.hash).toBe('#elsewhere'));
      expect(router).not.toHaveBeenCalled();
    });
  });

  itReadsTheSlottedLabelWhenLabelIsNull('mds-button');

  // #913: past half its height the browser clamps the radius; where corner-shape cannot be
  // drawn, the fallback block of corner.css lowers --magma-corner-cap to the round look-alike
  describe('the radius', () => {
    const radii = (root: HTMLElement): string[] =>
      Array.from(root.querySelectorAll('mds-button')).map(
        (button) => getComputedStyle(button).borderTopLeftRadius,
      );

    it('stops at half the height, what the browser clamps to', async () => {
      const { root } = await render('<mds-button label="Medium"></mds-button>');

      expect(getComputedStyle(root).borderTopLeftRadius).toBe('18px');
    });

    it('takes the part of the height of each size that --magma-corner-cap gives', async () => {
      const { root } = await render(
        `<div style="--magma-corner-cap: 0.25">
           <mds-button size="sm" label="sm"></mds-button>
           <mds-button size="md" label="md"></mds-button>
           <mds-button size="lg" label="lg"></mds-button>
           <mds-button size="xl" label="xl"></mds-button>
         </div>`,
      );

      expect(radii(root)).toEqual(['7px', '9px', '12px', '13px']);
    });

    it('keeps a radius set from outside', async () => {
      const { root } = await render(
        '<div style="--magma-corner-cap: 0.25"><mds-button label="Square" style="--mds-button-radius: 4px"></mds-button></div>',
      );

      expect(radii(root)).toEqual(['4px']);
    });
  });

  // #923: an mds-tooltip with relation="label" names an icon-only button, and the name taken
  // from the icon slug would stack a native tooltip on top of it
  describe('an icon-only button named by another element', () => {
    it('takes no name from the icon slug when it has aria-labelledby', async () => {
      mockIconFetch();
      const { root } = await render(
        '<mds-button icon="mdi/alien" aria-labelledby="name"></mds-button><span id="name">Alien</span>',
      );

      expect(root).not.toHaveAttribute('title');
      expect(root).not.toHaveAttribute('aria-label');
    });

    it('drops the name from the icon slug when aria-labelledby comes later, and takes it back', async () => {
      mockIconFetch();
      const { root, waitForChanges } = await render('<mds-button icon="mdi/alien"></mds-button>');
      expect(root).toEqualAttribute('title', 'alien');

      root.setAttribute('aria-labelledby', 'name');
      await waitForChanges();
      expect(root).not.toHaveAttribute('title');

      root.removeAttribute('aria-labelledby');
      await waitForChanges();
      expect(root).toEqualAttribute('title', 'alien');
    });

    it('keeps a title the author wrote', async () => {
      mockIconFetch();
      const { root, waitForChanges } = await render(
        '<mds-button icon="mdi/alien" title="Alieno"></mds-button>',
      );

      root.setAttribute('aria-labelledby', 'name');
      await waitForChanges();

      expect(root).toEqualAttribute('title', 'Alieno');
    });
  });

  // #937: an icon given as markup used to skip the role, labelled or not
  describe('with an icon given as markup', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';

    it('takes the button role when it has a label', async () => {
      const { root } = await render(`<mds-button icon='${svg}' label="Disegna"></mds-button>`);

      expect(root).toEqualAttribute('role', 'button');
    });

    it('takes the button role and no name from the icon when it has none', async () => {
      const { root } = await render(`<mds-button icon='${svg}' aria-label="Disegna"></mds-button>`);

      expect(root).toEqualAttributes({ role: 'button', 'aria-label': 'Disegna' });
      expect(root).not.toHaveAttribute('title');
    });
  });

  // Angular and Vue bind null for a missing value
  describe('with null properties', () => {
    afterEach(() => {
      document.querySelectorAll('body > form, body > mds-button').forEach((el) => el.remove());
    });

    it('submits its form when href is null', async () => {
      const open = vi.spyOn(window, 'open').mockImplementation(() => null);
      const form = document.createElement('form');
      const submit = vi.fn((event: Event) => event.preventDefault());
      form.addEventListener('submit', submit);
      document.body.appendChild(form);
      const button = await mountButton((el) => {
        (el as { href?: string | null }).href = null;
        // with a link the button would open a new tab instead of submitting
        el.target = 'blank';
        el.textContent = 'Send';
      }, form);

      button.click();

      await vi.waitFor(() => expect(submit).toHaveBeenCalledOnce());
      expect(open).not.toHaveBeenCalled();
    });

    it('sends no "null" to its form when name or value is null', async () => {
      const form = document.createElement('form');
      const submits = recordSubmits(form);
      document.body.appendChild(form);
      const unnamed = await mountButton((el) => {
        (el as { name?: string | null }).name = null;
        el.value = 'send';
      }, form);
      const valueless = await mountButton((el) => {
        el.name = 'action';
        (el as { value?: string | null }).value = null;
      }, form);

      unnamed.click();
      valueless.click();

      expect(Array.from(submits[0].data.keys())).toEqual([]);
      // a native submit button without a value sends an empty one
      expect(submits[1].data.getAll('action')).toEqual(['']);
    });

    it('names an icon-only button when label is null', async () => {
      mockIconFetch();
      const button = await mountButton((el) => {
        (el as { label?: string | null }).label = null;
        el.icon = 'mdi/alien';
      });

      expect(button.getAttribute('title') ?? button.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('notification slot', () => {
    it('renders the notification slotted after the first render', async () => {
      const { root, waitForChanges } = await render('<mds-button label="Label"></mds-button>');

      root.appendChild(createSlottedChild('notification', 'span'));
      await waitForChanges();

      const slot = root.shadowRoot!.querySelector('slot[name="notification"]') as HTMLSlotElement;
      expect(slot).not.toBeNull();
      expect(slot.assignedElements()).toHaveLength(1);
    });
  });

  // the keyboard clicks the button as the pointer does: a re-enabled button had lost Enter, an
  // awaiting one took it and submitted again, and Space did nothing (#820)
  describe('the keyboard', () => {
    const recordClicks = (button: HTMLElement): Event[] => {
      const clicks: Event[] = [];
      button.addEventListener('click', (event) => clicks.push(event));
      return clicks;
    };

    it('clicks on Enter, and on Space when it is released, as a native button does', async () => {
      const { root } = await render('<mds-button label="Save"></mds-button>');
      const clicks = recordClicks(root);
      root.focus();

      await userEvent.keyboard('{Enter}');
      expect(clicks).toHaveLength(1);

      await userEvent.keyboard('{Space>}');
      expect(clicks).toHaveLength(1);
      await userEvent.keyboard('{/Space}');
      expect(clicks).toHaveLength(2);
    });

    it('keeps the page from scrolling while Space is held', async () => {
      const { root } = await render('<mds-button label="Save"></mds-button>');
      const press = new KeyboardEvent('keydown', { code: 'Space', key: ' ', cancelable: true });

      root.dispatchEvent(press);

      expect(press.defaultPrevented).toBe(true);
    });

    it('follows a link on Enter only: Space is not a key of links', async () => {
      const { root } = await render(
        '<mds-button href="#elsewhere" label="Elsewhere"></mds-button>',
      );
      const clicks = recordClicks(root);
      root.addEventListener('click', (event) => event.preventDefault());
      root.focus();

      await userEvent.keyboard('{Space}');
      expect(clicks).toHaveLength(0);

      await userEvent.keyboard('{Enter}');
      expect(clicks).toHaveLength(1);
    });

    it('clicks on Enter and Space again once it is enabled after being disabled', async () => {
      const { root, waitForChanges } = await render<HTMLMdsButtonElement>(
        '<mds-button label="Save"></mds-button>',
      );
      const clicks = recordClicks(root);

      root.disabled = true;
      await waitForChanges();
      root.disabled = false;
      await waitForChanges();
      root.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('{Space}');

      expect(clicks).toHaveLength(2);
    });

    it('does not submit its form again while it awaits, from the keyboard or a script', async () => {
      const { root: form, waitForChanges } = await render<HTMLFormElement>(
        '<form><mds-button type="submit" name="action" value="send" label="Send"></mds-button></form>',
      );
      const submits = recordSubmits(form);
      const button = form.querySelector('mds-button')!;
      button.focus();

      await userEvent.keyboard('{Enter}');
      button.await = true;
      await waitForChanges();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('{Space}');
      button.click();

      expect(submits).toHaveLength(1);
      expect(form.ownerDocument.activeElement).toBe(button);

      button.await = false;
      await waitForChanges();
      await userEvent.keyboard('{Enter}');

      expect(submits).toHaveLength(2);
    });

    it('starts awaiting at load without taking Enter, and takes it when it stops', async () => {
      const { root, waitForChanges } = await render<HTMLMdsButtonElement>(
        '<mds-button label="Save" await></mds-button>',
      );
      const clicks = recordClicks(root);
      root.focus();

      await userEvent.keyboard('{Enter}');
      expect(clicks).toHaveLength(0);

      root.await = false;
      await waitForChanges();
      await userEvent.keyboard('{Enter}');
      expect(clicks).toHaveLength(1);
    });

    // a move disconnects the button and connects it again, without a new load
    it('still clicks on Enter after it is moved in the page', async () => {
      const { root } = await render('<div><mds-button label="Save"></mds-button><p></p></div>');
      const button = root.querySelector('mds-button')!;
      const clicks = recordClicks(button);

      root.querySelector('p')!.appendChild(button);
      button.focus();
      await userEvent.keyboard('{Enter}');

      expect(clicks).toHaveLength(1);
    });
  });

  // every declarative shadow root carries the whole stylesheet of its component, and a block
  // larger than the 32KB window of gzip does not compress against its repeats: a page of 257
  // buttons pre-rendered to 14MB of HTML, 97% of it CSS (#831)
  describe('server-side rendering', () => {
    const button = '<mds-button label="Item" variant="dark" tone="text"></mds-button>';

    it('pre-renders no spinner when it does not await', async () => {
      const markup = await renderToString(button);

      expect(markup).not.toContain('<mds-spinner');
    });

    // the prefixes Stencil added for iOS 9 and IE 11 (scripts/postcss-autoprefix.ts)
    it('pre-renders no prefix that only an unsupported browser reads', async () => {
      const markup = await renderToString(button);

      expect(markup).not.toMatch(/-webkit-(box-shadow|transition|transform)|-ms-/);
    });

    // 52KB before #831, 22KB after: the ceiling leaves 2KB of room and fails on one more
    // nested component or on a variant x tone matrix written out again
    it('pre-renders well inside the window of gzip', async () => {
      const markup = await renderToString(button);

      expect(markup.length).toBeLessThan(24 * 1024);
    });
  });
});
