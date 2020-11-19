import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import './Card.scss'

const Card = props =>
  <Grid {...props} className={`card ${props.className} ${props.interactive ? props.shadow + '--interactive' : props.shadow} ${props.radius ? props.radius : ''} ${props.padding ? props.padding : ''}`}>
    {props.children}
  </Grid>

Card.propTypes = {
  align: PropTypes.string,
  className: PropTypes.string,
  columns: PropTypes.string,
  fit: PropTypes.bool,
  gutter: PropTypes.string,
  interactive: PropTypes.bool,
  padding: PropTypes.string,
  radius: PropTypes.string,
  shadow: PropTypes.string,
  template: PropTypes.string,
}

Card.defaultProps = {
  className: '',
  columns: '0',
  gutter: 'xsmall',
  interactive: false,
  padding: 'padding-normal',
  radius: 'border-radius-normal',
  shadow: 'box-shadow-soft',
}

export default Card
