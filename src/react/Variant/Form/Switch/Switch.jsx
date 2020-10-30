import PropTypes from 'prop-types'
import BackofficeSwitch from '@Backoffice/Form/Switch/Switch'
import FormSwitch from '@Form/Switch/Switch'

const variants = {
  backoffice: BackofficeSwitch,
  default: FormSwitch,
}

const Switch = props =>
  variants[props.variant]

Switch.propTypes = {
  variant: PropTypes.string,
}

Switch.defaultProps = {
  variant: 'default',
}

export default Switch
