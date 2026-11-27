import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Data / Price table',
  id: 'ui-price-table',
};

const Template = (args) => (
  <div class="grid gap-600">
    <mds-text typography="h1" tag="h3" class="desktop:hidden">
      Choose the plan for you
    </mds-text>
    <div class="grid tablet:grid-cols-2 max-mobile:grid-cols-1 gap-600">
      <mds-price-table {...args} class="desktop:hidden">
        <mds-price-table-list>
          <mds-text typography="h5" tag="h4" slot="header">
            Basic plan
          </mds-text>
          <mds-text typography="detail" slot="header">
            Piano adatto a liberi professionisti con studi di piccole dimensioni.
          </mds-text>
          <mds-text typography="h2" tag="h4" slot="price">
            49€
          </mds-text>
          <mds-button slot="action" variant="dark">
            Inizia
          </mds-button>
        </mds-price-table-list>
        <mds-price-table-features>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Base features
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">10GB</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Customer support
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Automated functionalities
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Analytics</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Export reports
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Reports snapshots
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Advanced reports
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
        </mds-price-table-features>
      </mds-price-table>
      <mds-price-table {...args} class="desktop:hidden">
        <mds-price-table-list class="bg-label-amaranth-10">
          <mds-text typography="h5" tag="h4" slot="header">
            Professional plan
          </mds-text>
          <mds-text typography="detail" slot="header">
            Piano adatto a liberi professionisti con studi di piccole dimensioni.
          </mds-text>
          <mds-text typography="h2" tag="h4" slot="price">
            99€
          </mds-text>
          <mds-button slot="action" variant="dark">
            Inizia
          </mds-button>
        </mds-price-table-list>
        <mds-price-table-features>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Base features
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">20</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">20GB</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Customer support
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Automated functionalities
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Analytics</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Export reports
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Reports snapshots
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Advanced reports
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
        </mds-price-table-features>
      </mds-price-table>
      <mds-price-table {...args} class="desktop:hidden">
        <mds-price-table-list class="bg-label-violet-10">
          <mds-text typography="h5" tag="h4" slot="header">
            Enterprise plan
          </mds-text>
          <mds-text typography="detail" slot="header">
            Piano adatto a liberi professionisti con studi di piccole dimensioni.
          </mds-text>
          <mds-text typography="h2" tag="h4" slot="price">
            149€
          </mds-text>
          <mds-button slot="action" variant="dark">
            Inizia
          </mds-button>
        </mds-price-table-list>
        <mds-price-table-features>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Base features
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">Unlimited</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">1TB</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Customer support
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Automated functionalities
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Analytics</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Export reports
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Reports snapshots
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">
              Advanced reports
            </mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
        </mds-price-table-features>
      </mds-price-table>
    </div>
    <mds-price-table {...args} class="max-tablet:hidden">
      <mds-price-table-header
        {...args}
        class="max-mobile:grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4"
      >
        <mds-text
          typography="h1"
          tag="h3"
          class="tablet:col-span-3 col-span-1 desktop:col-span-1 desktop:py-600"
        >
          Choose the plan for you
        </mds-text>
        <mds-price-table-list>
          <mds-text typography="h5" tag="h4" slot="header">
            Basic plan
          </mds-text>
          <mds-text typography="detail" slot="header">
            Piano adatto a liberi professionisti con studi di piccole dimensioni.
          </mds-text>
          <mds-text typography="h2" tag="h4" slot="price">
            49€
          </mds-text>
          <mds-button slot="action" variant="dark">
            Inizia
          </mds-button>
        </mds-price-table-list>
        <mds-price-table-list class="bg-label-amaranth-10">
          <mds-text typography="h5" tag="h4" slot="header">
            Professional plan
          </mds-text>
          <mds-text typography="detail" slot="header">
            Piano adatto a liberi professionisti con studi di piccole dimensioni.
          </mds-text>
          <mds-text typography="h2" tag="h4" slot="price">
            99€
          </mds-text>
          <mds-button slot="action" variant="dark">
            Inizia
          </mds-button>
        </mds-price-table-list>
        <mds-price-table-list class="bg-label-violet-10">
          <mds-text typography="h5" tag="h4" slot="header">
            Enterprise plan
          </mds-text>
          <mds-text typography="detail" slot="header">
            Piano adatto a liberi professionisti con studi di piccole dimensioni.
          </mds-text>
          <mds-text typography="h2" tag="h4" slot="price">
            149€
          </mds-text>
          <mds-button slot="action" variant="dark">
            Inizia
          </mds-button>
        </mds-price-table-list>
      </mds-price-table-header>
      <mds-price-table-features {...args}>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">
            Base features
            <mds-help>The base features are: Login, Logout and Register.</mds-help>
          </mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">20</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">
            Unlimited
            <mds-help>Aw, c'mon... You know it's impossible.</mds-help>
          </mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">10GB</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">20GB</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">1TB</mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">
            Customer support
          </mds-price-table-features-cell>
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
          <mds-price-table-features-cell type="label">
            Advanced reports
          </mds-price-table-features-cell>
          <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
      </mds-price-table-features>
    </mds-price-table>
  </div>
);

