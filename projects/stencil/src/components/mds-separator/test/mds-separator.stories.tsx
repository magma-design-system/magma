import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Structure / Separator',
  id: 'ui-separator',
};

const Template = (args) => (
  <div class="p-600 bg-tone-neutral-10 rounded-3xl">
    <div class="grid rounded-xl bg-surface-raised shadow contrast-more:shadow-ring overflow-hidden">
      <mds-entity aria-label="Personaggio" class="shadow-none p-600" icon="mi/baseline/person">
        <mds-text aria-label="Nome" typography="h6">
          Mario Rossi
        </mds-text>
        <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="weak">
          buono
        </mds-badge>
        <mds-text aria-label="Email" slot="detail" typography="caption">
          mario@nintendo.com
        </mds-text>
      </mds-entity>
      <mds-separator {...args}></mds-separator>
      <mds-entity aria-label="Personaggio" class="shadow-none p-600" icon="mi/baseline/person">
        <mds-text aria-label="Nome" typography="h6">
          Luigi Verdi
        </mds-text>
        <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="weak">
          buono
        </mds-badge>
        <mds-text aria-label="Email" slot="detail" typography="caption">
          luigi@nintendo.com
        </mds-text>
      </mds-entity>
      <mds-separator {...args}></mds-separator>
      <mds-entity aria-label="Personaggio" class="shadow-none p-600" icon="mi/baseline/person">
        <mds-text aria-label="Nome" typography="h6">
          Wario
        </mds-text>
        <mds-badge aria-label="Carattere" slot="detail" variant="violet" tone="weak">
          biricchino
        </mds-badge>
        <mds-text aria-label="Email" slot="detail" typography="caption">
          wario@nintendo.com
        </mds-text>
      </mds-entity>
    </div>
  </div>
);

export const Default = {
  render: Template,
};

/**
 * Every state of the separator once the story has opened (#1440, @fixture/states). It has no
 * prop, no slot and no orientation, a horizontal line only: between the rows of a list at rest,
 * in a colour of a product (`--mds-separator-background`, a semantic role), and between the rows
 * of a card region, at its width. The modes (dark, more contrast, where its role turns stronger)
 * open by the link of the story. The separator takes no interaction: no state needs a play.
 */
interface SeparatorState {
  state: string;
  style?: Record<string, string>;
  /** in a card, between its rows */
  card?: boolean;
}

const separatorStates: SeparatorState[] = [
  { state: 'between the rows of a list' },
  {
    state: 'colour of a product, by its custom property',
    style: { '--mds-separator-background': 'rgb(var(--magma-accent-border))' },
  },
  { state: 'in a card, between its rows', card: true },
];

const rows = (style?: Record<string, string>) => [
  <mds-text key="subtotale">Subtotale: 104,92 EUR</mds-text>,
  <mds-separator key="1" style={style}></mds-separator>,
  <mds-text key="iva">IVA: 23,08 EUR</mds-text>,
  <mds-separator key="2" style={style}></mds-separator>,
  <mds-text key="totale">Totale: 128,00 EUR</mds-text>,
];

const TemplateStates = () => (
  <StatesGrid>
    {separatorStates.map(({ state, style, card }) => (
      <StateCell key={state} state={state}>
        {card ? (
          <mds-card>
            <mds-card-content>
              <div class="grid gap-300">{rows(style)}</div>
            </mds-card-content>
          </mds-card>
        ) : (
          <div class="grid gap-300">{rows(style)}</div>
        )}
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
