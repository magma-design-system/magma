import React from 'react'
import faker from 'faker'
import MdsText from '../../../dist/collection/components/mds-text/mds-text'
import dictionary, { tags } from './defaults'

export default {
  title: 'Typography / Text',
  component: MdsText,
  argTypes: {
    tag: {
      description: 'Specifies the HTML tag of the element',
      options: tags,
      control: { type: 'select' }
    },
    type: {
      description: 'Specifies the typography of the element',
      options: Object.keys(dictionary),
      control: { type: 'select' }
    },
  },
}
const Template = (args) =>
  <mds-text {...args}>{faker.lorem.paragraph()}</mds-text>;

export const Default = Template.bind({});

export const H1 = Template.bind({});
H1.args = {
  type: 'h1',
};

