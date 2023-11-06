import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import './Card.scss'

import { styles } from '@Library/styles'

const Card = ({ className, padding, borderRadius, boxShadow, ...restProps }) => {
  const classes = styles('card', {
    selectors: [
      className,
    ],
    scaffolded: {
      padding,
      borderRadius,
      boxShadow,
    },
  })

  return <Grid {...restProps} className={classes}>
    {restProps.children}
  </Grid>
}

Card.propTypes = {
  ...Grid.propTypes,
  borderRadius: PropTypes.string,
  boxShadow: PropTypes.string,
  className: PropTypes.string,
  padding: PropTypes.string,
}

Card.defaultProps = {
  borderRadius: 'normal',
  boxShadow: 'soft',
  className: '',
  padding: 'normal',
}

export default Card
