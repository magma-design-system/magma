import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import {
  buttonCurrentDictionary,
  buttonVariantDictionary,
  buttonSizeDictionary,
  buttonTargetDictionary,
  buttonIconPositionDictionary,
  buttonTypeDictionary,
} from '@type/button';
import { toneBoxVariantDictionary } from '@type/tone';
import { ButtonVariantType } from '@type/button';
import { ToneVariantType } from '@type/tone';

import { useEffect, useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';
import { textAnimateDictionary } from '@component/mds-text/meta/dictionary';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Actions / Button',
  id: 'ui-button',
  argTypes: {
    'auto-focus': {
      type: { name: 'boolean' },
      description: 'Specifies if the component is focused when is loaded on the viewport',
    },
    await: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is awaiting to load a response',
    },
    animation: {
      type: { name: 'string' },
      description: 'Specifies if the text is animated when it is rendered',
      options: textAnimateDictionary,
      control: { type: 'select' },
    },
    current: {
      type: { name: 'string' },
      description:
        'Marks the button that leads to the view you are in: `page` (or the attribute alone) is that view, inert; `section` is a view inside it, still a link',
      options: buttonCurrentDictionary,
      control: { type: 'select' },
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
    'icon-position': {
      type: { name: 'string' },
      description: 'Specifies the horizontal position of the icon displayed in the button',
      options: buttonIconPositionDictionary,
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
      options: toneBoxVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the button',
      options: buttonVariantDictionary,
      control: { type: 'select' },
    },
    type: {
      type: { name: 'string' },
      description: 'Specifies the type of the button',
      options: buttonTypeDictionary,
      control: { type: 'select' },
    },
    label: {
      type: { name: 'string' },
      description: 'Specifies the label of the button',
    },
  },
};

const Template = (args) => <mds-button {...args} label="Conferma azione"></mds-button>;

const TemplateService = (args) => <mds-button {...args}></mds-button>;

const TemplateNotifications = (args) => (
  <mds-button {...args} label="Notifiche">
    <mds-notification slot="notification" value={12}></mds-notification>
  </mds-button>
);

// takes args even if it drives most props itself: Storybook infers the controls only for
// render functions with at least one parameter
const TemplateAwait = (args) => {
  const [buttonState, setButtonState] = useState(0);
  // the await control forces the loading state, a click plays the whole cycle
  const state = args.await ? 1 : buttonState;

  const iconMap = {
    0: 'mi/baseline/eco',
    1: undefined,
    2: 'mi/baseline/done',
  };

  const variantsMap = {
    0: 'primary',
    1: 'primary',
    2: 'success',
  };

  const tonesMap = {
    0: 'strong',
    1: 'weak',
    2: 'strong',
  };

  function getLabel(state: number) {
    if (state === 0) return 'Conferma azione';
    if (state === 1) return 'Salvataggio in corso...';
    return 'Azione salvata';
  }

  function setLoadingState() {
    setButtonState(1);
    setTimeout(() => {
      setButtonState(2);
      setTimeout(() => {
        setButtonState(0);
      }, 2000);
    }, 2000);
  }

  return (
    <mds-button
      {...args}
      icon={iconMap[state]}
      variant={variantsMap[state]}
      tone={tonesMap[state]}
      await={state === 1}
      onClick={() => {
        if (state === 0) setLoadingState();
      }}
      label={getLabel(state)}
    ></mds-button>
  );
};

const TemplateKeyboard = (args) => (
  <div class="bg-tone-kaolin-10 p-600 grid gap-600">
    <mds-text>Focus this button with tab before press enter.</mds-text>
    <mds-button {...args} label="Click me from enter keyborad"></mds-button>
  </div>
);

const TemplateIcon = (args) => <mds-button {...args}> </mds-button>;

const TemplateForm = (args) => {
  const [inputValue, setInputValue] = useState('');
  return (
    <form
      class="grid grid-cols-full gap-400 max-w-[400px]"
      action="#"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        setInputValue(formData.get('inputTest'));
        return false;
      }}
    >
      {/* <input type="text" name="inputTest" /> */}
      <mds-input type="text" name="inputTest" class="w-full" placeholder="Es: hello world" />
      <mds-button {...args} label="Click me" type="submit" size="lg"></mds-button>
      {inputValue && (
        <mds-text>
          Input value: <b>{inputValue}</b>
        </mds-text>
      )}
    </form>
  );
};

