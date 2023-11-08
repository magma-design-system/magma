import React from 'react'
import faker from 'faker'

import ChecklistItem from '@UI/ChecklistItem/ChecklistItem'

export default {
  title: 'UI/ChecklistItem',
  component: ChecklistItem,
}

export const basicUsage = () =>
  <ChecklistItem>{faker.lorem.sentences()}</ChecklistItem>

export const checked = () =>
  <ChecklistItem checked>{faker.lorem.sentences()}</ChecklistItem>
