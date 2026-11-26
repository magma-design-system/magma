import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Data / Price table / Price table features',
  id: 'ui-price-table-price-table-features',
};

const Template = (args) => (
  <mds-price-table>
    <mds-price-table-features {...args}>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Base features</mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">20</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">Unlimited</mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">10GB</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">20GB</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">
          1TB
          <mds-help auto-placement="false" placement="top">
            It can vary by server status.
          </mds-help>
        </mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Customer support</mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">
          Automated functionalities
        </mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Analytics</mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Export reports</mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">
          Reports snapshots
        </mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Advanced reports</mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
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
 * Every state the matrix has of its own once the story has opened (#1440, @fixture/states), each
 * in a price table of its own: with the header band of `label` and without it, one plan and three
 * (the rows give every cell an equal share of the width), and the rows, which have no story of
 * their own (mds-price-table-features-row): one row, several, the long label that wraps. What a
 * cell draws is in the story of mds-price-table-features-cell. The hover of a row needs a real
 * pointer, which a story does not move. No state needs an interaction.
 */
interface MatrixState {
  state: string;
  label?: string;
  rows: string[][];
}

const one = [
  ['Firma digitale', 'supported'],
  ['Utenti', '10'],
  ['Conservazione a norma', 'unsupported'],
];
const three = [
  ['Firma digitale', 'supported', 'supported', 'supported'],
  ['Utenti', '10', '20', 'Illimitati'],
  ['Conservazione a norma', 'unsupported', 'supported', 'supported'],
];

const matrixStates: MatrixState[] = [
  { state: 'label, header band', label: 'Funzioni incluse', rows: one },
  { state: 'no label', rows: one },
  { state: 'three plans', label: 'Funzioni incluse', rows: three },
  { state: 'one row', label: 'Funzioni incluse', rows: one.slice(0, 1) },
  {
    state: 'long label of a row, wrapped',
    label: 'Funzioni incluse',
    rows: [
      ['Conservazione a norma dei documenti firmati digitalmente', 'supported', 'unsupported'],
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {matrixStates.map(({ state, label, rows }) => (
      <StateCell key={state} state={state}>
        <mds-price-table>
          <mds-price-table-features label={label}>
            {rows.map(([feature, ...values]) => (
              <mds-price-table-features-row key={feature}>
                <mds-price-table-features-cell type="label">
                  {feature}
                </mds-price-table-features-cell>
                {values.map((value, index) =>
                  value === 'supported' || value === 'unsupported' ? (
                    <mds-price-table-features-cell
                      key={index}
                      type={value}
                    ></mds-price-table-features-cell>
                  ) : (
                    <mds-price-table-features-cell key={index}>
                      {value}
                    </mds-price-table-features-cell>
                  ),
                )}
              </mds-price-table-features-row>
            ))}
          </mds-price-table-features>
        </mds-price-table>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
