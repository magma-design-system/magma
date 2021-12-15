import React from 'react'
import MdsModal from '@component/mds-modal/mds-modal'

import { modalPositionDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Modal',
  component: MdsModal,
  argTypes: {
    opened: {
      description: 'Specifies if the modal is opened or not',
      type: { name: 'boolean', required: false },
    },
    position: {
      control: { type: 'select' },
      description: 'Specifies the animation position of the modal window',
      options: modalPositionDictionary,
      type: { name: 'string', required: false },
    }
  },
}

const firstName = 'Mario'
const lastName = 'Rossi'
const fullName = `${firstName} ${lastName}`
const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@nintendo.com`

const Template = args =>
  <mds-modal {...args}>
    <header slot="top" className="p-8 max-w-lg flex gap-4 items-center border-b border-adjust-tone-09">
      <mds-img class="w-16" src="/logo-gruppo-maggioli-512w.webp"/>
      <div className="text-adjust-tone-02">
        <mds-text typography="h5" class="truncate min-w-0">Maggioli Editore</mds-text>
        <mds-text typography="detail" class="truncate min-w-0">Menu di servizio</mds-text>
      </div>
    </header>
    <div className="p-8 max-w-lg">
      <mds-text>
        As a multi-brand design system, our components need to be flexible enough for any one of our brands to use them for multiple use cases. To achieve this, we ensure that all of the brands are involved in the specification stage, giving us more confidence that we’re future-proofing our components as more brands adopt NewsKit.
      </mds-text>
    </div>
    <footer slot="bottom" className="p-8 max-w-lg flex gap-4 text-adjust-tone-02 border-t border-adjust-tone-09">
      <mds-author>
        <mds-avatar slot="avatar" class="w-16 mobile:w-12" src="/avatar-01-200x200.jpeg"/>
        <mds-text typography="h6" class="truncate min-w-0">{ fullName }</mds-text>
        <mds-text typography="caption" class="text-adjust-tone-04 truncate min-w-0">{ email }</mds-text>
      </mds-author>
      <mds-button icon="menu-more" class="ml-auto bg-transparent text-adjust-tone-02 p-4 border border-adjust-tone-09 rounded-full"/>
    </footer>
  </mds-modal>

const CustomTemplate = args =>
  <mds-modal {...args}>
    <mds-banner slot="window" class="max-w-xl" deletable headline="Action required">
      <mds-text typography="detail">
        As a multi-brand design system, our components need to be flexible enough for any one of our brands to use them for multiple use cases. To achieve this, we ensure that all of the brands are involved in the specification stage, giving us more confidence that we’re future-proofing our components as more brands adopt NewsKit.
      </mds-text>
      <mds-button slot="actions" variant="primary" tone="quiet">Cancel</mds-button>
      <mds-button slot="actions" variant="primary">Confirm</mds-button>
    </mds-banner>
  </mds-modal>

export const Default = Template.bind({})
export const CustomWindow = CustomTemplate.bind({})
