import React from 'react'
import faker from 'faker'

import Download from '@UI/Download/Download'
import Grid from '@Layout/Grid/Grid'

import './Download.stories.scss'

import data from './dictionary.json'

faker.locale = 'it'

export default {
  title: 'UI/Download',
  component: Download,
}

const downloadDictionary = Object.entries(data.extension).map(([key]) =>
  <Download fileName={`${faker.system.commonFileName().split('.')[0]}.${key}`} key={key}/>,
)

export const basicUsage = () =>
  <Download fileName={faker.system.commonFileName()}/>

export const previewImage = () =>
  <Download fileName="logo-gruppo-maggioli-bordered.svg" href={require('#Assets/brand/gruppo-maggioli/logo-gruppo-maggioli-bordered.svg')} preview/>

export const transparencyGrid = () =>
  <Download fileName="logo-gruppo-maggioli-bordered.svg" href={require('#Assets/brand/gruppo-maggioli/logo-gruppo-maggioli-bordered.svg')} preview transparencyGrid/>

export const dictionary = () =>
  <Grid template="downloads">
    {downloadDictionary}
  </Grid>

export const name = () =>
  <Download fileName="A very very very long file name.svg" name="short"/>
