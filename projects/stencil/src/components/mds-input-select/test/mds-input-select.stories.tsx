import { citiesDictionary } from '@fixture/cities'
import { autoCompleteDictionary } from '@dictionary/autocomplete'
import { h } from '@stencil/core'

const cities = {}
citiesDictionary.map((element, index) => { cities[index] = element } )

export default {
  title: 'Form / Select',
  argTypes: {
    autocomplete: {
      description: 'Specifies whether the element should have autocomplete enabled',
      options: autoCompleteDictionary,
      control: { type: 'select' },
    },
    autofocus: {
      type: { name: 'boolean' },
      description: 'Specifies that the element should automatically get focus when the page loads',
    },
    placeholder: {
      type: { name: 'string' },
      description: 'Specifies a short hint that describes the expected value of the element',
    },
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
