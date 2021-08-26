import React from 'react'
import MdsAuthor from '@component/mds-author/mds-author'
import faker from 'faker'

export default {
  title: 'UI / Author',
  component: MdsAuthor,
  argTypes: {
    initials: {
      type: { name: 'string', required: false },
      description: 'The user\'s inizials displayed if there\'s no image available',
    },
    src: {
      type: { name: 'string', required: false },
      description: 'The URL of the avatar image',
    },
  },
}



const Template = args =>
  <mds-author {...args} class="text-adjust-tone-08">
    <mds-avatar initials="jd" slot="avatar" class="w-20 bg-brand-maggioli-12"/>
    <mds-text typography="h6" class="text-adjust-tone-04">{ `${faker.name.firstName()} ${faker.name.lastName()}` }</mds-text>
    <mds-text typography="caption">{ faker.name.jobTitle() }</mds-text>
    <mds-text typography="caption">{ faker.name.jobArea() }</mds-text>
  </mds-author>

export const Default = Template.bind({})
Default.args = {
  src: 'https://via.placeholder.com/256x256',
}
