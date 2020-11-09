import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import './Card.scss'

const Card = props =>
  <Grid {...props} className={`card ${props.className} ${props.shadow ? props.shadow : ''}`}>
    {props.children}
  </Grid>

Card.propTypes = {
  align: PropTypes.string,
  className: PropTypes.string,
  columns: PropTypes.string,
  fit: PropTypes.bool,
  gutter: PropTypes.string,
  shadow: PropTypes.string,
  template: PropTypes.string,
}

Card.defaultProps = {
  className: '',
  columns: '0',
  gutter: 'xsmall',
  shadow: 'box-shadow-soft',
}

export default Card
