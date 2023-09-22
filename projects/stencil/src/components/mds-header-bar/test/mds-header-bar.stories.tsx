import { h } from '@stencil/core'
import { menuDictionary, navDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Header / Header bar',
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
}

const Template = args =>
  <mds-header-bar {...args}>
    <div class="flex gap-2 items-center">
      <mds-img class="w-10" src="./logo-gruppo-maggioli.svg" />
      <div class="mb-1">
        <mds-text typography="h6">Mobile menu</mds-text>
        <mds-text typography="option" class="text-tone-neutral-04">Shows up under 1024px</mds-text>
      </div>
    </div>
    <mds-button slot="nav" variant="dark" tone="ghost">Accedi</mds-button>
    <mds-button slot="nav" icon="mi/round/person">Registrati</mds-button>
  </mds-header-bar>

export const Default = Template.bind({})
