import React from 'react'
import faker from 'faker'

import Card from '@Layout/Card/Card'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Code from '@UI/InlineCode/InlineCode'
import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import Flash from '@UI/Flash/Flash'
import Tag from '@UI/Tag/Tag'

import cosmetics from '+Tokens/css-tokens/cosmetics.json'
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
        <Card key={key} shadow={`box-shadow-${key}`}>
          <span>
            <Code>{`box-shadow-${key}`}</Code>
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
        <Card key={key} radius={`border-radius-${key}`}>
          <Row>
            <Code>{`border-radius-${key}`}</Code>
            {key === 'xxlarge' && <Tag chip className="background-color-status-warning-19 color-status-warning-05" icon="status-warning">Sconsigliato</Tag>}
          </Row>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Card>
      )
    })}
  </Grid>

export const interactive = () =>
  <Card interactive>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Card>
