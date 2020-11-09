import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'

const Form = props =>
  <form onSubmit={props.onSubmit} className='form'>
    <Grid {...props}>
      {props.children}
    </Grid>
  </form>

Form.propTypes = {
  onSubmit: PropTypes.func,
}

Form.defaultProps = {
  onSubmit: () => {},
}

export default Form
