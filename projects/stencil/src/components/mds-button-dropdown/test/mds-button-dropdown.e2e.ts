import { render } from '@stencil/vitest';

/**
 * Records each submit of `form` as the receiver gets it: the form data built with the
 * submitter, which is what the browser sends.
 */
const recordSubmits = (form: HTMLFormElement): FormData[] => {
  const submits: FormData[] = [];
  form.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault();
    submits.push(new FormData(form, event.submitter));
  });
  return submits;
};

const primaryAction = (dropdown: Element): HTMLElement =>
  dropdown.shadowRoot!.querySelector<HTMLElement>('.dropdown-primary-action')!;

const chevron = (dropdown: Element): HTMLElement =>
  dropdown.shadowRoot!.querySelector<HTMLElement>('.dropdown-action')!;

describe('mds-button-dropdown', () => {
  it('renders', async () => {
    const { root } = await render('<mds-button-dropdown></mds-button-dropdown>');

    expect(root).toHaveAttribute('hydrated');
  });

  // a native click on the host also comes from the menu items, whose clicks bubble to it: the
  // primary action could only be told apart by its target, which nothing documented (#849)
  describe('mdsButtonDropdownClick', () => {
    const toolbar = `<mds-button-dropdown label="Save">
      <mds-button label="Save as copy"></mds-button>
    </mds-button-dropdown>`;

    const recordClicks = (dropdown: Element): Event[] => {
      const clicks: Event[] = [];
      dropdown.addEventListener('mdsButtonDropdownClick', (event) => clicks.push(event));
      return clicks;
    };

    it('comes from the primary action only, not the chevron or the menu items', async () => {
      const { root } = await render<HTMLElement>(toolbar);
      const clicks = recordClicks(root);

      primaryAction(root).click();
      chevron(root).click();
      root.querySelector('mds-button')!.click();

      expect(clicks).toHaveLength(1);
      expect(clicks[0].target).toBe(root);
    });

    it('comes from the keyboard too', async () => {
      const { root } = await render<HTMLElement>(toolbar);
      const clicks = recordClicks(root);

      primaryAction(root).dispatchEvent(
        new KeyboardEvent('keydown', { code: 'Enter', bubbles: true, composed: true }),
      );

      expect(clicks).toHaveLength(1);
    });

    it('is not emitted while disabled or awaiting', async () => {
      const { root, waitForChanges } = await render<HTMLMdsButtonDropdownElement>(toolbar);
      const clicks = recordClicks(root);

      root.disabled = true;
      await waitForChanges();
      primaryAction(root).click();
      root.disabled = false;
      root.await = true;
      await waitForChanges();
      primaryAction(root).click();

      expect(clicks).toHaveLength(0);
    });
  });

  // the primary action lived in the shadow root, with no form: it never submitted (#849)
  describe('in a form', () => {
    // the mail composer of #849: one form, three actions the receiver tells apart
    const composer = `<form>
      <input name="subject" value="Hello">
      <mds-button-dropdown type="submit" name="action" value="send" label="Send">
        <mds-button name="action" value="draft" label="Save as draft"></mds-button>
        <mds-button name="action" value="schedule" label="Schedule send"></mds-button>
      </mds-button-dropdown>
    </form>`;

    it('sends the name and value of the action chosen, the primary or a menu item', async () => {
      const { root } = await render<HTMLFormElement>(composer);
      const submits = recordSubmits(root);
      const dropdown = root.querySelector('mds-button-dropdown')!;
      const [draft, schedule] = Array.from(dropdown.querySelectorAll('mds-button'));

      primaryAction(dropdown).click();
      draft.click();
      schedule.click();

      expect(submits.map((data) => data.getAll('action'))).toEqual([
        ['send'],
        ['draft'],
        ['schedule'],
      ]);
      expect(submits[0].get('subject')).toBe('Hello');
    });

    it('never submits from the chevron', async () => {
      const { root } = await render<HTMLFormElement>(composer);
      const submits = recordSubmits(root);

      chevron(root.querySelector('mds-button-dropdown')!).click();

      expect(submits).toHaveLength(0);
    });

    it('does not submit without type="submit", unlike mds-button', async () => {
      // it never submitted before #849: a dropdown already in a form must not start to
      const { root } = await render<HTMLFormElement>(
        '<form><mds-button-dropdown name="action" value="send" label="Send"></mds-button-dropdown></form>',
      );
      const submits = recordSubmits(root);

      primaryAction(root.querySelector('mds-button-dropdown')!).click();

      expect(submits).toHaveLength(0);
    });

    it('resets the form with type="reset"', async () => {
      const { root } = await render<HTMLFormElement>(
        '<form><input name="subject" value="Hello"><mds-button-dropdown type="reset" label="Clear"></mds-button-dropdown></form>',
      );
      const submits = recordSubmits(root);
      const input = root.querySelector('input')!;
      input.value = 'Changed';

      primaryAction(root.querySelector('mds-button-dropdown')!).click();

      expect(input.value).toBe('Hello');
      expect(submits).toHaveLength(0);
    });

    it('submits the form named by its form attribute', async () => {
      const { root } = await render<HTMLElement>(
        '<div><form id="mail"></form><mds-button-dropdown form="mail" type="submit" name="action" value="send"></mds-button-dropdown></div>',
      );
      const submits = recordSubmits(root.querySelector('form')!);

      primaryAction(root.querySelector('mds-button-dropdown')!).click();

      expect(submits.map((data) => data.get('action'))).toEqual(['send']);
    });

    it('does not submit while disabled or awaiting', async () => {
      const { root, waitForChanges } = await render<HTMLFormElement>(composer);
      const submits = recordSubmits(root);
      const dropdown = root.querySelector('mds-button-dropdown')!;

      dropdown.disabled = true;
      await waitForChanges();
      primaryAction(dropdown).click();
      dropdown.disabled = false;
      dropdown.await = true;
      await waitForChanges();
      primaryAction(dropdown).click();

      expect(submits).toHaveLength(0);
    });

    it('leaves a link to navigate instead of submitting', async () => {
      const { root } = await render<HTMLFormElement>(
        '<form><mds-button-dropdown type="submit" href="#elsewhere" name="action" value="send"></mds-button-dropdown></form>',
      );
      const submits = recordSubmits(root);

      primaryAction(root.querySelector('mds-button-dropdown')!).click();

      expect(submits).toHaveLength(0);
      expect(window.location.hash).toBe('#elsewhere');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  });
});
