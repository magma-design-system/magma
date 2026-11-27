import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { stepperBarNavigationDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Navigation / Stepper Bar',
  id: 'ui-stepper-bar',
  argTypes: {
    'items-done': {
      type: { name: 'number' },
      description:
        'Sets the current item to the given index: 0 is none selected, 1 is the first item selected, last number + 1 is all items checked',
    },
    navigation: {
      options: stepperBarNavigationDictionary,
      control: { type: 'select' },
      type: { name: 'string' },
      description: 'Sets the navigation type',
    },
  },
};

const Template = (args) => (
  <mds-stepper-bar {...args}>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/person"
      label="Nuovo account"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/badge"
      label="Dati personali"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/round/email"
      label="Impostazioni newsletter"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/lock-open"
      label="Attivazione account"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/login"
      label="Accedi"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/done"
      label="Finito"
    ></mds-stepper-bar-item>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-amaranth-10 text-label-amaranth-04 relative"
    >
      <mds-text>Nuovo account</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '2');
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-blue-10 text-label-blue-04 relative"
    >
      <mds-text>Dati personali</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '1');
        }}
      >
        Indietro
      </mds-button>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '3');
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-green-10 text-label-green-04 relative"
    >
      <mds-text>Impostazioni newsletter</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '2');
        }}
      >
        Indietro
      </mds-button>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '4');
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-orange-10 text-label-orange-04 relative"
    >
      <mds-text>Attivazione account</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '3');
        }}
      >
        Indietro
      </mds-button>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '5');
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-violet-10 text-label-violet-04 relative"
    >
      <mds-text>Accedi</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '4');
        }}
      >
        Indietro
      </mds-button>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '6');
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-sky-10 text-label-sky-04 relative"
    >
      <mds-text>Finito</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '5');
        }}
      >
        Indietro
      </mds-button>
    </div>
  </mds-stepper-bar>
);

const TemplateOffsetMargin = (args) => (
  <div class="w-full p-600 bg-surface-raised shadow-sharp rounded-2xl">
    <mds-stepper-bar {...args}>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/person"
        label="Nuovo account"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/badge"
        label="Dati personali"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/round/email"
        label="Impostazioni newsletter"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/lock-open"
        label="Attivazione account"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/login"
        label="Accedi"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/done"
        label="Finito"
      ></mds-stepper-bar-item>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-amaranth-10 text-label-amaranth-04 relative"
      >
        <mds-text>Nuovo account</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '2');
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-blue-10 text-label-blue-04 relative"
      >
        <mds-text>Dati personali</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="outline"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '1');
          }}
        >
          Indietro
        </mds-button>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '3');
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-green-10 text-label-green-04 relative"
      >
        <mds-text>Impostazioni newsletter</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="outline"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '2');
          }}
        >
          Indietro
        </mds-button>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '4');
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-orange-10 text-label-orange-04 relative"
      >
        <mds-text>Attivazione account</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="outline"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '3');
          }}
        >
          Indietro
        </mds-button>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '5');
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-violet-10 text-label-violet-04 relative"
      >
        <mds-text>Accedi</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="outline"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '4');
          }}
        >
          Indietro
        </mds-button>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '6');
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-sky-10 text-label-sky-04 relative"
      >
        <mds-text>Finito</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="outline"
          onClick={() => {
            document.querySelector('mds-stepper-bar')?.setAttribute('items-done', '5');
          }}
        >
          Indietro
        </mds-button>
      </div>
    </mds-stepper-bar>
  </div>
);

export const Default = {
  render: Template,
};

export const OffsetMargin = {
  render: TemplateOffsetMargin,

  args: {
    style: { '--mds-stepper-bar-offset-margin': '24px' },
  },
};

export const ScrollbarNavigation = {
  render: Template,

  args: {
    navigation: 'scrollbar',
  },
};

export const Select = {
  render: Template,

  args: {
    'items-done': 3,
  },
};

/**
 * Every state of the stepper bar once the story has opened (#1440, @fixture/states): where the
 * current step is (none, the first, a middle one, the last, every step done), the panels of the
 * `content` slot with the one of the current step shown, more steps than the bar holds, scrolled
 * to the current one, and the scrollbar navigation. The states a step has of its own (queued,
 * current, done, its badge, caption and long label) are in the story of mds-stepper-bar-item.
 *
 * The bar moves only by `itemsDone`, which the page sets: each bar answers here as a product
 * does, the "Avanti" of a panel moving to the next step, and a done step asking to go back
 * (`mdsStepperBarItemDone`) moving there. A state only an interaction reaches (`play: true`) is
 * brought there by the play function, which checks `current` and `done` on the steps and
 * `hidden` on the panels, not their look.
 */
interface Step {
  label: string;
  icon: string;
  value: string;
}

interface StepperBarState {
  state: string;
  play?: boolean;
  bar: Record<string, number | string>;
  steps: Step[];
  panels?: boolean;
}

const requestSteps: Step[] = [
  { label: 'Richiedente', icon: 'mi/baseline/person', value: 'richiedente' },
  { label: 'Documenti', icon: 'mi/baseline/description', value: 'documenti' },
  { label: 'Invio', icon: 'mi/baseline/send', value: 'invio' },
];

