import { h } from '@stencil/core'
import { URLs } from '../../mds-img/meta/storybook'

export default {
  title: 'Layout / Card',
  argTypes: {
    'auto-grid': {
      type: { name: 'boolean' },
      description:
        'Enables automatic responsive behavior based on container queries',
    },
  },
}

const FullCardTemplate = args => (
  <div>
    <mds-card {...args}>
      <mds-card-header>
        <div class="flex gap-400 items-center min-w-0">
          <mds-avatar
            class="w-1100 min-w-1100 shrink-0"
            initials="mc"
          ></mds-avatar>
          <div class="flex gap-0 flex-col grow min-w-0">
            <mds-text typography="h6" truncate="word">
              Mario Coletta
            </mds-text>
            <mds-text typography="caption" truncate="word">
              Management designer
            </mds-text>
          </div>
        </div>
        <mds-button
          class="shrink-0"
          id="action-example"
          icon="mi/round/more-vert"
          variant="dark"
          tone="text"
        ></mds-button>
      </mds-card-header>
      <mds-card-media>
        <mds-img src={URLs[0]} class="object-cover"></mds-img>
      </mds-card-media>
      <mds-card-content>
        <mds-text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
          elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
          sed odio hendrerit diam maximus blandit ac malesuada odio.
        </mds-text>
      </mds-card-content>
      <mds-card-footer>
        <mds-button variant="dark" tone="text">
          Cancel
        </mds-button>
        <mds-button>Contact</mds-button>
      </mds-card-footer>
    </mds-card>
    <mds-dropdown
      target="action-example"
      class="max-w-[350px] p-200 gap-100"
      backdrop
    >
      <mds-button variant="dark" tone="text" class="justify-start">
        Modifica account
      </mds-button>
      <mds-button variant="dark" tone="text" class="justify-start">
        Elimina
      </mds-button>
      <mds-button variant="dark" tone="text" class="justify-start">
        Esci dalla sessione
      </mds-button>
    </mds-dropdown>
  </div>
)

const CustomSlotsTemplate = args => (
  <div>
    <mds-card {...args}>
      <div
        slot="header"
        class="flex gap-400 items-center justify-between px-400 py-400"
      >
        <div class="flex gap-400 items-center min-w-0">
          <mds-avatar
            class="w-1100 min-w-1100 shrink-0"
            initials="mc"
          ></mds-avatar>
          <div class="flex gap-0 flex-col grow min-w-0">
            <mds-text typography="h6" truncate="word">
              Mario Coletta
            </mds-text>
            <mds-text typography="caption" truncate="word">
              Management designer
            </mds-text>
          </div>
        </div>
        <mds-button
          id="action-example"
          icon="mi/round/more-vert"
          variant="dark"
          tone="text"
        ></mds-button>
      </div>
      <mds-img src={URLs[0]} slot="media" class="object-cover"></mds-img>
      <mds-text slot="content" class="px-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
        elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
        sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-text>
      <div slot="footer" class="px-400 py-400 text-right">
        <mds-button variant="dark">Contact</mds-button>
      </div>
    </mds-card>
    <mds-dropdown
      target="action-example"
      class="max-w-[350px] p-200 gap-100"
      backdrop
    >
      <mds-button variant="dark" tone="text" class="justify-start">
        Modifica account
      </mds-button>
      <mds-button variant="dark" tone="text" class="justify-start">
        Elimina
      </mds-button>
      <mds-button variant="dark" tone="text" class="justify-start">
        Esci dalla sessione
      </mds-button>
    </mds-dropdown>
  </div>
)

const LayoutHMCFTemplate = args => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center min-w-0">
        <mds-avatar
          class="w-1100 min-w-1100 shrink-0"
          initials="mc"
        ></mds-avatar>
        <div class="flex gap-0 flex-col grow min-w-0">
          <mds-text typography="h6" truncate="word">
            Mario Coletta
          </mds-text>
          <mds-text typography="caption" truncate="word">
            Management designer
          </mds-text>
        </div>
      </div>
      <mds-button
        icon="mi/round/more-vert"
        variant="dark"
        tone="text"
      ></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
        elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
        sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
)

const LayoutHMCTemplate = args => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center min-w-0">
        <mds-avatar
          class="w-1100 min-w-1100 shrink-0"
          initials="mc"
        ></mds-avatar>
        <div class="flex gap-0 flex-col grow min-w-0">
          <mds-text typography="h6" truncate="word">
            Mario Coletta
          </mds-text>
          <mds-text typography="caption" truncate="word">
            Management designer
          </mds-text>
        </div>
      </div>
      <mds-button
        icon="mi/round/more-vert"
        variant="dark"
        tone="text"
      ></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
        elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
        sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
  </mds-card>
)