const TemplateDisabled = () => {
  const [disabled, setDisabled] = useState(false);

  function toggle() {
    setDisabled(!disabled);
    console.info('disabled', disabled);
  }

  function enableButton() {
    setDisabled(false);
    // document.querySelector('#disabledButton')?.setAttribute('disabled', 'false')
  }

  return (
    <div class="grid grid-cols-1 gap-600">
      <div class="inline-flex gap-600">
        <mds-button
          id="disabledButton"
          class="w-4400"
          icon={disabled ? 'mi/baseline/block' : 'mi/baseline/check'}
          variant="primary"
          disabled={disabled}
          onClick={() => toggle()}
          label={disabled ? 'Disabled button' : 'Click to disable'}
        ></mds-button>
        {disabled && (
          <mds-button
            icon="mi/baseline/undo"
            variant="dark"
            tone="weak"
            onClick={() => enableButton()}
            label="Reset"
          ></mds-button>
        )}
      </div>
    </div>
  );
};

const TemplateAnimation = () => {
  const [buttonStateIndex, setButtonStateIndex] = useState(0);
  const buttonState: Array<{
    label: string;
    await: boolean;
    variant: ButtonVariantType;
    tone: ToneVariantType;
    icon?: string;
  }> = [
    {
      label: 'Click me',
      await: false,
      variant: 'primary',
      tone: 'strong',
    },
    {
      label: 'Loading...',
      variant: 'success',
      tone: 'weak',
      await: true,
    },
    {
      label: 'Load completed',
      icon: 'mi/baseline/check',
      variant: 'success',
      tone: 'strong',
      await: false,
    },
  ];

  const checkButtonState = () => {
    if (buttonStateIndex === 0) {
      setButtonStateIndex(1);
      setTimeout(() => {
        setButtonStateIndex(2);
      }, 2000);
      return;
    }

    if (buttonStateIndex === 2) {
      setButtonStateIndex(0);
    }

    setButtonStateIndex((buttonStateIndex + 1) % buttonState.length);
  };

  const [buttonHoverStateIndex, setButtonHoverStateIndex] = useState(0);

  const buttonHoverState = ['Hover me, if you dare', 'Now go!'];

  const handleMouseOver = () => {
    setButtonHoverStateIndex(1);
  };

  const handleMouseOut = () => {
    setButtonHoverStateIndex(0);
  };

  return (
    <div class="grid gap-600">
      <mds-button
        onClick={checkButtonState}
        class="w-full max-w-8000"
        animation="yugop"
        label={buttonState[buttonStateIndex].label}
        icon={buttonState[buttonStateIndex].icon}
        variant={buttonState[buttonStateIndex].variant}
        tone={buttonState[buttonStateIndex].tone}
        await={buttonState[buttonStateIndex].await}
      ></mds-button>
      <mds-button
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        label={buttonHoverState[buttonHoverStateIndex]}
        class="w-full max-w-8000"
        animation="yugop"
      ></mds-button>
    </div>
  );
};

const TemplateAsyncContent = () => {
  const [icon, setIcon] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setIcon('mi/baseline/check');
      setTimeout(() => {
        setLabel('Hello async world');
      }, 1000);
    }, 1000);
  }, [icon, label]);

  return <mds-button class="max-w-4400" icon={icon} label={label}></mds-button>;
};

export const Default = {
  render: Template,
};

export const AsyncContent = {
  render: TemplateAsyncContent,
  // the button has no name until the label arrives: the a11y audit runs after the play
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('mds-button')!;
    await waitFor(() => expect(button).toHaveAttribute('label', 'Hello async world'), {
      timeout: 3000,
    });
  },
};

export const TextAnimation = {
  render: TemplateAnimation,
};

export const AutoFocus = {
  render: Template,

  args: {
    'auto-focus': true,
  },
};

export const Await = {
  render: TemplateAwait,

  args: {
    await: false,
  },
};

