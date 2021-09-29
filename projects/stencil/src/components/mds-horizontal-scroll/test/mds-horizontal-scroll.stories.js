import React from 'react'
import MdsHorizontalScroll from '@component/mds-horizontal-scroll/mds-horizontal-scroll'
import { snapDictionary } from '../meta/dictionary'

export default {
  title: 'Layout / Horizontal Scroll',
  component: MdsHorizontalScroll,
  argTypes: {
    snap: {
      type: { name: 'string', required: false },
      description: 'The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary',
      options: snapDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-horizontal-scroll {...args}>
    <mds-button><span slot="text">First blood</span></mds-button>
    <mds-button><span slot="text">Second impact</span></mds-button>
    <mds-button><span slot="text">The third reich</span></mds-button>
    <mds-button><span slot="text">Four rooms</span></mds-button>
    <mds-button><span slot="text">The fifth element</span></mds-button>
    <mds-button><span slot="text">The sixth sense</span></mds-button>
    <mds-button><span slot="text">Seven psychopaths</span></mds-button>
    <mds-button><span slot="text">The hateful eight</span></mds-button>
    <mds-button><span slot="text">The ninth gate</span></mds-button>
  </mds-horizontal-scroll>

export const Default = Template.bind({})

export const Snap = Template.bind({})
Snap.args = {
  snap: 'end',
}

export const tailwindStyled = Template.bind({})
tailwindStyled.args = {
  class: 'bg-adjust-tone-04 gap-4 p-4 snap-px-4',
}