const manySteps: Step[] = [
  { label: 'Richiedente', icon: 'mi/baseline/person', value: 'richiedente' },
  { label: 'Immobile', icon: 'mi/baseline/home', value: 'immobile' },
  { label: 'Tecnico incaricato', icon: 'mi/baseline/badge', value: 'tecnico' },
  { label: 'Documenti', icon: 'mi/baseline/description', value: 'documenti' },
  { label: 'Pagamento', icon: 'mi/baseline/account-balance', value: 'pagamento' },
  { label: 'Invio', icon: 'mi/baseline/send', value: 'invio' },
];

const stepperBarStates: StepperBarState[] = [
  { state: 'no step current', bar: { 'items-done': 0 }, steps: requestSteps },
  { state: 'first step current', bar: { 'items-done': 1 }, steps: requestSteps },
  { state: 'middle step current', bar: { 'items-done': 2 }, steps: requestSteps },
  { state: 'last step current', bar: { 'items-done': 3 }, steps: requestSteps },
  { state: 'every step done', bar: { 'items-done': 4 }, steps: requestSteps },
  {
    state: 'panels, the current one shown',
    bar: { 'items-done': 2 },
    steps: requestSteps,
    panels: true,
  },
  { state: 'many steps, scrolled to the current', bar: { 'items-done': 4 }, steps: manySteps },
  {
    state: 'scrollbar navigation',
    bar: { 'items-done': 4, navigation: 'scrollbar' },
    steps: manySteps,
  },
  {
    state: 'next step from its panel',
    play: true,
    bar: { 'items-done': 1 },
    steps: requestSteps,
    panels: true,
  },
  {
    state: 'back to a done step by a click',
    play: true,
    bar: { 'items-done': 3 },
    steps: requestSteps,
  },
  {
    state: 'back to a done step with Enter',
    play: true,
    bar: { 'items-done': 3 },
    steps: requestSteps,
  },
];

/** What the page does when a done step asks to go back: it moves the bar to that step. */
const goBack = (event: Event) => {
  const bar = event.currentTarget as HTMLMdsStepperBarElement;
  const items = Array.from(bar.querySelectorAll('mds-stepper-bar-item'));
  const index = items.indexOf(event.target as HTMLMdsStepperBarItemElement);
  if (index >= 0) bar.setAttribute('items-done', String(index + 1));
};

/** What the "Avanti" of a panel does: the page moves the bar to the step after it. */
const goTo = (event: MouseEvent, step: number) =>
  (event.currentTarget as HTMLElement)
    .closest('mds-stepper-bar')
    ?.setAttribute('items-done', String(step));

const TemplateStates = () => (
  <StatesGrid>
    {stepperBarStates.map(({ state, play, bar, steps, panels }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-stepper-bar
          {...bar}
          ref={(element) => element?.addEventListener('mdsStepperBarItemDone', goBack)}
        >
          {steps.map(({ label, icon, value }) => (
            <mds-stepper-bar-item
              key={value}
              badge
              step
              icon={icon}
              icon-checked="mi/baseline/done"
              label={label}
              value={value}
            ></mds-stepper-bar-item>
          ))}
          {panels &&
            steps.map(({ label, value }, index) => (
              // the bar hides a panel with `hidden`, which a display of the page overrides: the
              // layout of the panel is on the element inside it
              <div key={value} slot="content" class="p-400 rounded-lg bg-surface-sunken">
                <div class="grid gap-400 justify-items-start">
                  <mds-text typography="h6">{label}</mds-text>
                  {index < steps.length - 1 && (
                    <mds-button
                      label="Avanti"
                      onClick={(event: MouseEvent) => goTo(event, index + 2)}
                    ></mds-button>
                  )}
                </div>
              </div>
            ))}
        </mds-stepper-bar>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The steps and the panels of a cell, once every Magma element of the cell has loaded. */
const loadedBar = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const items = Array.from(
    cell.querySelectorAll('mds-stepper-bar-item'),
  ) as HTMLMdsStepperBarItemElement[];
  const panels = Array.from(cell.querySelectorAll('[slot="content"]')) as HTMLElement[];
  return { cell, items, panels };
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const next = await loadedBar(canvasElement, 'next step from its panel');
  (next.panels[0].querySelector('mds-button') as HTMLElement).click();
  const clicked = await loadedBar(canvasElement, 'back to a done step by a click');
  clicked.items[0].click();
  // Enter on a done step, which listens to it on its host
  const enter = await loadedBar(canvasElement, 'back to a done step with Enter');
  enter.items[1].dispatchEvent(
    new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true, cancelable: true }),
  );

  // the properties, not the attributes: Stencil reflects them on the next frame, and a hidden
  // page draws no frame
  await waitFor(() => expect(next.items[0]).toHaveProperty('done', true));
  await waitFor(() => expect(next.items[1]).toHaveProperty('current', true));
  await waitFor(() => expect(next.panels[0]).toHaveProperty('hidden', true));
  await waitFor(() => expect(next.panels[1]).toHaveProperty('hidden', false));
  await waitFor(() => expect(clicked.items[0]).toHaveProperty('current', true));
  await waitFor(() => expect(clicked.items[1]).toHaveProperty('done', false));
  await waitFor(() => expect(enter.items[1]).toHaveProperty('current', true));
  await waitFor(() => expect(enter.items[0]).toHaveProperty('done', true));
  await waitFor(() => expect(enter.items[2]).toHaveProperty('current', false));
};

// TODO a11y: the strip of the steps scrolls when it is wider than its room (three steps in a
// third of the page, or on a phone) but has no focusable step while none is done, so the keyboard
// cannot scroll it (scrollable-region-focusable)
export const States = {
  render: TemplateStates,

  play: playStates,

  parameters: { a11y: { test: 'todo' } },
};
