import React from 'react'
import PropTypes from 'prop-types'
import './TableAlternate.scss'
import H6 from '@Typography/H6/H6'

const TableAltCell = props =>
  <td className={`table-alternate__cell ${props.className} ${props.grow ? 'table-alternate__cell--grow' : ''}`}>
    <div className="table-alternate__content">
      {props.children}
    </div>
  </td>

TableAltCell.propTypes = {
  className: PropTypes.string,
  grow: PropTypes.bool,
}

TableAltCell.defaultProps = {
  className: '',
  grow: false,
}

const TableAltHeaderCell = props =>
  <th className="table-alternate__cell table-alternate__cell--header">
    <H6>
      {props.children}
    </H6>
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
  <div className={`table-alternate ${props.interactive ? 'table-alternate--interactive' : ''} ${props.scrollable ? '' : 'table-alternate--no-scroll'} table-alternate--gain-${props.gain}`}>
    <table className="table-alternate__element">
      {props.children}
    </table>
  </div>

TableAlternate.propTypes = {
  className: PropTypes.string,
  gain: PropTypes.number,
  interactive: PropTypes.bool,
  scrollable: PropTypes.bool,
}

TableAlternate.defaultProps = {
  className: '',
  gain: 2,
  interactive: false,
  scrollable: true,
}

export default TableAlternate
export {
  TableAltBody,
  TableAltCell,
  TableAltHeader,
  TableAltHeaderCell,
  TableAltRow,
}
