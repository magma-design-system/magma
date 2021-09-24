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

export const tailwindStyled = Template.bind({})
tailwindStyled.args = {
  class: 'bg-adjust-tone-04 gap-4 p-4 snap-px-4',
}
