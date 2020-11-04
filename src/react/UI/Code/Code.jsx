import React from 'react'
import PropTypes from 'prop-types'
import './Code.scss'
import CodeTypography from '@Typography/Code/Code'

const Code = props =>
  <CodeTypography className={`code ${props.className}`}>
    {props.children}
  </CodeTypography>

Code.propTypes = {
  className: PropTypes.string,
}

Code.defaultProps = {
  className: '',
}

export default Code
