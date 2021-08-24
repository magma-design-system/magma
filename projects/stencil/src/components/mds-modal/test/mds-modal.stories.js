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
const Template = args =>
  <div>
    <mds-button>Open mobile window</mds-button>
    <mds-modal {...args}>
      <mds-banner slot="window" class="max-w-xl" deletable headline="Action required">
        { faker.lorem.paragraph() }
        <mds-button slot="actions" variant={args.variant} tone="weak">{ faker.hacker.verb() }</mds-button>
        <mds-button slot="actions" variant={args.variant}>{ faker.hacker.verb() }</mds-button>
      </mds-banner>
    </mds-modal>
  </div>

export const Default = Template.bind({})
