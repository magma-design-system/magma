import React from 'react'
import PropTypes from 'prop-types'
import './Hr.scss'

const Hr = props =>
  <hr className={`hr ${props.className} ${props.spacing ? 'hr--spacing-' + props.spacing : ''}`}/>

Hr.propTypes = {
  className: PropTypes.string,
  spacing: PropTypes.string,
}

Hr.defaultProps = {
  className: '',
}

export default Hr
