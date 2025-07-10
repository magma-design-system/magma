import { h } from '@stencil/core'
import {
  menuDictionary,
  navDictionary,
} from '../../mds-header-bar/meta/dictionary'
import {
  appearanceDictionary,
  appearanceSetDictionary,
} from '../meta/dictionary'

export default {
  title: 'UI / Header',
  argTypes: {
    appearance: {
      description: 'Sets the appearance of the header bar element',
      options: appearanceDictionary,
      control: { type: 'select' },
    },
    'appearance-set': {
      description:
        'Sets the appearance of the header bar element depending on the scroll position',
      options: appearanceSetDictionary,
      control: { type: 'select' },
    },
    backdrop: {
      description:
        'Sets if the backdrop is shown when the mds-header-bar attribute appearace is set to `inline`',
      type: 'boolean',
    },
    'auto-hide': {
      type: 'number',
      description:
        'When the page is scrolled down, the component mds-header-bar is hidden starting from the `autoHide` attribute\'s value, then if the page is scrolled up it is shown again',
    },
    menu: {
      description:
        'Sets the visibility type of the hamburger menu of mds-header-bar',
      options: menuDictionary,
      control: { type: 'select' },
    },
    nav: {
      description:
        'Sets the visibility type of the navigation menu of mds-header-bar',
      options: navDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args => (
  <div>
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
    <mds-header {...args}>
      <mds-header-bar>
        <div class="flex gap-400 items-center">
          <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6">Mobile menu</mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Shows up under 1024px
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" variant="dark" tone="ghost">
          Accedi
        </mds-button>
        <mds-button slot="nav" icon="mi/round/person">
          Registrati
        </mds-button>
      </mds-header-bar>
      <div slot="menu">
        <div class="flex gap-200 items-center p-600 border-b border-tone-neutral-09">
          <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6">Gruppo Maggioli</mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <div class="grid gap-200 p-600">
          <mds-button variant="dark" tone="ghost">
            Accedi
          </mds-button>
          <mds-button icon="mi/round/person">Registrati</mds-button>
        </div>
      </div>
    </mds-header>
  </div>
)

const TemplateAutoHide = args => (
  <div>
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
    <mds-header {...args}>
      <mds-header-bar>
        <div class="flex gap-400 items-center">
          <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6">Mobile menu</mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Shows up under 1024px
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" variant="dark" tone="ghost">
          Accedi
        </mds-button>
        <mds-button slot="nav" icon="mi/round/person">
          Registrati
        </mds-button>
      </mds-header-bar>
      <div slot="menu">
        <div class="flex gap-200 items-center p-600 border-b border-tone-neutral-09">
          <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6">Gruppo Maggioli</mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <div class="grid gap-200 p-600">
          <mds-button variant="dark" tone="ghost">
            Accedi
          </mds-button>
          <mds-button icon="mi/round/person">Registrati</mds-button>
        </div>
      </div>
    </mds-header>
  </div>
)

const TemplateLandingPage = args => (
  <div class="-m-600">
    <div class="bg-label-amaranth-06 text-tone-neutral flex text-center items-center justify-center h-[600px] flex-col pt-2000 select-none">
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
      <div class="grid gap-600 grid-cols-3 mobile:grid-cols-1 max-w-screen-desktop">
        {Array(18)
          .fill(null)
          .map(() => (
            <div class="grid gap-25">
              <mds-text typography="h5" tag="h2">
                This is a section title
              </mds-text>
              <mds-text>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Accusamus iure, ratione beatae quam optio cumque rerum modi
                consectetur odit eligendi omnis veniam fuga non ipsam voluptatum
                a ut neque illum.
              </mds-text>
            </div>
          ))}
      </div>
    </div>
    <mds-header {...args}>
      <mds-header-bar>
        <div class="flex gap-400 items-center">
          <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6">Mobile menu</mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Shows up under 1024px
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" variant="dark" tone="ghost">
          Accedi
        </mds-button>
        <mds-button slot="nav" icon="mi/round/person">
          Registrati
        </mds-button>
      </mds-header-bar>
      <div slot="menu">
        <div class="flex gap-200 items-center p-600 border-b border-tone-neutral-09">
          <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6">Gruppo Maggioli</mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <div class="grid gap-200 p-600">
          <mds-button variant="dark" tone="ghost">
            Accedi
          </mds-button>
          <mds-button icon="mi/round/person">Registrati</mds-button>
        </div>
      </div>
    </mds-header>
  </div>
)

export const Default = {
  render: Template,
}

export const AutoHide = {
  render: TemplateAutoHide,

  args: {
    'auto-hide': 300,
    threshold: 10,
  },
}

export const Appearance = {
  render: TemplateAutoHide,

  args: {
    appearance: 'inline',
  },
}

export const AppearanceSet = {
  render: TemplateLandingPage,

  args: {
    'appearance-set': 'inline, stripe 548',
    'auto-hide': 800,
    appearance: 'inline',
    menu: 'all',
    threshold: 10,
  },
}
