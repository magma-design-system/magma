import React from 'react'
import PropTypes from 'prop-types'
import './Grid.scss'

const Grid = props =>
  <div className="grid">
    {props.children}
  </div>

Grid.propTypes = {
  columns: PropTypes.number,
}

Grid.defaultProps = {
  columns: 0,
}

export default Grid
