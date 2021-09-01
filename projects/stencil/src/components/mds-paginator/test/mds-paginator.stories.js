import React from 'react'
import faker from 'faker'
import MdsPaginator from '@component/mds-paginator/mds-paginator'

export default {
  title: 'UI / Paginator',
  component: MdsPaginator,
  argTypes: {
    type: {
      type: { name: 'string', required: false },
      description: 'Defines if the list is ordered or unordered',
    },
  },
}
const Template = args =>
  <mds-paginator {...args}/>

export const Default = Template.bind({})
Default.args = {
  pages: 35,
}
