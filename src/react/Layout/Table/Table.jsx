import React from 'react'
import PropTypes from 'prop-types'
import './Table.scss'

const TableCell = props =>
  <td className="table__cell">
    <div className="table__content">
      {props.children}
    </div>
  </td>

TableCell.propTypes = {
  align: PropTypes.string,
}

TableCell.defaultProps = {
  align: '',
}

const TableHeaderCell = props =>
  <th className="table__cell table__cell--header text-sans text-sans--h6">
    {props.children}
  </th>

const TableRow = props =>
  <tr className="table__row">
    {props.children}
  </tr>

const TableHeader = props =>
  <thead className="table__header">
    <tr className="table__row table__row--header">
      {props.children}
    </tr>
  </thead>

const TableBody = props =>
  <tbody className="table__body">
    {props.children}
  </tbody>

const Table = props =>
  <div className="table">
    <table className="table__element">
      {props.children}
    </table>
  </div>

Table.propTypes = {
  scrollable: PropTypes.bool,
}

Table.defaultProps = {
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
