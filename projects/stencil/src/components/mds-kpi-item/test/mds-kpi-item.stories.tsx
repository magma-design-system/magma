import { h } from '@stencil/core'
import { iconsDictionary, mggIconsDictionary, svgIconsDictionary } from '@dictionary/icon'

export default {
  title: 'UI / KPI / KPI Item',
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Specifies the description under the value in the KPI element',
    },
    label: {
      type: { name: 'string' },
      description: 'Specifies the number to be displayed in the KPI element',
    },
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon or a base64 string to render it as an svg',
      options: mggIconsDictionary.concat(iconsDictionary).concat(svgIconsDictionary),
      control: { type: 'select' },
    },
    threshold: {
      type: { name: 'number' },
      description: 'Specifies the number to be displayed in the KPI element',
    },
  },
}

const Template = args =>
  <mds-kpi>
    <mds-kpi-item {...args}></mds-kpi-item>
  </mds-kpi>

export const Default = Template.bind({})
Default.args = {
  label: '400',
  icon: 'mi/baseline/description',
  description: 'Employees in 2021',
}
