import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import {
  buttonDropdownVariantDictionary,
  buttonSizeDictionary,
  buttonToneMinimalVariantDictionary,
  buttonTargetDictionary,
  buttonTypeDictionary,
} from '@type/button';

export default {
  title: 'UI / Actions / Button dropdown',
  id: 'ui-button-dropdown',
  argTypes: {
    label: {
      type: { name: 'string' },
      description: 'Choose to display or not the back arrow button',
    },
    'auto-focus': {
      type: { name: 'boolean' },
      description: 'Specifies if the component is focused when is loaded on the viewport',
    },
    await: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is awaiting to load a response',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is disabled or not',
    },
    href: {
      type: { name: 'string' },
      description: 'Specifies the URL target of the button',
    },
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    size: {
      type: { name: 'string' },
      description: 'Specifies the size of the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
    target: {
      type: { name: 'string' },
      options: buttonTargetDictionary,
      description: 'Specifies the target of the URL, if self or blank',
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the button',
      options: buttonToneMinimalVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the button',
      options: buttonDropdownVariantDictionary,
      control: { type: 'select' },
    },
    type: {
      type: { name: 'string' },
      description: 'Specifies the type of the primary action',
      options: buttonTypeDictionary,
      control: { type: 'select' },
    },
    name: {
      type: { name: 'string' },
      description: 'The name sent with value to the form the primary action submits',
    },
    value: {
      type: { name: 'string' },
      description: 'The value sent under name to the form the primary action submits',
    },
  },
};

const Template = (args) => (
  <mds-button-dropdown {...args}>
    <mds-button
      icon="mi/baseline/send"
      variant="dark"
      tone="text"
      label="Invia subito"
    ></mds-button>
    <mds-button icon="mi/baseline/delete" variant="dark" tone="text" label="Elimina"></mds-button>
  </mds-button-dropdown>
);

export const Default = {
  render: Template,

  args: {
    label: 'Salva come bozza',
    variant: 'success',
    tone: 'weak',
  },
};

// the mail composer of #849: every action submits the message, the receiver tells them apart
const TemplateFormActions = (args) => {
  const [action, setAction] = useState('');
  return (
    <form
      class="grid gap-400 max-w-[400px]"
      action="#"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        // React's synthetic event, which Stencil's JSX types as the DOM one
        const { submitter } = (event as unknown as { nativeEvent: SubmitEvent }).nativeEvent;
        setAction(String(new FormData(form, submitter).get('action')));
      }}
    >
      <mds-input-field label="Oggetto">
        <mds-input name="subject" value="Riunione di lunedi"></mds-input>
      </mds-input-field>
      <mds-button-dropdown {...args}>
        <mds-button
          name="action"
          value="draft"
          variant="dark"
          tone="text"
          label="Salva come bozza"
        ></mds-button>
        <mds-button
          name="action"
          value="schedule"
          variant="dark"
          tone="text"
          label="Invio programmato"
        ></mds-button>
      </mds-button-dropdown>
      {action && (
        <mds-text>
          Azione inviata: <b>{action}</b>
        </mds-text>
      )}
    </form>
  );
};

export const FormActions = {
  render: TemplateFormActions,

  args: {
    label: 'Invia',
    name: 'action',
    type: 'submit',
    value: 'send',
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const dropdown = canvasElement.querySelector('mds-button-dropdown')!;
    await waitFor(() => expect(dropdown).toHaveAttribute('hydrated'));

    await userEvent.click(dropdown.shadowRoot!.querySelector('.dropdown-primary-action')!);
    await expect(await canvas.findByText('send')).toBeInTheDocument();

    const menu = dropdown.shadowRoot!.querySelector('mds-dropdown')!;
    await userEvent.click(dropdown.shadowRoot!.querySelector('.dropdown-action')!);
    // the menu takes pointer events only once `visible` is reflected, on the render after the
    // click: before it the entries inherit `pointer-events: none` and userEvent refuses them
    await waitFor(() => expect(menu).toHaveAttribute('visible'));
    await userEvent.click(dropdown.querySelector('mds-button[value="draft"]')!);
    await expect(await canvas.findByText('draft')).toBeInTheDocument();
  },
};

// actions/stacked (#1189): under 380px of its container the row stacks and stretches every
// labelled action; the component gives the width to its primary action, the chevron at the end
// (#1313)
const TemplateStackedRow = (args) => (
  <div class="@container w-full max-w-[320px]">
    <div class="flex justify-end gap-inline @max-actions:flex-col @max-actions:*:self-stretch">
      <mds-button variant="dark" tone="outline" label="Copia JSON"></mds-button>
      <mds-button-dropdown {...args}>
        <mds-button variant="dark" tone="text" label="Scarica come CSS"></mds-button>
        <mds-button variant="dark" tone="text" label="Scarica come JSON"></mds-button>
      </mds-button-dropdown>
    </div>
  </div>
);

export const StackedRow = {
  render: TemplateStackedRow,

  args: {
    label: 'Scarica',
    icon: 'mi/baseline/download',
  },
  play: async ({ canvasElement }) => {
    const dropdown = canvasElement.querySelector('mds-button-dropdown')!;
    await waitFor(() => expect(dropdown).toHaveAttribute('hydrated'));
    const chevron = dropdown.shadowRoot!.querySelector('.dropdown-action')!;
    const row = dropdown.parentElement!.getBoundingClientRect();

    await waitFor(() => {
      const host = dropdown.getBoundingClientRect();
      expect(host.width).toBeCloseTo(row.width, 0);
      expect(chevron.getBoundingClientRect().right).toBeCloseTo(host.right, 0);
    });
  },
};

