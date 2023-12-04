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
        <div class="flex gap-400 items-center">
          <mds-avatar class="w-1100 min-w-1100 " initials='mc'></mds-avatar>
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
    <mds-dropdown target="action-example" class="max-w-[350px] p-200 gap-100" backdrop>
      <mds-button variant="dark" tone="quiet" class="justify-start">Modifica account</mds-button>
      <mds-button variant="dark" tone="quiet" class="justify-start">Elimina</mds-button>
      <mds-button variant="dark" tone="quiet" class="justify-start">Esci dalla sessione</mds-button>
    </mds-dropdown>
  </div>

const CustomSlotsTemplate = args =>
  <div>
    <mds-card {...args}>
      <div slot="header" class="flex gap-400 items-center justify-between px-400 py-400">
        <div class="flex gap-400 items-center">
          <mds-avatar class="w-1100 min-w-1100 " initials='mc'></mds-avatar>
          <div class="flex gap-0 flex-col">
            <mds-text typography="h6">Mauro Coletta</mds-text>
            <mds-text typography="caption">Management designer</mds-text>
          </div>
        </div>
        <mds-button id="action-example" icon="mi/round/more-vert" variant="light"></mds-button>
      </div>
      <mds-img src={URLs[0]} slot="media" class="object-cover"></mds-img>
      <div slot="content" class="px-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
      </div>
      <div slot="footer" class="px-400 py-400 text-right">
        <mds-button variant="dark">Contact</mds-button>
      </div>
    </mds-card>
    <mds-dropdown target="action-example" class="max-w-[350px] p-200 gap-100" backdrop>
      <mds-button variant="dark" tone="quiet" class="justify-start">Modifica account</mds-button>
      <mds-button variant="dark" tone="quiet" class="justify-start">Elimina</mds-button>
      <mds-button variant="dark" tone="quiet" class="justify-start">Esci dalla sessione</mds-button>
    </mds-dropdown>
  </div>

const LayoutHMCFTemplate = args =>
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100" initials='mc'></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="light"></mds-button>
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

const LayoutHMCTemplate = args =>
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials='mc'></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="light"></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
    </mds-card-content>
  </mds-card>

const LayoutHMFTemplate = args =>
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials='mc'></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="light"></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-footer>
      <mds-button variant="dark" tone="quiet">Cancel</mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>

const LayoutHCFTemplate = args =>
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials='mc'></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="light"></mds-button>
    </mds-card-header>
    <mds-card-content class="py-0">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
    </mds-card-content>
    <mds-card-footer>
      <mds-button variant="dark" tone="quiet">Cancel</mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>

const LayoutMCFTemplate = args =>
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
    </mds-card-content>
    <mds-card-footer class="pt-0">
      <mds-button variant="dark" tone="quiet">Cancel</mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>

const LayoutHCTemplate = args =>
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials='mc'></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="light"></mds-button>
    </mds-card-header>
    <mds-card-content class="pt-0">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
    </mds-card-content>
  </mds-card>

const LayoutMCTemplate = args =>
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
    </mds-card-content>
  </mds-card>

const LayoutMFTemplate = args =>
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-footer>
      <mds-button variant="dark" tone="quiet">Cancel</mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>

const LayoutHMTemplate = args =>
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials='mc'></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="light"></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
  </mds-card>

const LayoutCFTemplate = args =>
  <mds-card {...args}>
    <mds-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
    </mds-card-content>
    <mds-card-footer class="pt-0">
      <mds-button variant="dark" tone="quiet">Cancel</mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>

const LayoutHFTemplate = args =>
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials='mc'></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="light"></mds-button>
    </mds-card-header>
    <mds-card-footer class="pt-0">
      <mds-button variant="dark" tone="quiet">Cancel</mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>

const LayoutMTemplate = args =>
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
  </mds-card>

const LayoutHTemplate = args =>
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials='mc'></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button icon="mi/round/more-vert" variant="light"></mds-button>
    </mds-card-header>
  </mds-card>

const LayoutCTemplate = args =>
  <mds-card {...args}>
    <mds-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
    </mds-card-content>
  </mds-card>

const LayoutFTemplate = args =>
  <mds-card {...args}>
    <mds-card-footer>
      <mds-button variant="dark" tone="quiet">Cancel</mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>

export const Default = Template.bind({})
export const FullCard = FullCardTemplate.bind({})
export const FullCardCustomSlots = CustomSlotsTemplate.bind({})
FullCardCustomSlots.args = {
  'auto-grid': false,
}

export const LayoutHeaderMediaContentFooter = LayoutHMCFTemplate.bind({})
export const LayoutHeaderMediaContent = LayoutHMCTemplate.bind({})
export const LayoutHeaderMediaFooter = LayoutHMFTemplate.bind({})
export const LayoutHeaderContentFooter = LayoutHCFTemplate.bind({})
export const LayoutHeaderContent = LayoutHCTemplate.bind({})
export const LayoutHeaderMedia = LayoutHMTemplate.bind({})
export const LayoutHeaderFooter = LayoutHFTemplate.bind({})
export const LayoutMediaContentFooter = LayoutMCFTemplate.bind({})
export const LayoutMediaContent = LayoutMCTemplate.bind({})
export const LayoutMediaFooter = LayoutMFTemplate.bind({})
export const LayoutContentFooter = LayoutCFTemplate.bind({})
export const LayoutHeader = LayoutHTemplate.bind({})
export const LayoutMedia = LayoutMTemplate.bind({})
export const LayoutContent = LayoutCTemplate.bind({})
export const LayoutFooter = LayoutFTemplate.bind({})
