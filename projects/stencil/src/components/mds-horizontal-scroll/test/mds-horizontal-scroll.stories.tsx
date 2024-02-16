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
  <div class="bg-tone-neutral rounded-lg shadow-sharp gap-0 grid min-w-8000 overflow-hidden">
    <mds-img src="https://placehold.co/600x400"></mds-img>
    <div class="grid gap-100 p-400">
      <mds-text typography="h5">This is a card title</mds-text>
      <mds-text truncate="all">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum dolores aut, qui omnis, quisquam totam neque, perspiciatis at enim blanditiis beatae. Modi, qui veritatis dignissimos totam corporis molestias distinctio numquam?</mds-text>
    </div>
  </div>

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
