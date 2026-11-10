import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';
import { useLanguage } from '@test/language';
import { userEvent } from 'vitest/browser';

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

    // a disabled fieldset disables the host, but not the buttons in its shadow root, which
    // the primary action is clicked through
    it('neither submits nor emits in a disabled fieldset, until it is enabled', async () => {
      const { root, waitForChanges } = await render<HTMLFormElement>(
        '<form><fieldset disabled><mds-button-dropdown type="submit" name="action" value="send" label="Send"></mds-button-dropdown></fieldset></form>',
      );
      const submits = recordSubmits(root);
      const dropdown = root.querySelector('mds-button-dropdown')!;
      const clicks: Event[] = [];
      dropdown.addEventListener('mdsButtonDropdownClick', (event) => clicks.push(event));
      await waitForChanges();

      await userEvent.click(primaryAction(dropdown), { force: true });
      primaryAction(dropdown).click();

      expect(submits).toHaveLength(0);
      expect(clicks).toHaveLength(0);
      expect(primaryAction(dropdown)).toHaveAttribute('disabled');
      expect(chevron(dropdown)).toHaveAttribute('disabled');

      root.querySelector('fieldset')!.disabled = false;
      await waitForChanges();
      await userEvent.click(primaryAction(dropdown));

      expect(submits.map((data) => data.get('action'))).toEqual(['send']);
      expect(clicks).toHaveLength(1);
    });

    it('leaves a link to navigate instead of submitting', async () => {
      const { root } = await render<HTMLFormElement>(
        '<form><mds-button-dropdown type="submit" href="#elsewhere" name="action" value="send"></mds-button-dropdown></form>',
      );
      const submits = recordSubmits(root);

      primaryAction(root.querySelector('mds-button-dropdown')!).click();

      // a click from a script is followed once every listener had its say
      await vi.waitFor(() => expect(window.location.hash).toBe('#elsewhere'));
      expect(submits).toHaveLength(0);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  });
});

// #937: the chevron is an icon-only button, and with its role mds-dropdown can wire it
describe('mds-button-dropdown chevron', () => {
  useLanguage('it');

  it('is a button named in the current language, that says it opens the menu', async () => {
    const { root } = await render(
      '<mds-button-dropdown label="Salva"><mds-button label="Salva come"></mds-button></mds-button-dropdown>',
    );
    const chevron = root.shadowRoot!.querySelector('.dropdown-action')!;

    expect(chevron).toEqualAttributes({ role: 'button', 'aria-label': 'Altre azioni' });
    await vi.waitFor(() => {
      expect(chevron).toEqualAttribute('aria-expanded', 'false');
    });
  });
});

describe('mds-button-dropdown truncate', () => {
  it('reaches the label of the primary action', async () => {
    const { root } = await render(
      '<mds-button-dropdown label="Salva" truncate="none"><mds-button label="Salva come"></mds-button></mds-button-dropdown>',
    );

    expect(
      root.shadowRoot!.querySelector<HTMLMdsButtonElement>('.dropdown-primary-action')!.truncate,
    ).toBe('none');
  });
});

