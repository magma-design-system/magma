import { h } from '@stencil/core'
import { lokiDisabled } from '@test/loki-disabled'
import { iconsDictionary, mggIconsDictionary } from '@type/icon'
import { themeFullVariantAvatarDictionary } from '@type/variant'
import { toneMinimalVariantDictionary } from '@type/tone'

export default {
  title: 'UI / Avatar',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
    },
    initials: {
      type: { name: 'string' },
      description:
        'The user\'s inizials displayed if there\'s no image available',
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

const Template = args => <mds-avatar {...args} class="w-2400" />

const TemplateSmall = args => <mds-avatar {...args} class="w-600" />

export const Default = {
  render: Template,

  args: {
    src: './avatar-06-200x200.jpeg',
  },
}

export const NoImage = {
  render: Template,
  args: {},
}

export const Initials = {
  render: Template,

  args: {
    initials: 'ts',
  },
}

export const InitialsSmall = {
  render: TemplateSmall,

  args: {
    initials: 'ts',
  },
}

export const Icon = {
  render: Template,

  args: {
    icon: 'mi/baseline/pets',
  },
}

export const BrokenSrc = {
  render: Template,

  args: {
    src: 'http://broken-link',
  },

  story: lokiDisabled,
}
