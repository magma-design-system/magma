import React from 'react'
import faker from 'faker'

import Download from '@Element/Download/Download'
import Grid from '@Layout/Grid/Grid'

import './Download.stories.scss'

import data from './dictionary.json'

faker.locale = 'it'

export default {
  title: 'Element/Download',
  component: Download,
}

const downloadDictionary = Object.entries(data.extension).map(([key, value]) =>
  <Download fileName={`${faker.system.commonFileName().split('.')[0]}.${key}`} key={key}/>,
)

export const basicUsage = () =>
  <Download fileName={faker.system.commonFileName()}/>

export const dictionary = () =>
  <Grid template="downloads">
    {downloadDictionary}
  </Grid>