// actions/stacked (#1189) stretches every labelled action of a row: the host gives the width to
// its main action and keeps the chevron at its own size at the end, with none of its fill past
// them; at its own width nothing moves (#1313)
describe('mds-button-dropdown stretched', () => {
  const splitButton = (style = '') =>
    `<mds-button-dropdown label="Scarica" style="${style}"><mds-button label="Scarica come CSS"></mds-button></mds-button-dropdown>`;

  const box = (element: Element): DOMRect => element.getBoundingClientRect();

  const hydrated = (root: Element) =>
    vi.waitFor(() => {
      for (const component of root.querySelectorAll('mds-button-dropdown, :scope > mds-button')) {
        expect(component).toHaveAttribute('hydrated');
      }
      for (const dropdown of root.querySelectorAll('mds-button-dropdown')) {
        expect(primaryAction(dropdown)).toHaveAttribute('hydrated');
        expect(chevron(dropdown)).toHaveAttribute('hydrated');
      }
    });

  it('keeps its own width where nothing stretches it, its main action as wide as a button', async () => {
    const { root } = await render<HTMLElement>(
      `<div>${splitButton()}<mds-button label="Scarica"></mds-button></div>`,
    );
    await hydrated(root);
    const dropdown = root.querySelector('mds-button-dropdown')!;
    const button = root.querySelector(':scope > mds-button')!;

    expect(box(primaryAction(dropdown)).width).toBeCloseTo(box(button).width, 0);
    expect(box(dropdown).width).toBeCloseTo(
      box(primaryAction(dropdown)).width + box(chevron(dropdown)).width,
      0,
    );
  });

  // the three ways the rows of Magma stretch an action: mds-card-footer and mds-status-bar, a
  // product's own row, mds-banner
  it.each([
    ['align-self in a column', 'display: flex; flex-direction: column', 'align-self: stretch'],
    ['a width', '', 'width: 100%'],
    ['a flex-basis in a row that wraps', 'display: flex; flex-wrap: wrap', 'flex-basis: 100%'],
  ])('spreads its main action across the width it gets from %s', async (_, row, stretch) => {
    const { root } = await render<HTMLElement>(
      `<div><div style="width: 20rem; ${row}">${splitButton(stretch)}</div>${splitButton()}</div>`,
    );
    await hydrated(root);
    const [stretched, intrinsic] = Array.from(root.querySelectorAll('mds-button-dropdown'));
    const host = box(stretched);
    const primary = box(primaryAction(stretched));
    const arrow = box(chevron(stretched));
    const label = box(primaryAction(stretched).shadowRoot!.querySelector('[part="label"]')!);

    expect(host.width).toBeCloseTo(box(stretched.parentElement!).width, 0);
    expect(primary.left).toBeCloseTo(host.left, 0);
    expect(arrow.left).toBeCloseTo(primary.right, 0);
    expect(arrow.right).toBeCloseTo(host.right, 0);
    expect(arrow.width).toBeCloseTo(box(chevron(intrinsic)).width, 0);
    // the label stays in the middle of the main action, as in a stretched mds-button
    expect(label.left + label.width / 2).toBeCloseTo(primary.left + primary.width / 2, 0);
  });

  // the footer of a card under 380px stacks its row and stretches every action: the main action
  // takes the width from the start, the chevron stays on its right, at the end of the row; a
  // lone split button keeps its own width there (#1250), so it stands beside another action
  it('keeps the chevron at the end of the stacked row of a narrow mds-card-footer', async () => {
    const { root } = await render<HTMLElement>(
      `<mds-card style="width: 20rem"><mds-card-footer><mds-button variant="dark" tone="outline" label="Anteprima"></mds-button><mds-button-dropdown label="Scarica" icon="mi/baseline/download"><mds-button label="Scarica come SVG"></mds-button></mds-button-dropdown></mds-card-footer></mds-card>`,
    );
    await hydrated(root);
    const dropdown = root.querySelector('mds-button-dropdown')!;
    const action = box(root.querySelector('mds-card-footer > mds-button')!);
    const primary = box(primaryAction(dropdown));
    const arrow = box(chevron(dropdown));

    expect(box(root.querySelector('mds-card-footer')!).width).toBeLessThan(380);
    expect(box(dropdown).width).toBeCloseTo(action.width, 0);
    expect(primary.left).toBeCloseTo(action.left, 0);
    expect(arrow.left).toBeCloseTo(primary.right, 0);
    expect(arrow.right).toBeCloseTo(action.right, 0);
    expect(primary.width).toBeGreaterThan(arrow.width);
  });
});

// the outer corners of the two buttons are the corners of the host, the radius they had on their
// own; mds-button-group flattens them on the host, which ::slotted reaches (#1340)
describe('mds-button-dropdown corners', () => {
  const radii = (element: Element): number[] => {
    const style = getComputedStyle(element);
    return [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius,
    ].map((value) => parseFloat(value) || 0);
  };

  it('rounds the outer corners of its two buttons as its host, the inner ones flat', async () => {
    const { root } = await render<HTMLElement>(
      '<mds-button-dropdown label="Scarica"><mds-button label="Scarica come CSS"></mds-button></mds-button-dropdown>',
    );
    await vi.waitFor(() => {
      expect(primaryAction(root)).toHaveAttribute('hydrated');
      expect(chevron(root)).toHaveAttribute('hydrated');
    });
    const [radius] = radii(root);

    expect(radius).toBeGreaterThan(0);
    expect(radii(primaryAction(root))).toEqual([radius, 0, 0, radius]);
    expect(radii(chevron(root))).toEqual([0, radius, radius, 0]);
  });
});

