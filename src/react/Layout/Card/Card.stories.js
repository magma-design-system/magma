import React from 'react'
import faker from 'faker'

import Card from '@Layout/Card/Card'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Code from '@UI/InlineCode/InlineCode'
import Grid from '@Layout/Grid/Grid'
import Flash from '@UI/Flash/Flash'

import cosmetics from '+Tokens/css-tokens/cosmetics.json'
import sizes from '+Tokens/css-tokens/sizes.json'
const paddingSizes = Object.keys(sizes.size)
const shadows = Object.keys(cosmetics['box-shadow'])
const radius = Object.keys(cosmetics['border-radius'])

faker.locale = 'it'

export default {
  title: 'Layout/Card',
  component: Card,
}

export const gutterLarge = () =>
  <Grid gutter="xlarge">
    <Flash>
      I componenti <Code className="background-color-status-info-16 color-status-info-04">Card</Code> funzionano esattamente come un componente <Code className="background-color-status-info-16 color-status-info-04">Grid</Code>, controllate quest'ulimo per consultarne le proprietà ereditate.
    </Flash>
    <Card>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </Card>
  </Grid>

export const boxShadow = () =>
  <Grid gutter="xlarge">
    {shadows.map(key => {
      return (
        <Card key={key} boxShadow={`${key}`}>
          <span>
            <Code>{`${key}`}</Code>
          </span>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Card>
      )
    })}
  </Grid>

export const borderRadius = () =>
  <Grid gutter="xlarge">
    {radius.map(key => {
      return (
        <Card key={key} borderRadius={`${key}`}>
          <span>
            <Code>{`${key}`}</Code>
          </span>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Card>
      )
    })}
  </Grid>

export const padding = () =>
  <Grid gutter="xlarge">
    {paddingSizes.map(key => {
      return (
        <Card key={key} padding={`${key}`}>
          <span>
            <Code>{`${key}`}</Code>
          </span>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Card>
      )
    })}
  </Grid>

export const interactive = () =>
  <Card boxShadow="box--interactive">
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Card>
