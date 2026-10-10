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
  title: 'UI / Button dropdown',
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
        const { submitter } = event.nativeEvent as SubmitEvent;
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

    await userEvent.click(dropdown.shadowRoot!.querySelector('.dropdown-action')!);
    await userEvent.click(dropdown.querySelector('mds-button[value="draft"]')!);
    await expect(await canvas.findByText('draft')).toBeInTheDocument();
  },
};
