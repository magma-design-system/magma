import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import './Row.scss'

const Row = props => {
  const HtmlTag = props.htmlTag.toLowerCase()
  return <HtmlTag {...props} onClick={props.onClick} className={`row ${props.className} ${props.gutter !== '' ? 'row--gutter-' + props.gutter : ''} ${props.align !== '' ? 'row--align-' + props.align : ''} ${props.lastToRight ? 'row--last-to-right' : ''} `}>
    {
      Children.map(props.children, (child, index) => {
        if (child !== null) {
          return cloneElement(child, {
            key: index,
            className: child.props.className ? `${child.props.className} row__item` : 'row__item',
          })
        }
      })
    }
  </HtmlTag>
}

Row.propTypes = {
  align: PropTypes.string,
  className: PropTypes.string,
  gutter: PropTypes.string,
  htmlTag: PropTypes.string,
  lastToRight: PropTypes.bool,
  onClick: PropTypes.func,
}

Row.defaultProps = {
  align: 'center',
  className: '',
  gutter: 'xsmall',
  htmlTag: 'div',
  lastToRight: false,
}

export default Row
