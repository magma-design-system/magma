import PropTypes from 'prop-types'
import BackofficeButton from '@Backoffice/Form/Button/Button'
import DefaultButton from '@Form/Button/Button'
import ElementButton from '@Element/Button/Button'

const variants = {
  backoffice: BackofficeButton,
  default: DefaultButton,
  element: ElementButton,
}

const Button = props =>
  variants[props.variant]

Button.propTypes = {
  variant: PropTypes.string,
}

Button.defaultProps = {
  variant: 'default',
}

export default Button
