import { h } from '@stencil/core'

export default {
  title: 'UI / KPI',
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
    <mds-kpi-item value={75} description="Allenatori">
      <div slot="icon" class="bg-label-sky-09 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="mi/round/groups" class="w-12"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={123} description="Arbitri">
      <div slot="icon" class="bg-label-sky-09 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="mi/round/groups" class="w-12"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={48} description="Tifosi">
      <div slot="icon" class="bg-label-sky-09 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="mi/round/groups" class="w-12"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={188} description="Stadi">
      <div slot="icon" class="bg-label-sky-09 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="mi/round/groups" class="w-12"/>
      </div>
    </mds-kpi-item>
    <mds-kpi-item value={3} description="Giocatori">
      <div slot="icon" class="bg-label-sky-09 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
        <mds-icon name="mi/round/groups" class="w-12"/>
      </div>
    </mds-kpi-item>
  </mds-kpi>

const TemplateScroll = args =>
  <div>
    <div class="flex min-h-screen pb-8">
      <div class="bg-label-orchid-10 flex flex-grow p-4 flex-col items-center justify-center rounded-3xl text-center fill-label-orchid-04">
        <div class="flex-grow flex flex-col items-center justify-center">
          <mds-text typography="detail">Scroll the page down to see text entrance effect.</mds-text>
          <mds-text typography="caption">(It will trigger once)</mds-text>
        </div>
        <div class="flex-grow flex ">
          <mds-icon name="mi/round/arrow-circle-down" class="self-end animate-bounce"/>
        </div>
      </div>
    </div>
    <mds-kpi {...args}>
      <mds-kpi-item value={451} description="Progetti">
        <div slot="icon" class="bg-label-sky-10 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="mi/baseline/groups" class="w-12"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={385} description="Manager">
        <div slot="icon" class="bg-label-sky-10 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="mi/baseline/groups" class="w-12"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={196} description="Case">
        <div slot="icon" class="bg-label-sky-10 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="mi/baseline/groups" class="w-12"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={67} description="Automobili">
        <div slot="icon" class="bg-label-sky-10 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="mi/baseline/groups" class="w-12"/>
        </div>
      </mds-kpi-item>
      <mds-kpi-item value={22} description="Formaggi">
        <div slot="icon" class="bg-label-sky-10 fill-label-sky-04 p-6 pb-3 w-full flex justify-center items-center">
          <mds-icon name="mi/baseline/groups" class="w-12"/>
        </div>
      </mds-kpi-item>
    </mds-kpi>
  </div>

export const Default = Template.bind({})

export const ScrollEffect = TemplateScroll.bind({})
