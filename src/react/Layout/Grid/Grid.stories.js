import React from 'react'
import faker from 'faker'

import Grid from './Grid'
faker.locale = 'it'

export default {
  title: 'Layout/Grid',
  component: Grid,
}

let paragraph1 = faker.lorem.paragraph()
let paragraph2 = faker.lorem.paragraph()

export const gutterLarge = () =>
  <Grid gutter="large">
    <p className="text-sans text-sans--paragraph">{paragraph1}</p>
    <p className="text-sans text-sans--paragraph">{paragraph2}</p>
  </Grid>

export const gutterNormal = () =>
  <Grid>
    <p className="text-sans text-sans--paragraph">{paragraph1}</p>
    <p className="text-sans text-sans--paragraph">{paragraph2}</p>
  </Grid>

export const gutterSmall = () =>
  <Grid gutter="small">
    <p className="text-sans text-sans--paragraph">{paragraph1}</p>
    <p className="text-sans text-sans--paragraph">{paragraph2}</p>
  </Grid>

export const gutterXSmall = () =>
  <Grid gutter="xsmall">
    <p className="text-sans text-sans--paragraph">{paragraph1}</p>
    <p className="text-sans text-sans--paragraph">{paragraph2}</p>
  </Grid>

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
