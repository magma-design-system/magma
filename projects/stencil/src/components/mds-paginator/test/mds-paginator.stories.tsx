import { h } from '@stencil/core'
import { lokiDisabled } from '@test/loki-disabled'

export default {
  title: 'UI / Paginator',
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

currentPage.story = lokiDisabled
