import React from 'react'
import PropTypes from 'prop-types'
import './BackofficeHr.scss'

const BackofficeHr = props =>
  <hr className={`backoffice-hr ${props.className}`}/>

BackofficeHr.propTypes = {
  className: PropTypes.string,
}

BackofficeHr.defaultProps = {
  className: '',
}

export default BackofficeHr
