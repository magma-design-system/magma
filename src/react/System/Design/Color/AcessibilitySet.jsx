import React from 'react'
import PropTypes from 'prop-types'
import ColorAccessibilityTest from './ColorAccessibilityTest'
import { TableRow, TableCell } from '@Layout/Table/Table'

const AcessibilitySet = props => {
  Object.entries(props.colors).map(([name, color]) => {
    return (
      <TableRow>
        <TableCell>Color</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Code</TableCell>
        <TableCell>Values</TableCell>
        <TableCell>Accessibility</TableCell>
      </TableRow>
    )
  })

  return (
    <TableRow>
      <TableCell>Color</TableCell>
      <TableCell>Name</TableCell>
      <TableCell>Code</TableCell>
      <TableCell>Values</TableCell>
      <TableCell><ColorAccessibilityTest color="#ffcc33"/></TableCell>
    </TableRow>
  )
}

AcessibilitySet.propTypes = {
  colors: PropTypes.object,
}

export default AcessibilitySet
