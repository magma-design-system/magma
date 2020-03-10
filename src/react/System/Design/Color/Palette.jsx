import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'
import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import './Palette.scss'

import data from './PaletteData.scss'
const palettes = JSON.parse(data.palette.replace(/'/g, '').replace(/, ]/g, ']').toString())

const PaletteRow = props =>
  <TableRow className="sys-palette">
    <TableCell>
      <div className="sys-palette__preview">
        <div className={`sys-palette__base ${props.backgroundBase}`}></div>
        <div className={`sys-palette__variant ${props.background}`}></div>
      </div>
    </TableCell>
    <TableCell grow={true}>
      <Grid gutter="none">
        <Row>
          <div className={`sys-palette__text ${props.color}`}>
            Aa
          </div>
          <span className="text-mono text-mono--small">{props.color}</span>
        </Row>
        <Row>
          <div className={`sys-palette__dot ${props.background}`}></div>
          <span className="text-mono text-mono--small">{props.background}</span>
        </Row>
      </Grid>
    </TableCell>
    <TableCell>
      Accessibility
    </TableCell>
  </TableRow>

PaletteRow.propTypes = {
  backgroundBase: PropTypes.string,
  background: PropTypes.string,
  color: PropTypes.string,
}

PaletteRow.defaultProps = {
  backgroundBase: '',
  background: '',
  color: '',
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
        <Fragment key={key}>
          {Number(palette.id) === 0 &&
            <PaletteRow color={palette.colorBase} background={palette.backgroundBase} backgroundBase={palette.backgroundBase}/>
          }
          {Number(palette.id) > 0 && Number(palette.id) < Number(palette.totalNodes) &&
            <PaletteRow color={palette.color} background={palette.background} backgroundBase={palette.backgroundBase}/>
          }
        </Fragment>,
      )}
    </TableBody>
  </Table>

export default Palette
