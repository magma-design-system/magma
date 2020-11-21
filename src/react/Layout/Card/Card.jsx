import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import './Card.scss'

import { appendSelectors, globalSelectors } from '@Library/styles'

const Card = ({ className, padding, borderRadius, boxShadow, ...restProps }) => {
  const localClassNames = appendSelectors([
    'card',
    className,
  ])

  const globalClassNames = globalSelectors({
    padding,
    borderRadius,
    boxShadow,
  })

  return <Grid {...restProps} className={`${localClassNames} ${globalClassNames}`}>
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
  interactive: false,
  padding: 'normal',
}

export default Card
