import React from 'react'
import PropTypes from 'prop-types'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'
import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import './Palette.scss'

import data from './PaletteData.scss'
const palettes = JSON.parse(data.palette.replace(/'/g, '').replace(/, ]/g, ']').toString())

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
            <div className={`sys-palette__preview ${palette.background}`}>
              <span className={`sys-palette__preview-dot background-color-${palette.name}`}></span>
            </div>
          </TableCell>
          <TableCell>
            <Grid gutter="none">
              <Row>
                <div className="sys-palette__preview-text">
                  Aa
                </div>
                <span>{palette.colorReverse}</span>
              </Row>
              <span>{palette.background}</span>
            </Grid>
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
