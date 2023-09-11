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
      <mds-button icon="mi/round/more-vert" variant="light"></mds-button>
    </mds-card-header>
  </mds-card>

export const Default = Template.bind({})
