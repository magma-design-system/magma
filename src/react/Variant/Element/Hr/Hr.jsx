import PropTypes from 'prop-types'
import BackofficeHr from '@Backoffice/Element/Hr/Hr'
import ElementHr from '@Element/Hr/Hr'

const variants = {
  backoffice: BackofficeHr,
  default: ElementHr,
}

const Hr = props =>
  variants[props.variant]

Hr.propTypes = {
  variant: PropTypes.string,
}

Hr.defaultProps = {
  variant: 'default',
}

export default Hr
