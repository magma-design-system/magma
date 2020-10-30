import PropTypes from 'prop-types'
import BackofficeInputText from '@Backoffice/Form/Input/InputText'
import FormInputText from '@Form/Input/InputText'

const variants = {
  backoffice: BackofficeInputText,
  default: FormInputText,
}

const InputText = props =>
  variants[props.variant]

InputText.propTypes = {
  variant: PropTypes.string,
}

InputText.defaultProps = {
  variant: 'default',
}

export default InputText
