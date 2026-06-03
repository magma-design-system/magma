import { themeInputVariantDictionary } from '@type/variant';
import { validationModelDictionary } from '@component/mds-input/meta/dictionary';
import { h } from '@stencil/core';

interface MdsInputFieldInterface {
  label?: string;
  message?: string;
}

export default {
  title: 'Form / Input Field',
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
          role="submit"
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
