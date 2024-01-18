import { h } from '@stencil/core'

export default {
  title: 'UI / KPI / KPI Item',
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
      <div slot="icon" class="bg-label-sky-10 fill-label-sky-04 p-600 pb-300 w-full flex justify-center items-center">
        <mds-icon name="mi/baseline/groups" class="w-12"/>
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
