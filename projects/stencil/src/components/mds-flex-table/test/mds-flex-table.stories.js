import React, { Fragment } from 'react'
import faker from 'faker'
import MdsFlexTable from '@component/mds-flex-table/mds-flex-table'

export default {
  title: 'Layout / Table (Flex)',
  component: MdsFlexTable,
  argTypes: {
    interactive: {
      description: 'Specifies if the table row are higlighted on mouseover event',
      type: { name: 'boolean' },
    },
    template: {
      description: 'Specifies the template for flex children elements',
      type: { name: 'string' },
    },
  }
}

const Template = args =>
  <mds-flex-table {...args}>
    <mds-flex-table-header>
      <mds-flex-table-cell><mds-text typography="action">{ faker.lorem.word() }</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">{ faker.lorem.word() }</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">{ faker.lorem.word() }</mds-text></mds-flex-table-cell>
    </mds-flex-table-header>
    <mds-flex-table-body>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-text>{ faker.lorem.sentence() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.lorem.sentence() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.lorem.paragraph() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-text>{ faker.lorem.sentence() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.lorem.sentence() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.lorem.paragraph() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-text>{ faker.lorem.sentence() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.lorem.sentence() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.lorem.paragraph() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
    </mds-flex-table-body>
    <mds-flex-table-footer template="1fr">
      <mds-flex-table-cell><mds-text typography="action">{ faker.lorem.paragraph() }</mds-text></mds-flex-table-cell>
    </mds-flex-table-footer>
  </mds-flex-table>

const TemplateManyItems = args =>
  <mds-flex-table {...args}>
    <mds-flex-table-header>
      <mds-flex-table-cell><mds-text typography="action">Avatar</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Username</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Email</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Full name</mds-text></mds-flex-table-cell>
    </mds-flex-table-header>
    <mds-flex-table-body>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
    </mds-flex-table-body>
    <mds-flex-table-footer template="1fr">
      <mds-flex-table-cell typography="caption">The grid table works with tabular data, no long text shoud be used.</mds-flex-table-cell>
    </mds-flex-table-footer>
  </mds-flex-table>

const TemplateManyItemsScroll = args =>
  <mds-flex-table {...args}>
    <mds-flex-table-header>
      <mds-flex-table-cell><mds-text typography="action">Avatar</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Username</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Email</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Full name</mds-text></mds-flex-table-cell>
    </mds-flex-table-header>
    <mds-flex-table-body class="max-h-96">
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.internet.userName() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">{ faker.internet.email() }</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
    </mds-flex-table-body>
    <mds-flex-table-footer template="1fr">
      <mds-flex-table-cell typography="caption">The grid table works with tabular data, no long text shoud be used.</mds-flex-table-cell>
    </mds-flex-table-footer>
  </mds-flex-table>

export const Default = Template.bind({})
Default.args = {
  template: '1 1 1',
}

export const tabularContents = TemplateManyItems.bind({})
tabularContents.args = {
  template: '1 1 1 1',
}

export const scrollContents = TemplateManyItemsScroll.bind({})
scrollContents.args = {
  template: '1 1 1 1',
}
