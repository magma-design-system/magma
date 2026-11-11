import { citiesDictionary } from '@fixture/cities';
import { inDarkMode } from '@fixture/dark-mode';
import { themeInputVariantDictionary } from '@type/variant';
import { autoCompleteDictionary } from '@type/autocomplete';
import {
  inputTextTypeDictionary,
  inputControlsLayoutDictionary,
  inputControlsIconDictionary,
} from '@type/input';
import { typographyInputDictionary } from '@type/typography';
import { iconsDictionary } from '@type/icon';
import { h } from '@stencil/core';

import { MdsInputInterface } from '../mds-input';
import { useEffect } from 'react';
import { expect, waitFor } from 'storybook/test';

// https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill

export default {
  title: 'UI / Forms / Input',
  id: 'form-input',
  argTypes: {
    autocomplete: {
      description: 'Specifies whether the element should have autocomplete enabled',
      options: autoCompleteDictionary,
      control: { type: 'select' },
    },
    autofocus: {
      type: { name: 'boolean' },
      description: 'Specifies that the element should automatically get focus when the page loads',
    },
    await: {
      type: { name: 'boolean' },
      description: 'Specifies if the spinner icon is shown, replacing the icon if present',
    },
    'controls-icon': {
      description:
        'Specifies the icon type of the counter button when the input type is set to `number`',
      options: inputControlsIconDictionary,
      control: { type: 'select' },
    },
    'controls-layout': {
      description:
        'Specifies the layout of the counter button when the input type is set to `number`',
      options: inputControlsLayoutDictionary,
      control: { type: 'select' },
    },
    datalist: {
      type: { name: 'array' },
      description:
        'A list of search terms to be searched from the input field, it should be used with type="search" input',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'If true, the element is displayed as disabled',
    },
    icon: {
      control: { type: 'select' },
      description: 'An icon displayed at the right of the input',
      options: iconsDictionary,
      type: { name: 'string' },
    },
    max: {
      type: { name: 'number' },
      description: 'Specifies the maximum value',
    },
    maxlength: {
      type: { name: 'number' },
      description: 'Specifies the maximum number of characters allowed in an element',
    },
    mic: {
      type: { name: 'boolean' },
      description: 'Toggles text recognition',
    },
    min: {
      type: { name: 'number' },
      description: 'Specifies the minimum value',
    },
    minlength: {
      type: { name: 'number' },
      description: 'Specifies the minimum number of characters allowed in an element',
    },
    name: {
      type: { name: 'string' },
      description: 'Is needed to reference the form data after the form is submitted',
    },
    pattern: {
      type: { name: 'string' },
      description: "Specifies a regular expression that element's value is checked against",
    },
    placeholder: {
      type: { name: 'string' },
      description: 'Specifies a short hint that describes the expected value of the element',
    },
    readOnly: {
      type: { name: 'boolean' },
      description: 'Specifies that the element is read-only',
    },
    required: {
      type: { name: 'boolean' },
      description: 'Specifies that the element must be filled out before submitting the form',
    },
    step: {
      type: { name: 'string' },
      description: 'Specifies the interval between legal numbers in an input field',
    },
    tip: {
      type: { name: 'string' },
      description: 'Sets the message of the variant of the input field',
    },
    type: {
      type: { name: 'string' },
      description: 'Specifies the type of element',
      options: inputTextTypeDictionary,
      control: { type: 'select' },
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of element',
      options: typographyInputDictionary,
      control: { type: 'select' },
    },
    value: {
      type: { name: 'string' },
      description: 'Specifies the value of the element',
    },
    variant: {
      type: { name: 'string' },
      options: themeInputVariantDictionary,
      control: { type: 'select' },
      description: 'Sets the variant of the input field',
    },
  },
};

const Template = (args: MdsInputInterface) => <mds-input {...args}></mds-input>;

