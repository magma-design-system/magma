import React from 'react'
import faker from 'faker'

import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Button from '@Form/Button/Button'
faker.locale = 'it'

export default {
  title: 'Layout/HorizontalScroll',
  component: HorizontalScroll,
}

export const defaultUse = () =>
  <HorizontalScroll>
    <Button>{faker.lorem.word()}</Button>
    <Button>{faker.lorem.word()}</Button>
    <Button>{faker.lorem.word()}</Button>
    <Button>{faker.lorem.word()}</Button>
    <Button>{faker.lorem.word()}</Button>
  </HorizontalScroll>
