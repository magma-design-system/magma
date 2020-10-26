import React from 'react'
import faker from 'faker'

import Grid from '@Layout/Grid/Grid'
import Paragraph from '@Typography/Paragraph/Paragraph'

faker.locale = 'it'

export default {
  title: 'Layout/Grid',
  component: Grid,
}

const paragraph1 = faker.lorem.paragraph()
const paragraph2 = faker.lorem.paragraph()

export const defaultUsage = () =>
  <Grid>
    <Paragraph>{paragraph1}</Paragraph>
    <Paragraph>{paragraph2}</Paragraph>
  </Grid>

export const gutterXLarge = () =>
  <Grid gutter="xlarge">
    <Paragraph>{paragraph1}</Paragraph>
    <Paragraph>{paragraph2}</Paragraph>
  </Grid>

export const gutterLarge = () =>
  <Grid gutter="large">
    <Paragraph>{paragraph1}</Paragraph>
    <Paragraph>{paragraph2}</Paragraph>
  </Grid>

export const gutterSmall = () =>
  <Grid gutter="small">
    <Paragraph>{paragraph1}</Paragraph>
    <Paragraph>{paragraph2}</Paragraph>
  </Grid>

export const gutterXSmall = () =>
  <Grid gutter="xsmall">
    <Paragraph>{paragraph1}</Paragraph>
    <Paragraph>{paragraph2}</Paragraph>
  </Grid>

export const with2Columns = () =>
  <Grid columns="2">
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Grid>

export const with3Columns = () =>
  <Grid columns="3">
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Grid>

export const with4Columns = () =>
  <Grid columns="4">
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Grid>

export const autoFit = () =>
  <Grid template="auto-fit">
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Grid>

export const autoFill = () =>
  <Grid template="auto-fill">
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Grid>
