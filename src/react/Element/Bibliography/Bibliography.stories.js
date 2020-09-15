import React from 'react'
import faker from 'faker'

import Bibliography from '@Element/Bibliography/Bibliography'

faker.locale = 'it'

export default {
  title: 'Element/Bibliography',
  component: Bibliography,
}

export const defaultUsageAPA = () =>
  <Bibliography firstName="Giorgio" lastName="Moroder" date="2020-08-24" title="My name is Giovanni Giorgio, but everybody calls me Giorgio"/>
