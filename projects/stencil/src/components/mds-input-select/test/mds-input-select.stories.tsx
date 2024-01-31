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
  <mds-input-select {...args}>
    <option value="1">First contact</option>
    <option value="2">Second impact</option>
    <option value="3">The Third Man</option>
    <option value="4">The Fourth Emendament</option>
  </mds-input-select>

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Seleziona un film...',
}
