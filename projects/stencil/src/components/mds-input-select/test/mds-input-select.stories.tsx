import { citiesDictionary } from '@fixture/cities'
import { h } from '@stencil/core'

const cities = {}
citiesDictionary.map((element, index) => { cities[index] = element } )

export default {
  title: 'Form / Select',
  argTypes: {

  },
}

const Template = args =>
  <mds-input-select {...args} options={JSON.stringify(cities)}/>

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Select an item...',
}
