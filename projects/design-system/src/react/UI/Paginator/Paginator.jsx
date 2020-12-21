import React from 'react'
import PropTypes from 'prop-types'
import './Paginator.scss'

// https://www.pinterest.it/pin/686236061950009783/?nic_v2=1a66Hjmz5

import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Icon from '@Design/Icon/Icon'

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
    {props.value}
  </div>

PaginatorLast.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
}

PaginatorLast.defaultProps = {
  className: '',
  value: 50,
}

const PaginatorPrev = props =>
  <div onClick={props.onClick} className={`paginator__item paginator__item--prev ${props.className}`}>
    <Icon name="paginator-previous"/>
  </div>

PaginatorPrev.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
}

PaginatorPrev.defaultProps = {
  className: '',
  onClick: () => {},
}

const PaginatorNext = props =>
  <div onClick={props.onClick} className={`paginator__item paginator__item--next ${props.className}`}>
    <Icon name="paginator-next"/>
  </div>

PaginatorNext.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
}

PaginatorNext.defaultProps = {
  className: '',
  onClick: () => {},
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
  <div onClick={props.onClick} className={`paginator__item ${props.className} ${props.isActive ? 'paginator__item--active' : ''}`}>
    { props.children }
  </div>

PaginatorItem.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
}

PaginatorItem.defaultProps = {
  className: '',
  isActive: false,
  onClick: () => {},
}

function getPageButton(props, number) {
  return <PaginatorItem onClick={() => props.onClick(number)}
    isActive={number === props.currentPage}>
    {number}
  </PaginatorItem>
}

function fewPages(props) {
  const pages = Array.from({ length: props.pages - 2 }, (_, i) => i + 1)
  return generatePaginator(props, pages.map(page => page + 1))
}

function firstOrLast(props) {
  const pages = [2, 3, 0, props.pages - 2, props.pages - 1]
  return generatePaginator(props, pages)
}

function third(props) {
  const pages = [2, 3, 4, 0, props.pages - 1]
  return generatePaginator(props, pages)
}

function lastThird(props) {
  const pages = [2, 0, props.pages - 3, props.pages - 2, props.pages - 1]
  return generatePaginator(props, pages)
}

function middle(props, currentPage) {
  const pages = [0, currentPage - 1, currentPage, currentPage + 1, 0]
  return generatePaginator(props, pages)
}

function generatePaginator(props, pages) {
  return pages.map(page => {
    if (page !== 0) {
      return getPageButton(props, page)
    }
    return <PaginatorSeparator/>
  })
}

function paginatorCore(props) {
  const { pages } = props
  const currentPage = props.currentPage > pages ? pages : props.currentPage

  if (pages < minPages) return fewPages(props)
  if (currentPage === 3) return third(props)
  if (currentPage === pages - 2) return lastThird(props)
  if (currentPage === 2 || currentPage === pages - 1 || currentPage === 1 || currentPage === pages) {
    return firstOrLast(props)
  }
  return middle(props, currentPage)
}

const minPages = 8

function Paginator(props) {
  if (props.pages === 1) return <div className="paginator"></div>

  return (
    <HorizontalScroll smooth={false} className={`paginator ${props.className}`}>
      { props.pages >= minPages ? <PaginatorPrev onClick={props.onClickPrev}/> : null}
      <div className="paginator__list">
        { getPageButton(props, 1)}
        { paginatorCore(props) }
        { getPageButton(props, props.pages) }
      </div>
      { props.pages >= minPages ? <PaginatorNext onClick={props.onClickNext}/> : null }
    </HorizontalScroll>
  )
}

Paginator.propTypes = {
  pages: PropTypes.number,
  className: PropTypes.string,
  currentPage: PropTypes.number,
  onClick: PropTypes.func,
  onClickPrev: PropTypes.func,
  onClickNext: PropTypes.func,
}

Paginator.defaultProps = {
  pages: 8,
  className: '',
  currentPage: 4,
  onClick: () => {},
  onClickPrev: () => {},
  onClickNext: () => {},
}

export default Paginator
export {
  PaginatorItem,
}
