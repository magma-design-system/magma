import PropTypes from 'prop-types'
import BackofficeInputEmail from '@Backoffice/Form/InputEmail/InputEmail'
import FormInputEmail from '@Form/InputEmail/InputEmail'

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
