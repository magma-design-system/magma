import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Feedback / Spinner',
  id: 'ui-spinner',
  argTypes: {
    running: {
      type: { name: 'boolean' },
      description: 'Specifies the number of total pages to be handled',
    },
  },
};

const Template = (args) => <mds-spinner {...args} />;

export const Default = {
  render: Template,
};

export const Running = {
  render: Template,

  args: {
    running: true,
  },
};

/**
 * Every state of the spinner once the story has opened (#1440, @fixture/states). Without
 * `running` the spinner is hidden and still, so its cell keeps only its room (48px). Running, it
 * turns without end, one turn in 0.725s, slowed to 8s with a reduced animation
 * (`globals=animation:reduce`), never stopped: a screenshot catches it at any angle. Its size and
 * ink are the product's, on the host (`w-600 h-600`, a `text-*` class), as the usage docs say. The
 * product starts and stops it: the play function sets `running` on two of them and checks the
 * property, and a spinner stopped with `false` is left with no `running` at all, hidden.
 */
interface SpinnerState {
  state: string;
  play?: boolean;
  label?: boolean;
  props: Record<string, string | boolean>;
}

const spinnerStates: SpinnerState[] = [
  { state: 'idle, hidden', props: {} },
  { state: 'running', props: { running: true } },
  { state: 'running, 24px', props: { running: true, class: 'w-600 h-600' } },
  {
    state: 'running, beside its text, ink of the text',
    label: true,
    props: { running: true, class: 'w-600 h-600 text-fg-default' },
  },
  { state: 'started', play: true, props: {} },
  { state: 'stopped', play: true, props: { running: true } },
];

const TemplateStates = () => (
  <StatesGrid>
    {spinnerStates.map(({ state, play, label, props }) => (
      <StateCell key={state} state={state} play={play}>
        {label ? (
          <div class="flex items-center gap-200">
            <mds-spinner {...props}></mds-spinner>
            <mds-text typography="detail">Caricamento dei documenti in corso...</mds-text>
          </div>
        ) : (
          <div class="flex">
            <mds-spinner {...props}></mds-spinner>
          </div>
        )}
      </StateCell>
    ))}
  </StatesGrid>
);

/** The spinner of a cell, once it has loaded. */
const loadedSpinner = async (canvasElement: HTMLElement, state: string) => {
  const spinner = stateCell(canvasElement, state).querySelector(
    'mds-spinner',
  ) as HTMLMdsSpinnerElement;
  await waitFor(() => expect(spinner).toHaveAttribute('hydrated'));
  return spinner;
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const started = await loadedSpinner(canvasElement, 'started');
  started.running = true;
  const stopped = await loadedSpinner(canvasElement, 'stopped');
  stopped.running = false;

  await waitFor(() => expect(started).toHaveProperty('running', true));
  // false is no state of its own: the spinner turns it into no `running`, as an absent attribute
  await waitFor(() => expect(stopped).toHaveProperty('running', undefined));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
