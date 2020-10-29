import React from 'react'
import faker from 'faker'

import Row from '@Layout/Row/Row'
import Button from '@Form/Button/Button'
faker.locale = 'it'

export default {
  title: 'Layout/Row',
  component: Row,
}

const word1 = faker.lorem.word()
const word2 = faker.lorem.word()

export const gutterXLarge = () =>
  <Row gutter="xlarge">
    <Button>{word1}</Button>
    <Button>{word2}</Button>
  </Row>

export const gutterLarge = () =>
  <Row gutter="large">
    <Button>{word1}</Button>
    <Button>{word2}</Button>
  </Row>

export const gutterNormal = () =>
  <Row>
    <Button>{word1}</Button>
    <Button>{word2}</Button>
  </Row>

export const gutterSmall = () =>
  <Row gutter="small">
    <Button>{word1}</Button>
    <Button>{word2}</Button>
  </Row>

export const gutterXSmall = () =>
  <Row gutter="xsmall">
    <Button>{word1}</Button>
    <Button>{word2}</Button>
  </Row>

export const lastToRight = () =>
  <Row gutter="xsmall" lastToRight={true}>
    <Button>{word1}</Button>
    <Button>{word2}</Button>
  </Row>
