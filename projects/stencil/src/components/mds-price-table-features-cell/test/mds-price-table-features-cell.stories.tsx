import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Data / Price table / Price table features cell',
  id: 'ui-price-table-price-table-features-cell',
};

const Template = (args) => (
  <mds-price-table>
    <mds-price-table-features {...args}>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">
          Base features
          <mds-help auto-placement="false" placement="top">
            This option is available only on afternoon.
          </mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported">
          <mds-help auto-placement="false" placement="top">
            This option is available only on afternoon.
          </mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported">
          <mds-help auto-placement="false" placement="top">
            Sometimes it's just not working.
          </mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">
          Data bandwidth
          <mds-help auto-placement="false" placement="top">
            Per user
          </mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell>10GB</mds-price-table-features-cell>
        <mds-price-table-features-cell>20GB</mds-price-table-features-cell>
        <mds-price-table-features-cell>
          1TB
          <mds-help auto-placement="false" placement="top">
            Just joking, the space is 30GB
          </mds-help>
        </mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Customer support</mds-price-table-features-cell>
        <mds-price-table-features-cell class="px-300" type="custom">
          <span>Uno</span>
          <mds-help auto-placement="false" placement="top">
            This is very nice.
          </mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell class="px-300" type="custom">
          <span>Due</span>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell class="px-300" type="custom">
          <span>Tre</span>
        </mds-price-table-features-cell>
      </mds-price-table-features-row>
    </mds-price-table-features>
  </mds-price-table>
);

export const Default = {
  render: Template,

  args: {
    label: 'Report e analisi',
  },
};

/**
 * Every state a cell has of its own once the story has opened (#1440, @fixture/states), each in
 * a row of its own matrix, after the label of the feature: the text it starts from, included,
 * not included, custom content, the label cell, each with a help where a product puts one, and
 * the long text and label that wrap. The header band and the rows are in the story of
 * mds-price-table-features. The hover of a row needs a real pointer, which a story does not move.
 * No state needs an interaction.
 */
interface CellState {
  state: string;
  label?: string;
  labelHelp?: string;
  cell: {
    type?: HTMLMdsPriceTableFeaturesCellElement['type'];
    text?: string;
    help?: string;
    custom?: boolean;
  };
}

const cellStates: CellState[] = [
  { state: 'type text (default)', cell: { text: '20 GB' } },
  {
    state: 'type text, with a help',
    cell: { text: '1 TB', help: 'Lo spazio si somma tra gli utenti.' },
  },
  { state: 'type supported', cell: { type: 'supported' } },
  {
    state: 'type supported, with a help',
    cell: { type: 'supported', help: 'Solo con la firma remota.' },
  },
  { state: 'type unsupported', cell: { type: 'unsupported' } },
  { state: 'type custom', cell: { type: 'custom', custom: true } },
  {
    state: 'type label, with a help',
    labelHelp: 'Per ogni utente del piano.',
    cell: { text: '20 GB' },
  },
  {
    state: 'long text and label, wrapped',
    label: 'Conservazione a norma dei documenti firmati',
    cell: { text: 'Dieci anni, con esibizione su richiesta' },
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {cellStates.map(({ state, label, labelHelp, cell }) => (
      <StateCell key={state} state={state}>
        <mds-price-table>
          <mds-price-table-features>
            <mds-price-table-features-row>
              <mds-price-table-features-cell type="label">
                {label ?? 'Spazio di archiviazione'}
                {labelHelp && <mds-help>{labelHelp}</mds-help>}
              </mds-price-table-features-cell>
              <mds-price-table-features-cell type={cell.type}>
                {cell.text}
                {cell.custom && <mds-badge label="Nuovo" variant="info" tone="weak"></mds-badge>}
                {cell.help && <mds-help>{cell.help}</mds-help>}
              </mds-price-table-features-cell>
            </mds-price-table-features-row>
          </mds-price-table-features>
        </mds-price-table>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
