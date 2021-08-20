import React from 'react'
import faker from 'faker'
import MdsBanner from '@component/mds-banner/mds-banner'

export default {
  title: 'UI / Banner',
  component: MdsBanner,
  argTypes: {
    deletable: {
      type: { name: 'boolean', required: false },
      description: 'Shows the cross icon to perform cancel/delete action on element',
    },
    headline: {
      type: { name: 'string', required: false },
      description: 'The title on the top of the banner',
    },
  },
}

const Template = args =>
  <mds-banner {...args}>
    { faker.lorem.paragraph() }
  </mds-banner>

const TemplateActions = args =>
  <mds-banner {...args}>
    { faker.lorem.paragraph() }
    <mds-button slot="actions">{ faker.hacker.verb() }</mds-button>
    <mds-button slot="actions">{ faker.hacker.verb() }</mds-button>
  </mds-banner>

export const Default = Template.bind({})

export const Headline = Template.bind({})
Headline.args = {
  headline: faker.animal.dog(),
}

export const Deletable = Template.bind({})
Deletable.args = {
  deletable: true,
}

export const Actions = TemplateActions.bind({})
