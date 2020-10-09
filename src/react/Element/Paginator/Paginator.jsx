import React from 'react'
import PropTypes from 'prop-types'
import './Paginator.scss'

// https://www.pinterest.it/pin/686236061950009783/?nic_v2=1a66Hjmz5

import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Icon from '@Design/Icon/Icon'

const intermediateItems = 3

const PaginatorFirst = props =>
  <div className={`paginator__item paginator__item--first ${props.className}`}>
    1
  </div>

PaginatorFirst.propTypes = {
  className: PropTypes.string,
}

PaginatorFirst.defaultProps = {
  className: '',
}

const PaginatorLast = props =>
  <div className={`paginator__item paginator__item--last ${props.className}`}>
    100
  </div>

PaginatorLast.propTypes = {
  className: PropTypes.string,
}

PaginatorLast.defaultProps = {
  className: '',
}

const PaginatorPrev = props =>
  <div className={`paginator__item paginator__item--prev ${props.className}`}>
    <Icon name="paginator-previous"/>
  </div>

PaginatorPrev.propTypes = {
  className: PropTypes.string,
}

PaginatorPrev.defaultProps = {
  className: '',
}

const PaginatorNext = props =>
  <div className={`paginator__item paginator__item--next ${props.className}`}>
    <Icon name="paginator-next"/>
  </div>

PaginatorNext.propTypes = {
  className: PropTypes.string,
}

PaginatorNext.defaultProps = {
  className: '',
}

const PaginatorSeparator = props =>
  <div className={`paginator__item paginator__item--disabled ${props.className}`}>
    ...
  </div>

PaginatorSeparator.propTypes = {
  className: PropTypes.string,
}

PaginatorSeparator.defaultProps = {
  className: '',
}

const PaginatorItem = props =>
  <div className={`paginator__item ${props.className} ${props.isActive ? 'paginator__item--active' : ''}`}>
    { props.children }
  </div>

PaginatorItem.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
}

PaginatorItem.defaultProps = {
  className: '',
  isActive: false,
}

const Paginator = props =>
  <HorizontalScroll smooth={false} className={`paginator ${props.className}`}>
    <PaginatorPrev/>
    <div className="paginator__list">
      <PaginatorFirst/>
      <PaginatorItem>2</PaginatorItem>
      <PaginatorItem isActive>{intermediateItems}</PaginatorItem>
      <PaginatorSeparator/>
      <PaginatorItem>7</PaginatorItem>
      <PaginatorItem>8</PaginatorItem>
      <PaginatorItem>9</PaginatorItem>
      <PaginatorLast/>
    </div>
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
