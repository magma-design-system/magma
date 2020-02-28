import React from 'react'
import PropTypes from 'prop-types'
import './Grid.scss'

const Grid = props =>
  <div className={`grid ${props.columns.toString() !== '0' ? 'grid--' + props.columns.toString() + '-columns' : ''}`}>
    {props.children}
  </div>

Grid.propTypes = {
  columns: PropTypes.string,
}

Grid.defaultProps = {
  columns: '0',
}

export default Grid
