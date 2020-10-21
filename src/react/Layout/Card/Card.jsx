import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import './Card.scss'

const Card = props =>
  <Grid {...props} className={`card ${props.className}`}>
    {props.children}
  </Grid>

Card.propTypes = {
  align: PropTypes.string,
  className: PropTypes.string,
  fit: PropTypes.bool,
  columns: PropTypes.string,
  gutter: PropTypes.string,
  template: PropTypes.string,
}

Card.defaultProps = {
  className: 'box-shadow-soft',
  columns: '0',
  gutter: 'xsmall',
  template: '',
}

export default Card
