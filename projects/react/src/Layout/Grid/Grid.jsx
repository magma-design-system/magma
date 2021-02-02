import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Grid.scss'

const Grid = ({ align, className, columns, gutter, htmlTag, rows, template, ...restProps }) => {
  const HtmlTag = htmlTag.toLowerCase()

  const classes = styles('grid', {
    selectors: [
      className,
    ],
    modifiers: {
      align,
      columns,
      gutter,
      rows,
      template,
    },
  })

  return <HtmlTag className={classes}>
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
