import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { URLs } from '../../mds-img/meta/storybook';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Structure / Card',
  id: 'layout-card',
  argTypes: {
    'disable-auto-grid': {
      type: { name: 'boolean' },
      description: 'Disables the automatic responsive behavior based on container queries',
    },
  },
};

const FullCardTemplate = (args) => (
  <div>
    <mds-card {...args}>
      <mds-card-header>
        <div class="flex gap-400 items-center min-w-0">
          <mds-avatar class="w-1100 min-w-1100 shrink-0" initials="mc"></mds-avatar>
          <div class="flex gap-0 flex-col grow min-w-0">
            <mds-text typography="h6" truncate="word">
              Mario Coletta
            </mds-text>
            <mds-text typography="caption" truncate="word">
              Management designer
            </mds-text>
          </div>
        </div>
        <mds-button
          class="shrink-0"
          id="action-example"
          icon="mi/round/more-vert"
          variant="dark"
          tone="text"
        ></mds-button>
      </mds-card-header>
      <mds-card-media>
        <mds-img src={URLs[0]} class="object-cover"></mds-img>
      </mds-card-media>
      <mds-card-content>
        <mds-text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
          Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
          blandit ac malesuada odio.
        </mds-text>
      </mds-card-content>
      <mds-card-footer>
        <mds-button variant="dark" tone="text">
          Cancel
        </mds-button>
        <mds-button>Contact</mds-button>
      </mds-card-footer>
    </mds-card>
    <mds-dropdown target="#action-example" class="max-w-[350px] p-200 gap-100" backdrop>
      <mds-button variant="dark" tone="text" class="justify-start">
        Modifica account
      </mds-button>
      <mds-button variant="dark" tone="text" class="justify-start">
        Elimina
      </mds-button>
      <mds-button variant="dark" tone="text" class="justify-start">
        Esci dalla sessione
      </mds-button>
    </mds-dropdown>
  </div>
);

const CustomSlotsTemplate = (args) => (
  <div>
    <mds-card {...args}>
      <div slot="header" class="flex gap-400 items-center justify-between px-400 py-400">
        <div class="flex gap-400 items-center min-w-0">
          <mds-avatar class="w-1100 min-w-1100 shrink-0" initials="mc"></mds-avatar>
          <div class="flex gap-0 flex-col grow min-w-0">
            <mds-text typography="h6" truncate="word">
              Mario Coletta
            </mds-text>
            <mds-text typography="caption" truncate="word">
              Management designer
            </mds-text>
          </div>
        </div>
        <mds-button
          id="action-example"
          icon="mi/round/more-vert"
          variant="dark"
          tone="text"
        ></mds-button>
      </div>
      <mds-img src={URLs[0]} slot="media" class="object-cover"></mds-img>
      <mds-text slot="content" class="px-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
      <div slot="footer" class="px-400 py-400 text-right">
        <mds-button variant="dark">Contact</mds-button>
      </div>
    </mds-card>
    <mds-dropdown target="#action-example" class="max-w-[350px] p-200 gap-100" backdrop>
      <mds-button variant="dark" tone="text" class="justify-start">
        Modifica account
      </mds-button>
      <mds-button variant="dark" tone="text" class="justify-start">
        Elimina
      </mds-button>
      <mds-button variant="dark" tone="text" class="justify-start">
        Esci dalla sessione
      </mds-button>
    </mds-dropdown>
  </div>
);

const LayoutHMCFTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center min-w-0">
        <mds-avatar class="w-1100 min-w-1100 shrink-0" initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col grow min-w-0">
          <mds-text typography="h6" truncate="word">
            Mario Coletta
          </mds-text>
          <mds-text typography="caption" truncate="word">
            Management designer
          </mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="dark" tone="text"></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
);

const LayoutHMCTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center min-w-0">
        <mds-avatar class="w-1100 min-w-1100 shrink-0" initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col grow min-w-0">
          <mds-text typography="h6" truncate="word">
            Mario Coletta
          </mds-text>
          <mds-text typography="caption" truncate="word">
            Management designer
          </mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="dark" tone="text"></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
  </mds-card>
);

const LayoutHMFTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center min-w-0">
        <mds-avatar class="w-1100 min-w-1100 shrink-0" initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col grow min-w-0">
          <mds-text typography="h6" truncate="word">
            Mario Coletta
          </mds-text>
          <mds-text typography="caption" truncate="word">
            Management designer
          </mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="dark" tone="text"></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
);

const LayoutHCFTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center min-w-0">
        <mds-avatar class="w-1100 min-w-1100 shrink-0" initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col grow min-w-0">
          <mds-text typography="h6" truncate="word">
            Mario Coletta
          </mds-text>
          <mds-text typography="caption" truncate="word">
            Management designer
          </mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="dark" tone="text"></mds-button>
    </mds-card-header>
    <mds-card-content class="py-0">
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
);

const LayoutMCFTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
    <mds-card-footer class="pt-0">
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
);

const LayoutHCTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="dark" tone="text"></mds-button>
    </mds-card-header>
    <mds-card-content class="pt-0">
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
  </mds-card>
);

const LayoutMCTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
  </mds-card>
);

const LayoutMFTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
);

const LayoutHMTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="dark" tone="text"></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
  </mds-card>
);

const LayoutCFTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
    <mds-card-footer class="pt-0">
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
);

const LayoutHFTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="dark" tone="text"></mds-button>
    </mds-card-header>
    <mds-card-footer class="pt-0">
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
);

const LayoutMTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
  </mds-card>
);

const LayoutHTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="dark" tone="text"></mds-button>
    </mds-card-header>
  </mds-card>
);

const LayoutCTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
  </mds-card>
);

const LayoutFTemplate = (args) => (
  <mds-card {...args}>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
);

export const Default = {
  render: FullCardTemplate,
};

export const FullCardCustomSlots = {
  render: CustomSlotsTemplate,

  args: {
    'disable-auto-grid': true,
  },
};

export const LayoutHeaderMediaContentFooter = {
  render: LayoutHMCFTemplate,
};

export const LayoutHeaderMediaContent = {
  render: LayoutHMCTemplate,
};

export const LayoutHeaderMediaFooter = {
  render: LayoutHMFTemplate,
};

export const LayoutHeaderContentFooter = {
  render: LayoutHCFTemplate,
};

export const LayoutHeaderContent = {
  render: LayoutHCTemplate,
};

export const LayoutHeaderMedia = {
  render: LayoutHMTemplate,
};

export const LayoutHeaderFooter = {
  render: LayoutHFTemplate,
};

export const LayoutMediaContentFooter = {
  render: LayoutMCFTemplate,
};

export const LayoutMediaContent = {
  render: LayoutMCTemplate,
};

export const LayoutMediaFooter = {
  render: LayoutMFTemplate,
};

export const LayoutContentFooter = {
  render: LayoutCFTemplate,
};

export const LayoutHeader = {
  render: LayoutHTemplate,
};

export const LayoutMedia = {
  render: LayoutMTemplate,
};

export const LayoutContent = {
  render: LayoutCTemplate,
};

export const LayoutFooter = {
  render: LayoutFTemplate,
};

// actions/stacked (#1189, #1250): a card in a grid is narrow on any screen, its footer under
// 380px, where a row of two actions stacks; a lone action has no order to keep and stays at its
// own width at the end, a split button too
const gridCard = (title: string, text: string, actions) => (
  <mds-card class="w-full max-w-[320px] justify-self-center">
    <mds-card-header>
      <mds-text typography="h6">{title}</mds-text>
    </mds-card-header>
    <mds-card-content>
      <mds-text>{text}</mds-text>
    </mds-card-content>
    <mds-card-footer>{actions}</mds-card-footer>
  </mds-card>
);

