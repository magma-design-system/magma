import React from 'react'
import PropTypes from 'prop-types'
import FormButton from '@Form/Button/Button'

const Button = props =>
  <FormButton
    className={`text-secondary text-secondary--paragraph ${props.className}`}
    {...props}
  >
    { props.children ? props.children : '' }
  </FormButton>

Button.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Button.defaultProps = {
  className: '',
  htmlTag: 'div',
}

export default Button
