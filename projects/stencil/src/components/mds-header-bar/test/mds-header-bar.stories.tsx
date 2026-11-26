import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { menuDictionary, navDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Structure / Header / Header bar',
  id: 'ui-header-header-bar',
  argTypes: {
    menu: {
      description: 'Sets the visibility type of the hamburger menu',
      options: menuDictionary,
      control: { type: 'select' },
    },
    nav: {
      description: 'Sets the visibility type of the navigation menu',
      options: navDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-header-bar {...args}>
    <div class="flex gap-200 items-center">
      <mds-img class="w-100000" src="./logo-gruppo-maggioli.svg" />
      <div class="mb-100">
        <mds-text typography="h6">Mobile menu</mds-text>
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
);

export const Default = {
  render: Template,
};

/**
 * Every state a bar has of its own once the story has opened (#1440, @fixture/states), each in an
 * mds-header at the top of a page of its own (a box with `transform` and `overflow: hidden`, which
 * holds the header, sticky, and its backdrop, fixed). Its regions: the brand with the navigation,
 * with the navigation and the hamburger, with the hamburger alone, alone; the brand as a name
 * without a logo, the long name that wraps, a navigation of many actions. Inside a header `menu`
 * and `nav` are written by the header, and a hamburger needs the `menu` slot of the header to
 * open anything: the bar shows them as its header says. The states that come from the header
 * (the floating appearance, the hidden bar, the breakpoints of `nav` and `menu`) are in the story
 * of mds-header, and the menu opens in an mds-modal, in the top layer over the whole page, so it
 * is left to the stories of the header and of the modal. No state needs a play.
 */
interface BarState {
  state: string;
  header?: Record<string, string>;
  /** the header has a menu, which the hamburger opens */
  menu?: boolean;
  /** the actions of the navigation */
  nav: string[];
  /** the name of the product, beside the logo */
  name: string;
  /** the brand is the name alone */
  noLogo?: boolean;
}

const barStates: BarState[] = [
  { state: 'brand and navigation', nav: ['Accedi', 'Registrati'], name: 'Servizi online' },
  {
    state: 'brand, navigation and hamburger',
    header: { nav: 'all', menu: 'all' },
    menu: true,
    nav: ['Accedi', 'Registrati'],
    name: 'Servizi online',
  },
  {
    state: 'brand and hamburger, no navigation',
    header: { menu: 'all' },
    menu: true,
    nav: [],
    name: 'Servizi online',
  },
  { state: 'brand alone', nav: [], name: 'Servizi online' },
  {
    state: 'name without a logo',
    nav: ['Accedi', 'Registrati'],
    name: 'Servizi online',
    noLogo: true,
  },
  {
    state: 'long name',
    nav: ['Accedi'],
    name: "Sportello unico per l'edilizia e per le imprese del Comune",
  },
  {
    state: 'many actions in the navigation',
    nav: ['Servizi', 'Notizie', 'Contatti', 'Accedi'],
    name: 'Comune',
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {barStates.map(({ state, header, menu, nav, name, noLogo }) => (
      <StateCell key={state} state={state}>
        <div
          class="relative overflow-hidden rounded-md bg-surface-default"
          style={{ transform: 'translateZ(0)' }}
        >
          <mds-header {...header}>
            <mds-header-bar>
              <div class="flex gap-400 items-center">
                {!noLogo && (
                  <mds-img
                    class="w-1000 shrink-0"
                    src="./logo-gruppo-maggioli.svg"
                    alt="Gruppo Maggioli"
                  />
                )}
                <mds-text typography="h6">{name}</mds-text>
              </div>
              {nav.map((action, index) => (
                <mds-button
                  key={action}
                  slot="nav"
                  variant={index === nav.length - 1 ? 'primary' : 'dark'}
                  tone={index === nav.length - 1 ? 'strong' : 'outline'}
                >
                  {action}
                </mds-button>
              ))}
            </mds-header-bar>
            {menu && (
              <div slot="menu" class="grid gap-200 p-600">
                {nav.map((action) => (
                  <mds-button key={action} variant="dark" tone="outline">
                    {action}
                  </mds-button>
                ))}
              </div>
            )}
          </mds-header>
          <div class="p-600">
            <mds-text typography="detail">
              Pagamenti, certificati e pratiche del Comune, in un unico posto.
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
        // a page has one header, and the nav of its bar takes no name: the pages of this story put
        // several unnamed navs in one document, which axe reads as landmarks a screen reader cannot
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
