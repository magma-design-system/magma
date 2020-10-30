import PropTypes from 'prop-types'
import BackofficeInputList from '@Backoffice/Form/Input/InputList'
import FormInputList from '@Form/Input/InputList'

const variants = {
  backoffice: BackofficeInputList,
  default: FormInputList,
}

const InputList = props =>
  variants[props.variant]

InputList.propTypes = {
  variant: PropTypes.string,
}

InputList.defaultProps = {
  variant: 'default',
}

export default InputList
