import React from 'react'
import MdsAvatar from '@component/mds-avatar/mds-avatar'

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

const Template = args =>
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
  initials: 'mg',
}

export const brokenSrc = Template.bind({})
brokenSrc.args = {
  src: 'http://broken-link',
}
brokenSrc.story = {
  parameters: {
    loki: { skip: true },
  },
}

// https://github.com/oblador/loki/blob/master/docs/flaky-tests.md
console.log(brokenSrc.loki)
