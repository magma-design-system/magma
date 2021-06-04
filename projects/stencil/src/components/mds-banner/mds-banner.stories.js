import React from 'react'
import faker from 'faker'
import MdsBanner from '../../../dist/collection/components/mds-banner/mds-banner'

export default {
  title: 'MdsBanner',
  component: MdsBanner,
  argTypes: {
    variant: {
      type: 'text',
      description: 'You need it to choose the color variant of the component'
    },
  },
};

const defaultArgs = {
  variant: 'cino',
}

const text = faker.lorem.paragraph()

const Template = args => {
  return <div>
    <div className="text-mono-hack">
      <mds-banner {...args}>{text}</mds-banner>
    </div>
    <hr></hr>
    <div className="text-mono text-mono--hack">
      <mds-banner {...args}>{text}</mds-banner>
    </div>
  </div>
}

export const Default = Template.bind({})
Default.args = { ...defaultArgs }
