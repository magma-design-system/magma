import React, { Fragment } from 'react'
import faker from 'faker'
import MdsFlexTable from '@component/mds-flex-table/mds-flex-table'

export default {
  title: 'Layout / Table (Flex Table)',
  component: MdsFlexTable,
}

const Template = args =>
  <mds-flex-table {...args}>
    <mds-flex-table-header>
      <mds-flex-table-cell typography="action">{ faker.lorem.word() }</mds-flex-table-cell>
      <mds-flex-table-cell typography="action">{ faker.lorem.word() }</mds-flex-table-cell>
      <mds-flex-table-cell typography="action">{ faker.lorem.word() }</mds-flex-table-cell>
    </mds-flex-table-header>
    <mds-flex-table-body>
      <mds-flex-table-row>
        <mds-flex-table-cell>{ faker.lorem.sentence() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.lorem.sentence() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.lorem.paragraph() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell>{ faker.lorem.sentence() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.lorem.sentence() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.lorem.paragraph() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell>{ faker.lorem.sentence() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.lorem.sentence() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.lorem.paragraph() }</mds-flex-table-cell>
      </mds-flex-table-row>
    </mds-flex-table-body>
    <mds-flex-table-footer template="1fr">
      <mds-flex-table-cell typography="caption">{ faker.lorem.paragraph() }</mds-flex-table-cell>
    </mds-flex-table-footer>
  </mds-flex-table>

const TemplateManyItems = args =>
  <mds-flex-table {...args}>
    <mds-flex-table-header>
      <mds-flex-table-cell typography="action">Avatar</mds-flex-table-cell>
      <mds-flex-table-cell typography="action">Username</mds-flex-table-cell>
      <mds-flex-table-cell typography="action">Email</mds-flex-table-cell>
      <mds-flex-table-cell typography="action">Full name</mds-flex-table-cell>
    </mds-flex-table-header>
    <mds-flex-table-body>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
    </mds-flex-table-body>
    <mds-flex-table-footer template="1fr">
      <mds-flex-table-cell typography="caption">The grid table works with tabular data, no long text shoud be used.</mds-flex-table-cell>
    </mds-flex-table-footer>
  </mds-flex-table>

const TemplateManyItemsScroll = args =>
  <mds-flex-table {...args}>
    <mds-flex-table-header>
      <mds-flex-table-cell typography="action">Avatar</mds-flex-table-cell>
      <mds-flex-table-cell typography="action">Username</mds-flex-table-cell>
      <mds-flex-table-cell typography="action">Email</mds-flex-table-cell>
      <mds-flex-table-cell typography="action">Full name</mds-flex-table-cell>
    </mds-flex-table-header>
    <mds-flex-table-body class="max-h-96">
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials={faker.internet.userName()}/></mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.internet.userName() }</mds-flex-table-cell>
        <mds-flex-table-cell typography="hack">{ faker.internet.email() }</mds-flex-table-cell>
        <mds-flex-table-cell>{ faker.name.firstName() + ' ' + faker.name.firstName() }</mds-flex-table-cell>
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
