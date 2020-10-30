import React from 'react'
import PropTypes from 'prop-types'
import './Hr.scss'

const Hr = props =>
  <hr className={`hr ${props.className}`}/>

Hr.propTypes = {
  className: PropTypes.string,
}

Hr.defaultProps = {
  className: '',
}

export default Hr
