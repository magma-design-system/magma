import { typographyDictionary } from '@dictionary/typography'
import {
  themeFullVariantDictionary,
  toneSimpleVariantDictionary,
} from '@dictionary/variant'
import { h } from '@stencil/core'
import { truncateDictionary } from '@dictionary/text'

export default {
  title: 'UI / Label',
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description:
        'Enables the cross icon to perform cancel/delete action on element',
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
const Template = args => (
  <mds-label {...args}>Label con un testo piuttosto lungo</mds-label>
)

export const Default = {
  render: Template,
}

export const Truncate = {
  render: Template,

  args: {
    truncate: 'word',
    class: 'w-3200',
  },
}

export const Typography = {
  render: Template,

  args: {
    typography: 'label',
  },
}

export const OnClickClose = {
  render: Template,

  args: {
    deletable: true,
    // onClickClose: event => { console.info(event, 'hello') },
  },
}

export const TailwindRadius = {
  render: args => (
    <mds-label
      class="rounded-3xl bg-label-lime-09 text-label-lime-02"
      {...args}
    >
      Limone
    </mds-label>
  ),
}

export const TailwindColor = {
  render: args => (
    <mds-label class="bg-label-blue-09 text-label-blue-02" {...args}>
      Sale
    </mds-label>
  ),
}
