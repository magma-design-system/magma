import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import { appendSelectors, modifiers } from '@Library/styles'
import './Row.scss'

const Row = ({ align, gutter, htmlTag, lastChild, onClick, ...restProps }) => {
  const HtmlTag = htmlTag.toLowerCase()
  const mainSelector = 'row'
  const localClassNames = appendSelectors([
    mainSelector,
    restProps.className,
  ])

  const modifierClassNames = modifiers(mainSelector, {
    align,
    gutter,
    lastChild,
  })

  const children = Children.map(restProps.children, child => {
    if (child !== null) {
      return cloneElement(child, {
        className: `${child.props.className ? child.props.className : ''} row__item`,
      })
    }
  })

  return <HtmlTag {...restProps} onClick={onClick} className={`${localClassNames} ${modifierClassNames}`}>{children}</HtmlTag>
}

Row.propTypes = {
  align: PropTypes.string, // center | flex-start | flex-end
  className: PropTypes.string,
  gutter: PropTypes.string,
  htmlTag: PropTypes.string,
  lastChild: PropTypes.string, // to-right
  onClick: PropTypes.func,
}

Row.defaultProps = {
  align: 'center',
  gutter: 'xsmall',
  htmlTag: 'div',
}

export default Row
