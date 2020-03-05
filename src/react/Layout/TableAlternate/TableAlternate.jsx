import React from 'react'
import PropTypes from 'prop-types'
import './TableAlternate.scss'

const TableAltCell = props =>
  <td className="table-alternate__cell">
    <div className="table-alternate__content">
      {props.children}
    </div>
  </td>

TableAltCell.propTypes = {
  align: PropTypes.string,
}

TableAltCell.defaultProps = {
  align: '',
}

const TableAltHeaderCell = props =>
  <th className="table-alternate__cell table-alternate__cell--header text-sans text-sans--h6">
    {props.children}
  </th>

const TableAltRow = props =>
  <tr className="table-alternate__row">
    {props.children}
  </tr>

const TableAltHeader = props =>
  <thead className="table-alternate__header">
    <tr className="table-alternate__row table-alternate__row--header">
      {props.children}
    </tr>
  </thead>

const TableAltBody = props =>
  <tbody className="table-alternate__body">
    {props.children}
  </tbody>

const TableAlternate = props =>
  <div className={`table-alternate ${props.interactive ? 'table-alternate--interactive' : ''}`}>
    <table className="table-alternate__element">
      {props.children}
    </table>
  </div>

TableAlternate.propTypes = {
  scrollable: PropTypes.bool,
  interactive: PropTypes.bool,
}

TableAlternate.defaultProps = {
  scrollable: true,
  interactive: false,
}

export default TableAlternate
export {
  TableAltBody,
  TableAltCell,
  TableAltHeader,
  TableAltHeaderCell,
  TableAltRow,
}
