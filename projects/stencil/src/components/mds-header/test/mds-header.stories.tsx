import { h } from '@stencil/core'

export default {
  title: 'UI / Header',
  argTypes: {},
}

const Template = args =>
  <mds-header {...args}>
    <mds-header-bar>
      <div class="flex gap-2 items-center">
        <mds-img class="w-10" src="./logo-gruppo-maggioli.svg"/>
        <div class="mb-1">
          <mds-text typography="h6">Gruppo Maggioli</mds-text>
          <mds-text typography="option" class="text-adjust-tone-04">Header by RD Team</mds-text>
        </div>
      </div>
      <mds-button slot="nav" variant="dark" tone="ghost">Accedi</mds-button>
      <mds-button slot="nav" icon="mi/round/person">Registrati</mds-button>
    </mds-header-bar>
    <div slot="nav-mobile">
      <div class="flex gap-2 items-center p-6 border-b border-adjust-tone-09">
        <mds-img class="w-10" src="./logo-gruppo-maggioli.svg"/>
        <div class="mb-1">
          <mds-text typography="h6">Gruppo Maggioli</mds-text>
          <mds-text typography="option" class="text-adjust-tone-04">Header by RD Team</mds-text>
        </div>
      </div>
      <div class="grid gap-2 p-6">
        <mds-button variant="dark" tone="ghost">Accedi</mds-button>
        <mds-button icon="mi/round/person">Registrati</mds-button>
      </div>
    </div>
  </mds-header>

export const Default = Template.bind({})
