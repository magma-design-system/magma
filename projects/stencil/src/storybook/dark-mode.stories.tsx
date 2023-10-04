import clsx from 'clsx'
import { h } from '@stencil/core'

const darkModeDictionary = [
  'none',
  'dark-mode',
  'dark-mode-os',
]

export default {
  title: 'Miscellaneous',
  argTypes: {
    darkMode: {
      type: { name: 'string' },
      control: { type: 'select' },
      options: darkModeDictionary,
    },
  },
}

const Template = args => {
  const html = document.getElementsByTagName('html')[0]
  html.setAttribute('class', `hydrated ${args.darkMode}`)

  return <div class={clsx('grid gap-6 p-6 bg-tone-neutral transition-colors text-tone-neutral-03', args.darkMode)}>
    <div class="gap-2">
      <mds-text>To use Dark Mode, You just need to add <mds-text typography="snippet">dark-mode</mds-text> or <mds-text typography="snippet">dark-mode-os</mds-text> to your body.</mds-text>
      <mds-text>Selector <mds-text typography="snippet">dark-mode</mds-text> will simply set Dark Mode for colors.</mds-text>
      <mds-text>Selector <mds-text typography="snippet">dark-mode-os</mds-text> will set Dark Mode if your OS is set to Dark Mode and your browser supports it.</mds-text>
    </div>
    <div class="grid grid-cols-3 min-w-min">
      <div><mds-badge variant="dark" tone="strong">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="dark" tone="weak">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="dark" tone="quiet">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="light" tone="strong">Samoiedo</mds-badge></div>
      <div><mds-badge variant="light" tone="weak">Samoiedo</mds-badge></div>
      <div><mds-badge variant="light" tone="quiet">Samoiedo</mds-badge></div>
      <div><mds-badge variant="error" tone="strong">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="error" tone="weak">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="error" tone="quiet">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="amaranth" tone="strong">Samoiedo</mds-badge></div>
      <div><mds-badge variant="amaranth" tone="weak">Samoiedo</mds-badge></div>
      <div><mds-badge variant="amaranth" tone="quiet">Samoiedo</mds-badge></div>
      <div><mds-badge variant="orchid" tone="strong">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="orchid" tone="weak">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="orchid" tone="quiet">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="violet" tone="strong">Samoiedo</mds-badge></div>
      <div><mds-badge variant="violet" tone="weak">Samoiedo</mds-badge></div>
      <div><mds-badge variant="violet" tone="quiet">Samoiedo</mds-badge></div>
      <div><mds-badge variant="blue" tone="strong">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="blue" tone="weak">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="blue" tone="quiet">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="sky" tone="strong">Samoiedo</mds-badge></div>
      <div><mds-badge variant="sky" tone="weak">Samoiedo</mds-badge></div>
      <div><mds-badge variant="sky" tone="quiet">Samoiedo</mds-badge></div>
      <div><mds-badge variant="info" tone="strong">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="info" tone="weak">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="info" tone="quiet">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="aqua" tone="strong">Samoiedo</mds-badge></div>
      <div><mds-badge variant="aqua" tone="weak">Samoiedo</mds-badge></div>
      <div><mds-badge variant="aqua" tone="quiet">Samoiedo</mds-badge></div>
      <div><mds-badge variant="success" tone="strong">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="success" tone="weak">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="success" tone="quiet">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="green" tone="strong">Samoiedo</mds-badge></div>
      <div><mds-badge variant="green" tone="weak">Samoiedo</mds-badge></div>
      <div><mds-badge variant="green" tone="quiet">Samoiedo</mds-badge></div>
      <div><mds-badge variant="lime" tone="strong">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="lime" tone="weak">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="lime" tone="quiet">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="yellow" tone="strong">Samoiedo</mds-badge></div>
      <div><mds-badge variant="yellow" tone="weak">Samoiedo</mds-badge></div>
      <div><mds-badge variant="yellow" tone="quiet">Samoiedo</mds-badge></div>
      <div><mds-badge variant="warning" tone="strong">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="warning" tone="weak">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="warning" tone="quiet">Bovaro del Bernese</mds-badge></div>
      <div><mds-badge variant="orange" tone="strong">Samoiedo</mds-badge></div>
      <div><mds-badge variant="orange" tone="weak">Samoiedo</mds-badge></div>
      <div><mds-badge variant="orange" tone="quiet">Samoiedo</mds-badge></div>
    </div>
  </div>
}

export const DarkMode = Template.bind({})
DarkMode.args = {
  darkMode: 'color-mode--none',
}