const TemplateLanguage = (args: MdsInputInterface) => (
  <div class="grid gap-400">
    <mds-input {...args}></mds-input>
    <div class="grid gap grid-cols-3">
      <mds-pref>
        <mds-pref-language>
          <mds-pref-language-item code="it"></mds-pref-language-item>
          <mds-pref-language-item code="en"></mds-pref-language-item>
          <mds-pref-language-item code="el"></mds-pref-language-item>
          <mds-pref-language-item code="es"></mds-pref-language-item>
          <mds-pref-language-item code="ja"></mds-pref-language-item>
        </mds-pref-language>
      </mds-pref>
    </div>
  </div>
);

export const Default = {
  render: Template,

  args: {
    placeholder: 'Scrivi qualcosa',
  },
};

export const AutoComplete = {
  render: Template,

  args: {
    autocomplete: 'cc-name',
    type: 'text',
    placeholder: 'Intestatario carta di credito',
  },
};

export const AutoFocus = {
  render: Template,

  args: {
    autofocus: true,
    placeholder: 'Auto focus input text',
  },
};

export const ControlsLayout = {
  render: Template,

  args: {
    'controls-layout': 'horizontal',
    type: 'number',
    placeholder: 'Controls layout',
  },
};

export const ControlsIcon = {
  render: Template,

  args: {
    'controls-icon': 'arithmetic',
    type: 'number',
    placeholder: 'Controls icon',
  },
};

export const Disabled = {
  render: Template,

  args: {
    disabled: true,
    placeholder: 'Disabled',
  },
};

export const Max = {
  render: Template,

  args: {
    max: '3',
    type: 'number',
    value: '2',
    placeholder: 'Scrivi qualcosa',
  },
};

export const MaxLength = {
  render: Template,

  args: {
    maxlength: 128,
    type: 'text',
    value: 'Hello',
    placeholder: 'Scrivi qualcosa',
  },
};

export const Min = {
  render: Template,

  args: {
    min: '3',
    type: 'number',
    value: '5',
    placeholder: 'Scrivi qualcosa',
  },
};

export const MinLength = {
  render: Template,

  args: {
    minlength: 5,
    type: 'text',
    value: 'Hello',
    placeholder: 'Scrivi qualcosa',
  },
};

export const Required = {
  render: Template,

  args: {
    required: true,
    placeholder: 'This is a required field',
  },
};

export const ReadOnly = {
  render: Template,

  args: {
    readOnly: true,
    value: 'Read only text',
    placeholder: 'Scrivi qualcosa',
  },
};

export const Variant = {
  render: Template,

  args: {
    placeholder: 'Es: 1234 5678 7654 3234',
    tip: 'visa',
  },
};

export const Tip = {
  render: Template,

  args: {
    placeholder: 'Scrivi qualcosa...',
    tip: 'input',
  },
};

export const Password = {
  render: Template,

  args: {
    type: 'password',
    placeholder: 'Insert a password',
  },
};

/** The dots that mask the password start after the icon, where the text of the field starts. */
export const PasswordWithIcon = {
  render: Template,

  args: {
    type: 'password',
    icon: 'mdi/key',
    placeholder: 'Insert a password',
    value: 'secret',
  },
};

export const Placeholder = {
  render: Template,

  args: {
    placeholder: 'Es: change this placeholder',
  },
};

const TemplateSearch = (args: MdsInputInterface) => {
  useEffect(() => {
    document.querySelector('mds-input')!.datalist = args.datalist;
  });
  return <mds-input {...args}></mds-input>;
};

export const Search = {
  render: TemplateSearch,

  args: {
    datalist: citiesDictionary,
    type: 'search',
    placeholder: 'Search a city name...',
  },
};

export const Icon = {
  render: Template,

  args: {
    icon: 'mi/round/email',
    placeholder: 'Status input field',
  },
};

export const TestLanguageChange = {
  render: TemplateLanguage,

  args: {
    icon: 'mi/round/email',
    readonly: true,
    placeholder: 'Status input field',
  },
};

export const VariantAi = {
  render: Template,

  args: {
    variant: 'ai',
    placeholder: 'Es: Come si cresce un bovaro del bernese?',
  },
};