export const LoneActionInAGrid = {
  render: () => (
    <div class="@container">
      <div class="grid grid-cols-1 gap-600 @2xl:grid-cols-2 @4xl:grid-cols-3">
        {gridCard(
          'Colore',
          "I ruoli semantici con cui si dipinge un'interfaccia.",
          <mds-button
            variant="primary"
            tone="outline"
            icon="mi/baseline/arrow-forward"
            icon-position="right"
          >
            Leggi
          </mds-button>,
        )}
        {gridCard(
          'Logo',
          'Il marchio del gruppo, in tutti i formati.',
          <mds-button-dropdown label="Scarica" icon="mi/baseline/download">
            <mds-button variant="dark" tone="text" label="Scarica come SVG"></mds-button>
            <mds-button variant="dark" tone="text" label="Scarica come PNG"></mds-button>
          </mds-button-dropdown>,
        )}
        {gridCard('Richiesta 2026/114', 'In attesa della firma del responsabile.', [
          <mds-button key="rifiuta" variant="dark" tone="outline">
            Rifiuta
          </mds-button>,
          <mds-button key="firma" variant="primary" tone="outline">
            Firma
          </mds-button>,
        ])}
      </div>
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const footers = Array.from(canvasElement.querySelectorAll('mds-card-footer'));
    const box = (element: Element) => element.getBoundingClientRect();

    // the two lone actions and the row of two, so that no footer passes by holding nothing
    expect(footers.map((footer) => footer.children.length)).toEqual([1, 1, 2]);
    await waitFor(() => {
      for (const footer of footers) {
        const row = box(footer);
        const actions = Array.from(footer.children).map(box);

        expect(row.width).toBeLessThan(380);
        if (actions.length === 1) {
          expect(actions[0].width).toBeLessThan(row.width / 2);
          expect(actions[0].right).toBeCloseTo(row.right, 0);
        } else {
          for (const action of actions) expect(action.width).toBeCloseTo(row.width, 0);
        }
      }
    });
  },
};

/**
 * Every state of the card once the story has opened (#1440, @fixture/states). The card names its
 * layout after the regions it holds, so the states are its layouts: each set of regions, stacked
 * as in a cell of the grid, then the five layouts that set the media beside the other regions in
 * a card wider than 30em, in cells two columns wide (from three columns of the grid: a card
 * reads its own width, never the window). Then the regions as plain elements with their `slot`,
 * the grid left to the author (`disable-auto-grid`), the colours of a product
 * (`--mds-card-background` and `--mds-card-color` together), a badge in front of the media (the
 * `content` slot of mds-card-media), the footer with one action, a card taller than its regions
 * (the footer at the bottom, the free space above it) and the empty card. The parts
 * (mds-card-header, -media, -content, -footer) have no story of their own: their states are
 * here. The card takes no interaction of its own: no state needs a play.
 */
interface CardState {
  state: string;
  /** the regions, by their initials: header, media, content, footer */
  regions: string;
  /** two columns of the grid, for a card wider than 30em */
  wide?: boolean;
  card?: Record<string, string | boolean>;
  style?: Record<string, string>;
  /** a badge in front of the media */
  mediaContent?: boolean;
  /** the footer with one action */
  oneAction?: boolean;
  /** the regions as plain elements with their slot */
  plain?: boolean;
}

const regionsOf = (initials: string) =>
  [
    initials.includes('h') && 'header',
    initials.includes('m') && 'media',
    initials.includes('c') && 'content',
    initials.includes('f') && 'footer',
  ]
    .filter(Boolean)
    .join(', ');

const layouts = ['hmcf', 'hmc', 'hmf', 'hcf', 'mcf', 'hm', 'hc', 'hf', 'mc', 'mf', 'cf'];
const wideLayouts = ['hmcf', 'hmc', 'hmf', 'mcf', 'mc'];

