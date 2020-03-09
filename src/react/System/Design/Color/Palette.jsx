import React from 'react'
import PropTypes from 'prop-types'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'
import './Palette.scss'

import data from './PaletteData.scss'
const palettes = JSON.parse(data.palette.replace(/'/g, '').replace(/, ]/g, ']').toString())

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
  <Table>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>CSS</TableHeaderCell>
      <TableHeaderCell>Accessibility</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {Object.entries(palettes).map(([name, palette], key) =>
        <TableRow key={key} className="sys-palette">
          <TableCell>
            {console.log(palette.background, palette.color)}
            <div className={`sys-palette__preview ${palette.background}`}>
              <span className={palette.colorReverse}>Aa</span>
            </div>
          </TableCell>
          <TableCell>
            <span>{palette.background}</span>
            <span>{palette.colorReverse}</span>
          </TableCell>
          <TableCell>
            Accessibility
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>

Palette.propTypes = {
  collection: PropTypes.object,
}

Palette.defaultProps = {
  collection: {},
}

export default Palette
