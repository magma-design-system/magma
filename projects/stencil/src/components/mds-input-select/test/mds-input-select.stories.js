import React from 'react'
import MdsInputSelect from '@component/mds-input-select/mds-input-select'
import { citiesDictionary } from '@fixture/cities'
import faker from 'faker'

const cities = {}
citiesDictionary.map((element, index) => { cities[index] = element } )

export default {
  title: 'Form / Select',
  component: MdsInputSelect,
  argTypes: {

  },
}

const Template = args =>
  <mds-input-select {...args} options={JSON.stringify(cities)}/>

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Select an item...',
}
