import { h } from '@stencil/core'

export default {
  title: 'UI / Separator',
}

const Template = args =>
  <div class="grid gap-4">
    <mds-entity aria-label="Personaggio" class="shadow-none px-0" icon="mi/baseline/person">
      <mds-text aria-label="Nome" typography="h6">Mario Rossi</mds-text>
      <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="quiet">buono</mds-badge>
      <mds-text aria-label="Email" slot="detail" typography="caption">mario@nintendo.com</mds-text>
    </mds-entity>
    <mds-separator {...args}></mds-separator>
    <mds-entity aria-label="Personaggio" class="shadow-none px-0" icon="mi/baseline/person">
      <mds-text aria-label="Nome" typography="h6">Luigi Verdi</mds-text>
      <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="quiet">buono</mds-badge>
      <mds-text aria-label="Email" slot="detail" typography="caption">luigi@nintendo.com</mds-text>
    </mds-entity>
    <mds-separator {...args}></mds-separator>
    <mds-entity aria-label="Personaggio" class="shadow-none px-0" icon="mi/baseline/person">
      <mds-text aria-label="Nome" typography="h6">Wario</mds-text>
      <mds-badge aria-label="Carattere" slot="detail" variant="violet" tone="quiet">biricchino</mds-badge>
      <mds-text aria-label="Email" slot="detail" typography="caption">wario@nintendo.com</mds-text>
    </mds-entity>
  </div>

export const Default = Template.bind({})
