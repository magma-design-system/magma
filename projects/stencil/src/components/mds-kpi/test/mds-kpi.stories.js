import React from 'react'
import MdsKpiItem from '@component/mds-kpi-item/mds-kpi-item'
import faker from 'faker'

export default {
  title: 'UI / KPI',
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
  <mds-kpi {...args}>
    <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
      <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
      <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
      <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
      <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
      <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
  </mds-kpi>

const TemplateScroll = args =>
  <div>
    <div className="bg-label-orchid-20 flex flex-col items-center justify-center min-h-screen my-4 rounded-3xl text-center text-label-orchid-08">
      <mds-text typography="detail">Scroll the page down to see text entrance effect.</mds-text>
      <mds-text typography="caption">(It will trigger once)</mds-text>
    </div>
    <mds-kpi {...args}>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-19 text-label-sky-08 p-6 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
    </mds-kpi>
  </div>

export const Default = Template.bind({})

export const ScrollEffect = TemplateScroll.bind({})
