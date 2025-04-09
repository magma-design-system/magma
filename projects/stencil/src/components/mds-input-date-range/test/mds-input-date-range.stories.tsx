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

const formatDate = (date = new Date()) => {
  // Format: YYYY-MM-DD
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getMonthBounds = (date = new Date()) => {
  // Primo giorno del mese
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)

  // Ultimo giorno del mese
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  return {
    startOfMonth: formatDate(firstDay),
    endOfMonth: formatDate(lastDay),
  }
}

const getWeekBounds = (date = new Date()) => {
  // Clona la data per non modificarla
  const currentDate = new Date(date)

  // Ottiene il giorno della settimana (0 = domenica, 1 = lunedì, ..., 6 = sabato)
  const day = currentDate.getDay()

  // Calcola differenza dal lunedì
  const diffToMonday = day === 0 ? -6 : 1 - day

  // Primo giorno (lunedì)
  const monday = new Date(currentDate)
  monday.setDate(currentDate.getDate() + diffToMonday)

  // Ultimo giorno (domenica)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  // Ritorna date pulite (solo anno-mese-giorno)
  return {
    startOfWeek: monday.toISOString().split('T')[0],
    endOfWeek: sunday.toISOString().split('T')[0],
  }
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

const TemplatePreselection = args => {
  const { startOfWeek, endOfWeek } = getWeekBounds()
  const { startOfMonth, endOfMonth } = getMonthBounds()
  return <div class="grid gap-400">
    <mds-input-date-range {...args}>
      <mds-input-date value={args['start-date']} slot="start"></mds-input-date>
      <mds-input-date value={args['end-date']} slot="end"></mds-input-date>
      <mds-input-date-range-preselection start={startOfWeek} end={endOfWeek}>Questa settimana</mds-input-date-range-preselection>
      <mds-input-date-range-preselection start={startOfMonth} end={endOfMonth}>Questo mese</mds-input-date-range-preselection>
    </mds-input-date-range>
  </div>
}

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
