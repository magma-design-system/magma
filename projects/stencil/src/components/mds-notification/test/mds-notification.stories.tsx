import { strategyDictionary } from '../meta/dictionary';
import { themeStatusVariantDictionary } from '@type/variant';
import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Feedback / Notification',
  id: 'ui-notification',
  argTypes: {
    strategy: {
      type: { name: 'string' },
      description: 'Specifies the position strategy of the notification',
      options: strategyDictionary,
      control: { type: 'select' },
    },
    value: {
      description: 'Specifies the number of notifications to display',
      type: { name: 'number' },
    },
    dismissed: {
      description: 'Specifies if the notification is dismissed',
      type: { name: 'boolean' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the colour of the dot and of the badge, a status',
      options: themeStatusVariantDictionary,
      control: { type: 'select' },
    },
    pulse: {
      description: 'Specifies if the dot pulses when `value` grows: three beats and then still',
      type: { name: 'boolean' },
    },
  },
};

const Template = (args) => (
  <div>
    <mds-notification target="#my-button" {...args} />
    <mds-button class="fixed bottom-2000 right-2000" id="my-button" icon="mdi/email">
      Incoming messages
    </mds-button>
  </div>
);

const TemplateStatic = (args) => (
  <div>
    <mds-button class="fixed bottom-2000 right-2000" id="my-button" icon="mdi/email">
      Incoming messages
      <mds-notification
        style={{ '--mds-notification-ring-size': '0' }}
        slot="notification"
        {...args}
      />
    </mds-button>
  </div>
);

const TemplateStaticPositioning = (args) => (
  <div>
    <mds-button class="fixed bottom-2000 right-2000" id="my-button" icon="mdi/email">
      Incoming messages
      <mds-notification
        class="absolute -top-300 -right-200 translate-1/2"
        slot="notification"
        {...args}
      />
    </mds-button>
  </div>
);

export const Default = {
  render: Template,
};

export const Value = {
  render: Template,

  args: {
    value: 7,
    dismissed: false,
  },
};

export const NoValue = {
  render: Template,

  args: {
    dismissed: false,
  },
};

export const Static = {
  render: TemplateStatic,

  args: {
    strategy: 'disabled',
    value: 7,
    dismissed: false,
  },
};

export const StaticPositioning = {
  render: TemplateStaticPositioning,

  args: {
    strategy: 'disabled',
    value: 31,
    dismissed: false,
  },
};

export const Max = {
  render: Template,

  args: {
    value: 15,
    max: 9,
    dismissed: false,
  },
};

const TemplateVariants = (args) => (
  <div class="flex flex-wrap items-center gap-600">
    {themeStatusVariantDictionary.map((variant) => (
      <mds-notification key={variant} {...args} variant={variant} />
    ))}
  </div>
);

export const Variants = {
  render: TemplateVariants,

  args: {
    strategy: 'disabled',
    value: 7,
  },
};

// the line of the new items of a list (pattern list-with-filters, case show-new-items): the
// count grows with every click, and the dot pulses three times each time it does
const TemplatePulseInLine = (args) => {
  const add = () => {
    const notification = document.querySelector<HTMLMdsNotificationElement>('#new-items');
    if (notification) notification.value = notification.value + 1;
  };

  return (
    <div class="flex flex-wrap items-center gap-600">
      <div class="flex items-center gap-200">
        <p role="status" class="flex items-center gap-100">
          <mds-notification id="new-items" {...args} />
          <mds-text typography="detail">nuove pratiche</mds-text>
        </p>
        <mds-button variant="info" tone="outline" size="sm">
          Mostra
        </mds-button>
      </div>
      <mds-button variant="dark" tone="weak" size="sm" icon="mi/baseline/add" onClick={add}>
        Aggiungi una pratica
      </mds-button>
    </div>
  );
};

export const PulseInLine = {
  render: TemplatePulseInLine,

  args: {
    variant: 'info',
    pulse: true,
    value: 3,
  },
};

