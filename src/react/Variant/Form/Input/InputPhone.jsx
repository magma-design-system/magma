import PropTypes from 'prop-types'
import BackofficeInputPhone from '@Backoffice/Form/InputPhone/InputPhone'
import FormInputPhone from '@Form/InputPhone/InputPhone'

const variants = {
  backoffice: BackofficeInputPhone,
  default: FormInputPhone,
}

const InputPhone = props =>
  variants[props.variant]

InputPhone.propTypes = {
  variant: PropTypes.string,
}

InputPhone.defaultProps = {
  variant: 'default',
}

export default InputPhone