export const Default = {
  render: Template,

  args: {
    label: 'Report e analisi',
  },
};

/**
 * Every state the price table has of its own once the story has opened (#1440, @fixture/states):
 * the two arrangements its parts make, a plan stacked over its own features (the narrow layout)
 * and the comparison, the band of the plans over one matrix whose columns line up with them,
 * with three plans and with two. The table has no props: a product picks the arrangement by the
 * width it has, so the comparison cells span the whole grid, as wide as a page. What a plan, the
 * band and the matrix show is in the stories of their parts. No state needs an interaction.
 */
interface TableState {
  state: string;
  /** the comparison: the band of the plans over one matrix */
  comparison?: boolean;
  plans: string[];
}

const plans = ['Piano base', 'Piano professionale', 'Piano enti'];
const prices: Record<string, string> = {
  'Piano base': '49 euro',
  'Piano professionale': '99 euro',
  'Piano enti': '149 euro',
};
const matrix: [string, ...string[]][] = [
  ['Firma digitale', 'supported', 'supported', 'supported'],
  ['Utenti', '10', '20', 'Illimitati'],
  ['Spazio per utente', '10 GB', '20 GB', '1 TB'],
  ['Conservazione a norma', 'unsupported', 'supported', 'supported'],
];

const Plan = ({ name }: { name: string }) => (
  <mds-price-table-list>
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
);

const Features = ({ columns }: { columns: number }) => (
  <mds-price-table-features label="Funzioni incluse">
    {matrix.map(([feature, ...values]) => (
      <mds-price-table-features-row key={feature}>
        <mds-price-table-features-cell type="label">{feature}</mds-price-table-features-cell>
        {values
          .slice(0, columns)
          .map((value, index) =>
            value === 'supported' || value === 'unsupported' ? (
              <mds-price-table-features-cell
                key={index}
                type={value}
              ></mds-price-table-features-cell>
            ) : (
              <mds-price-table-features-cell key={index}>{value}</mds-price-table-features-cell>
            ),
          )}
      </mds-price-table-features-row>
    ))}
  </mds-price-table-features>
);

const tableStates: TableState[] = [
  { state: 'stacked, a plan over its features', plans: plans.slice(0, 1) },
  { state: 'comparison, three plans', comparison: true, plans },
  { state: 'comparison, two plans', comparison: true, plans: plans.slice(0, 2) },
];

const TemplateStates = () => (
  <StatesGrid>
    {tableStates.map(({ state, comparison, plans: names }) => (
      <div key={state} class={comparison ? 'col-span-full' : undefined}>
        <StateCell state={state}>
          {comparison ? (
            <mds-price-table>
              <mds-price-table-header class={names.length === 3 ? 'grid-cols-4' : 'grid-cols-3'}>
                <mds-text typography="h3" tag="h3">
                  Scegli il piano per il tuo ufficio
                </mds-text>
                {names.map((name) => (
                  <Plan key={name} name={name}></Plan>
                ))}
              </mds-price-table-header>
              <Features columns={names.length}></Features>
            </mds-price-table>
          ) : (
            <mds-price-table>
              <Plan name={names[0]}></Plan>
              <Features columns={1}></Features>
            </mds-price-table>
          )}
        </StateCell>
      </div>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