/**
 * Every state of the badge once the story has opened (#1440, @fixture/states), in the three
 * places a product puts it: in the `notification` slot of an mds-button (the common one, placed
 * by the button, `strategy` turns `disabled` by itself), floating on a target it finds by
 * `target`, and in a line of text. A floating badge is positioned by floating-ui from the box of
 * its target, so its cell holds it in place by holding the target: the default `fixed` strategy
 * follows the viewport and is measured again on every scroll and resize, `absolute` is placed in
 * the box of the cell (`relative`). Counts stay under 1000, so the number reads the same in every
 * locale (`toLocaleString` writes the thousands). The pulse is the one state an interaction
 * reaches: the play function makes the count grow and checks `value`; the ring plays three beats
 * (3 seconds) and stops, and never plays with a reduced animation (`globals=animation:reduce`), so
 * a screenshot of the first seconds may catch a beat.
 */
interface NotificationState {
  state: string;
  play?: boolean;
  place: 'button' | 'target' | 'line';
  props: Record<string, string | number | boolean>;
}

const notificationStates: NotificationState[] = [
  { state: 'in a button, count', place: 'button', props: { value: 7 } },
  { state: 'in a button, dot', place: 'button', props: { value: 0 } },
  { state: 'in a button, three digits', place: 'button', props: { value: 128 } },
  { state: 'in a button, over max', place: 'button', props: { value: 15, max: 9 } },
  { state: 'in a button, dismissed', place: 'button', props: { value: 7, dismissed: true } },
  { state: 'variant error (default)', place: 'button', props: { value: 7, variant: 'error' } },
  { state: 'variant info', place: 'button', props: { value: 7, variant: 'info' } },
  { state: 'variant success', place: 'button', props: { value: 7, variant: 'success' } },
  { state: 'variant warning', place: 'button', props: { value: 7, variant: 'warning' } },
  { state: 'on a target, fixed', place: 'target', props: { value: 3 } },
  { state: 'on a target, absolute', place: 'target', props: { value: 3, strategy: 'absolute' } },
  { state: 'on a target, dot', place: 'target', props: { value: 0, strategy: 'absolute' } },
  {
    state: 'on a target, dismissed',
    place: 'target',
    props: { value: 3, strategy: 'absolute', dismissed: true },
  },
  { state: 'in a line', place: 'line', props: { value: 3, variant: 'info' } },
  {
    state: 'in a line, count grown, pulse',
    play: true,
    place: 'line',
    props: { value: 3, variant: 'info', pulse: true },
  },
];

// an id for the target of a cell, from the name of its state
const targetId = (state: string) => `notification-${state.replace(/[^a-z]+/g, '-')}`;

const TemplateStates = () => (
  <StatesGrid>
    {notificationStates.map(({ state, play, place, props }) => (
      <StateCell key={state} state={state} play={play}>
        {place === 'button' && (
          <div class="flex">
            <mds-button icon="mdi/email" label="Messaggi">
              <mds-notification slot="notification" {...props}></mds-notification>
            </mds-button>
          </div>
        )}
        {place === 'target' && (
          <div class="relative flex p-200">
            <mds-button
              id={targetId(state)}
              icon="mdi/email"
              label="Messaggi"
              variant="dark"
              tone="weak"
            ></mds-button>
            <mds-notification target={`#${targetId(state)}`} {...props}></mds-notification>
          </div>
        )}
        {place === 'line' && (
          <p role="status" class="flex items-center gap-100">
            <mds-notification {...props}></mds-notification>
            <mds-text typography="detail">nuove pratiche</mds-text>
          </p>
        )}
      </StateCell>
    ))}
  </StatesGrid>
);

/** The badge of a cell, once every Magma element of the cell has loaded. */
const loadedNotification = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return cell.querySelector('mds-notification') as HTMLMdsNotificationElement;
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const grown = await loadedNotification(canvasElement, 'in a line, count grown, pulse');
  // the count grows as a product sets it, after the first render: the first is no change
  grown.value = 4;
  await waitFor(() => expect(grown).toHaveProperty('value', 4));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
