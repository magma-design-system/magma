import { h } from '@stencil/core'
import { lokiDisabled } from '@test/loki-disabled'
import { iconsDictionary, mggIconsDictionary } from '@dictionary/icon'
import { themeFullVariantAvatarDictionary, toneMinimalVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Avatar',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
    },
    initials: {
      type: { name: 'string' },
      description: 'The user\'s inizials displayed if there\'s no image available',
    },
    src: {
      type: { name: 'string' },
      description: 'The URL of the avatar image',
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the component',
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the component',
      options: themeFullVariantAvatarDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-avatar {...args} class="w-2400"/>

export const Default = Template.bind({})
Default.args = {
  src: './avatar-06-200x200.jpeg',
}

export const NoImage = Template.bind({})
NoImage.args = { }

export const Initials = Template.bind({})
Initials.args = {
  initials: 'ts',
}

export const Icon = Template.bind({})
Icon.args = {
  icon: 'mi/baseline/pets',
}

export const BrokenSrc = Template.bind({})
BrokenSrc.args = {
  src: 'http://broken-link',
}
BrokenSrc.story = lokiDisabled
