import React from 'react'
import faker from 'faker'

import Download from '@Content/Download/Download'
import Grid from '@Layout/Grid/Grid'

import './Download.stories.scss'

import data from './dictionary.json'

faker.locale = 'it'

export default {
  title: 'Content/Download',
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

export const cropName = () =>
  <Download fileName="A very very very long file name.svg" length="short"/>
