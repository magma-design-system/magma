import React from 'react'
import faker from 'faker'

import Tab, { TabItem } from '@UI/Tab/Tab'

faker.locale = 'it'

export default {
  title: 'UI/Tab',
  component: Tab,
}

export const basicUsage = () =>
  <Tab>
    <TabItem active>{faker.lorem.word()}</TabItem>
    <TabItem>{faker.lorem.word()}</TabItem>
    <TabItem>{faker.lorem.word()}</TabItem>
  </Tab>