/**
 * Every state of the split button once the story has opened (#1440, @fixture/states): each variant
 * in both its tones, the sizes, with an icon and without a label, disabled (by the attribute and by
 * a fieldset), waiting, the current view (a page and a section), a link, the long label in two
 * truncations, and the menu open. Secondary renders as primary, kept for compatibility
 * (docs/agents/variants.md). The light variant is painted in the paper of the mode, so it sits on
 * the inverse surface. The menu is opened in the first cell, at the top of the page: its panel
 * opens on the side of the window with the most room, below it there, into the room the cell keeps,
 * so that it covers no other state (in the last cell it opened upwards, over the cell above). A
 * click anywhere on the page closes it, so it is the only one open. A state only an interaction
 * reaches (`play: true`) is brought there by the play function, which checks the property, not the
 * look. `type`, `name`, `value` and `dropdown-label` change what the button sends or how the
 * chevron is named, not how it looks; the width it takes in a stacked row is the StackedRow story.
 */
interface DropdownState {
  state: string;
  play?: boolean;
  /** the inverse surface, for the variant painted in the paper of the mode */
  inverse?: boolean;
  /** the split buttons sit in a disabled fieldset */
  fieldset?: boolean;
  dropdowns: Record<string, string | boolean>[];
}

// the label each variant takes in a product: what the variant says
const variantLabels: [string, string][] = [
  ['primary', 'Invia'],
  ['secondary', 'Modifica'],
  ['ai', 'Riassumi'],
  ['dark', 'Esporta'],
  ['light', 'Apri'],
  ['error', 'Elimina'],
  ['warning', 'Sospendi'],
  ['success', 'Approva'],
  ['info', 'Dettagli'],
];

const sizeDropdown = (size: string) => [{ size, label: 'Scarica', icon: 'mi/baseline/download' }];
const menuOpen = 'menu open';

const dropdownStates: DropdownState[] = [
  { state: menuOpen, play: true, dropdowns: [{ label: 'Invia', icon: 'mi/baseline/send' }] },
  ...variantLabels.map(([variant, label]) => ({
    state: `variant ${variant} (strong, weak)`,
    inverse: variant === 'light',
    dropdowns: ['strong', 'weak'].map((tone) => ({ variant, tone, label })),
  })),
  { state: 'size sm', dropdowns: sizeDropdown('sm') },
  { state: 'size md (default)', dropdowns: sizeDropdown('md') },
  { state: 'size lg', dropdowns: sizeDropdown('lg') },
  { state: 'size xl', dropdowns: sizeDropdown('xl') },
  { state: 'icon', dropdowns: [{ label: 'Invia', icon: 'mi/baseline/send' }] },
  {
    state: 'icon, no label',
    dropdowns: [{ icon: 'mi/baseline/print', 'dropdown-label': 'Altre opzioni di stampa' }],
  },
  {
    state: 'disabled (strong, weak)',
    dropdowns: ['strong', 'weak'].map((tone) => ({ tone, label: 'Invia', disabled: true })),
  },
  { state: 'disabled by its fieldset', fieldset: true, dropdowns: [{ label: 'Invia' }] },
  {
    state: 'await (strong, weak)',
    dropdowns: ['strong', 'weak'].map((tone) => ({
      tone,
      label: 'Invio in corso',
      await: true,
    })),
  },
  {
    state: 'current page, a link',
    dropdowns: [
      { label: 'Pratiche', href: '#pratiche', variant: 'dark', tone: 'weak', current: true },
    ],
  },
  {
    state: 'current section, a link back',
    dropdowns: [
      { label: 'Pratiche', href: '#pratiche', variant: 'dark', tone: 'weak', current: 'section' },
    ],
  },
  { state: 'link (href)', dropdowns: [{ label: 'Vai alle pratiche', href: '#pratiche' }] },
  {
    state: 'long label, truncate word (default)',
    dropdowns: [{ label: 'Invia la comunicazione a tutti i destinatari', class: 'max-w-6400' }],
  },
  {
    state: 'long label, truncate none',
    dropdowns: [
      {
        label: 'Invia la comunicazione a tutti i destinatari',
        truncate: 'none',
        class: 'max-w-6400',
      },
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {dropdownStates.map(({ state, play, inverse, fieldset, dropdowns }) => {
      const row = dropdowns.map((props, index) => (
        <mds-button-dropdown key={String(index)} {...props}>
          <mds-button
            icon="mi/outline/schedule"
            variant="dark"
            tone="text"
            type="button"
            label="Programma l'invio"
          ></mds-button>
          <mds-button
            icon="mi/baseline/edit"
            variant="dark"
            tone="text"
            type="button"
            label="Salva come bozza"
          ></mds-button>
        </mds-button-dropdown>
      ));
      const layout = `flex flex-wrap items-center gap-200${inverse ? ' bg-surface-inverse p-400 rounded-lg' : ''}`;
      return (
        <StateCell key={state} state={state} play={play}>
          {fieldset ? (
            <fieldset disabled class={`${layout} border-0 m-0 min-w-0 p-0`}>
              {row}
            </fieldset>
          ) : (
            <div class={layout}>{row}</div>
          )}
          {/* the room the panel opens into, under the split button */}
          {state === menuOpen && <div class="h-3600"></div>}
        </StateCell>
      );
    })}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const cell = stateCell(canvasElement, menuOpen);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const dropdown = cell.querySelector('mds-button-dropdown') as HTMLMdsButtonDropdownElement;
  // the chevron is the caller of the menu, in the shadow root of the component
  (dropdown.shadowRoot!.querySelector('.dropdown-action') as HTMLElement).click();

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() =>
    expect(dropdown.shadowRoot!.querySelector('mds-dropdown')).toHaveProperty('visible', true),
  );
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