export const TextRecognition = {
  render: Template,

  args: {
    variant: 'ai',
    mic: true,
    placeholder: 'Es: Come si cresce un bovaro del bernese?',
  },
};

/**
 * A colour field (#1260): the code is typed in the field and validated, the swatch at its start
 * shows the colour, the button at its end opens the picker of the platform. The value is
 * `#rrggbb`: `#ABC` is written `#aabbcc` at load, as a code typed is when the field is left.
 */
export const Color = {
  render: Template,

  args: {
    'aria-label': 'Colore di base',
    type: 'color',
    value: '#2F6FD0',
    placeholder: '#rrggbb',
  },

  play: async ({ canvasElement }) => {
    const field = canvasElement.querySelector('mds-input') as HTMLMdsInputElement;
    await waitFor(() => expect(field).toHaveAttribute('hydrated'));
    await expect(field.value).toBe('#2f6fd0');
    const swatch = field.shadowRoot!.querySelector('.swatch') as HTMLElement;
    await expect(getComputedStyle(swatch).backgroundColor).toBe('rgb(47, 111, 208)');
    const action = field.shadowRoot!.querySelector('.color-picker-button') as HTMLElement;
    await expect(action).toHaveAttribute('title', 'Choose a colour for Colore di base');
  },
};

/** The colour field in every size, empty, read-only, disabled and awaiting. */
const TemplateColorStates = () => (
  <div class="@container">
    <div class="grid items-start gap-400 @md:grid-cols-2 @3xl:grid-cols-3">
      <mds-input type="color" aria-label="Grande" value="#a89586"></mds-input>
      <mds-input type="color" aria-label="Medio" size="md" value="#a89586"></mds-input>
      <mds-input type="color" aria-label="Piccolo" size="sm" value="#a89586"></mds-input>
      <mds-input type="color" aria-label="Vuoto" placeholder="#rrggbb"></mds-input>
      <mds-input type="color" aria-label="Sola lettura" value="#2f6fd0" readonly></mds-input>
      <mds-input type="color" aria-label="Disabilitato" value="#2f6fd0" disabled></mds-input>
      <mds-input type="color" aria-label="In attesa" value="#2f6fd0" await></mds-input>
      <mds-input type="color" aria-label="Bianco" value="#ffffff"></mds-input>
      <mds-input type="color" aria-label="Nero" value="#000000"></mds-input>
    </div>
  </div>
);

export const ColorStates = {
  render: TemplateColorStates,
};

/**
 * A colour field whose text names no colour: the swatch is empty, the ring alone, and leaving the
 * field shows the error. The value is `''`, which the form gets.
 */
const playColorError = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const field = canvasElement.querySelector('mds-input') as HTMLMdsInputElement;
  await waitFor(() => expect(field).toHaveAttribute('hydrated'));
  const input = field.shadowRoot!.querySelector('input.input') as HTMLInputElement;
  input.focus();
  input.blur();
  await waitFor(() => expect(field).toHaveAttribute('variant', 'error'));
  await expect(field.value).toBe('');
  await expect(input.value).toBe('blu');
};

export const ColorError = {
  render: Template,

  args: {
    'aria-label': 'Colore del bordo',
    type: 'color',
    value: 'blu',
  },

  play: playColorError,
};

/** The colour field and its error in dark: the ring of the swatch stays visible on the field. */
const TemplateColorDark = () => (
  <div class="@container">
    <div class="grid items-start gap-400 @md:grid-cols-2">
      <mds-input type="color" aria-label="Colore del bordo" value="blu"></mds-input>
      <mds-input type="color" aria-label="Colore di base" value="#2f6fd0"></mds-input>
      <mds-input type="color" aria-label="Nero" value="#000000"></mds-input>
      <mds-input type="color" aria-label="Vuoto" placeholder="#rrggbb"></mds-input>
    </div>
  </div>
);

export const ColorDark = {
  render: TemplateColorDark,

  beforeEach: inDarkMode,

  play: playColorError,
};

