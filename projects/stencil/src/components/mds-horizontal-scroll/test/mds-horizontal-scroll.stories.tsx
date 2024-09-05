import { h } from '@stencil/core'
import { snapDictionary, viewportDictionary } from '../meta/dictionary'

export default {
  title: 'Layout / Horizontal Scroll',
  argTypes: {
    controls: {
      type: { name: 'string' },
      description: 'Specifies the viewport which will display navigation controls',
      options: viewportDictionary,
      control: { type: 'select' },
    },
    scrollbar: {
      description: 'Specifies if the scrollbar is visible or not',
      type: { name: 'boolean' },
    },
    snap: {
      type: { name: 'string' },
      description: 'Specifies the box’s snap position as an alignment of its snap area',
      options: snapDictionary,
      control: { type: 'select' },
    },
  },
}

const CardTemplate = () =>
  <mds-card class="min-w-[320px]">
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
      <mds-img src="https://placehold.co/600x400" class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus blandit ac malesuada odio.
    </mds-card-content>
  </mds-card>

const Template = args =>
  <mds-horizontal-scroll {...args}>
    <CardTemplate/>
    <CardTemplate/>
    <CardTemplate/>
    <CardTemplate/>
    <CardTemplate/>
    <CardTemplate/>
    <CardTemplate/>
    <CardTemplate/>
    <CardTemplate/>
    <CardTemplate/>
  </mds-horizontal-scroll>

export const Default = Template.bind({})

export const Snap = Template.bind({})
Snap.args = {
  snap: 'end',
}

export const Scrollbar = Template.bind({})
Scrollbar.args = {
  scrollbar: true,
}

export const TailwindStyled = Template.bind({})
TailwindStyled.args = {
  class: 'bg-tone-neutral-04 gap-400 p-400 snap-px-400',
}
