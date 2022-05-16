// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ComponentStory } from '@storybook/react'
import MdsAvatar from '@component/mds-avatar/mds-avatar'
import { lokiDisabled } from '@test/loki-disabled'

export default {
  title: 'UI / Avatar',
  component: MdsAvatar,
  argTypes: {
    initials: {
      type: { name: 'string' },
      description: 'The user\'s inizials displayed if there\'s no image available',
    },
    src: {
      type: { name: 'string' },
      description: 'The URL of the avatar image',
    },
  },
}

const Template: ComponentStory<MdsAvatar> = args =>
  <div className="w-24">
    <mds-avatar {...args}/>
  </div>

export const Default = Template.bind({})
Default.args = {
  src: 'https://via.placeholder.com/1024x1024',
}

export const noImage = Template.bind({})
noImage.args = { }

export const initials = Template.bind({})
initials.args = {
  initials: 'ts',
}

export const brokenSrc = Template.bind({})
brokenSrc.args = {
  src: 'http://broken-link',
}
brokenSrc.story = lokiDisabled
