import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';
import { createSlottedChild, itReadsTheSlottedLabelWhenLabelIsNull } from '@test/slot';

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

  it('falls back to the md typography for an unknown size', async () => {
    const { root } = await render('<mds-button size="">Label</mds-button>');

    const text = root.shadowRoot!.querySelector('mds-text');
    expect(text).toEqualAttribute('typography', 'action');
  });

  describe('the awaiting state', () => {
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

  itReadsTheSlottedLabelWhenLabelIsNull('mds-button');

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
});
