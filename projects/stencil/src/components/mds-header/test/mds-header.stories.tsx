import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { menuDictionary, navDictionary } from '../../mds-header-bar/meta/dictionary';
import { appearanceDictionary, appearanceSetDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Structure / Header',
  id: 'ui-header',
  argTypes: {
    appearance: {
      description: 'Sets the appearance of the header bar element',
      options: appearanceDictionary,
      control: { type: 'select' },
    },
    'appearance-set': {
      description: 'Sets the appearance of the header bar element depending on the scroll position',
      options: appearanceSetDictionary,
      control: { type: 'select' },
    },
    'hide-backdrop': {
      description:
        'Hides the backdrop shown when the mds-header-bar attribute appearace is set to `inline`',
      type: 'boolean',
    },
    'auto-hide': {
      type: 'number',
      description:
        "When the page is scrolled down, the component mds-header-bar is hidden starting from the `autoHide` attribute's value, then if the page is scrolled up it is shown again",
    },
    menu: {
      description: 'Sets the visibility type of the hamburger menu of mds-header-bar',
      options: menuDictionary,
      control: { type: 'select' },
    },
    nav: {
      description: 'Sets the visibility type of the navigation menu of mds-header-bar',
      options: navDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <div>
    <mds-header {...args}>
      <mds-header-bar>
        <div class="flex gap-400 items-center">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-100 grid grid-cols-full gap-100">
            <mds-text typography="h5" tag="h3">
              Mobile menu
            </mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Shows up under 1024px
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" variant="dark" tone="outline">
          Accedi
        </mds-button>
        <mds-button slot="nav" icon="mi/round/person">
          Registrati
        </mds-button>
      </mds-header-bar>
      <div slot="menu">
        <div class="flex gap-200 items-center p-600 border-b border-tone-neutral-09">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6" tag="h4">
              Gruppo Maggioli
            </mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <div class="grid gap-200 p-600">
          <mds-button variant="dark" tone="outline">
            Accedi
          </mds-button>
          <mds-button icon="mi/round/person">Registrati</mds-button>
        </div>
      </div>
    </mds-header>
    <div class="grid">
      {Array(40)
        .fill(null)
        .map((_value, index) => (
          <div
            key={index}
            class="h-[100px] flex items-start justify-center text-center border-0 border-t border-solid border-t-tone-neutral-07"
          >
            <mds-text
              class="px-200 py-100 rounded-b-lg bg-tone-neutral-10 border-t-0 border border-solid border-tone-neutral-07"
              typography="snippet"
              tag="div"
            >
              {index === 0 ? '0px' : index + '00px'}
            </mds-text>
          </div>
        ))}
    </div>
  </div>
);

const TemplateAutoHide = (args) => (
  <div>
    <mds-header {...args}>
      <mds-header-bar>
        <div class="flex gap-400 items-center">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-100 grid grid-cols-full gap-100">
            <mds-text typography="h5" tag="h3">
              Mobile menu
            </mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Shows up under 1024px
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" variant="dark" tone="outline">
          Accedi
        </mds-button>
        <mds-button slot="nav" icon="mi/round/person">
          Registrati
        </mds-button>
      </mds-header-bar>
      <div slot="menu">
        <div class="flex gap-200 items-center p-600 border-b border-tone-neutral-09">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6" tag="h4">
              Gruppo Maggioli
            </mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <div class="grid gap-200 p-600">
          <mds-button variant="dark" tone="outline">
            Accedi
          </mds-button>
          <mds-button icon="mi/round/person">Registrati</mds-button>
        </div>
      </div>
    </mds-header>
    <div class="grid">
      {Array(40)
        .fill(null)
        .map((_value, index) => (
          <div
            key={index}
            class="h-[100px] flex items-start justify-center text-center border-0 border-t border-solid border-t-tone-neutral-07"
          >
            <mds-text
              class="px-200 py-100 rounded-b-lg bg-tone-neutral-10 border-t-0 border border-solid border-tone-neutral-07"
              typography="snippet"
              tag="div"
            >
              {index === 0 ? '0px' : index + '00px'}
            </mds-text>
          </div>
        ))}
    </div>
  </div>
);

const TemplateLandingPage = (args) => (
  <div class="-m-600">
    <mds-header {...args}>
      <mds-header-bar>
        <div class="flex gap-400 items-center">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-100 grid grid-cols-full gap-100">
            <mds-text typography="h5" tag="h3">
              Mobile menu
            </mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Shows up under 1024px
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" variant="dark" tone="outline">
          Accedi
        </mds-button>
        <mds-button slot="nav" icon="mi/round/person">
          Registrati
        </mds-button>
      </mds-header-bar>
      <div slot="menu">
        <div class="flex gap-200 items-center p-600 border-b border-tone-neutral-09">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6" tag="h4">
              Gruppo Maggioli
            </mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <div class="grid gap-200 p-600">
          <mds-button variant="dark" tone="outline">
            Accedi
          </mds-button>
          <mds-button icon="mi/round/person">Registrati</mds-button>
        </div>
      </div>
    </mds-header>
    <div class="bg-label-amaranth-06 text-fg-on-emphasis flex text-center items-center justify-center h-[600px] flex-col select-none">
      <mds-text typography="h1">Hey</mds-text>
      <mds-text typography="h1">WelcomeTo</mds-text>
      <mds-text typography="h1">ThisBeautiful</mds-text>
      <mds-text typography="h1">AndIncrediblyNice</mds-text>
      <mds-text typography="h1">FakeLandingPage</mds-text>
      <mds-text typography="h1">ForYourJoy</mds-text>
      <mds-text typography="h1">ByeBye</mds-text>
      <mds-text typography="h1">Bro</mds-text>
    </div>
    <div class="p-1200 flex justify-center">
      <div class="grid gap-600 grid-cols-3 max-mobile:grid-cols-1 max-w-screen-desktop">
        {Array(18)
          .fill(null)
          .map((_value, index) => (
            <div key={index} class="grid gap-25">
              <mds-text typography="h5" tag="h2">
                This is a section title
              </mds-text>
              <mds-text>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus iure, ratione
                beatae quam optio cumque rerum modi consectetur odit eligendi omnis veniam fuga non
                ipsam voluptatum a ut neque illum.
              </mds-text>
            </div>
          ))}
      </div>
    </div>
  </div>
);

export const Default = {
  render: Template,
};

export const AutoHide = {
  render: TemplateAutoHide,

  args: {
    'auto-hide': 300,
    threshold: 10,
  },
};

export const Appearance = {
  render: TemplateAutoHide,

  args: {
    appearance: 'inline',
  },
};

export const AppearanceSet = {
  render: TemplateLandingPage,

  args: {
    'appearance-set': 'inline, stripe 548',
    'auto-hide': 800,
    appearance: 'inline',
    menu: 'all',
    threshold: 10,
  },
};

/**
 * Every state of the header once the story has opened (#1440, @fixture/states), each at the top
 * of a page of its own: a box with `transform` and `overflow: hidden` holds the header, sticky,
 * and its backdrop, fixed, which would otherwise stand at the top of the window over every cell.
 * The two appearances, the floating one with and without its backdrop, the bar hidden in each,
 * and where the header lets the bar show its navigation and its hamburger (`nav`, `menu`: the
 * values name breakpoints of the window, so a cell shows what the window of the story is wide
 * enough for), with and without a `menu` slot, which a hamburger needs to open anything. The bar
 * hides on scroll (`auto-hide`) and changes appearance on scroll (`appearance-set`) by the scroll
 * of the window, which every cell shares: the hidden bar is set here on `visibility`, the scroll
 * is in the stories AutoHide and AppearanceSet. The menu opens in an mds-modal, in the top layer
 * over the whole page, so it is left to the stories of the header and of the modal. The states
 * the bar has of its own (its regions, the long name, the many actions) are in the story of
 * mds-header-bar. No state needs a play.
 */
interface HeaderState {
  state: string;
  header?: Record<string, string | boolean>;
  /** the header has a menu, which the hamburger opens */
  menu?: boolean;
}

const headerStates: HeaderState[] = [
  { state: 'stripe, nav from desktop and menu on mobile', menu: true },
  { state: 'inline, floating', header: { appearance: 'inline' }, menu: true },
  {
    state: 'inline, without backdrop',
    header: { appearance: 'inline', 'hide-backdrop': true },
    menu: true,
  },
  { state: 'stripe, hidden', header: { visibility: 'hidden' }, menu: true },
  {
    state: 'inline, hidden',
    header: { appearance: 'inline', visibility: 'hidden' },
    menu: true,
  },
  { state: 'nav and menu on every screen', header: { nav: 'all', menu: 'all' }, menu: true },
  { state: 'menu only, on every screen', header: { nav: 'none', menu: 'all' }, menu: true },
  {
    state: 'nav on mobile, menu from desktop',
    header: { nav: 'mobile', menu: 'desktop' },
    menu: true,
  },
  { state: 'menu none', header: { nav: 'all', menu: 'none' }, menu: true },
  { state: 'menu on every screen, no menu slot', header: { nav: 'all', menu: 'all' } },
];

const TemplateStates = () => (
  <StatesGrid>
    {headerStates.map(({ state, header, menu }) => (
      <StateCell key={state} state={state}>
        <div
          class="relative overflow-hidden rounded-md bg-surface-default"
          style={{ transform: 'translateZ(0)' }}
        >
          <mds-header {...header}>
            <mds-header-bar>
              <div class="flex gap-400 items-center">
                <mds-img
                  class="w-1000 shrink-0"
                  src="./logo-gruppo-maggioli.svg"
                  alt="Gruppo Maggioli"
                />
                <mds-text typography="h6">Servizi online</mds-text>
              </div>
              <mds-button slot="nav" variant="dark" tone="outline">
                Accedi
              </mds-button>
              <mds-button slot="nav" icon="mi/round/person">
                Registrati
              </mds-button>
            </mds-header-bar>
            {menu && (
              <div slot="menu" class="grid gap-200 p-600">
                <mds-button variant="dark" tone="outline">
                  Accedi
                </mds-button>
                <mds-button icon="mi/round/person">Registrati</mds-button>
              </div>
            )}
          </mds-header>
          <div class="grid gap-200 p-600">
            <mds-text typography="detail">
              Pagamenti, certificati e pratiche del Comune, in un unico posto.
            </mds-text>
            <mds-text typography="detail" class="text-fg-muted">
              Accedi con SPID o CIE per vedere le tue pratiche.
            </mds-text>
          </div>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,

  parameters: {
    a11y: {
      config: {
        // a page has one header, and the nav of its bar takes no name: the ten pages of this story
        // put ten unnamed navs in one document, which axe reads as landmarks a screen reader cannot
        // tell apart (landmark-unique). Off here only, the rest of axe runs; the rule of
        // .storybook/preview.jsx is repeated, since a parameter that is an array is replaced
        rules: [
          { id: 'color-contrast', reviewOnFail: true },
          { id: 'landmark-unique', enabled: false },
        ],
      },
    },
  },
};
