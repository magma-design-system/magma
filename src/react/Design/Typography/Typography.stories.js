// import React, { Fragment } from 'react'
import faker from 'faker'

import Grid from '@Layout/Grid/Grid'
import H1 from './H1/H1'
import H2 from './H2/H2'
import H3 from './H3/H3'
import H4 from './H4/H4'
import H5 from './H5/H5'
import H6 from './H6/H6'
import Paragraph from './Paragraph/Paragraph'
import Caption from './Caption/Caption'

faker.locale = 'it'

export default {
  title: 'Design/Typography',
  component: Paragraph,
}

export const basicUsage = () =>
  <Grid>
    <H1>H1 - {faker.lorem.sentence()}</H1>
    <H2>H2 - {faker.lorem.sentence()}</H2>
    <H3>H3 - {faker.lorem.sentence()}</H3>
    <H4>H4 - {faker.lorem.sentence()}</H4>
    <H5>H5 - {faker.lorem.sentences()}</H5>
    <H6>H6 - {faker.lorem.paragraph()}</H6>
    <Paragraph>Paragraph - {faker.lorem.paragraphs()}</Paragraph>
    <Caption>Caption - {faker.lorem.paragraphs()}</Caption>
  </Grid>
