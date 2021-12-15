import React from 'react'
import MdsCard from '@component/mds-card/mds-card'

export default {
  title: 'Layout / Card',
  component: MdsCard,
}

const Template = args =>
  <mds-card {...args}>
    <mds-text>L' aspetto di Gogoat ricorda una capra o un montone. Ha dei folti cespugli sul corpo che si presentano quasi come una criniera. Il suo pelo è marrone, più chiaro e folto di quello degli Skiddo. Ha delle corna molto lunghe e ricurve, ed anche piuttosto resistenti. Se l'allenatore gli stringe le corna il loro legame si intensifica.</mds-text>
    <mds-text>È in grado di intuire gli stati d'animo del suo Allenatore dal modo in cui questi gli afferra le corna. Ciò consente a Pokémon e Allenatore di correre in perfetta sintonia. Infatti, la sua grande stazza permette al suo Allenatore di cavalcarlo.</mds-text>
    <mds-text>Questi Pokémon vivono in greggi. Stabiliscono il leader del gruppo confrontandosi a cornate.</mds-text>
  </mds-card>

export const Default = Template.bind({})

export const tailwindStyle = () => <mds-card class="gap-4 p-6 shadow-xl">
  <mds-text class="bg-status-info-09 text-status-info-03 -mx-6 -mt-6 p-6">L' aspetto di Gogoat ricorda una capra o un montone. Ha dei folti cespugli sul corpo che si presentano quasi come una criniera. Il suo pelo è marrone, più chiaro e folto di quello degli Skiddo. Ha delle corna molto lunghe e ricurve, ed anche piuttosto resistenti. Se l'allenatore gli stringe le corna il loro legame si intensifica.</mds-text>
  <mds-text>È in grado di intuire gli stati d'animo del suo Allenatore dal modo in cui questi gli afferra le corna. Ciò consente a Pokémon e Allenatore di correre in perfetta sintonia. Infatti, la sua grande stazza permette al suo Allenatore di cavalcarlo.</mds-text>
    <mds-text>Questi Pokémon vivono in greggi. Stabiliscono il leader del gruppo confrontandosi a cornate.</mds-text>
</mds-card>