describe('mds-button-dropdown chevron and primary action', () => {
  const menu = (dropdown: Element): HTMLMdsDropdownElement =>
    dropdown.shadowRoot!.querySelector<HTMLMdsDropdownElement>('mds-dropdown')!;

  // #797: the chevron toggles the menu, it no longer stays open until Escape or a click outside
  it('opens the menu on a click of the chevron, and closes it on the next one', async () => {
    const { root, waitForChanges } = await render(
      '<mds-button-dropdown label="Tenant"><mds-button label="Other tenant"></mds-button></mds-button-dropdown>',
    );
    await vi.waitFor(() => {
      expect(chevron(root)).toEqualAttribute('aria-expanded', 'false');
    });

    await userEvent.click(chevron(root));
    await waitForChanges();
    expect(menu(root).visible).toBe(true);

    await userEvent.click(chevron(root));
    await waitForChanges();
    expect(menu(root).visible).toBe(false);
  });

  // #798: href and target belong to the primary action; on the chevron they made it navigate
  it('gives the link to the primary action only, so the chevron opens the menu', async () => {
    const { root, waitForChanges } = await render(
      '<mds-button-dropdown label="Open" href="#elsewhere" target="blank"><mds-button label="Other"></mds-button></mds-button-dropdown>',
    );
    const primary = primaryAction(root) as HTMLMdsButtonElement;
    const arrow = chevron(root) as HTMLMdsButtonElement;

    expect(primary.href).toBe('#elsewhere');
    expect(primary.target).toBe('blank');
    expect(arrow.href).toBeUndefined();
    expect(arrow).toEqualAttribute('role', 'button');

    await userEvent.click(arrow);
    await waitForChanges();
    expect(menu(root).visible).toBe(true);
    expect(window.location.hash).toBe('');
  });

  it('focuses the primary action with autoFocus, not the chevron', async () => {
    const { root } = await render(
      '<mds-button-dropdown label="Open" auto-focus></mds-button-dropdown>',
    );

    await vi.waitFor(() => {
      expect(root.shadowRoot!.activeElement).toBe(primaryAction(root));
    });
  });
});

// the primary action that leads to the view you are in (#1264)
describe('mds-button-dropdown current', () => {
  const menu = (dropdown: Element): HTMLMdsDropdownElement =>
    dropdown.shadowRoot!.querySelector<HTMLMdsDropdownElement>('mds-dropdown')!;
  const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

  afterEach(() => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  });

  it('announces the primary action only; the chevron takes the look and keeps opening the menu', async () => {
    const { root, waitForChanges } = await render(
      '<mds-button-dropdown label="Records" href="#records" current><mds-button label="Archive"></mds-button></mds-button-dropdown>',
    );
    const primary = primaryAction(root);
    const arrow = chevron(root);
    await vi.waitFor(() => expect(primary).toEqualAttribute('aria-current', 'page'));

    expect(arrow).toEqualAttribute('aria-current', 'false');
    expect(arrow).toHaveAttribute('current');

    await userEvent.click(arrow);
    await waitForChanges();
    expect(menu(root).visible).toBe(true);
  });

  it('neither navigates nor emits from the view you are in', async () => {
    const { root } = await render(
      '<mds-button-dropdown label="Records" href="#records" current></mds-button-dropdown>',
    );
    const clicks: Event[] = [];
    root.addEventListener('mdsButtonDropdownClick', (event) => clicks.push(event));
    const primary = primaryAction(root);

    primary.focus();
    await userEvent.keyboard('{Enter}');
    primary.click();
    await settle();

    expect(clicks).toHaveLength(0);
    expect(window.location.hash).toBe('');
  });

  it('keeps the primary action of a section a link back, which emits', async () => {
    const { root } = await render(
      '<mds-button-dropdown label="Records" href="#records" current="section"></mds-button-dropdown>',
    );
    const clicks: Event[] = [];
    root.addEventListener('mdsButtonDropdownClick', (event) => clicks.push(event));
    const primary = primaryAction(root);
    await vi.waitFor(() => expect(primary).toEqualAttribute('aria-current', 'true'));

    await userEvent.click(primary);

    await vi.waitFor(() => expect(window.location.hash).toBe('#records'));
    expect(clicks).toHaveLength(1);
  });

  // the icons of the states are the primary action's: the chevron keeps its arrow (#1264)
  it('gives icon-current and icon-hover to the primary action only', async () => {
    mockIconFetch();
    const { root } = await render(
      '<mds-button-dropdown label="Colors" icon="mi/outline/palette" icon-current="mi/baseline/palette" icon-hover="mi/baseline/check" current></mds-button-dropdown>',
    );
    const primary = primaryAction(root) as HTMLMdsButtonElement;
    const arrow = chevron(root) as HTMLMdsButtonElement;

    await vi.waitFor(() => expect(primary.iconCurrent).toBe('mi/baseline/palette'));
    expect(primary.iconHover).toBe('mi/baseline/check');
    expect(arrow.iconCurrent).toBeUndefined();
    expect(arrow.iconHover).toBeUndefined();
  });
});