const LayoutHMFTemplate = args => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center min-w-0">
        <mds-avatar
          class="w-1100 min-w-1100 shrink-0"
          initials="mc"
        ></mds-avatar>
        <div class="flex gap-0 flex-col grow min-w-0">
          <mds-text typography="h6" truncate="word">
            Mario Coletta
          </mds-text>
          <mds-text typography="caption" truncate="word">
            Management designer
          </mds-text>
        </div>
      </div>
      <mds-button
        icon="mi/round/more-vert"
        variant="dark"
        tone="text"
      ></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
)

const LayoutHCFTemplate = args => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center min-w-0">
        <mds-avatar
          class="w-1100 min-w-1100 shrink-0"
          initials="mc"
        ></mds-avatar>
        <div class="flex gap-0 flex-col grow min-w-0">
          <mds-text typography="h6" truncate="word">
            Mario Coletta
          </mds-text>
          <mds-text typography="caption" truncate="word">
            Management designer
          </mds-text>
        </div>
      </div>
      <mds-button
        icon="mi/round/more-vert"
        variant="dark"
        tone="text"
      ></mds-button>
    </mds-card-header>
    <mds-card-content class="py-0">
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
        elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
        sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
)

const LayoutMCFTemplate = args => (
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
        elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
        sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
    <mds-card-footer class="pt-0">
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
)

const LayoutHCTemplate = args => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button
        icon="mi/round/more-vert"
        variant="dark"
        tone="text"
      ></mds-button>
    </mds-card-header>
    <mds-card-content class="pt-0">
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
        elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
        sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
  </mds-card>
)

const LayoutMCTemplate = args => (
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
        elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
        sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
  </mds-card>
)

const LayoutMFTemplate = args => (
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
)

const LayoutHMTemplate = args => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button
        icon="mi/round/more-vert"
        variant="dark"
        tone="text"
      ></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
  </mds-card>
)

const LayoutCFTemplate = args => (
  <mds-card {...args}>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
        elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
        sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
    <mds-card-footer class="pt-0">
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
)

const LayoutHFTemplate = args => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button
        icon="mi/round/more-vert"
        variant="dark"
        tone="text"
      ></mds-button>
    </mds-card-header>
    <mds-card-footer class="pt-0">
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
)

const LayoutMTemplate = args => (
  <mds-card {...args}>
    <mds-card-media>
      <mds-img src={URLs[0]} class="object-cover"></mds-img>
    </mds-card-media>
  </mds-card>
)

const LayoutHTemplate = args => (
  <mds-card {...args}>
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials="mc"></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">Mauro Coletta</mds-text>
          <mds-text typography="caption">Management designer</mds-text>
        </div>
      </div>
      <mds-button
        icon="mi/round/more-vert"
        variant="dark"
        tone="text"
      ></mds-button>
    </mds-card-header>
  </mds-card>
)

const LayoutCTemplate = args => (
  <mds-card {...args}>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
        elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
        sed odio hendrerit diam maximus blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
  </mds-card>
)

const LayoutFTemplate = args => (
  <mds-card {...args}>
    <mds-card-footer>
      <mds-button variant="dark" tone="text">
        Cancel
      </mds-button>
      <mds-button>Contact</mds-button>
    </mds-card-footer>
  </mds-card>
)

export const Default = {
  render: FullCardTemplate,
}

export const FullCardCustomSlots = {
  render: CustomSlotsTemplate,

  args: {
    'auto-grid': false,
  },
}

export const LayoutHeaderMediaContentFooter = {
  render: LayoutHMCFTemplate,
}

export const LayoutHeaderMediaContent = {
  render: LayoutHMCTemplate,
}

export const LayoutHeaderMediaFooter = {
  render: LayoutHMFTemplate,
}

export const LayoutHeaderContentFooter = {
  render: LayoutHCFTemplate,
}

export const LayoutHeaderContent = {
  render: LayoutHCTemplate,
}

export const LayoutHeaderMedia = {
  render: LayoutHMTemplate,
}

export const LayoutHeaderFooter = {
  render: LayoutHFTemplate,
}

export const LayoutMediaContentFooter = {
  render: LayoutMCFTemplate,
}

export const LayoutMediaContent = {
  render: LayoutMCTemplate,
}

export const LayoutMediaFooter = {
  render: LayoutMFTemplate,
}

export const LayoutContentFooter = {
  render: LayoutCFTemplate,
}

export const LayoutHeader = {
  render: LayoutHTemplate,
}

export const LayoutMedia = {
  render: LayoutMTemplate,
}

export const LayoutContent = {
  render: LayoutCTemplate,
}

export const LayoutFooter = {
  render: LayoutFTemplate,
}
