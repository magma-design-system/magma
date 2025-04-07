import { h } from '@stencil/core'

export default {
  title: 'Form / Input Date Range',
  argTypes: {},
}

const Template = args =>
  <mds-input-date-range {...args}>
    <mds-input-date value={args['start-date']} slot="start"></mds-input-date>
    <mds-input-date value={args['end-date']} slot="end"></mds-input-date>
  </mds-input-date-range>

const TemplateMinMax = args =>
  <div class="grid gap-400">
    <mds-input-date-range {...args}>
      <mds-input-date value={args['start-date']} slot="start"></mds-input-date>
      <mds-input-date value={args['end-date']} slot="end"></mds-input-date>
    </mds-input-date-range>
    <div class="inline-flex gap-400">
      <mds-text>Min date {args.min}</mds-text>
      <mds-text>Max date {args.max}</mds-text>
    </div>
  </div>

const TemplatePreselection = args =>
  <div class="grid gap-400">
    <mds-input-date-range {...args} preselection="startDate endDate Label, date Label">
      <mds-input-date value={args['start-date']} slot="start"></mds-input-date>
      <mds-input-date value={args['end-date']} slot="end"></mds-input-date>
      <mds-input-date-range-preselection start="2025-04-04" end="2025-04-09">Pippo</mds-input-date-range-preselection>
      <mds-input-date-range-preselection start="2025-05-10" end="2025-06-10">Pluto</mds-input-date-range-preselection>

    </mds-input-date-range>
    {/* <div class="inline-flex gap-400">
      <mds-text>Min date {args.min}</mds-text>
      <mds-text>Max date {args.max}</mds-text>
    </div> */}
  </div>

export const Default = Template.bind({})


export const InvalidDates = Template.bind({})
InvalidDates.args = {
  'start-date': '2025-04-31',
  'end-date': '2025-12-32',
}

export const MinMax = TemplateMinMax.bind({})
MinMax.args = {
  'start-date': '2025-03-19',
  'end-date': '2025-03-21',
  min: '2025-03-15',
  max: '2025-03-27',
}

export const Preselection = TemplatePreselection.bind({})
// Preselection.args = {
//   'start-date': '2025-03-19',
//   'end-date': '2025-03-21',
//   min: '2025-03-15',
//   max: '2025-03-27',
// }


