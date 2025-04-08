import { h } from '@stencil/core'

export default {
  title: 'Form / Input Date Range',
  argTypes: {
    delay: {
      type: { name: 'number' },
      description: 'Specifies the delay in milliseconds before closing the calendar dropdown',
    },
    'start-date': {
      type: { name: 'string' },
      description: 'Specifies the start date of the range',
    },
    'end-date': {
      type: { name: 'string' },
      description: 'Specifies the end date of the range',
    },
    min: {
      type: { name: 'string' },
      description: 'Specifies the min date of the range, user cannot set dates before this date',
    },
    max: {
      type: { name: 'string' },
      description: 'Specifies the max date of the range, user cannot set dates after this date',
    },
  },
}

const getDate = (offsetDays: number = 0): string => {
  const today = new Date()
  today.setDate(today.getDate() + offsetDays)

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
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
    <mds-input-date-range {...args}>
      <mds-input-date value={args['start-date']} slot="start"></mds-input-date>
      <mds-input-date value={args['end-date']} slot="end"></mds-input-date>
      <mds-input-date-range-preselection start="2025-04-07" end="2025-04-13">Questa settimana</mds-input-date-range-preselection>
      <mds-input-date-range-preselection start="2025-04-01" end="2025-04-30">Questo mese</mds-input-date-range-preselection>
    </mds-input-date-range>
  </div>

export const Default = Template.bind({})

export const InvalidDates = Template.bind({})
InvalidDates.args = {
  'start-date': getDate(-3),
  'end-date': getDate(4),
}

export const MinMax = TemplateMinMax.bind({})
MinMax.args = {
  'start-date': getDate(-3),
  'end-date': getDate(4),
  min: getDate(-30),
  max: getDate(30),
}

export const Preselection = TemplatePreselection.bind({})
