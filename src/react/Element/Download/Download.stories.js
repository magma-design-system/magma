import React from 'react'
import faker from 'faker'

import Download from '@Element/Download/Download'

faker.locale = 'it'

export default {
  title: 'Element/Download',
  component: Download,
}

export const basicUsage = () =>
  <Download fileName={faker.system.commonFileName()}/>
