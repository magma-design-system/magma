import { h } from '@stencil/core'
import { URLs } from '../../mds-img/meta/storybook'

export default {
  title: 'Layout / Card',
  argTypes: {
    'auto-grid': {
      type: { name: 'boolean' },
      description: 'Enables automatic responsive behavior based on container queries',
    },
  },
}

const Template = args =>
  <mds-card {...args}>
    <mds-text>L' aspetto di Gogoat ricorda una capra o un montone. Ha dei folti cespugli sul corpo che si presentano quasi come una criniera. Il suo pelo è marrone, più chiaro e folto di quello degli Skiddo. Ha delle corna molto lunghe e ricurve, ed anche piuttosto resistenti. Se l'allenatore gli stringe le corna il loro legame si intensifica.</mds-text>
    <mds-text>È in grado di intuire gli stati d'animo del suo Allenatore dal modo in cui questi gli afferra le corna. Ciò consente a Pokémon e Allenatore di correre in perfetta sintonia. Infatti, la sua grande stazza permette al suo Allenatore di cavalcarlo.</mds-text>
    <mds-text>Questi Pokémon vivono in greggi. Stabiliscono il leader del gruppo confrontandosi a cornate.</mds-text>
  </mds-card>

const FullCardTemplate = args =>
  <div>
    <mds-card {...args}>
      <mds-card-header>
        <div class="flex gap-4 items-center">
          <mds-avatar class="w-11" initials='mc'></mds-avatar>
          <div class="flex gap-0 flex-col">
            <mds-text typography="h6">Mauro Coletta</mds-text>
            <mds-text typography="caption">Management designer</mds-text>
          </div>
        </div>
        <mds-button id="action-example" icon="mi/round/more-vert" variant="light"></mds-button>
      </mds-card-header>
      <mds-card-media>
        <mds-img src={URLs[0]} class="object-cover"></mds-img>
      </mds-card-media>
      <mds-card-content>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-card-content>
      <mds-card-footer>
        <mds-button variant="dark" tone="quiet">Cancel</mds-button>
        <mds-button>Contact</mds-button>
      </mds-card-footer>
    </mds-card>
    <mds-dropdown target="action-example" class="max-w-[350px] p-2 gap-1" backdrop>
      <mds-button variant="dark" tone="quiet" class="justify-start">Modifica account</mds-button>
      <mds-button variant="dark" tone="quiet" class="justify-start">Elimina</mds-button>
      <mds-button variant="dark" tone="quiet" class="justify-start">Esci dalla sessione</mds-button>
    </mds-dropdown>
  </div>

const CustomSlotsTemplate = args =>
  <div>
    <mds-card {...args}>
      <div slot="header" class="flex gap-4 items-center justify-between px-4 py-4">
        <div class="flex gap-4 items-center">
          <mds-avatar class="w-11" initials='mc'></mds-avatar>
          <div class="flex gap-0 flex-col">
            <mds-text typography="h6">Mauro Coletta</mds-text>
            <mds-text typography="caption">Management designer</mds-text>
          </div>
        </div>
        <mds-button id="action-example" icon="mi/round/more-vert" variant="light"></mds-button>
      </div>
      <mds-img src={URLs[0]} slot="media" class="object-cover"></mds-img>
      <div slot="content" class="px-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
      </div>
      <div slot="footer" class="px-4 py-4 text-right">
        <mds-button variant="dark">Contact</mds-button>
      </div>
    </mds-card>
    <mds-dropdown target="action-example" class="max-w-[350px] p-2 gap-1" backdrop>
      <mds-button variant="dark" tone="quiet" class="justify-start">Modifica account</mds-button>
      <mds-button variant="dark" tone="quiet" class="justify-start">Elimina</mds-button>
      <mds-button variant="dark" tone="quiet" class="justify-start">Esci dalla sessione</mds-button>
    </mds-dropdown>
  </div>

export const Default = Template.bind({})
export const FullCard = FullCardTemplate.bind({})
export const FullCardCustomSlots = CustomSlotsTemplate.bind({})
FullCardCustomSlots.args = {
  'auto-grid': false,
}
