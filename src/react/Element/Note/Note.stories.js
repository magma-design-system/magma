import React from 'react'

import Note from '@Element/Note/Note'
import Grid from '@Layout/Grid/Grid'
import Caption from '@Typography/Caption/Caption'
import Detail from '@Typography/Detail/Detail'
import H5 from '@Typography/H5/H5'

import faker from 'faker'

export default {
  title: 'Element/Note',
  component: Note,
}

export const basicUsage = () =>
  <Grid columns="3">
    <Note>
      <H5>Note</H5>
      <Caption>{faker.lorem.paragraph()}</Caption>
    </Note>
  </Grid>

export const Dismissable = () =>
  <Grid columns="3">
    <Note dismiss={true}>
      <H5>Action complete</H5>
      <Caption>{faker.lorem.paragraph()}</Caption>
    </Note>
  </Grid>

export const Colors = () =>
  <Grid columns="3" fit={true}>
    <Note status="success">
      <H5>Success</H5>
      <Detail>{faker.lorem.paragraph()}</Detail>
    </Note>
    <Note status="info">
      <H5>Info</H5>
      <Detail>{faker.lorem.paragraph()}</Detail>
    </Note>
    <Note status="warning">
      <H5>Warning</H5>
      <Detail>{faker.lorem.paragraph()}</Detail>
    </Note>
    <Note status="error">
      <H5>Error</H5>
      <Detail>{faker.lorem.paragraph()}</Detail>
    </Note>
  </Grid>
