import PropTypes from 'prop-types'
import BackofficeInputEmail from '@Backoffice/Form/Input/InputEmail'
import FormInputEmail from '@Form/Input/InputEmail'

const variants = {
  backoffice: BackofficeInputEmail,
  default: FormInputEmail,
}

const InputEmail = props =>
  variants[props.variant]

InputEmail.propTypes = {
  variant: PropTypes.string,
}

InputEmail.defaultProps = {
  variant: 'default',
}

export default InputEmail
