import { h } from '@stencil/core'

export default {
  title: 'UI / List',
}

const Template = () =>
  <mds-list>
    <mds-list-item>Pane</mds-list-item>
    <mds-list-item>Acqua</mds-list-item>
    <mds-list-item>Pasta</mds-list-item>
  </mds-list>

export const Default = Template.bind({})
