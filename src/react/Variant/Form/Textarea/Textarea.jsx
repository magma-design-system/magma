import PropTypes from 'prop-types'
import BackofficeTextarea from '@Backoffice/Form/Textarea/Textarea'
import FormTextarea from '@Form/Textarea/Textarea'

const variants = {
  backoffice: BackofficeTextarea,
  default: FormTextarea,
}

const Textarea = props =>
  variants[props.variant]

Textarea.propTypes = {
  variant: PropTypes.string,
}

Textarea.defaultProps = {
  variant: 'default',
}

export default Textarea
