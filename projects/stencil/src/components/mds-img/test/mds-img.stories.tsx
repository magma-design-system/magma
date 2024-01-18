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

export const AltText = Template.bind({})
AltText.args = {
  alt: 'This is an alternative text',
  src: URLs[0],
}

export const AspectRatio = Template.bind({})
AspectRatio.args = {
  'aspect-ratio': aspectRatios[5],
  src: URLs[2],
}
