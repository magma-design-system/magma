import React from 'react'
import PropTypes from 'prop-types'
import { appendSelectors, modifiers } from '@Library/styles'
import './Grid.scss'

const Grid = ({ align, columns, gutter, htmlTag, rows, template, ...restProps }) => {
  const HtmlTag = htmlTag.toLowerCase()
  const localClassNames = appendSelectors([
    'grid',
    restProps.className,
  ])

  const modifierClassNames = modifiers('grid', {
    align,
    columns,
    gutter,
    rows,
    template,
  })

  return <HtmlTag className={`${localClassNames} ${modifierClassNames}`}>
    { restProps.children }
  </HtmlTag>
}

Grid.propTypes = {
  align: PropTypes.string,
  className: PropTypes.string,
  columns: PropTypes.string,
  rows: PropTypes.string, // fit-vertically
  gutter: PropTypes.string,
  htmlTag: PropTypes.string,
  template: PropTypes.string,
}

Grid.defaultProps = {
  className: '',
  htmlTag: 'div',
}

export default Grid
