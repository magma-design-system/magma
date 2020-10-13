import React from 'react'
import PropTypes from 'prop-types'
import './Grid.scss'

const Grid = props => {
  const HtmlTag = props.htmlTag.toLowerCase()
  return (
    <HtmlTag className={`grid ${props.className} ${props.template ? 'grid--tmpl-' + props.template : ''} ${props.fit ? 'grid--fit' : ''} ${props.align ? 'grid--align-' + props.align : ''} ${props.columns !== '0' ? 'grid--' + props.columns + '-columns' : ''} ${props.gutter !== '' ? 'grid--' + props.gutter : ''}`.replace(/\s\s+/g, ' ').trim()}>
      {props.children}
    </HtmlTag>
  )
}

Grid.propTypes = {
  align: PropTypes.string,
  className: PropTypes.string,
  fit: PropTypes.bool,
  columns: PropTypes.string,
  gutter: PropTypes.string,
  htmlTag: PropTypes.string,
  template: PropTypes.string,
}

Grid.defaultProps = {
  className: '',
  columns: '0',
  gutter: '',
  htmlTag: 'div',
  template: '',
}

export default Grid
