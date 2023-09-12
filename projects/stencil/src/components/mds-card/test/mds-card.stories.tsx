import { h } from '@stencil/core'
import { URLs } from '../../mds-img/meta/storybook'

export default {
  title: 'Layout / Card',
}

const Template = args =>
  <mds-card {...args}>
    <mds-text>L' aspetto di Gogoat ricorda una capra o un montone. Ha dei folti cespugli sul corpo che si presentano quasi come una criniera. Il suo pelo è marrone, più chiaro e folto di quello degli Skiddo. Ha delle corna molto lunghe e ricurve, ed anche piuttosto resistenti. Se l'allenatore gli stringe le corna il loro legame si intensifica.</mds-text>
    <mds-text>È in grado di intuire gli stati d'animo del suo Allenatore dal modo in cui questi gli afferra le corna. Ciò consente a Pokémon e Allenatore di correre in perfetta sintonia. Infatti, la sua grande stazza permette al suo Allenatore di cavalcarlo.</mds-text>
    <mds-text>Questi Pokémon vivono in greggi. Stabiliscono il leader del gruppo confrontandosi a cornate.</mds-text>
  </mds-card>

export const Default = Template.bind({})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const FullCardTemplate = () =>
  <mds-card class="min-h-[300px]">
    <mds-card-header>
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
    <mds-img src={URLs[0]} slot="media"></mds-img>
    <div slot="content">Contents</div>
    <div slot="footer">Footer</div>
  </mds-card>

export const fullCard = FullCardTemplate.bind({})