/**
 * Numbers the user can change, and cannot: read-only and disabled, in both layouts. The counter
 * buttons change the value, so a locked number has none: its text takes their room, and its end
 * is left to the badge of its state, which covered them (#1368).
 */
const TemplateNumberLocked = () => (
  <div class="@container">
    <div class="grid items-start gap-600 @md:grid-cols-3">
      <mds-input type="number" aria-label="Quantita" value="3"></mds-input>
      <mds-input type="number" aria-label="Quantita in sola lettura" value="3" readonly></mds-input>
      <mds-input type="number" aria-label="Quantita disabilitata" value="3" disabled></mds-input>
      <mds-input
        type="number"
        controls-layout="horizontal"
        aria-label="Persone"
        value="2"
      ></mds-input>
      <mds-input
        type="number"
        controls-layout="horizontal"
        aria-label="Persone in sola lettura"
        value="2"
        readonly
      ></mds-input>
      <mds-input
        type="number"
        controls-layout="horizontal"
        aria-label="Persone disabilitate"
        value="2"
        disabled
      ></mds-input>
    </div>
  </div>
);

export const NumberLocked = {
  render: TemplateNumberLocked,

  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const fields = Array.from(canvasElement.querySelectorAll('mds-input'));
    await waitFor(() => fields.forEach((field) => expect(field).toHaveAttribute('hydrated')));
    fields.forEach((field) => {
      const locked = field.hasAttribute('readonly') || field.hasAttribute('disabled');
      expect(field.shadowRoot!.querySelectorAll('.counter-button')).toHaveLength(locked ? 0 : 2);
    });
  },
};

// what stands at the end of a field, under its top tip: the buttons, and the arrow of a select
const END_ACTIONS =
  '.password-toggle-button, .mic-toggle-button, .color-picker-button, .counter-button, .action-open-calendar';

/** The glyphs at the end of a field: the icons of its buttons, or the arrow of a select. */
const endGlyphs = (field: Element): Element[] =>
  field.localName === 'mds-input-select'
    ? Array.from(field.shadowRoot!.querySelectorAll('.icon'))
    : Array.from(field.shadowRoot!.querySelectorAll(END_ACTIONS)).map((button) =>
        button.shadowRoot!.querySelector('.icon')!,
      );

/** The area two boxes share, 0 when they do not overlap. */
const overlap = (a: DOMRect, b: DOMRect): number =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

/**
 * Fields with a top tip (the badge of read only and disabled, the dot of required) and an action
 * at their end, in every size: the tip stands on the top border, half outside, clear of the corner
 * and of the action, which it covered when it stood inside (vittorio 2026-11-11, #1368).
 */
const TemplateTipOnTheBorder = () => (
  <div class="@container">
    <div class="grid items-start gap-600 @md:grid-cols-3">
      {(['lg', 'md', 'sm'] as const).map((size) => (
        <div key={size} class="grid gap-600">
          <mds-input-field label={`Password (${size})`}>
            <mds-input type="password" value="segreto" readonly size={size}></mds-input>
          </mds-input-field>
          <mds-input-field label={`Colore (${size})`}>
            <mds-input type="color" value="#2f6fd0" required size={size}></mds-input>
          </mds-input-field>
          <mds-input-field label={`Nota (${size})`}>
            <mds-input mic value="Testo" required size={size}></mds-input>
          </mds-input-field>
          <mds-input-field label={`Quantita (${size})`}>
            <mds-input type="number" value="3" required size={size}></mds-input>
          </mds-input-field>
          <mds-input-field label={`Persone (${size})`}>
            <mds-input
              type="number"
              controls-layout="horizontal"
              value="2"
              required
              size={size}
            ></mds-input>
          </mds-input-field>
          <mds-input-field label={`Scadenza (${size})`}>
            <mds-input-date value="2026-11-11" required size={size}></mds-input-date>
          </mds-input-field>
          <mds-input-field label={`Provincia (${size})`}>
            <mds-input-select disabled size={size}>
              <option value="bo">Bologna</option>
            </mds-input-select>
          </mds-input-field>
        </div>
      ))}
    </div>
  </div>
);

