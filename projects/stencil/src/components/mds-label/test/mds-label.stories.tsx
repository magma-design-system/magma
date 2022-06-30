/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { typographyDictionary } from '@dictionary/typography'
import { themeFullVariantDictionary, toneSimpleVariantDictionary } from '@dictionary/variant'
import { h } from '@stencil/core'

export default {
  title: 'UI / Label',
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description: 'Enables the cross icon to perform cancel/delete action on element',
    },
    truncate: {
      type: { name: 'boolean' },
      description: 'Truncates text inside the tag or displays it in multiline if needed',
    },
    typography: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographyDictionary,
    },
    tone: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the tone of the color variant',
      options: toneSimpleVariantDictionary,
    },
    variant: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the theme variant colors',
      options: themeFullVariantDictionary,
    },
  },
}
const Template = args =>
  <mds-label {...args}>Label con un testo piuttosto lungo</mds-label>

export const Default = Template.bind({})

export const truncate = Template.bind({})
truncate.args = {
  truncate: false,
  class: 'w-32',
}

export const typography = Template.bind({})
typography.args = {
  typography: 'label',
}

export const onClickClose = Template.bind({})
onClickClose.args = {
  deletable: true,
  onClickClose: event => { console.log(event, 'hello') },
}

export const tailwindRadius = args =>
  <mds-label class="rounded-3xl bg-label-lime-09 text-label-lime-02" {...args}>Limone</mds-label>

export const tailwindColor = args =>
  <mds-label class="bg-label-blue-09 text-label-blue-02" {...args}>Sale</mds-label>

