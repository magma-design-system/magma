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

function Paginator(props) {
  const minPages = 8
  const pages = Array.from({ length: props.pages }, (_, i) => i + 1)
  const currentPage = props.currentPage > props.pages ? props.pages : props.currentPage

  if (props.pages === 1) {
    return <div></div>
  }

  return (
    <HorizontalScroll smooth={false} className={`paginator ${props.className}`}>
      { props.pages >= minPages ? <PaginatorPrev onClick={props.onClickPrev}/> : null}
      <div className="paginator__list">
        <PaginatorItem onClick={() => props.onClick(1)} isActive={currentPage === 1}>
          1
        </PaginatorItem>
        { props.pages < minPages
          ? pages.map(page => {
            if (page > 1 && page < props.pages) {
              return <PaginatorItem key={page} onClick={() => props.onClick(page)}
                isActive={page === currentPage}>
                {page}
              </PaginatorItem>
            }
            return null
          })
          : pages.map(page => {
            if (page === 1 || page === props.pages) {
              return null
            }

            if (currentPage < 3 || currentPage > props.pages - 2) {
              if (page < 4 || page > props.pages - 3) {
                return <PaginatorItem key={page} onClick={() => props.onClick(page)}
                  isActive={page === currentPage}>
                  {page}
                </PaginatorItem>
              } else if (page === 4) {
                return <PaginatorSeparator key={page}/>
              }
            } else {
              if (page > currentPage - 2 && page < currentPage + 2) {
                return <PaginatorItem key={page} onClick={() => props.onClick(page)}
                  isActive={page === currentPage}>
                  {page}
                </PaginatorItem>
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <PaginatorSeparator key={page}/>
              }
            }
            return null
          })
        }
        { props.pages > 1
          ? <PaginatorItem onClick={() => props.onClick(props.pages)}
            isActive={props.pages === currentPage}>
            {props.pages}
          </PaginatorItem>
          : ''
        }
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
  pages: 9,
  className: '',
  currentPage: 8,
  onClick: () => {},
  onClickPrev: () => {},
  onClickNext: () => {},
}

export default Paginator
export {
  PaginatorItem,
}
