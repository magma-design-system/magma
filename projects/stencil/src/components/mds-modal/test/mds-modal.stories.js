import React from 'react'
import faker from 'faker'
import MdsModal from '@component/mds-modal/mds-modal'

export default {
  title: 'UI / Modal',
  component: MdsModal,
  argTypes: {
    opened: {
      type: { name: 'boolean', required: false },
      description: 'Specifies if the modal is opened or not',
    },
  },
}

const buttonA = faker.hacker.verb()
const buttonB = faker.hacker.verb()
const text = faker.lorem.paragraphs(3)
const header = faker.lorem.sentence(3)

const Template = args =>
  <mds-modal {...args}>
    <header slot="header" class="p-4">
      <mds-text typography="h5">{ header }</mds-text>
    </header>
    <div slot="body">
      <mds-text>
        { text }
      </mds-text>
    </div>
    <footer slot="footer">
      <mds-button variant={args.variant} tone="weak">{ buttonA }</mds-button>
      <mds-button variant={args.variant} tone="weak">{ buttonB }</mds-button>
    </footer>
  </mds-modal>

const CustomTemplate = args =>
  <mds-modal {...args}>
    <mds-banner slot="window" class="max-w-xl" deletable headline="Action required">
      { text }
      <mds-button slot="actions" variant={args.variant} tone="weak">{ buttonA }</mds-button>
      <mds-button slot="actions" variant={args.variant}>{ buttonB }</mds-button>
    </mds-banner>
  </mds-modal>

export const Default = Template.bind({})
export const CustomWindow = CustomTemplate.bind({})
