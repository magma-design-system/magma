import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Row.scss'

const Row = ({ align, className, gutter, htmlTag, lastChild, onClick, width, ...restProps }) => {
  const HtmlTag = htmlTag.toLowerCase()
  const classes = styles('row', {
    selectors: [
      className,
    ],
    modifiers: {
      align,
      gutter,
      lastChild,
      width,
    },
  })

  const children = Children.map(restProps.children, child => {
    if (child !== null) {
      return cloneElement(child, {
        className: `${child.props.className ? child.props.className : ''} row__item`,
      })
    }
  })

  return <HtmlTag {...restProps} onClick={onClick} className={classes}>{children}</HtmlTag>
}

Row.propTypes = {
  align: PropTypes.string, // center | flex-start | flex-end
  className: PropTypes.string,
  gutter: PropTypes.string,
  htmlTag: PropTypes.string,
  lastChild: PropTypes.string, // to-right
  onClick: PropTypes.func,
  width: PropTypes.string, // full || inline
}

Row.defaultProps = {
  align: 'center',
  gutter: 'xsmall',
  htmlTag: 'div',
  width: 'full',
}

export default Row
