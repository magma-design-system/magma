import PropTypes from 'prop-types'
import BackofficeInputText from '@Backoffice/Form/InputText/InputText'
import FormInputText from '@Form/InputText/InputText'

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
