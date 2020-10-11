import React from 'react'
import faker from 'faker'

import InfoBar from '@Content/InfoBar/InfoBar'

faker.locale = 'it'

export default {
  title: 'Content/InfoBar',
  component: InfoBar,
}

export const basicUsage = () =>
  <InfoBar perc={faker.random.number(100)}>
    { faker.lorem.sentence() }
  </InfoBar>