const cardStates: CardState[] = [
  ...layouts.map((regions) => ({ state: regionsOf(regions), regions })),
  { state: 'header only', regions: 'h' },
  { state: 'media only', regions: 'm' },
  { state: 'content only', regions: 'c' },
  { state: 'footer only', regions: 'f' },
  // each card two columns wide beside a cell one column wide, so the rows stay full
  ...wideLayouts.flatMap((regions, index): CardState[] => [
    { state: `wider than 30em: ${regionsOf(regions)}`, regions, wide: true },
    [
      { state: 'regions as elements with their slot', regions: 'hmcf', plain: true },
      { state: 'disable-auto-grid', regions: 'hmcf', card: { 'disable-auto-grid': true } },
      {
        state: 'background and text of a product',
        regions: 'hc',
        style: {
          '--mds-card-background': 'rgb(var(--magma-accent-emphasis))',
          '--mds-card-color': 'rgb(var(--magma-text-on-emphasis))',
        },
      },
      { state: 'a badge in front of the media', regions: 'hmc', mediaContent: true },
      { state: 'footer with one action', regions: 'hcf', oneAction: true },
    ][index],
  ]),
  {
    state: 'taller than its regions, the footer at the bottom',
    regions: 'hf',
    card: { class: 'min-h-8000' },
  },
  { state: 'empty', regions: '' },
];

const header = (
  <div class="grid gap-0">
    <mds-text typography="h6">Richiesta 2026/114</mds-text>
    <mds-text typography="caption">Ufficio tributi</mds-text>
  </div>
);
const image = <mds-img src={URLs[0]} alt="" class="object-cover"></mds-img>;
const text = (
  <mds-text>Il contribuente chiede il rimborso della TARI versata due volte per il 2025.</mds-text>
);
const actions = (oneAction?: boolean) =>
  oneAction
    ? [
        <mds-button key="apri" variant="primary" tone="outline">
          Apri la pratica
        </mds-button>,
      ]
    : [
        <mds-button key="rifiuta" variant="dark" tone="outline">
          Rifiuta
        </mds-button>,
        <mds-button key="accogli" variant="primary" tone="outline">
          Accogli
        </mds-button>,
      ];

const regionsAsParts = ({ regions, mediaContent, oneAction }: CardState) => [
  regions.includes('h') && <mds-card-header key="header">{header}</mds-card-header>,
  regions.includes('m') && (
    <mds-card-media key="media">
      {image}
      {mediaContent && <mds-badge slot="content">In evidenza</mds-badge>}
    </mds-card-media>
  ),
  regions.includes('c') && <mds-card-content key="content">{text}</mds-card-content>,
  regions.includes('f') && <mds-card-footer key="footer">{actions(oneAction)}</mds-card-footer>,
];

const regionsAsElements = () => [
  <div key="header" slot="header">
    {header}
  </div>,
  <mds-img key="media" slot="media" src={URLs[0]} alt="" class="object-cover"></mds-img>,
  <mds-text key="content" slot="content">
    Il contribuente chiede il rimborso della TARI versata due volte per il 2025.
  </mds-text>,
  <div key="footer" slot="footer" class="flex gap-200 justify-end">
    {actions()}
  </div>,
];

// a card wider than 30em: from three columns of the grid its cell takes two (a container query
// of the frame, which the cells cannot ask for)
const wideCells = `@container (width >= 48rem) { ${cardStates
  .filter(({ wide }) => wide)
  .map(({ state }) => `section[data-state="${state}"]`)
  .join(', ')} { grid-column: span 2; } }`;

const TemplateStates = () => (
  <StatesGrid>
    <style>{wideCells}</style>
    {cardStates.map((cardState) => (
      <StateCell key={cardState.state} state={cardState.state}>
        <mds-card {...cardState.card} style={cardState.style}>
          {cardState.plain ? regionsAsElements() : regionsAsParts(cardState)}
        </mds-card>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