export const Disabled = {
  render: TemplateDisabled,

  args: {
    disabled: false,
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const button = await canvas.findByRole('button');
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    expect(button).toBeDisabled();
    // back to false, as a control switched off: the attribute goes, the button is enabled again
    await userEvent.click(canvasElement.querySelector('mds-button[label="Reset"]')!);
    await waitFor(() => expect(button).not.toBeDisabled());
  },
};

export const Variant = {
  render: Template,

  args: {
    variant: 'success',
  },
};

export const ServiceVariantGoogle = {
  render: TemplateService,

  args: {
    variant: 'google',
    label: 'Login with Google',
  },
};

export const ServiceVariantApple = {
  render: TemplateService,

  args: {
    variant: 'apple',
    label: 'Login with Apple',
  },
};

export const Tone = {
  render: Template,

  args: {
    variant: 'success',
    tone: 'weak',
  },
};

export const Size = {
  render: Template,

  args: {
    size: 'sm',
  },
};

export const Icon = {
  render: TemplateIcon,

  args: {
    icon: 'mi/baseline/eco',
    title: 'Pianta un albero',
  },
};

export const IconFill = {
  render: TemplateIcon,

  args: {
    variant: 'success',
    icon: 'mi/baseline/eco',
    class: 'fill-status-error-05',
  },
};

export const IconARIATitle = {
  render: TemplateIcon,

  args: {
    icon: 'mi/baseline/eco',
    'aria-label': 'Pianta un albero',
  },
};

export const IconPosition = {
  render: Template,

  args: {
    'icon-position': 'right',
    icon: 'mi/baseline/eco',
  },
};

export const KeyboardPress = {
  render: TemplateKeyboard,

  args: {
    onClick: () => {
      alert('Button clicked');
    },
  },
};

export const Href = {
  render: Template,

  args: {
    href: 'http://www.maggioli.it',
  },
};

export const Target = {
  render: Template,

  args: {
    href: 'http://www.maggioli.it',
    target: 'blank',
  },
};

export const Notifications = {
  render: TemplateNotifications,
};

// the button that leads to the view you are in (#1264): the sections of a bar as links, then a
// switcher in every tone, with the current one in the middle
const TemplateCurrent = () => (
  <div class="grid gap-600">
    <nav aria-label="Sezioni" class="flex flex-wrap gap-200">
      <mds-button href="#pratiche" variant="dark" tone="text" current>
        Pratiche
      </mds-button>
      <mds-button href="#contatti" variant="dark" tone="text">
        Contatti
      </mds-button>
      <mds-button href="#scadenze" variant="dark" tone="text">
        Scadenze
      </mds-button>
    </nav>
    {toneBoxVariantDictionary.map((tone) => (
      <div key={tone} class="flex flex-wrap items-center gap-200">
        <mds-text typography="detail" class="w-1600 text-fg-muted">
          {tone}
        </mds-text>
        {['Giorno', 'Settimana', 'Mese'].map((label) => (
          <mds-button
            key={label}
            tone={tone}
            type="button"
            label={label}
            current={label === 'Settimana' ? true : undefined}
          ></mds-button>
        ))}
      </div>
    ))}
  </div>
);

export const Current = {
  render: TemplateCurrent,
  play: async ({ canvas }) => {
    const here = (await canvas.findByRole('link', { name: 'Pratiche' })) as HTMLMdsButtonElement;
    await waitFor(() => expect(here).toHaveAttribute('aria-current', 'page'));
    expect(here).toHaveAttribute('tabindex', '0');
    expect(canvas.getByRole('link', { name: 'Contatti' })).not.toHaveAttribute('aria-current');
  },
};

