import React from 'react'
import PropTypes from 'prop-types'
import Table, { TableBody, TableRow, TableCell } from '@Layout/Table/Table'
import './Palette.scss'

import data from './PaletteData.scss'
const palette = JSON.parse(data.palette.replace(/'/g, '').replace(/, ]/g, ']').toString())

console.log(palette)

const PalettePreview = () =>
  <div>
    <div className="sys-palette__preview">
      Aa
    </div>
  </div>

PalettePreview.propTypes = {
  collection: PropTypes.object,
}

PalettePreview.defaultProps = {
  collection: {},
}

const Palette = props =>
  <Table className="sys-palette">
    <TableBody>
      {
        Object.entries(palette).map(([name, backgroundSelector, colorSelector, color], key) =>
          <TableRow key={key} className="sys-palette__row">
            <TableCell><PalettePreview name={name} backgroundSelector={backgroundSelector} colorSelector={colorSelector} color={color}/></TableCell>
          </TableRow>,
        )
      }
    </TableBody>
  </Table>

Palette.propTypes = {
  collection: PropTypes.object,
}

Palette.defaultProps = {
  collection: {},
}

export default Palette
