import React from 'react'
import faker from 'faker'
import markdown from './Grid.md'

import Grid from './Grid'
faker.locale = 'it'

export default {
  title: 'Layout/Grid',
  component: Grid,
}

export const basicUsage = () =>
  <Grid>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
  </Grid>

basicUsage.story = {
  parameters: {
    notes: { markdown },
  },
}

export const with2Columns = () =>
  <Grid columns="2">
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
  </Grid>

export const with3Columns = () =>
  <Grid columns="3">
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
  </Grid>

export const with4Columns = () =>
  <Grid columns="4">
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
    <p className="text-sans text-sans--paragraph">{faker.lorem.paragraph()}</p>
  </Grid>