// the icon of each state (#1264): outline at rest, filled on the current section and under the
// pointer, which previews it. The switcher of the views marks the current one with a check and
// keeps the icons still under the pointer, icon-hover set to icon: a check there would say the
// view is chosen before the click. The slugs are written out whole: iconsauce serves only the
// ones it reads in the sources
const TemplateCurrentIcons = () => (
  <div class="grid gap-600">
    <nav aria-label="Sezioni" class="flex flex-wrap gap-200">
      <mds-button
        href="#home"
        variant="dark"
        tone="text"
        icon="mi/outline/home"
        icon-current="mi/baseline/home"
      >
        Home
      </mds-button>
      <mds-button
        href="#pratiche"
        variant="dark"
        tone="text"
        icon="mi/outline/folder"
        icon-current="mi/baseline/folder"
        current
      >
        Pratiche
      </mds-button>
      <mds-button
        href="#impostazioni"
        variant="dark"
        tone="text"
        icon="mi/outline/settings"
        icon-current="mi/baseline/settings"
      >
        Impostazioni
      </mds-button>
    </nav>
    <div class="flex flex-wrap gap-200">
      <mds-button
        type="button"
        tone="weak"
        icon="mi/baseline/view-list"
        icon-current="mi/baseline/check"
        icon-hover="mi/baseline/view-list"
        label="Elenco"
        current
      ></mds-button>
      <mds-button
        type="button"
        tone="weak"
        icon="mi/baseline/grid-view"
        icon-current="mi/baseline/check"
        icon-hover="mi/baseline/grid-view"
        label="Griglia"
      ></mds-button>
    </div>
  </div>
);

// the icons at rest and on the current button: the userEvent of the play dispatches events and
// moves no pointer, so :hover never matches here; the icon under the pointer is tested with a
// real one in mds-button.e2e.ts
export const CurrentIcons = {
  render: TemplateCurrentIcons,
  play: async ({ canvas, canvasElement }) => {
    const shown = (button: HTMLElement) =>
      Array.from(button.shadowRoot!.querySelectorAll<HTMLMdsIconElement>('.icon'))
        .filter((icon) => getComputedStyle(icon).display !== 'none')
        .map((icon) => icon.name);
    const here = await canvas.findByRole('link', { name: 'Pratiche' });
    const view = canvasElement.querySelector('mds-button[label="Elenco"]') as HTMLElement;

    await waitFor(() => expect(shown(here)).toEqual(['mi/baseline/folder']));
    expect(shown(canvas.getByRole('link', { name: 'Home' }))).toEqual(['mi/outline/home']);
    expect(shown(view)).toEqual(['mi/baseline/check']);
  },
};

export const FormParticipation = {
  render: TemplateForm,

  args: {
    type: 'button',
  },
};

export const TestInteraction = {
  render: Template,
  args: {
    onClick: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const button = (await canvas.findByRole('button')) as HTMLMdsButtonElement;
    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalledOnce();
  },
};

const variantToneCombinations = buttonVariantDictionary.flatMap((variant) =>
  toneBoxVariantDictionary.map((tone) => ({ tone, variant })),
);

const VariantsTableTemplate = () => (
  <mds-table>
    <mds-table-header>
      <mds-table-header-cell label="Preview"></mds-table-header-cell>
      <mds-table-header-cell label="Variant" sortable></mds-table-header-cell>
      <mds-table-header-cell label="Tone" sortable></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      {variantToneCombinations.map(({ tone, variant }) => (
        <mds-table-row key={`${variant}-${tone}`}>
          <mds-table-cell>
            <mds-button variant={variant} tone={tone} label="Hello world"></mds-button>
          </mds-table-cell>
          <mds-table-cell value={variant}>
            <mds-text typography="hack" class="whitespace-nowrap">
              {variant}
            </mds-text>
          </mds-table-cell>
          <mds-table-cell value={tone}>
            <mds-text typography="hack" class="whitespace-nowrap">
              {tone}
            </mds-text>
          </mds-table-cell>
        </mds-table-row>
      ))}
    </mds-table-body>
  </mds-table>
);

export const VariantsTable = {
  render: VariantsTableTemplate,
};

/**
 * Every state of the button once the story has opened (#1440, @fixture/states): each variant in
 * every tone, the service variants, the sizes with and without icon, the icon on either side and
 * alone, disabled (by the attribute and by a fieldset), waiting, the current view (a switcher, a
 * bar of links, a section, its icon), a link, a notification, the long label in each truncation and
 * the animated label. The rows of tones go from the most marked to the least: box, strong, weak,
 * outline, text; secondary renders as primary, kept for compatibility (docs/agents/variants.md).
 * The light variant is painted in the paper of the mode, so it sits on the inverse surface, as on
 * an image or a dark band of a product. A state only an interaction reaches (`play: true`) is
 * brought there by the play function, which checks the property, not the look. The icon under the
 * pointer (`icon-hover`) and the hover of each tone need a real pointer, which a play does not
 * move: mds-button.e2e.ts tests them. `type` and `download` change what a click does, not how the
 * button looks.
 */
