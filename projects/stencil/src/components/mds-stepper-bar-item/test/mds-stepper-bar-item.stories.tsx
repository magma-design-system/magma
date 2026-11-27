import { iconsDictionary, mggIconsDictionary } from '@type/icon';
import { TypographyType, typographyInfoDictionary } from '@type/typography';
import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Navigation / Stepper Bar / Stepper Bar Item',
  id: 'ui-stepper-bar-stepper-bar-item',
  argTypes: {
    done: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is checked or not',
    },
    current: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is the current or not',
    },
    icon: {
      type: { name: 'string' },
      description:
        'Specifies the icon displayed of the component when is not checked or the current item',
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
    },
    'icon-checked': {
      type: { name: 'string' },
      description: 'Specifies the icon displayed of the component when is checked',
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
    },
    text: {
      type: { name: 'string' },
      description: 'Specifies a short description of the component',
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographyInfoDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-stepper-bar items-done={0}>
    <mds-stepper-bar-item
      icon-checked="mi/baseline/done"
      icon="mi/baseline/agriculture"
      label="First"
    />
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mi/baseline/adobe" label="Second" />
    <mds-stepper-bar-item icon-checked="mi/baseline/done" {...args} />
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mi/baseline/css" label="Forth" />
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mdi/baseball" label="Fifth" />
  </mds-stepper-bar>
);

const TemplateDone = (args) => (
  <mds-stepper-bar items-done={3}>
    <mds-stepper-bar-item
      done
      icon="mi/baseline/agriculture"
      icon-checked={args['icon-checked']}
      label="First"
    />
    <mds-stepper-bar-item
      done
      icon="mi/baseline/adobe"
      icon-checked={args['icon-checked']}
      label="Second"
    />
    <mds-stepper-bar-item {...args} />
    <mds-stepper-bar-item icon="mi/baseline/css" label="Forth" />
    <mds-stepper-bar-item icon="mi/baseline/local-activity" label="Fifth" />
  </mds-stepper-bar>
);

// mi_baseline_local-activity
// mi_baseline_bluetooth

const defaultArgs = {
  icon: 'mi/baseline/book',
  label: 'Third',
};

export const Default = {
  render: Template,

  args: {
    ...defaultArgs,
  },
};

export const Done = {
  render: TemplateDone,

  args: {
    ...defaultArgs,
    done: true,
  },
};

export const Current = {
  render: TemplateDone,

  args: {
    ...defaultArgs,
    current: true,
  },
};

export const IconChecked = {
  render: TemplateDone,

  args: {
    ...defaultArgs,
    done: true,
    'icon-checked': 'mi/baseline/done',
  },
};

export const Text = {
  render: Template,

  args: {
    ...defaultArgs,
    text: 'Item text',
  },
};

export const Typography = {
  render: Template,

  args: {
    ...defaultArgs,
    typography: 'paragraph',
  },
};

/**
 * Every state a step has of its own once the story has opened (#1440, @fixture/states), each in
 * a bar of two steps: the step in the state is the first ("Richiedente"), or the second, the last
 * of the bar, in the states named `last`; the other is its context. The bar decides whether a step
 * is queued, current or done (its `items-done`), the step how it shows it: the icon and the one
 * that replaces it once done, the badge, the caption above the label (the one of the component
 * or the page's), the typography and the long label that wraps, and the last step, without the
 * bar after its icon. The states of the bar (where the current step is, the panels, the strip
 * that scrolls) are in the story of mds-stepper-bar.
 *
 * A done step asks to go back (`mdsStepperBarItemDone`) and the page answers by moving the bar
 * there, as a product does. A state only an interaction reaches (`play: true`) is brought there
 * by the play function, which checks `current`, not its look.
 */
interface StepProps {
  label: string;
  icon: string;
  value: string;
  'icon-checked'?: string;
  badge?: boolean;
  step?: boolean;
  'step-label'?: string;
  typography?: TypographyType;
}

interface StepState {
  state: string;
  play?: boolean;
  itemsDone: number;
  /** the props of the step in the state; the other step takes the ones it shares with it */
  step: StepProps;
  last?: boolean;
}

