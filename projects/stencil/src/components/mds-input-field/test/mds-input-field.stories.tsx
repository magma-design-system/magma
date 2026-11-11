import { themeInputVariantDictionary } from '@type/variant';
import { validationModelDictionary } from '@component/mds-input/meta/dictionary';
import { h } from '@stencil/core';
import { inDarkMode } from '@fixture/dark-mode';
import { expect, waitFor } from 'storybook/test';

interface MdsInputFieldInterface {
  label?: string;
  message?: string;
}

export default {
  title: 'UI / Forms / Input Field',
  id: 'form-input-field',
  argTypes: {
    label: {
      type: { name: 'string' },
      description: 'Display a text on the top of the input text field',
    },
    message: {
      type: { name: 'string' },
      description: 'Display a message at the bottom of the input text field',
    },
    pattern: {
      type: { name: 'string' },
      description: "Specifies a regular expression that element's value is checked against",
    },
    variant: {
      type: { name: 'string' },
      options: themeInputVariantDictionary,
      control: { type: 'select' },
      description: 'Sets the variant of the input field',
    },
    validate: {
      type: { name: 'string' },
      description: 'Specifies the type of model data to be automatically validated',
      options: validationModelDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-input-field {...args}>
    <mds-input name="fullName" placeholder="Es: Mario Rossi"></mds-input>
  </mds-input-field>
);

export const Default = {
  render: Template,

  args: {
    label: 'Nome e cognome',
  },
};

export const Message = {
  render: Template,

  args: {
    label: 'Questo è un label',
    message: 'Senza validazione il messaggio non dovrebbe cambiare o scomparire',
  },
};

export const Variant = {
  render: Template,

  args: {
    label: 'Questo è un label',
    variant: 'error',
    message: 'This is a field with a message',
  },
};

const FormIntegrationTemplate = (args: MdsInputFieldInterface) => (
  <div class="grid gap-600">
    <form class="grid gap-400" id="mds-icon-fi" name="mds-icon-fi">
      <mds-input-field {...args}>
        <mds-input name="fullName" placeholder="Es: Mario Rossi" autofocus></mds-input>
      </mds-input-field>
      <div class="flex flex-wrap gap-400 items-baseline">
        <mds-button
          class="shrink-0 max-mobile:grow"
          type="button"
          onClick={() => {
            const formEl = document.querySelector('form') as HTMLFormElement;
            const spanEl = document.querySelector('span.input-value') as HTMLSpanElement;
            const inputEl = document.querySelector('mds-input') as HTMLMdsInputElement;
            if (formEl.fullName.value === '') {
              inputEl.setFocus();
              spanEl.classList.remove('scale-110');
              spanEl.innerText = 'empty';
              return;
            }
            spanEl.innerText = formEl.fullName.value;
            spanEl.classList.add('scale-110');
            formEl.addEventListener('submit', (e: SubmitEvent) => {
              e.preventDefault();
              console.info('Submitted', e);
            });
          }}
        >
          Check value
        </mds-button>
        <mds-text variant="code">
          Input value taken from form element{' '}
          <span class="input-value inline-flex rounded text-tone-neutral-04 bg-tone-neutral-08 px-200 transition-transform duration-200">
            empty
          </span>
        </mds-text>
      </div>
    </form>
  </div>
);

export const FormIntegration = {
  render: FormIntegrationTemplate,

  args: {
    label: 'full name',
  },
};

const TemplateValidation = () => (
  <div class="grid gap-600">
    <mds-text typography="h6">Validation NOT required</mds-text>
    <mds-input-field label="inserisci il tuo codice fiscale">
      <mds-input name="fullName" type="cf" placeholder="Es: MRCRSS83B21D704L"></mds-input>
    </mds-input-field>
    <mds-hr></mds-hr>
    <mds-text typography="h6">Validation REQUIRED</mds-text>
    <mds-input-field label="inserisci il tuo codice fiscale">
      <mds-input name="fullName" type="cf" placeholder="Es: MRCRSS83B21D704L" required></mds-input>
    </mds-input-field>
  </div>
);

export const Validation = {
  render: TemplateValidation,
};

const TemplateNestedButton = (args) => (
  <mds-input-field {...args}>
    <mds-input name="fullName" type={args.type} placeholder={args.placeholder}></mds-input>
    <mds-button icon="mi/baseline/chevron-right" size="lg"></mds-button>
  </mds-input-field>
);

export const NestedButton = {
  render: TemplateNestedButton,

  args: {
    label: 'inserisci il tuo codice fiscale',
    placeholder: 'Es: MRCRSS83B21D704L',
    type: 'cf',
  },
};

/**
 * Colour fields (#1260) with their label and message: one holding a colour, one whose text names
 * no colour, which shows the message of mds-input once the field is left.
 */
const TemplateColor = () => (
  <div class="@container">
    <form class="grid items-start gap-400 @md:grid-cols-2">
      <mds-input-field label="Colore di base">
        <mds-input type="color" name="base" value="#2f6fd0" placeholder="#rrggbb"></mds-input>
      </mds-input-field>
      <mds-input-field label="Colore del bordo">
        <mds-input type="color" name="border" value="blu" placeholder="#rrggbb"></mds-input>
      </mds-input-field>
    </form>
  </div>
);

const playColor = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const [, wrong] = Array.from(canvasElement.querySelectorAll('mds-input-field'));
  const field = wrong.querySelector('mds-input') as HTMLMdsInputElement;
  await waitFor(() => expect(field).toHaveAttribute('hydrated'));
  const input = field.shadowRoot!.querySelector('input.input') as HTMLInputElement;
  input.focus();
  input.blur();
  await waitFor(() =>
    expect(wrong).toHaveProperty('message', 'Enter a hex colour code, such as #2f6fd0'),
  );
  const swatch = field.shadowRoot!.querySelector('.swatch') as HTMLButtonElement;
  await expect(swatch).toHaveAttribute('aria-label', 'Choose a colour for Colore del bordo');
};

export const Color = {
  render: TemplateColor,

  play: playColor,
};

export const ColorDark = {
  render: TemplateColor,

  beforeEach: inDarkMode,

  play: playColor,
};
