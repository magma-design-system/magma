import React from 'react'
import PropTypes from 'prop-types'
import './Grid.scss'

const Grid = props => {
  const HtmlTag = props.htmlTag.toLowerCase()
  return (
    <HtmlTag className={`grid ${props.className} ${props.template ? 'grid--tmpl-' + props.template : ''} ${props.fit ? 'grid--fit' : ''} ${props.columns !== '0' ? 'grid--' + props.columns + '-columns' : ''} ${props.gutter !== '' ? 'grid--' + props.gutter : ''} `}>
      {props.children}
    </HtmlTag>
  )
}

Grid.propTypes = {
  className: PropTypes.string,
  columns: PropTypes.string,
  fit: PropTypes.bool,
  gutter: PropTypes.string,
  htmlTag: PropTypes.string,
  template: PropTypes.string,
}

Grid.defaultProps = {
  className: '',
  columns: '0',
  fit: false,
  gutter: '',
  htmlTag: 'div',
  template: '',
}

export default Grid
