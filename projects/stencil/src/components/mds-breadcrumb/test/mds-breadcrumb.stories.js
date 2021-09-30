import React from 'react'
import faker from 'faker'
import MdsBreadcrumb from '@component/mds-breadcrumb/mds-breadcrumb'


export default {
  title: 'UI / Breadcrumb',
  component: MdsBreadcrumb,
  argTypes: {},
}

const Template = args =>
  <mds-breadcrumb {...args}>
    <mds-breadcrumb-item>{ faker.lorem.word() }</mds-breadcrumb-item>
    <mds-breadcrumb-item>{ faker.lorem.words(2) }</mds-breadcrumb-item>
    <mds-breadcrumb-item>{ faker.lorem.word() }</mds-breadcrumb-item>
  </mds-breadcrumb>

export const Default = Template.bind({})

