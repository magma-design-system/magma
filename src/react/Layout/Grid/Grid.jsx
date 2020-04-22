import React from 'react'
import PropTypes from 'prop-types'
import './Grid.scss'

const Grid = props =>
  <div className={`grid ${props.className} ${props.fit ? 'grid--fit' : ''} ${props.columns !== '0' ? 'grid--' + props.columns + '-columns' : ''} ${props.gutter !== '' ? 'grid--' + props.gutter : ''} `}>
    {props.children}
  </div>

Grid.propTypes = {
  className: PropTypes.string,
  columns: PropTypes.string,
  fit: PropTypes.bool,
  gutter: PropTypes.string,
}

Grid.defaultProps = {
  className: '',
  columns: '0',
  fit: false,
  gutter: '',
}

export default Grid
