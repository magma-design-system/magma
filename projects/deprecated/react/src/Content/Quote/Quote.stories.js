import React from 'react'

import Quote from '@Content/Quote/Quote'

export default {
  title: 'Content/Quote',
  component: Quote,
}

export const basicUsage = () =>
  <Quote author="Fred Brooks">
    What one programmer can do in one month, two programmers can do in two months
  </Quote>
