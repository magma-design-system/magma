import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'

import { appendSelectors } from '@Library/styles'

const Form = ({ className, onSubmit, ...restProps }) => {
  const localClassNames = appendSelectors([
    'form',
    className,
  ])

  return <form onSubmit={onSubmit} className={`${localClassNames}`}>
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
