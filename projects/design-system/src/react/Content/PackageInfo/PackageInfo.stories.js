import React from 'react'
import faker from 'faker'

import PackageInfo from '@Content/PackageInfo/PackageInfo'

faker.locale = 'it'

export default {
  title: 'Content/PackageInfo',
  component: PackageInfo,
}

export const basicUsage = () =>
  <PackageInfo package={require('+Project/mgg-icons/package.json')}/>

export const fontIconsCLI = () =>
  <PackageInfo package={require('+Project/font-icons-cli/package.json')}/>

export const designSystem = () =>
  <PackageInfo package={require('+Project/design-system/package.json')}/>
