import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Data / Price table / Price table header',
  id: 'ui-price-table-price-table-header',
};

const Template = (args) => (
  <mds-price-table-header
    {...args}
    class="max-mobile:grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4"
  >
    <mds-text
      typography="h1"
      class="tablet:col-span-3 col-span-1 desktop:col-span-1 desktop:py-600"
    >
      Choose the plan for you
    </mds-text>
    <mds-price-table-list>
      <mds-text typography="h5" tag="h2" slot="header">
        Basic plan
      </mds-text>
      <mds-text typography="detail" slot="header">
        Piano adatto a liberi professionisti con studi di piccole dimensioni.
      </mds-text>
      <mds-text typography="h2" slot="price">
        49€
      </mds-text>
      <mds-button slot="action" variant="dark">
        Inizia
      </mds-button>
    </mds-price-table-list>
    <mds-price-table-list class="bg-label-amaranth-10">
      <mds-text typography="h5" tag="h2" slot="header">
        Professional plan
      </mds-text>
      <mds-text typography="detail" slot="header">
        Piano adatto a liberi professionisti con studi di piccole dimensioni.
      </mds-text>
      <mds-text typography="h2" slot="price">
        99€
      </mds-text>
      <mds-button slot="action" variant="dark">
        Inizia
      </mds-button>
    </mds-price-table-list>
    <mds-price-table-list class="bg-label-violet-10">
      <mds-text typography="h5" tag="h2" slot="header">
        Enterprise plan
      </mds-text>
      <mds-text typography="detail" slot="header">
        Piano adatto a liberi professionisti con studi di piccole dimensioni.
      </mds-text>
      <mds-text typography="h2" slot="price">
        149€
      </mds-text>
      <mds-button slot="action" variant="dark">
        Inizia
      </mds-button>
    </mds-price-table-list>
  </mds-price-table-header>
);

export const Default = {
  render: Template,
};

/**
 * Every state the band of the plans has of its own once the story has opened (#1440,
 * @fixture/states), each in a price table of its own: the plans alone in equal columns, as many
 * as it holds, and with the title of the table in the first column or above the plans, by classes
 * on the band and on the title as a product writes them. A band of three or four columns needs the
 * width of a page, not of one column of the grid: those cells span the whole grid. What a plan
 * holds is in the story of mds-price-table-list, the band over the matrix in the story of
 * mds-price-table. No state needs an interaction.
 */
interface BandState {
  state: string;
  /** the cell spans the whole grid */
  wide?: boolean;
  band?: string;
  title?: string;
  plans: string[];
}

const plans = ['Piano base', 'Piano professionale', 'Piano enti'];
const prices: Record<string, string> = {
  'Piano base': '49 euro',
  'Piano professionale': '99 euro',
  'Piano enti': '149 euro',
};

const bandStates: BandState[] = [
  { state: 'two plans, equal columns', plans: plans.slice(0, 2) },
  { state: 'three plans, equal columns', wide: true, plans },
  {
    state: 'title in the first column, three plans',
    wide: true,
    band: 'grid-cols-4',
    title: 'col-span-1',
    plans,
  },
  {
    state: 'title above the plans',
    wide: true,
    band: 'grid-cols-3',
    title: 'col-span-3',
    plans,
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {bandStates.map(({ state, wide, band, title, plans: names }) => (
      <div key={state} class={wide ? 'col-span-full' : undefined}>
        <StateCell state={state}>
          <mds-price-table>
            <mds-price-table-header class={band}>
              {title && (
                <mds-text typography="h3" tag="h3" class={title}>
                  Scegli il piano per il tuo ufficio
                </mds-text>
              )}
              {names.map((name) => (
                <mds-price-table-list key={name}>
                  <mds-text typography="h5" tag="h4" slot="header">
                    {name}
                  </mds-text>
                  <mds-text typography="detail" slot="header">
                    Per gli uffici che gestiscono le pratiche online.
                  </mds-text>
                  <mds-text typography="h2" tag="p" slot="price">
                    {prices[name]}
                  </mds-text>
                  <mds-button slot="action" variant="dark">
                    Inizia
                  </mds-button>
                </mds-price-table-list>
              ))}
            </mds-price-table-header>
          </mds-price-table>
        </StateCell>
      </div>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
