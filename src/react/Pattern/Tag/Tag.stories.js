import React from 'react'
import faker from 'faker'

import Tag from '@Pattern/Tag/Tag'
import Paragraph from '@Typography/Paragraph/Paragraph'

faker.locale = 'it'

export default {
  title: 'Pattern/Tag',
  component: Tag,
}

export const basicUsage = () =>
  <Tag>
    <Paragraph>{faker.lorem.word()}</Paragraph>
  </Tag>

export const Colors = () =>
  <Tag iconClassName="color-status-success-09">
    <Paragraph>{faker.lorem.word()}</Paragraph>
  </Tag>

export const chipTag = () =>
  <Tag chip={true}>
    <Paragraph>{faker.lorem.word()}</Paragraph>
  </Tag>
