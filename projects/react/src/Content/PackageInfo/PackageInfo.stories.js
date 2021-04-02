import React from 'react'
import faker from 'faker'

import PackageInfo from '@Content/PackageInfo/PackageInfo'

faker.locale = 'it'

export default {
  title: 'Content/PackageInfo',
  component: PackageInfo,
}

export const basicUsage = () =>
  <PackageInfo packageData={require('+Project/icons/package.json')}/>

export const fontIconsCLI = () =>
  <PackageInfo packageData={require('+Project/font-icons-cli/package.json')}/>

export const designSystem = () =>
  <PackageInfo packageData={require('+Project/docs/package.json')}/>
