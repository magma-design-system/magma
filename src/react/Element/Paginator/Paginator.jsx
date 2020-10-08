import React from 'react'
import PropTypes from 'prop-types'
import './Paginator.scss'

// https://www.pinterest.it/pin/686236061950009783/?nic_v2=1a66Hjmz5

import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Icon from '@Design/Icon/Icon'

const intermediateItems = 3

const PaginatorFirst = props =>
  <div className="paginator__item">
    1
  </div>

const PaginatorLast = props =>
  <div className="paginator__item">
    100
  </div>

const PaginatorPrev = props =>
  <div className="paginator__item">
    <Icon name="paginator-previous"/>
  </div>

const PaginatorNext = props =>
  <div className="paginator__item">
    <Icon name="paginator-next"/>
  </div>

const PaginatorSeparator = props =>
  <div className="paginator__item">
    ...
  </div>

const PaginatorItem = props =>
  <div className="paginator__item">
    <Icon name="next"/>
  </div>

const Paginator = props =>
  <HorizontalScroll className={`paginator ${props.className}`}>
    <PaginatorPrev/>
    <PaginatorFirst/>
    <PaginatorItem>1</PaginatorItem>
    <PaginatorItem>2</PaginatorItem>
    <PaginatorItem>{intermediateItems}</PaginatorItem>
    <PaginatorSeparator/>
    <PaginatorItem>7</PaginatorItem>
    <PaginatorItem>8</PaginatorItem>
    <PaginatorItem>9</PaginatorItem>
    <PaginatorLast/>
    <PaginatorNext/>
  </HorizontalScroll>

Paginator.propTypes = {
  pages: PropTypes.number,
  className: PropTypes.string,
}

Paginator.defaultProps = {
  pages: 100,
  className: '',
}

export default Paginator
export {
  PaginatorItem,
}
