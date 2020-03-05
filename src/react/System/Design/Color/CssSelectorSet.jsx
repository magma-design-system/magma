import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { TableRow, TableCell } from '@Layout/Table/Table'

import './AccessibilitySet.scss'

const AccessibilitySet = props =>
  <Fragment>
    {
      Object.entries(props.colors).map(([name, color], key) =>
        <TableRow key={key} className="accessibility-set">
          <TableCell><div className={`accessibility-set__dot background-color-${name}`}></div></TableCell>
          <TableCell className="accessibility-set__name"><b>{name.split('-')[1]}</b></TableCell>
          <TableCell>
            <div className="accessibility-set__codes grid">
              <input className="accessibility-set__code text-mono text-mono--small" onFocus={event => event.target.setSelectionRange(0, event.target.value.length)} spellcheck="false" type="text" value={`background-color-${name}`} readonly/>
              <input className="accessibility-set__code text-mono text-mono--small" onFocus={event => event.target.setSelectionRange(0, event.target.value.length)} spellcheck="false" type="text" value={`color-${name}`} readonly/>
            </div>
          </TableCell>
          <TableCell className="text-sans text-sans--caption">{color}</TableCell>
        </TableRow>,
      )
    }
  </Fragment>

AccessibilitySet.propTypes = {
  colors: PropTypes.object,
}

export default AccessibilitySet
