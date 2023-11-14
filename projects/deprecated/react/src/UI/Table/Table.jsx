import React from 'react'
import PropTypes from 'prop-types'
import './Table.scss'

import H6 from '@Typography/H6/H6'

const TableCell = props =>
  <td className={`Table__cell ${props.className} ${props.grow ? 'Table__cell--grow' : ''}`}>
    <div className="Table__content">
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
  <th className="Table__cell Table__cell--header">
    <H6>
      {props.children}
    </H6>
  </th>

const TableRow = props =>
  <tr className={`Table__row ${props.className}`}>
    {props.children}
  </tr>

TableRow.propTypes = {
  className: PropTypes.string,
}

TableRow.defaultProps = {
  className: '',
}

const TableHeader = props =>
  <thead className="Table__header">
    <tr className="Table__row Table__row--header">
      {props.children}
    </tr>
  </thead>

const TableBody = props =>
  <tbody className={`Table__body ${props.className}`}>
    {props.children}
  </tbody>

TableBody.propTypes = {
  className: PropTypes.string,
}

TableBody.defaultProps = {
  className: '',
}

const Table = props =>
  <div className={`Table ${props.className} ${props.theme ? 'Table--theme-alternate' : ''} ${props.interactive ? 'Table--interactive' : ''}`}>
    <table className="Table__element">
      {props.children}
    </table>
  </div>

Table.propTypes = {
  className: PropTypes.string,
  interactive: PropTypes.bool,
  theme: PropTypes.string,
}

Table.defaultProps = {
  className: '',
  interactive: false,
}

export default Table
export {
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
}
