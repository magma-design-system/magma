import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'
import ColorAccessibilityTest from './ColorAccessibilityTest'
import { TableRow, TableCell } from '@Layout/Table/Table'

import './AccessibilitySet.scss'

const paragraph = faker.lorem.paragraph()

const AccessibilitySet = props =>
  <Fragment>
    {
      Object.entries(props.colors).map(([name, color], key) =>
        <TableRow key={key} className="sys-accessibility-set">
          <TableCell><div className={`sys-accessibility-set__dot background-color-${name}`}></div></TableCell>
          <TableCell className="sys-accessibility-set__name"><b>{name.split('-')[1]}</b></TableCell>
          <TableCell className={`sys-accessibility-set__example text-sans text-sans--caption color-${name}`}>{paragraph}</TableCell>
          <TableCell><ColorAccessibilityTest color={color}/></TableCell>
        </TableRow>,
      )
    }
  </Fragment>

AccessibilitySet.propTypes = {
  colors: PropTypes.object,
}

export default AccessibilitySet
