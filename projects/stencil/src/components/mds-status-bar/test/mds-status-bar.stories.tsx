import { h } from '@stencil/core';
import { useState } from 'react';
import { statusBarPositionDictionary } from '../meta/dictionary';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Actions / Status bar',
  id: 'ui-status-bar',
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Specifies the description near the slotted actions',
    },
    position: {
      type: { name: 'string' },
      description: 'Specifies the position of the status bar',
      options: statusBarPositionDictionary,
      control: { type: 'select' },
    },
    visible: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is visible',
    },
  },
};

const Template = (args) => {
  let statusBar: HTMLMdsStatusBarElement | null = document.querySelector(
    'mds-status-bar',
  ) as HTMLMdsStatusBarElement;
  let cancel: HTMLMdsButtonElement | null = document.querySelector(
    '#cancel',
  ) as HTMLMdsButtonElement;
  let confirm: HTMLMdsButtonElement | null = document.querySelector(
    '#confirm',
  ) as HTMLMdsButtonElement;

  const [buttonState, setButtonState] = useState(0);

  const iconMap = {
    0: 'mi/baseline/done',
    1: undefined,
    2: 'mi/baseline/done-all',
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

  function setLoadingState() {
    setButtonState(1);
    cancel = document.querySelector('#cancel') as HTMLMdsButtonElement;
    cancel.disabled = true;
    setTimeout(() => {
      confirm = document.querySelector('#confirm') as HTMLMdsButtonElement;
      setButtonState(2);
      confirm.disabled = true;
      setTimeout(() => {
        statusBar?.hide();
      }, 1000);
      setTimeout(() => {
        setButtonState(0);
      }, 1500);
    }, 2000);
  }

  return (
    <div>
      <mds-button
        onClick={() => {
          statusBar = document.querySelector('mds-status-bar') as HTMLMdsStatusBarElement;
          if (statusBar) statusBar.visible = true;
          if (cancel) cancel.disabled = undefined;
          if (confirm) confirm.disabled = undefined;
        }}
      >
        Edit stuff
      </mds-button>
      <mds-status-bar {...args}>
        <mds-button
          id="cancel"
          variant="dark"
          tone="weak"
          onClick={(e: MouseEvent) => {
            (e.target as HTMLElement).closest('mds-status-bar')?.hide();
          }}
        >
          Annulla
        </mds-button>
        <mds-button
          id="confirm"
          icon={iconMap[buttonState]}
          variant={variantsMap[buttonState]}
          tone={tonesMap[buttonState]}
          await={buttonState === 1}
          onClick={() => {
            if (buttonState === 0) setLoadingState();
          }}
        >
          {buttonState === 0 && 'Conferma azione'}
          {buttonState === 1 && 'Salvataggio in corso...'}
          {buttonState === 2 && 'Salvataggio riuscito'}
        </mds-button>
      </mds-status-bar>
    </div>
  );
};

export const Default = {
  render: Template,

  args: {
    description: 'Stai modificando 4 elementi',
  },
};

/**
 * Every state of the bar once the story has opened (#1440, @fixture/states). The bar docks to the
 * bottom of the window, so each one sits in a stage of its own, which is the window to it: the
 * `transform` of the stage makes it the containing block of the fixed window of the bar, which
 * would otherwise stack every bar of the page in the same corner. Shown at each position, with its
 * actions alone, so that the stage shows where it docks; with the description, beside one action, a
 * long one, an action that waits while the other is disabled, and a split button among the actions;
 * hidden; and hidden by its cancel action, as a product closes it. The actions stack only on a
 * window of 480px or less, which the stages of this page are not: that state needs a narrow
 * viewport. A state only an interaction reaches (`play: true`) is brought there by the play
 * function, which checks `visible`, not the look.
 */
interface BarState {
  state: string;
  play?: boolean;
  bar: Record<string, string | boolean>;
  actions: Record<string, string | boolean>[];
  /** a split button as the main action, in place of the last button */
  dropdown?: boolean;
}

const cancel = { label: 'Annulla', variant: 'dark', tone: 'weak', type: 'button' };
const confirm = { label: 'Conferma', type: 'button' };
const editing = 'Stai modificando 4 elementi';
const hiddenByCancel = 'hidden by its cancel action';

const barStates: BarState[] = [
  {
    state: 'visible, bottom-right (default)',
    bar: { visible: true },
    actions: [cancel, confirm],
  },
  {
    state: 'position bottom',
    bar: { visible: true, position: 'bottom' },
    actions: [cancel, confirm],
  },
  {
    state: 'position bottom-left',
    bar: { visible: true, position: 'bottom-left' },
    actions: [cancel, confirm],
  },
  {
    state: 'description',
    bar: { visible: true, description: editing },
    actions: [cancel, confirm],
  },
  {
    state: 'description, one action',
    bar: { visible: true, description: editing },
    actions: [confirm],
  },
  {
    state: 'long description',
    bar: {
      visible: true,
      description:
        'Stai modificando 4 elementi: le modifiche saranno visibili a tutti i membri del gruppo dopo la conferma',
    },
    actions: [cancel, confirm],
  },
  {
    state: 'saving: an action waits, the other disabled',
    bar: { visible: true, description: editing },
    actions: [
      { ...cancel, disabled: true },
      { label: 'Salvataggio in corso', type: 'button', await: true },
    ],
  },
  {
    state: 'a split button among the actions',
    bar: { visible: true, description: editing },
    actions: [cancel],
    dropdown: true,
  },
  { state: 'hidden', bar: { description: editing }, actions: [cancel, confirm] },
  {
    state: hiddenByCancel,
    play: true,
    bar: { visible: true, description: editing },
    actions: [cancel, confirm],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {barStates.map(({ state, play, bar, actions, dropdown }) => (
      <StateCell key={state} state={state} play={play}>
        {/* the window of the bar: its transform contains the fixed window of the bar */}
        <div
          class="relative h-4800 overflow-hidden rounded-lg bg-surface-default"
          style={{ transform: 'translateZ(0)' }}
        >
          <mds-status-bar {...bar}>
            {actions.map((props, index) => (
              <mds-button
                key={String(index)}
                {...props}
                onClick={
                  props === cancel
                    ? (event: MouseEvent) =>
                        (event.currentTarget as HTMLElement).closest('mds-status-bar')?.hide()
                    : undefined
                }
              ></mds-button>
            ))}
            {dropdown && (
              <mds-button-dropdown label="Conferma">
                <mds-button
                  variant="dark"
                  tone="text"
                  type="button"
                  label="Conferma e invia"
                ></mds-button>
              </mds-button-dropdown>
            )}
          </mds-status-bar>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const cell = stateCell(canvasElement, hiddenByCancel);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const bar = cell.querySelector('mds-status-bar') as HTMLMdsStatusBarElement;
  (cell.querySelector('mds-button[label="Annulla"]') as HTMLElement).click();

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(bar).toHaveProperty('visible', undefined));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
