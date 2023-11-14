import React from 'react'
import faker from 'faker'

import PackageInfo from '@Content/PackageInfo/PackageInfo'

faker.locale = 'it'

export default {
  title: 'Content/PackageInfo',
  component: PackageInfo,
}

export const basicUsage = () =>
  <PackageInfo packageData={require('../../../package.json')}/>
