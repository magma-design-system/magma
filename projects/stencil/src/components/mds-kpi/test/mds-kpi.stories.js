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
      <div slot="icon" className="bg-label-sky-09 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
      <div slot="icon" className="bg-label-sky-09 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
      <div slot="icon" className="bg-label-sky-09 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
      <div slot="icon" className="bg-label-sky-09 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
      <div slot="icon" className="bg-label-sky-09 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="groups" class="text-5xl"/>
      </div>
    </mds-kpi-item>
  </mds-kpi>

const TemplateScroll = args =>
  <div>
    <div className="flex min-h-screen pb-8">
      <div className="bg-label-orchid-10 flex flex-grow p-4 flex-col items-center justify-center rounded-3xl text-center text-label-orchid-04">
        <div class="flex-grow flex flex-col items-center justify-center">
          <mds-text typography="detail">Scroll the page down to see text entrance effect.</mds-text>
          <mds-text typography="caption">(It will trigger once)</mds-text>
        </div>
        <div class="flex-grow flex ">
          <mds-icon name="arrow-circle-down" class="self-end animate-bounce"/>
        </div>
      </div>
    </div>
    <mds-kpi {...args}>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-10 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-10 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-10 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-10 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={ faker.datatype.number(999) } description={ faker.lorem.sentence(faker.datatype.number({ min: 1, max: 3 })) }>
        <div slot="icon" className="bg-label-sky-10 text-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="groups" class="text-5xl"/>
        </div>
      </mds-kpi-item>
    </mds-kpi>
  </div>

export const Default = Template.bind({})

export const ScrollEffect = TemplateScroll.bind({})
