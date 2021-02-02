import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'

import { styles } from '@Library/styles'

const Form = ({ className, onSubmit, ...restProps }) => {
  const classes = styles('form', {
    selectors: [
      className,
    ],
  })

  return <form onSubmit={onSubmit} className={classes}>
    <Grid {...restProps}>
      {restProps.children}
    </Grid>
  </form>
}

Form.propTypes = {
  ...Grid.propTypes,
  onSubmit: PropTypes.func,
}

Form.defaultProps = {
  onSubmit: () => {},
}

export default Form
