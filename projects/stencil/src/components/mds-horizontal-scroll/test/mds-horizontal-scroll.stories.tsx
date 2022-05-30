import { h } from '@stencil/core'
import { snapDictionary } from '../meta/dictionary'

export default {
  title: 'Layout / Horizontal Scroll',
  argTypes: {
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

const Template = args =>
  <mds-horizontal-scroll {...args}>
    <mds-button>First blood</mds-button>
    <mds-button>Second impact</mds-button>
    <mds-button>The third reich</mds-button>
    <mds-button>Four rooms</mds-button>
    <mds-button>The fifth element</mds-button>
    <mds-button>The sixth sense</mds-button>
    <mds-button>Seven psychopaths</mds-button>
    <mds-button>The hateful eight</mds-button>
    <mds-button>The ninth gate</mds-button>
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

export const tailwindStyled = Template.bind({})
tailwindStyled.args = {
  class: 'bg-adjust-tone-04 gap-4 p-4 snap-px-4',
}
