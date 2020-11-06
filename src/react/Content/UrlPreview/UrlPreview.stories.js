import React from 'react'
import faker from 'faker'

import UrlPreview from '@Content/UrlPreview/UrlPreview'

faker.locale = 'it'

export default {
  title: 'Content/UrlPreview',
  component: UrlPreview,
}

export const basicUsage = () =>
  <UrlPreview active={true} url="https://stylable.io/"/>

export const wide = () =>
  <UrlPreview active={true} wide={true} url="https://stylable.io/"/>

export const centered = () =>
  <UrlPreview active={true} wide={true} centered={true} url="https://stylable.io/"/>

export const customShadow = () =>
  <UrlPreview active={true} wide={true} centered={true} shadow="box-shadow-strong" url="https://stylable.io/"/>
