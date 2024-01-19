import { typographyDictionary, typographyVariationsDictionary } from '@dictionary/typography'
import { h } from '@stencil/core'
import { useState } from 'react'
import { tagsDictionary, textAnimateDictionary } from '../meta/dictionary'
import { truncateDictionary } from '@dictionary/text'

export default {
  title: 'Design / Typography',
  argTypes: {
    animation: {
      control: { type: 'select' },
      description: 'Specifies if the text is animated when it is rendered',
      options: textAnimateDictionary,
    },
    tag: {
      control: { type: 'select' },
      description: 'Specifies the HTML tag of the element',
      options: tagsDictionary,
    },
    text: {
      type: { name: 'string' },
      description: 'Specifies the text string to the component instead of passing an HTML node',
    },
    truncate: {
      control: { type: 'select' },
      description: 'Specifies if the text shoud be truncated or should behave as a normal text',
      options: truncateDictionary,
    },
    typography: {
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographyDictionary,
    },
    variant: {
      control: { type: 'select' },
      description: 'Specifies the variant for `typography`',
      options: typographyVariationsDictionary,
    },
  },
}
const Template = args =>
  <mds-text {...args}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent dictum nec eros vitae dictum. Nunc lobortis pharetra lectus. Mauris egestas velit et mattis molestie. Sed risus purus, laoreet a massa in, tincidunt iaculis sem. Nam congue, ipsum viverra condimentum dignissim, mauris mi lacinia tortor, eu sodales magna augue a dui.</mds-text>

const AnimateTemplate = () => {

  const [text, setText] = useState('Choose a song...')

  const setValue = (event: Event): void|undefined => {
    const selectEl = event.target as HTMLSelectElement
    setText(selectEl.value)
  }

  return <div class="grid gap-400">
    <div class="bg-tone-neutral-09 p-600 rounded-lg">
      <mds-text animation="yugop" text={ text }></mds-text>
    </div>
    <div>
      <select onChange={(e: Event) => setValue(e)}>
        <option value="U2">Choose a song...</option>
        <option value="One">One</option>
        <option value="Zoo Station">Zoo Station</option>
        <option value="With or Without You">With or Without You</option>
        <option value="Where The Streets Have No Name">Where The Streets Have No Name</option>
      </select>
    </div>
  </div>
}

export const Default = Template.bind({})

export const Animation = AnimateTemplate.bind({})

export const Text = Template.bind({})
Text.args = {
  text: 'This is a text string passed by text attribute',
}

export const Truncate = Template.bind({})
Truncate.args = {
  truncate: 'word',
}

export const VariantTitleAction = Template.bind({})
VariantTitleAction.args = {
  typography: 'action',
}

export const VariantTitleH1 = Template.bind({})
VariantTitleH1.args = {
  typography: 'h1',
}

export const VariantTitleH2 = Template.bind({})
VariantTitleH2.args = {
  typography: 'h2',
}

export const VariantTitleH3 = Template.bind({})
VariantTitleH3.args = {
  typography: 'h3',
}

export const VariantTitleH4 = Template.bind({})
VariantTitleH4.args = {
  typography: 'h4',
}

export const VariantTitleH5 = Template.bind({})
VariantTitleH5.args = {
  typography: 'h5',
}

export const VariantTitleH6 = Template.bind({})
VariantTitleH6.args = {
  typography: 'h6',
}

export const VariantInfoCaption = Template.bind({})
VariantInfoCaption.args = {
  typography: 'caption',
}

export const VariantInfoDetail = Template.bind({})
VariantInfoDetail.args = {
  typography: 'detail',
}

export const VariantInfoLabel = Template.bind({})
VariantInfoLabel.args = {
  typography: 'label',
}

export const VariantInfoOption = Template.bind({})
VariantInfoOption.args = {
  typography: 'option',
}

export const VariantInfoParagraph = Template.bind({})
VariantInfoParagraph.args = {
  typography: 'paragraph',
}

export const VariantInfoTip = Template.bind({})
VariantInfoTip.args = {
  typography: 'tip',
}

export const VariantReadCaption = Template.bind({})
VariantReadCaption.args = {
  typography: 'caption',
  variant: 'read',
}

export const VariantReadDetail = Template.bind({})
VariantReadDetail.args = {
  typography: 'detail',
  variant: 'read',
}

export const VariantReadParagraph = Template.bind({})
VariantReadParagraph.args = {
  typography: 'paragraph',
  variant: 'read',
}

export const VariantCodeSnippet = Template.bind({})
VariantCodeSnippet.args = {
  tag: 'div',
  typography: 'snippet',
}

export const VariantCodeHack = Template.bind({})
VariantCodeHack.args = {
  tag: 'div',
  typography: 'hack',
}
