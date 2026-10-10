import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-input-switch', () => {
  const setup = async (html: string) => {
    const { root, waitForChanges } = await render<HTMLMdsInputSwitchElement>(html);
    const shadow = root.shadowRoot!;
    return {
      root,
      waitForChanges,
      input: shadow.querySelector<HTMLInputElement>('input.field')!,
      control: shadow.querySelector<HTMLElement>('.switch-container, .label-icon')!,
    };
  };

  it('renders', async () => {
    const { root } = await render('<mds-input-switch></mds-input-switch>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('exposes the native input as the labelled control, the label only draws it', async () => {
    const { input, control } = await setup('<mds-input-switch>Notifications</mds-input-switch>');

    expect(input).toEqualAttributes({ role: 'switch', 'aria-label': 'Select Notifications' });
    // `aria-label` is prohibited on a label, and two tab stops would announce the control twice
    expect(control).not.toHaveAttribute('aria-label');
    expect(control).not.toHaveAttribute('tabindex');
  });

  it('keeps the native checkbox and radio semantics', async () => {
    const { input } = await setup('<mds-input-switch type="checkbox"></mds-input-switch>');

    expect(input).not.toHaveAttribute('role');
    expect(input).toEqualAttributes({ type: 'checkbox', 'aria-label': 'Select element' });
  });

  it('toggles from the keyboard through the focused input', async () => {
    const { root, input, waitForChanges } = await setup(
      '<mds-input-switch>Notifications</mds-input-switch>',
    );

    input.focus();
    expect(root.shadowRoot!.activeElement).toBe(input);

    await userEvent.keyboard(' ');
    await waitForChanges();
    expect(root).toHaveAttribute('checked');
    expect(input).toEqualAttribute('aria-label', 'Deselect Notifications');

    await userEvent.keyboard('{Enter}');
    await waitForChanges();
    expect(root).not.toHaveAttribute('checked');
  });

  it('toggles when the drawn switch is clicked', async () => {
    const { root, control, waitForChanges } = await setup(
      '<mds-input-switch>Notifications</mds-input-switch>',
    );

    await userEvent.click(control);
    await waitForChanges();

    expect(root).toHaveAttribute('checked');
  });
});

const clickSwitch = async (element: HTMLElement): Promise<void> => {
  await userEvent.click(
    element.shadowRoot!.querySelector<HTMLElement>('.switch-container, .label-icon')!,
  );
};

const setupForm = async (html: string) => {
  const { root, waitForChanges } = await render<HTMLElement>(html);
  const form = root.tagName === 'FORM' ? (root as HTMLFormElement) : root.querySelector('form')!;
  const switches = Array.from(root.querySelectorAll('mds-input-switch'));
  return { root, form, switches, waitForChanges };
};

// Like a native checkbox, a form reset brings back the checked state of load (#822)
describe('form reset', () => {
  it('brings back the checked state of load and submits accordingly', async () => {
    const { form, switches, waitForChanges } = await setupForm(
      '<form><mds-input-switch name="news" value="yes"></mds-input-switch><mds-input-switch name="terms" value="ok" checked></mds-input-switch></form>',
    );
    const [news, terms] = switches;
    await clickSwitch(news);
    await clickSwitch(terms);
    await waitForChanges();
    expect(new FormData(form).get('news')).toBe('yes');
    expect(new FormData(form).has('terms')).toBe(false);

    form.reset();
    await waitForChanges();

    expect(news).not.toHaveAttribute('checked');
    expect(terms).toHaveAttribute('checked');
    expect(terms.shadowRoot!.querySelector('input')!.checked).toBe(true);
    const data = new FormData(form);
    expect(data.has('news')).toBe(false);
    expect(data.get('terms')).toBe('ok');
  });
});

// Like native radios, a group submits the one checked (#822)
describe('radio group', () => {
  const radios = (name: string) =>
    ['a', 'b', 'c']
      .map(
        (value) =>
          `<mds-input-switch type="radio" name="${name}" value="${value}"></mds-input-switch>`,
      )
      .join('');

  it('submits only the radio checked last', async () => {
    const { form, switches, waitForChanges } = await setupForm(`<form>${radios('r')}</form>`);

    await clickSwitch(switches[0]);
    await clickSwitch(switches[1]);
    await waitForChanges();

    expect(switches[0]).not.toHaveAttribute('checked');
    expect(new FormData(form).getAll('r')).toEqual(['b']);
  });

  it('unchecks the others for a radio checked by code', async () => {
    const { form, switches, waitForChanges } = await setupForm(`<form>${radios('r')}</form>`);
    await clickSwitch(switches[0]);

    switches[2].checked = true;
    await waitForChanges();

    expect(switches[0]).not.toHaveAttribute('checked');
    expect(new FormData(form).getAll('r')).toEqual(['c']);
  });

  it('leaves alone the radios without a name and the other switches', async () => {
    const { switches, waitForChanges } = await setupForm(
      '<div><mds-input-switch type="radio" value="a"></mds-input-switch><mds-input-switch type="radio" value="b"></mds-input-switch><mds-input-switch type="checkbox" checked></mds-input-switch></div>',
    );
    const [a, b, checkbox] = switches;

    await clickSwitch(a);
    await clickSwitch(b);
    await waitForChanges();

    expect(a).toHaveAttribute('checked');
    expect(b).toHaveAttribute('checked');
    expect(checkbox).toHaveAttribute('checked');
  });

  it('keeps a group per form', async () => {
    const { switches, waitForChanges } = await setupForm(
      `<div><form>${radios('r')}</form><form>${radios('r')}</form></div>`,
    );

    await clickSwitch(switches[0]);
    await clickSwitch(switches[4]);
    await waitForChanges();

    expect(switches[0]).toHaveAttribute('checked');
    expect(switches[4]).toHaveAttribute('checked');
  });
});

// The form value follows the state set by code too, not only the clicks (#822)
describe('form value', () => {
  it('follows checked, value and disabled set by code', async () => {
    const { form, switches, waitForChanges } = await setupForm(
      '<form><mds-input-switch name="news" value="yes"></mds-input-switch></form>',
    );
    const [news] = switches;

    news.checked = true;
    await waitForChanges();
    expect(new FormData(form).get('news')).toBe('yes');

    news.value = 'weekly';
    await waitForChanges();
    expect(new FormData(form).get('news')).toBe('weekly');

    news.disabled = true;
    await waitForChanges();
    news.disabled = false;
    await waitForChanges();
    expect(new FormData(form).get('news')).toBe('weekly');
  });
});