interface ButtonState {
  state: string;
  play?: boolean;
  /** the inverse surface, for the variant painted in the paper of the mode */
  inverse?: boolean;
  /** the buttons sit in a disabled fieldset */
  fieldset?: boolean;
  /** a count in the notification slot of each button */
  notification?: number;
  buttons: Record<string, string | boolean>[];
}

const stateTones = ['box', 'strong', 'weak', 'outline', 'text'];
const everyTone = (button: Record<string, string | boolean>): Record<string, string | boolean>[] =>
  stateTones.map((tone) => ({ ...button, tone }));
const toneNames = stateTones.join(', ');

// the label each variant takes in a product: what the variant says
const variantLabels: [ButtonVariantType, string][] = [
  ['primary', 'Salva'],
  ['secondary', 'Modifica'],
  ['ai', 'Riassumi'],
  ['dark', 'Annulla'],
  ['light', 'Apri'],
  ['error', 'Elimina'],
  ['warning', 'Sospendi'],
  ['success', 'Approva'],
  ['info', 'Dettagli'],
];

const sizeButtons = (size: string): Record<string, string | boolean>[] => [
  { size, label: 'Aggiungi' },
  { size, label: 'Aggiungi', icon: 'mi/baseline/add' },
  { size, icon: 'mi/baseline/add', 'aria-label': 'Aggiungi' },
];

const longLabel = 'Scarica il riepilogo delle pratiche del trimestre';
const pressed = 'pressed (strong, weak, outline)';
const focused = 'focused';

