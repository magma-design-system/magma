import { themeVariantDictionary } from '@type/variant';
import { ToneBoxVariantType, toneMinimalVariantDictionary } from '@type/tone';
import { ButtonVariantType } from '@type/button';

import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { toastPositionDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Feedback / Toast',
  id: 'ui-toast',
  argTypes: {
    dismissible: {
      description: 'Shows a button that closes the toast',
      type: { name: 'boolean', required: false },
    },
    duration: {
      description:
        'If set, specifies the visibility duration in milliseconds of the element inside the viewport, when the time is up the visible property will be set to false',
      type: { name: 'number', required: false },
    },
    position: {
      type: { name: 'string', required: false },
      description: 'Sets position of the toast',
      options: toastPositionDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string', required: false },
      description: 'Sets the tone of the color variant',
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string', required: false },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
    visible: {
      description: 'Specifies if the toast is visible or not',
      type: { name: 'boolean', required: false },
    },
  },
};

const checkVariant = (variant: 'dark' | 'light') => {
  if (variant === 'dark') {
    return 'light';
  }

  if (variant === 'light') {
    return 'dark';
  }

  return variant;
};

const Template = (args) => (
  <mds-toast {...args}>
    <mds-icon slot="icon" name="mi/baseline/warning" />
    Elemento spidiguddato a sinistra con successo
    <mds-button slot="action" size="sm" variant={checkVariant(args.variant)} tone={args.tone}>
      Annulla
    </mds-button>
  </mds-toast>
);

const TemplateSpinner = (args) => (
  <mds-toast {...args}>
    <mds-spinner running slot="icon" class="w-600 h-600" />
    Invio messaggio in corso...
    <mds-button slot="action" size="sm" variant="warning" tone="weak">
      Annulla
    </mds-button>
  </mds-toast>
);

export const Default = {
  render: Template,
};

export const Spinner = {
  render: TemplateSpinner,
};

// a toast with an action stays until it is closed, and the person can close it
export const Persistent = {
  args: {
    dismissible: true,
    duration: 0,
    variant: 'error',
    visible: true,
  },
  render: (args) => (
    <mds-toast {...args}>
      <mds-icon slot="icon" name="mi/baseline/warning" />
      Invio non riuscito
      <mds-button slot="action" size="sm" variant="error" tone="weak">
        Riprova
      </mds-button>
    </mds-toast>
  ),
};

/**
 * Every state of a toast once the story has opened (#1440, @fixture/states). A toast is fixed to
 * an edge of the viewport: each cell holds it on a stage of its own, a box with a `transform`,
 * which makes it the containing block of the fixed toast, and `overflow-hidden`, which clips the
 * toast parked outside it while hidden; so the toasts of the page do not pile up at the bottom of
 * the window. Every toast has `duration="0"` and stays: a countdown would hide it while the story
 * is open. The variants carry an icon and the hide button, whose colour and arrow follow the
 * variant and the edge; the parts one at a time are on the default variant (light, strong). The
 * toast lined up in a column by an mds-toast-region is in the story of the region. The one state
 * an interaction reaches is a toast hidden by the person with its button: the play function clicks
 * it and checks `visible`, and the toast leaves the stage.
 */
interface ToastAction {
  label: string;
  variant: ButtonVariantType;
  tone: ToneBoxVariantType;
}

interface ToastState {
  state: string;
  play?: boolean;
  hidden?: boolean;
  tall?: boolean;
  icon?: string;
  spinner?: boolean;
  text?: string;
  action?: ToastAction;
  props: Record<string, string | number | boolean>;
}

const toastText = 'Bozza salvata';
const toastIcons: Record<string, string> = {
  ai: 'mgg/ai-brain',
  dark: 'mi/baseline/info',
  error: 'mi/baseline/warning',
  info: 'mi/baseline/info',
  light: 'mi/baseline/info',
  primary: 'mi/baseline/info',
  success: 'mi/baseline/check-circle',
  warning: 'mi/baseline/warning',
};
const undo: ToastAction = { label: 'Annulla', variant: 'dark', tone: 'weak' };

const toastStates: ToastState[] = [
  ...themeVariantDictionary.flatMap((variant) =>
    toneMinimalVariantDictionary.map((tone) => ({
      state: `${variant}, ${tone}`,
      icon: toastIcons[variant],
      props: { variant, tone, dismissible: true },
    })),
  ),
  { state: 'text only', props: {} },
  { state: 'icon', icon: 'mi/baseline/check-circle', props: {} },
  { state: 'action', action: undo, props: {} },
  { state: 'dismissible', props: { dismissible: true } },
  {
    state: 'every part',
    icon: 'mi/baseline/delete',
    text: 'Pratica eliminata',
    action: undo,
    props: { dismissible: true },
  },
  {
    state: 'waiting, spinner as icon',
    spinner: true,
    text: 'Invio del messaggio in corso...',
    action: undo,
    props: {},
  },
  {
    state: 'long text',
    tall: true,
    icon: 'mi/baseline/warning',
    text: 'Il documento è stato salvato, ma tre allegati superano la dimensione massima consentita e non sono stati caricati: riducili e caricali di nuovo dalla scheda della pratica.',
    action: { label: 'Riprova', variant: 'error', tone: 'weak' },
    props: { variant: 'error', dismissible: true },
  },
  ...toastPositionDictionary.map((position) => ({
    state:
      position === 'bottom-center' ? 'position bottom-center (default)' : `position ${position}`,
    props: { position, dismissible: true },
  })),
  { state: 'hidden', hidden: true, props: {} },
  { state: 'hidden with its button', play: true, props: { dismissible: true } },
];

const TemplateStates = () => (
  <StatesGrid>
    {toastStates.map(({ state, play, hidden, tall, icon, spinner, text, action, props }) => (
      <StateCell key={state} state={state} play={play}>
        <div
          class={`relative overflow-hidden rounded-md bg-surface-default ${tall ? 'h-4800' : 'h-2800'}`}
          style={{ transform: 'translateZ(0)' }}
        >
          <mds-toast visible={hidden ? undefined : true} duration={0} {...props}>
            {icon && <mds-icon slot="icon" name={icon} />}
            {spinner && <mds-spinner running slot="icon" class="w-600 h-600" />}
            {text ?? toastText}
            {action && (
              <mds-button slot="action" size="sm" variant={action.variant} tone={action.tone}>
                {action.label}
              </mds-button>
            )}
          </mds-toast>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const cell = stateCell(canvasElement, 'hidden with its button');
  const toast = cell.querySelector('mds-toast') as HTMLMdsToastElement;
  await waitFor(() => expect(toast).toHaveAttribute('hydrated'));
  const hide = toast.shadowRoot!.querySelector('mds-button.hide') as HTMLMdsButtonElement;
  await waitFor(() => expect(hide).toHaveAttribute('hydrated'));
  hide.click();
  await waitFor(() => expect(toast).toHaveProperty('visible', false));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
