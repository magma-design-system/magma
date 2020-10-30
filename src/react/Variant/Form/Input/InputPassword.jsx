import PropTypes from 'prop-types'
import BackofficeInputPassword from '@Backoffice/Form/InputPassword/InputPassword'
import FormInputPassword from '@Form/InputPassword/InputPassword'

const variants = {
  backoffice: BackofficeInputPassword,
  default: FormInputPassword,
}

const InputPassword = props =>
  variants[props.variant]

InputPassword.propTypes = {
  variant: PropTypes.string,
}

InputPassword.defaultProps = {
  variant: 'default',
}

export default InputPassword
