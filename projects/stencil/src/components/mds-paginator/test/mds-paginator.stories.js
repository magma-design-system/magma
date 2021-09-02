import React from 'react'
import faker from 'faker'
import MdsPaginator from '@component/mds-paginator/mds-paginator'

export default {
  title: 'UI / Paginator',
  component: MdsPaginator,
  argTypes: {
    pages: {
      type: { name: 'number', required: false },
      description: 'Specifies the number of total pages to be handled',
    },
    'current-page': {
      type: { name: 'number', required: false },
      description: 'Specifies the current page selected in the paginator',
    },
  },
}
const Template = args =>
  <mds-paginator {...args}/>

export const Default = Template.bind({})
Default.args = {
  pages: 32,
}

export const currentPage = Template.bind({})
currentPage.args = {
  'current-page': 16,
  pages: 32,
}
