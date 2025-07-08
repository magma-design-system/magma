import { h } from '@stencil/core'
import {
  snapDictionary,
  viewportDictionary,
  navigationDictionary,
} from '../meta/dictionary'

export default {
  title: 'Layout / Horizontal Scroll',
  argTypes: {
    controls: {
      type: { name: 'string' },
      description:
        'Specifies the viewport which will display navigation controls',
      options: viewportDictionary,
      control: { type: 'select' },
    },
    navigation: {
      description: 'Specifies if the scrollbar is visible or not',
      type: { name: 'string' },
      options: navigationDictionary,
      control: { type: 'select' },
    },
    snap: {
      type: { name: 'string' },
      description:
        'Specifies the box’s snap position as an alignment of its snap area',
      options: snapDictionary,
      control: { type: 'select' },
    },
  },
}

const CardTemplate = ({ title, initials }) => (
  <mds-card class="min-w-[320px]">
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials={initials}></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">{title}</mds-text>
          <mds-text typography="caption">This is an example card</mds-text>
        </div>
      </div>
      <mds-button
        id="action-example"
        icon="mi/round/more-vert"
        variant="light"
      ></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img
        src="https://placehold.co/600x400"
        class="object-cover"
      ></mds-img>
    </mds-card-media>
    <mds-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
      elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
      sed odio hendrerit diam maximus blandit ac malesuada odio.
    </mds-card-content>
  </mds-card>
)

const Template = args => (
  <div class="-m-600 -bg-tone-neutral-10 border-b-2 border-solid border-tone-neutral-09 border-x-0 border-t-0">
    <mds-horizontal-scroll {...args}>
      <CardTemplate initials="01" title="Card" />
      <CardTemplate initials="02" title="Card" />
      <CardTemplate initials="03" title="Card" />
      <CardTemplate initials="04" title="Card" />
      <CardTemplate initials="05" title="Card" />
      <CardTemplate initials="06" title="Card" />
      <CardTemplate initials="07" title="Card" />
      <CardTemplate initials="08" title="Card" />
      <CardTemplate initials="09" title="Card" />
      <CardTemplate initials="10" title="Card" />
    </mds-horizontal-scroll>
  </div>
)

export const Default = {
  render: Template,
}

export const Snap = {
  render: Template,

  args: {
    snap: 'end',
  },
}

export const Navigation = {
  render: Template,

  args: {
    navigation: 'navigation',
  },
}

export const TailwindStyled = {
  render: Template,

  args: {
    class: 'bg-tone-neutral-04 gap-400 p-400 snap-px-400',
  },
}
