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
  const pages = Array.from({ length: props.pages }, (_, i) => i + 1)
  if(props.pages === 1){return <div></div>}
  return (
    <HorizontalScroll smooth={false} className={`paginator ${props.className}`}>
      <PaginatorPrev onClick={props.onClickPrev}/>
      <div className="paginator__list">
        <PaginatorItem onClick={() => props.onClick(1)} isActive={props.currentPage === 1}>
          1
        </PaginatorItem>
        { props.pages < 6
          ? pages.map(elem => {
            if (elem > 1 && elem < props.pages) {
              return <PaginatorItem key={elem} onClick={() => props.onClick(elem)}
                isActive={elem === props.currentPage}>
                {elem}
              </PaginatorItem>
            }
            return null
          })
          : pages.map(elem => {
            if (elem > 1 && elem < props.pages) {
              if (props.currentPage < 3 || props.currentPage > props.pages - 2) {
                if (elem < 4) {
                  return <PaginatorItem key={elem} onClick={() => props.onClick(elem)} ù
                    isActive={elem === props.currentPage}>
                    {elem}
                  </PaginatorItem>
                } else if (elem > props.pages - 3) {
                  return <PaginatorItem key={elem} onClick={() => props.onClick(elem)}
                    isActive={elem === props.currentPage}>
                    {elem}
                  </PaginatorItem>
                } else if (elem === 4) {
                  return <PaginatorSeparator key={elem}/>
                }
              } else {
                if (elem > props.currentPage - 2 && elem < props.currentPage + 2) {
                  return <PaginatorItem key={elem} onClick={() => props.onClick(elem)}
                    isActive={elem === props.currentPage}>
                    {elem}
                  </PaginatorItem>
                } else if (elem === props.currentPage - 2 || elem === props.currentPage + 2) {
                  return <PaginatorSeparator key={elem}/>
                }
              }
            }
            return null
          })
        }
        { props.pages > 1
          ? <PaginatorItem onClick={() => props.onClick(props.pages)}
            isActive={props.pages === props.currentPage}>
            {props.pages}
          </PaginatorItem>
          : ''
        }
      </div>
      <PaginatorNext onClick={props.onClickNext}/>
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
  pages: 1,
  className: '',
  currentPage: 1,
  onClick: () => {},
  onClickPrev: () => {},
  onClickNext: () => {},
}

export default Paginator
export {
  PaginatorItem,
}
