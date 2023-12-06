import { h } from '@stencil/core'
import { menuDictionary, navDictionary } from '../../mds-header-bar/meta/dictionary'

export default {
  title: 'UI / Header',
  argTypes: {
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
}

const Template = args =>
  <mds-header {...args}>
    <mds-header-bar>
      <div class="flex gap-200 items-center">
        <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
        <div class="mb-100">
          <mds-text typography="h6">Mobile menu</mds-text>
          <mds-text typography="option" class="text-tone-neutral-04">Shows up under 1024px</mds-text>
        </div>
      </div>
      <mds-button slot="nav" variant="dark" tone="ghost">Accedi</mds-button>
      <mds-button slot="nav" icon="mi/round/person">Registrati</mds-button>
    </mds-header-bar>
    <div slot="menu">
      <div class="flex gap-200 items-center p-600 border-b border-tone-neutral-09">
        <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
        <div class="mb-100">
          <mds-text typography="h6">Gruppo Maggioli</mds-text>
          <mds-text typography="option" class="text-tone-neutral-04">Header by RD Team</mds-text>
        </div>
      </div>
      <div class="grid gap-200 p-600">
        <mds-button variant="dark" tone="ghost">Accedi</mds-button>
        <mds-button icon="mi/round/person">Registrati</mds-button>
      </div>
    </div>
  </mds-header>

export const Default = Template.bind({})