const applicant: StepProps = {
  icon: 'mi/baseline/person',
  'icon-checked': 'mi/baseline/done',
  label: 'Richiedente',
  value: 'richiedente',
};
const withBadge: StepProps = { ...applicant, badge: true, step: true };
const sending: StepProps = {
  badge: true,
  step: true,
  icon: 'mi/baseline/send',
  'icon-checked': 'mi/baseline/done',
  label: 'Invio',
  value: 'invio',
};

const stepStates: StepState[] = [
  { state: 'queued', itemsDone: 0, step: applicant },
  { state: 'current', itemsDone: 1, step: applicant },
  { state: 'done, its checked icon', itemsDone: 2, step: applicant },
  {
    state: 'done, without a checked icon',
    itemsDone: 2,
    step: { icon: 'mi/baseline/person', label: 'Richiedente', value: 'richiedente' },
  },
  { state: 'badge and caption, queued', itemsDone: 0, step: withBadge },
  { state: 'badge and caption, current', itemsDone: 1, step: withBadge },
  { state: 'badge and caption, done', itemsDone: 2, step: withBadge },
  { state: 'caption only', itemsDone: 1, step: { ...applicant, step: true } },
  {
    state: 'caption of the page',
    itemsDone: 1,
    step: { ...applicant, step: true, 'step-label': 'Fase {{ index }}' },
  },
  { state: 'badge only', itemsDone: 1, step: { ...applicant, badge: true } },
  { state: 'smaller typography', itemsDone: 1, step: { ...withBadge, typography: 'detail' } },
  {
    state: 'long label',
    itemsDone: 1,
    step: { ...withBadge, label: 'Dati del richiedente e del delegato alla presentazione' },
  },
  { state: 'last, queued', itemsDone: 1, step: sending, last: true },
  { state: 'last, current', itemsDone: 2, step: sending, last: true },
  { state: 'last, done', itemsDone: 3, step: sending, last: true },
  { state: 'done step chosen by a click', play: true, itemsDone: 2, step: withBadge },
  { state: 'done step chosen with Enter', play: true, itemsDone: 2, step: withBadge },
];

/** What the page does when a done step asks to go back: it moves the bar to that step. */
const goBack = (event: Event) => {
  const bar = event.currentTarget as HTMLMdsStepperBarElement;
  const items = Array.from(bar.querySelectorAll('mds-stepper-bar-item'));
  const index = items.indexOf(event.target as HTMLMdsStepperBarItemElement);
  if (index >= 0) bar.setAttribute('items-done', String(index + 1));
};

const TemplateStates = () => (
  <StatesGrid>
    {stepStates.map(({ state, play, itemsDone, step, last }) => {
      // the other step shares how the steps show themselves, not what they are
      const { badge, step: caption, typography } = step;
      const other: StepProps = {
        badge,
        step: caption,
        typography,
        icon: last ? 'mi/baseline/person' : 'mi/baseline/send',
        'icon-checked': 'mi/baseline/done',
        label: last ? 'Richiedente' : 'Invio',
        value: last ? 'richiedente' : 'invio',
      };
      const [first, second] = last ? [other, step] : [step, other];
      return (
        <StateCell key={state} state={state} play={play}>
          <mds-stepper-bar
            items-done={itemsDone}
            ref={(element) => element?.addEventListener('mdsStepperBarItemDone', goBack)}
          >
            <mds-stepper-bar-item {...first}></mds-stepper-bar-item>
            <mds-stepper-bar-item {...second}></mds-stepper-bar-item>
          </mds-stepper-bar>
        </StateCell>
      );
    })}
  </StatesGrid>
);

/** The steps of a cell, once every Magma element of the cell has loaded. */
const loadedSteps = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return Array.from(
    cell.querySelectorAll('mds-stepper-bar-item'),
  ) as HTMLMdsStepperBarItemElement[];
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const [clicked] = await loadedSteps(canvasElement, 'done step chosen by a click');
  clicked.click();
  // Enter on the step, which listens to it on its host
  const [enter] = await loadedSteps(canvasElement, 'done step chosen with Enter');
  enter.dispatchEvent(
    new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true, cancelable: true }),
  );

  // the properties, not the attributes: Stencil reflects them on the next frame, and a hidden
  // page draws no frame
  await waitFor(() => expect(clicked).toHaveProperty('current', true));
  await waitFor(() => expect(clicked).toHaveProperty('done', false));
  await waitFor(() => expect(enter).toHaveProperty('current', true));
  await waitFor(() => expect(enter).toHaveProperty('done', false));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
