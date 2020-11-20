import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import './Card.scss'

/*
modifier('card', {
  gutter: props.gutter,
})
selector({
  padding: props.padding,
  radius: props.radius,
  shadow: props.shadow,
})
cleanClass([
  'card',
  className,
  interactive ? shadow + '--interactive' : shadow,
  radius,
  padding,
])
*/

const Card = ({ children, className, interactive, padding, radius, shadow, ...restProps }) => {
  const classNames = [
    'card',
    className,
    interactive ? shadow + '--interactive' : shadow,
    radius,
    padding,
  ].filter(value => !!value).join(' ')

  return <Grid {...restProps} className={classNames}>
    {children}
  </Grid>
}

Card.propTypes = {
  ...Grid.propTypes,
  className: PropTypes.string,
  interactive: PropTypes.bool,
  padding: PropTypes.string,
  radius: PropTypes.string,
  shadow: PropTypes.string,
}

Card.defaultProps = {
  className: '',
  gutter: 'xsmall',
  interactive: false,
  padding: 'padding-normal',
  radius: 'border-radius-normal',
  shadow: 'box-shadow-soft',
}

export default Card
