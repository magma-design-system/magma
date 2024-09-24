import { h } from '@stencil/core'

export default {
  title: 'UI / Separator',
}

const Template = args =>
  <div class="p-600 bg-tone-neutral-10 rounded-3xl">
    <div class="grid rounded-xl bg-tone-neutral shadow contrast-more:shadow-outline overflow-hidden">
      <mds-entity aria-label="Personaggio" class="shadow-none p-600" icon="mi/baseline/person">
        <mds-text aria-label="Nome" typography="h6">Mario Rossi</mds-text>
        <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="weak">buono</mds-badge>
        <mds-text aria-label="Email" slot="detail" typography="caption">mario@nintendo.com</mds-text>
      </mds-entity>
      <mds-separator {...args}></mds-separator>
      <mds-entity aria-label="Personaggio" class="shadow-none p-600" icon="mi/baseline/person">
        <mds-text aria-label="Nome" typography="h6">Luigi Verdi</mds-text>
        <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="weak">buono</mds-badge>
        <mds-text aria-label="Email" slot="detail" typography="caption">luigi@nintendo.com</mds-text>
      </mds-entity>
      <mds-separator {...args}></mds-separator>
      <mds-entity aria-label="Personaggio" class="shadow-none p-600" icon="mi/baseline/person">
        <mds-text aria-label="Nome" typography="h6">Wario</mds-text>
        <mds-badge aria-label="Carattere" slot="detail" variant="violet" tone="weak">biricchino</mds-badge>
        <mds-text aria-label="Email" slot="detail" typography="caption">wario@nintendo.com</mds-text>
      </mds-entity>
    </div>
  </div>

export const Default = Template.bind({})
