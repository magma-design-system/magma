import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Structure / Hr',
  id: 'ui-hr',
};

const Template = (args) => <mds-hr {...args} />;

export const Default = {
  render: Template,
};

export const Style = {
  render: Template,

  args: {
    class: 'bg-tone-neutral-04',
  },
};

/**
 * Every state of the rule once the story has opened (#1440, @fixture/states). It has no prop, no
 * slot and no orientation, a horizontal line only: between two sections at rest, in the colour
 * of a semantic role set by a class on its host (the stronger neutral of the borders, the accent
 * of the brand), and between the rows of a card, at the width of its region. The modes (dark,
 * more contrast) open by the link of the story. The rule takes no interaction: no state needs a
 * play.
 */
interface HrState {
  state: string;
  hr?: Record<string, string>;
  /** in a card, between its rows */
  card?: boolean;
}

const hrStates: HrState[] = [
  { state: 'between two sections' },
  { state: 'colour of the borders, by a class', hr: { class: 'bg-border-default' } },
  { state: 'colour of the accent, by a class', hr: { class: 'bg-accent-border' } },
  { state: 'in a card, between its rows', card: true },
];

const TemplateStates = () => (
  <StatesGrid>
    {hrStates.map(({ state, hr, card }) => (
      <StateCell key={state} state={state}>
        {card ? (
          <mds-card>
            <mds-card-content>
              <div class="grid gap-300">
                <mds-text>Servizio annuale</mds-text>
                <mds-hr {...hr}></mds-hr>
                <mds-text>Supporto prioritario</mds-text>
              </div>
            </mds-card-content>
          </mds-card>
        ) : (
          <div class="grid gap-400">
            <mds-text>Nome, cognome e data di nascita.</mds-text>
            <mds-hr {...hr}></mds-hr>
            <mds-text>Indirizzo e-mail e numero di telefono.</mds-text>
          </div>
        )}
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
