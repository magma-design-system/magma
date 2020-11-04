import React from 'react'
import faker from 'faker'
import randomIcon from '@Design/Icon/faker'

import Tag from '@UI/Tag/Tag'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Detail from '@Typography/Detail/Detail'

faker.locale = 'it'

export default {
  title: 'UI/Tag',
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

export const customIcon = () =>
  <Tag icon={randomIcon()} chip={true}>
    <Paragraph>{faker.lorem.word()}</Paragraph>
  </Tag>

export const customColors = () =>
  <Tag icon={randomIcon()} chip={true} iconClassName="color-status-warning-09" className="color-status-warning-04 background-color-status-warning-18">
    <Detail>{faker.lorem.word()}</Detail>
  </Tag>
