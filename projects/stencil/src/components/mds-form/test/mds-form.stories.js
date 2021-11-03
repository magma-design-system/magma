import React from 'react'
import MdsForm from '@component/mds-form/mds-form'

export default {
  title: 'Form / Form',
  component: MdsForm,
  argTypes: {
    name: {
      type: { name: 'string', required: false },
      description: 'Truncates text inside the label or displays it in multiline if needed',
    },
  },
}

const Template = args =>
  <mds-form {...args} class="gap-4">
    <mds-text>Hello form</mds-text>
    <mds-input placeholder="Full name"/>
    <button type="submit">Submittalo</button>
  </mds-form>

export const Default = Template.bind({})
Default.args = {
  name: 'pinello',
  onSubmit: (e) => { console.log(e) },
}
