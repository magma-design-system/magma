import React from 'react'
import faker from 'faker'

import Note from './Note'
import Grid from '@Layout/Grid/Grid'
import Caption from '@Typography/Caption/Caption'
import H5 from '@Typography/H5/H5'

export default {
  title: 'Pattern/Note',
  component: Note,
}

export const basicUsage = () =>
  <Grid columns="3">
    <Note>
      <H5>Note</H5>
      <Caption></Caption>
    </Note>
  </Grid>

export const Dismissable = () =>
  <Grid columns="3">
    <Note dismiss={true}>
      <H5>Action complete</H5>
      <Caption></Caption>
    </Note>
  </Grid>

export const Colors = () =>
  <Grid columns="3" fit={true}>
    <Note variant="success">
      <H5>Success</H5>
      <Caption></Caption>
    </Note>
    <Note variant="warning">
      <H5>Warning</H5>
      <Caption></Caption>
    </Note>
    <Note variant="error">
      <H5>Error</H5>
      <Caption></Caption>
    </Note>
  </Grid>
