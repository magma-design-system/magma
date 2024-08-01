import { h } from '@stencil/core'

export default {
  title: 'Form / Range',
  argTypes: {
    min: {
      type: { name: 'number', required: true },
      description: 'The lowest value in the range of permitted values',
    },
    max: {
      type: { name: 'number', required: true },
      description: 'The greatest value in the range of permitted values',
    },
    step: {
      type: { name: 'number', required: true },
      description: 'The step attribute is a number that specifies the granularity that the value must adhere to, or the special value any, which is described below',
    },
    value: {
      type: { name: 'number', required: true },
      description: 'The value attribute contains a number which contains a representation of the selected number',
    },
  },
}

const Template = args =>
  <mds-input-range {...args}>
    Range label
  </mds-input-range>

const hideHeaderCss = `
  mds-input-range::part(header) {
    display: none;
  }
`

const HideHeaderTemplate = args =>
  <div>
    <style>{hideHeaderCss}</style>
    <mds-input-range {...args}>
      This shouldn't be visible
    </mds-input-range>
  </div>


export const Default = Template.bind({})

export const Min = Template.bind({})
Min.args = {
  min: -100,
}

export const Max = Template.bind({})
Max.args = {
  max: 200,
}

export const Step = Template.bind({})
Step.args = {
  step: 10,
}

export const Value = Template.bind({})
Value.args = {
  value: 90,
}

export const HideHeader = HideHeaderTemplate.bind({})