const buttonStates: ButtonState[] = [
  ...variantLabels.map(([variant, label]) => ({
    state: `variant ${variant} (${toneNames})`,
    inverse: variant === 'light',
    buttons: everyTone({ variant, label, type: 'button' }),
  })),
  { state: 'variant google', buttons: [{ variant: 'google', label: 'Accedi con Google' }] },
  { state: 'variant apple', buttons: [{ variant: 'apple', label: 'Accedi con Apple' }] },
  { state: 'size sm', buttons: sizeButtons('sm') },
  { state: 'size md (default)', buttons: sizeButtons('md') },
  { state: 'size lg', buttons: sizeButtons('lg') },
  { state: 'size xl', buttons: sizeButtons('xl') },
  { state: 'icon left (default)', buttons: [{ label: 'Aggiungi', icon: 'mi/baseline/add' }] },
  {
    state: 'icon right',
    buttons: [{ label: 'Avanti', icon: 'mi/baseline/arrow-forward', 'icon-position': 'right' }],
  },
  {
    state: 'icon only, named by aria-label (strong, weak, outline, text)',
    buttons: ['strong', 'weak', 'outline', 'text'].map((tone) => ({
      icon: 'mi/baseline/delete',
      'aria-label': 'Elimina la pratica',
      variant: 'error',
      tone,
    })),
  },
  {
    state: 'icon only, named from its slug',
    buttons: [{ icon: 'mi/baseline/print', variant: 'dark', tone: 'weak' }],
  },
  {
    state: `disabled (${toneNames})`,
    buttons: everyTone({ label: 'Salva', disabled: true }),
  },
  {
    state: 'disabled, icon only',
    buttons: [{ icon: 'mi/baseline/delete', 'aria-label': 'Elimina la pratica', disabled: true }],
  },
  {
    state: 'disabled by its fieldset',
    fieldset: true,
    buttons: [{ label: 'Salva' }, { label: 'Annulla', variant: 'dark', tone: 'outline' }],
  },
  {
    state: 'await (strong, weak, outline)',
    buttons: ['strong', 'weak', 'outline'].map((tone) => ({
      label: 'Salvataggio in corso',
      tone,
      await: true,
    })),
  },
  {
    state: 'await, with icon',
    buttons: [{ label: 'Invio in corso', icon: 'mi/baseline/send', await: true }],
  },
  {
    state: 'await, icon only',
    buttons: [{ icon: 'mi/baseline/send', 'aria-label': 'Invia', await: true }],
  },
  {
    state: 'current, a switcher',
    buttons: [
      { label: 'Giorno', tone: 'weak', type: 'button' },
      { label: 'Settimana', tone: 'weak', type: 'button', current: true },
      { label: 'Mese', tone: 'weak', type: 'button' },
    ],
  },
  {
    state: `current (${toneNames})`,
    buttons: everyTone({ label: 'Settimana', type: 'button', current: true }),
  },
  {
    state: 'current page, a bar of links',
    buttons: [
      { label: 'Pratiche', href: '#pratiche', variant: 'dark', tone: 'text', current: true },
      { label: 'Contatti', href: '#contatti', variant: 'dark', tone: 'text' },
      { label: 'Scadenze', href: '#scadenze', variant: 'dark', tone: 'text' },
    ],
  },
  {
    state: 'current section, a link back',
    buttons: [
      { label: 'Pratiche', href: '#pratiche', variant: 'dark', tone: 'text', current: 'section' },
      { label: 'Contatti', href: '#contatti', variant: 'dark', tone: 'text' },
    ],
  },
  {
    state: 'current, with icon-current',
    buttons: [
      {
        label: 'Home',
        href: '#home',
        variant: 'dark',
        tone: 'text',
        icon: 'mi/outline/home',
        'icon-current': 'mi/baseline/home',
      },
      {
        label: 'Pratiche',
        href: '#pratiche',
        variant: 'dark',
        tone: 'text',
        icon: 'mi/outline/folder',
        'icon-current': 'mi/baseline/folder',
        current: true,
      },
    ],
  },
  {
    state: 'link (href)',
    buttons: [{ label: 'Vai alle pratiche', href: '#pratiche', tone: 'outline' }],
  },
  {
    state: 'link, new tab',
    buttons: [
      {
        label: 'Visita il sito',
        href: 'https://www.maggioli.it',
        target: 'blank',
        icon: 'mi/baseline/open-in-new',
        'icon-position': 'right',
        tone: 'weak',
      },
    ],
  },
  {
    state: 'notification',
    notification: 12,
    buttons: [{ label: 'Messaggi', icon: 'mi/baseline/email', variant: 'dark', tone: 'weak' }],
  },
  {
    state: 'long label, truncate word (default)',
    buttons: [{ label: longLabel, class: 'max-w-6400' }],
  },
  {
    state: 'long label, truncate all',
    buttons: [{ label: longLabel, truncate: 'all', class: 'max-w-6400' }],
  },
  {
    state: 'long label, truncate none',
    buttons: [{ label: longLabel, truncate: 'none', class: 'max-w-6400' }],
  },
  { state: 'animation yugop', buttons: [{ label: 'Conferma azione', animation: 'yugop' }] },
  {
    state: pressed,
    play: true,
    buttons: ['strong', 'weak', 'outline'].map((tone) => ({ label: 'Salva', tone })),
  },
  { state: focused, play: true, buttons: [{ label: 'Salva' }] },
];

const TemplateStates = () => (
  <StatesGrid>
    {buttonStates.map(({ state, play, inverse, fieldset, notification, buttons }) => {
      const row = buttons.map((props, index) => (
        <mds-button key={String(index)} {...props}>
          {notification !== undefined && (
            <mds-notification slot="notification" value={notification}></mds-notification>
          )}
        </mds-button>
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
        </StateCell>
      );
    })}
  </StatesGrid>
);

/** The buttons of a cell, once every Magma element of the cell has loaded. */
const loadedButtons = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return Array.from(cell.querySelectorAll('mds-button')) as HTMLMdsButtonElement[];
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  // pressed and held: the host listens to mousedown, and lets go on mouseup or mouseout
  const held = await loadedButtons(canvasElement, pressed);
  held.forEach((button) => button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
  // the host is the tab stop of the button
  const [focus] = await loadedButtons(canvasElement, focused);
  focus.focus();

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => held.forEach((button) => expect(button).toHaveProperty('active', true)));
  await waitFor(() => expect(canvasElement.ownerDocument.activeElement).toBe(focus));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
