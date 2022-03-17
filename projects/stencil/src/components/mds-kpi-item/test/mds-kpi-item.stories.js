import React from 'react'
import MdsKpiItem from '@component/mds-kpi-item/mds-kpi-item'

export default {
  title: 'UI / KPI / KPI Item',
  component: MdsKpiItem,
  argTypes: {
    description: {
      type: { name: 'string', required: true },
      description: 'Specifies the description under the value in the KPI element',
    },
    value: {
      type: { name: 'number', required: true },
      description: 'Specifies the number to be displayed in the KPI element',
    },
  },
}

const Template = args =>
  <mds-kpi>
    <mds-kpi-item {...args}/>
  </mds-kpi>

const TemplateIcon = args =>
  <mds-kpi>
    <mds-kpi-item {...args}>
      <div slot="icon" className="bg-label-sky-10 text-label-sky-04 p-6 pb-0 w-full flex justify-center items-center">
        <mds-icon name="mi/baseline/groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
  </mds-kpi>

export const Default = Template.bind({})
Default.args = {
  value: 400,
  description: 'Employees in 2021',
}

export const Icon = TemplateIcon.bind({})
Icon.args = {
  value: 400,
  description: 'Employees in 2021',
}