const playTipOnTheBorder = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const fields = Array.from(
    canvasElement.querySelectorAll('mds-input, mds-input-date, mds-input-select'),
  );
  await waitFor(() => fields.forEach((field) => expect(field).toHaveAttribute('hydrated')));
  // the closed calendar of a date hides once its dropdown hydrates: until then the three calendars
  // of the page show the same month to axe, as landmarks of the same name
  await waitFor(() =>
    fields.forEach((field) =>
      field
        .shadowRoot!.querySelectorAll('mds-dropdown')
        .forEach((dropdown) => expect(getComputedStyle(dropdown).display).toBe('none')),
    ),
  );
  await waitFor(() =>
    fields.forEach((field) => {
      const top = field.getBoundingClientRect().top;
      const items = Array.from(
        field.shadowRoot!.querySelectorAll('mds-input-tip[position="top"] mds-input-tip-item'),
      ).map((item) => item.getBoundingClientRect());
      const glyphs = endGlyphs(field).map((glyph) => glyph.getBoundingClientRect());

      expect(items.length).toBeGreaterThan(0);
      expect(glyphs.length).toBeGreaterThan(0);
      items.forEach((item) => {
        expect(Math.abs((item.top + item.bottom) / 2 - top)).toBeLessThanOrEqual(1);
        glyphs.forEach((glyph) => expect(overlap(item, glyph)).toBe(0));
      });
    }),
  );
};

export const TipOnTheBorder = {
  render: TemplateTipOnTheBorder,

  play: playTipOnTheBorder,
};

export const TipOnTheBorderDark = {
  render: TemplateTipOnTheBorder,

  beforeEach: inDarkMode,

  play: playTipOnTheBorder,
};

const FormIntegrationTemplate = (args: MdsInputInterface) => {
  return (
    <div class="grid gap-600">
      <form
        class="grid gap-400"
        id="mds-icon-fi"
        name="mds-icon-fi"
        onSubmit={(e: SubmitEvent) => {
          e.preventDefault();
          console.info('Submitted', e);
        }}
      >
        <mds-input {...args}></mds-input>
        <mds-button
          class="w-min"
          type="submit"
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            const form = document.querySelector('form') as HTMLFormElement;
            const span = document.querySelector('span.input-value') as HTMLSpanElement;
            span.innerText = form['mds-input'].value !== '' ? form['mds-input'].value : 'Empty';
          }}
        >
          Check value
        </mds-button>
      </form>
      <mds-text variant="code">
        Input value taken from form element:{' '}
        <span class="inline-flex input-value rounded text-tone-neutral-01 bg-tone-neutral-08 px-200 py-50">
          Empty
        </span>
      </mds-text>
    </div>
  );
};

export const FormIntegration = {
  render: FormIntegrationTemplate,

  args: {
    placeholder: 'Es: Hello world!',
    name: 'mds-input',
  },
};

/**
 * Login form for manual checks with password managers. The native fields live in the Shadow DOM
 * of each mds-input: Bitwarden, LastPass, Chrome and Edge detect them, Firefox and
 * KeePassXC-Browser do not (see #519). Open the story in isolation (iframe.html) to avoid the
 * Storybook frame.
 */
const LoginTemplate = () => {
  return (
    <form
      class="grid gap-400"
      onSubmit={(e: SubmitEvent) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget as HTMLFormElement);
        console.info('Login submitted as', data.get('username'));
      }}
    >
      <mds-input-field label="Email">
        <mds-input
          name="username"
          type="email"
          autocomplete="username"
          placeholder="nome@esempio.it"
          required
        ></mds-input>
      </mds-input-field>
      <mds-input-field label="Password">
        <mds-input
          name="password"
          type="password"
          autocomplete="current-password"
          required
        ></mds-input>
      </mds-input-field>
      <mds-button class="w-min" type="submit">
        Accedi
      </mds-button>
    </form>
  );
};

export const Login = {
  render: LoginTemplate,
};
