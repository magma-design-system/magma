import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
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
    'dropdown-icon': {
      type: { name: 'string' },
      description: 'The icon of the chevron, the button that opens the menu, in place of the arrow',
      options: iconsDictionary,
      control: { type: 'select' },
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

// the conversations with an agent in a side column: the name opens one, the three dots of
// dropdown-icon its menu; stretched by the column, the name takes the width and the dots stay at
// the end
const conversations = ['Riunione di lunedi', 'Bozza del bando di gara', 'Riepilogo delle ferie'];

const TemplateConversations = (args) => (
  <nav class="flex flex-col gap-100 w-full max-w-[280px]" aria-label="Conversazioni">
    {conversations.map((name, index) => (
      <mds-button-dropdown
        {...args}
        key={name}
        class="self-stretch"
        current={index === 0 ? 'page' : undefined}
        href={`#chat-${index}`}
        label={name}
      >
        <mds-button
          icon="mi/baseline/edit"
          variant="dark"
          tone="text"
          label="Rinomina"
        ></mds-button>
        <mds-button
          icon="mi/baseline/share"
          variant="dark"
          tone="text"
          label="Condividi"
        ></mds-button>
        <mds-button
          icon="mi/baseline/delete"
          variant="error"
          tone="text"
          label="Elimina"
        ></mds-button>
      </mds-button-dropdown>
    ))}
  </nav>
);

export const Conversations = {
  render: TemplateConversations,

  args: {
    'dropdown-icon': 'mi/baseline/more-horiz',
    size: 'sm',
    tone: 'weak',
    variant: 'dark',
  },
  play: async ({ canvasElement, userEvent }) => {
    const dropdown = canvasElement.querySelector('mds-button-dropdown')!;
    await waitFor(() => expect(dropdown).toHaveAttribute('hydrated'));
    const dots = dropdown.shadowRoot!.querySelector('.dropdown-action') as HTMLMdsButtonElement;

    await expect(dots.icon).toBe('mi/baseline/more-horiz');
    // named in the language of the page after the label, as the arrow is
    await expect(dots.getAttribute('aria-label')).toContain('Riunione di lunedi');

    const menu = dropdown.shadowRoot!.querySelector('mds-dropdown')!;
    await userEvent.click(dots);
    await waitFor(() => expect(menu).toHaveAttribute('visible'));
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
