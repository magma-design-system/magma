import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Data / Price table / Price table list',
  id: 'ui-price-table-price-table-list',
};

const Template = (args) => (
  <mds-price-table-list {...args}>
    <mds-text typography="h5" slot="header">
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
);

const TemplateFull = (args) => (
  <mds-price-table-list {...args}>
    <mds-text typography="h5" slot="header">
      Basic plan
    </mds-text>
    <mds-text typography="detail" slot="header">
      Piano adatto a liberi professionisti con studi di piccole dimensioni.
    </mds-text>
    <mds-price-table-list-item supported>Basic features</mds-price-table-list-item>
    <mds-price-table-list-item supported>10 Users</mds-price-table-list-item>
    <mds-price-table-list-item supported>
      20GB disk space per user
      <mds-help>Sometimes it won't work</mds-help>
    </mds-price-table-list-item>
    <mds-price-table-list-item supported>Chat support</mds-price-table-list-item>
    <mds-price-table-list-item supported>Automated flows</mds-price-table-list-item>
    <mds-price-table-list-item>Analytics</mds-price-table-list-item>
    <mds-price-table-list-item>Report export</mds-price-table-list-item>
    <mds-price-table-list-item supported>Report snapshots</mds-price-table-list-item>
    <mds-price-table-list-item>Advanced reports</mds-price-table-list-item>
    <mds-price-table-list-item>API access</mds-price-table-list-item>
    <mds-text typography="h2" slot="price">
      49€
    </mds-text>
    <mds-button slot="action" variant="dark">
      Inizia
    </mds-button>
  </mds-price-table-list>
);

export const Default = {
  render: Template,
};
export const WithFeatures = {
  render: TemplateFull,
};

/**
 * Every state a plan has of its own once the story has opened (#1440, @fixture/states), each in
 * a price table of its own: the plan without features, which leaves out the separator and the
 * region of the items, the plan with features, and the states of its items, which have no story
 * of their own (mds-price-table-list-item): included and not included, each typography, an item
 * with a help, the long item that wraps; then the plan without a price or an action and the long
 * heading that wraps. The plans side by side and the comparison matrix are in the story of
 * mds-price-table. The features rendered after load (`play: true`) are appended by the play
 * function, which checks that the plan opened its region of the items: the plan has no property
 * for it, so the check reads its shadow root.
 */
interface PlanState {
  state: string;
  play?: boolean;
  heading?: string;
  description?: string;
  price?: boolean;
  action?: boolean;
  items?: {
    text: string;
    supported?: boolean;
    typography?: HTMLMdsPriceTableListItemElement['typography'];
    help?: string;
  }[];
}

const features = [
  { text: 'Fino a 10 utenti', supported: true },
  { text: '20 GB di spazio per utente', supported: true },
  { text: 'Assistenza via chat', supported: true },
  { text: 'Firma digitale' },
  { text: 'Conservazione a norma' },
];
const itemsAdded = 'features rendered after load';

const planStates: PlanState[] = [
  { state: 'heading, price and action, no features' },
  { state: 'with features', items: features },
  {
    state: 'items included',
    items: features.slice(0, 3),
  },
  { state: 'items not included', items: features.slice(3) },
  ...['caption', 'detail', 'paragraph'].map((typography) => ({
    state: `items, typography ${typography}${typography === 'detail' ? ' (default)' : ''}`,
    items: features.slice(2, 4).map((item) => ({ ...item, typography })),
  })),
  {
    state: 'item with a help',
    items: [
      {
        text: '20 GB di spazio per utente',
        supported: true,
        help: 'Lo spazio si somma tra gli utenti.',
      },
    ],
  },
  {
    state: 'long item, wrapped',
    items: [
      {
        text: 'Conservazione a norma dei documenti firmati digitalmente per dieci anni, con esibizione su richiesta',
        supported: true,
      },
    ],
  },
  { state: 'no price', price: false, items: features.slice(0, 2) },
  { state: 'no action', action: false, items: features.slice(0, 2) },
  {
    state: 'long heading and description, wrapped',
    heading: 'Piano per gli enti con piu sedi e uffici distaccati',
    description:
      'Adatto agli enti che gestiscono le pratiche di piu sportelli, con ruoli e permessi distinti per ogni ufficio.',
    items: features.slice(0, 2),
  },
  { state: itemsAdded, play: true },
];

const TemplateStates = () => (
  <StatesGrid>
    {planStates.map(({ state, play, heading, description, price = true, action = true, items }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-price-table>
          <mds-price-table-list>
            <mds-text typography="h5" tag="h4" slot="header">
              {heading ?? 'Piano base'}
            </mds-text>
            <mds-text typography="detail" slot="header">
              {description ?? 'Per i professionisti con uno studio piccolo.'}
            </mds-text>
            {items?.map(({ text, supported, typography, help }) => (
              <mds-price-table-list-item key={text} supported={supported} typography={typography}>
                {text}
                {help && <mds-help>{help}</mds-help>}
              </mds-price-table-list-item>
            ))}
            {price && (
              <mds-text typography="h2" tag="p" slot="price">
                49 euro
              </mds-text>
            )}
            {action && (
              <mds-button slot="action" variant="dark">
                Inizia
              </mds-button>
            )}
          </mds-price-table-list>
        </mds-price-table>
      </StateCell>
    ))}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const plan = stateCell(canvasElement, itemsAdded).querySelector(
    'mds-price-table-list',
  ) as HTMLMdsPriceTableListElement;
  await waitFor(() => expect(plan).toHaveAttribute('hydrated'));
  features.slice(0, 2).forEach(({ text, supported }) => {
    const item = document.createElement('mds-price-table-list-item');
    if (supported) item.setAttribute('supported', '');
    item.textContent = text;
    plan.append(item);
  });
  // the plan has no property for its items: the region it renders is the state
  await waitFor(() => expect(plan.shadowRoot!.querySelector('.main')).not.toBeNull());
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
