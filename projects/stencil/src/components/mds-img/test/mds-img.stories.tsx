import { h } from '@stencil/core'
import { argTypes, aspectRatios, URLs } from '../meta/storybook'

export default {
  title: 'UI / Image',
  argTypes,
}

const Template = args =>
  <mds-img {...args}/>

export const Default = Template.bind({})
Default.args = {
  src: URLs[0],
}

export const altText = Template.bind({})
altText.args = {
  alt: 'This is an alternative text',
  src: URLs[0],
}

export const aspectRatio = Template.bind({})
aspectRatio.args = {
  'aspect-ratio': aspectRatios[5],
  src: URLs[2],
}
