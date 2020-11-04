import React from 'react'
import faker from 'faker'

import Card from '@Layout/Card/Card'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Code from '@UI/Code/Code'
import Grid from '@Layout/Grid/Grid'
import Flash from '@UI/Flash/Flash'

import cosmetics from '+Tokens/css-tokens/cosmetics.json'
const shadows = Object.keys(cosmetics['box-shadow'])

faker.locale = 'it'

export default {
  title: 'Layout/Card',
  component: Card,
}

export const gutterLarge = () =>
  <Grid gutter="xlarge">
    <Flash className="text-secondary text-secondary--paragraph">
      I componenti <Code className="background-color-status-info-16 color-status-info-04">Card</Code> funzionano esattamente come un componente <Code className="background-color-status-info-16 color-status-info-04">Grid</Code>, controllate quest'ulimo per consultarne le proprietà ereditate.
    </Flash>
    <Card>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </Card>
  </Grid>

export const shadowsList = () =>
  <Grid gutter="xlarge">
    {shadows.map(key => {
      return (
        <Card key={key} className={`box-shadow-${key}`}>
          <span>
            <Code>{`box-shadow-${key}`}</Code>
          </span>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Card>
      )
    })}
  </Grid>
