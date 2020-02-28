import React from 'react'

import BaseGrid from '@Layout/Grid/Grid'

const Grid = props =>
  <BaseGrid {...props} gutter="xsmall">
    {props.children}
  </BaseGrid>

export default Grid
