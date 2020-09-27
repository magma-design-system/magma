import React from 'react'
import PropTypes from 'prop-types'
import './Table.scss'

import H6 from '@Typography/H6/H6'

const TableCell = props =>
  <td className={`table__cell ${props.className} ${props.grow ? 'table__cell--grow' : ''}`}>
    <div className="table__content">
      {props.children}
    </div>
  </td>

TableCell.propTypes = {
  className: PropTypes.string,
  grow: PropTypes.bool,
}

TableCell.defaultProps = {
  className: '',
  grow: false,
}

const TableHeaderCell = props =>
  <th className="table__cell table__cell--header">
    <H6>
      {props.children}
    </H6>
  </th>

const TableRow = props =>
  <tr className={`table__row ${props.className}`}>
    {props.children}
  </tr>

TableRow.propTypes = {
  className: PropTypes.string,
}

TableRow.defaultProps = {
  className: '',
}

const TableHeader = props =>
  <thead className="table__header">
    <tr className="table__row table__row--header">
      {props.children}
    </tr>
  </thead>

const TableBody = props =>
  <tbody className={`table__body ${props.className}`}>
    {props.children}
  </tbody>

TableBody.propTypes = {
  className: PropTypes.string,
}

TableBody.defaultProps = {
  className: '',
}

const Table = props =>
  <div className={`table ${props.className} ${props.interactive ? 'table--interactive' : ''} ${props.scrollable ? '' : 'table--no-scroll'} table--gain-${props.gain}`}>
    <table className="table__element">
      {props.children}
    </table>
  </div>

Table.propTypes = {
  className: PropTypes.string,
  gain: PropTypes.number,
  interactive: PropTypes.bool,
  scrollable: PropTypes.bool,
}

Table.defaultProps = {
  className: '',
  gain: 1,
  interactive: false,
  scrollable: true,
}

export default Table
export {
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
}
