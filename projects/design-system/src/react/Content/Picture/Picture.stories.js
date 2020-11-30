import React from 'react'
import faker from 'faker'

import Picture from '@Content/Picture/Picture'

faker.locale = 'it'

export default {
  title: 'Content/Picture',
  component: Picture,
}

export const defaultUsage = () =>
  <Picture src="//via.placeholder.com/800x400" sources={[
    { minWidth: 600, srcset: '//via.placeholder.com/1200x600' },
    { minWidth: 1000, srcset: '//via.placeholder.com/2000x800' },
  ]} />
