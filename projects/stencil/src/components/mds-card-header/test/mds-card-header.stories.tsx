import { h } from '@stencil/core'

export default {
  title: 'Layout / Card / Header',
}

const Template = args =>
  <mds-card>
    <mds-card-header {...args}>
      <div class="flex gap-4 items-center">
        <mds-avatar class="w-11" initials='mc'></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button id="action-example" icon="mi/round/more-vert" variant="light"></mds-button>
      <mds-dropdown target="action-example" class="max-w-[350px] p-2 gap-1">
        <mds-button variant="light" class="justify-start">Modifica account</mds-button>
        <mds-button variant="light" class="justify-start">Elimina</mds-button>
        <mds-button variant="light" class="justify-start">Esci dalla sessione</mds-button>
      </mds-dropdown>
    </mds-card-header>
  </mds-card>

export const Default = Template.bind({})
