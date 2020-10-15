import React from 'react'

import Usage, { UsageDo, UsageDont } from '@Content/Usage/Usage'

export default {
  title: 'Content/Usage',
  component: Usage,
}

export const basicUsage = () =>
  <Usage>
    <UsageDo>Do this</UsageDo>
    <UsageDont>Dont do this</UsageDont>
  </Usage>
