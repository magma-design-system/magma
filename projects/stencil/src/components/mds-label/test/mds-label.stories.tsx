import { typographyTooltipDictionary } from '@type/typography'
import { themeLabelVariantDictionary } from '@type/variant'
import { toneSimpleVariantDictionary } from '@type/tone'

import { h } from '@stencil/core'
import { truncateDictionary } from '@type/text'

export default {
  title: 'UI / Label',
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description:
        'Enables the cross icon to perform cancel/delete action on element',
    },
    label: {
      type: { name: 'string' },
      description: 'The label of the component',
    },
    truncate: {
      type: { name: 'string' },
      control: { type: 'select' },
      options: truncateDictionary,
      description:
        'Truncates text inside the tag or displays it in multiline if needed',
    },
    typography: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographyTooltipDictionary,
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
      options: themeLabelVariantDictionary,
    },
  },
}
const Template = args => (
  <mds-label {...args}></mds-label>
)

export const Default = {
  render: Template,
  args: {
    label: 'This is a text label',
  },
}

export const Truncate = {
  render: Template,

  args: {
    truncate: 'word',
    label: 'This is a very long text that should be truncated',
    class: 'w-3200',
  },
}

export const Typography = {
  render: Template,

  args: {
    typography: 'caption',
    label: 'This is a text label',
  },
}

export const OnClickClose = {
  render: Template,

  args: {
    deletable: true,
    label: 'This is a text label',
    // onClickClose: event => { console.info(event, 'hello') },
  },
}
