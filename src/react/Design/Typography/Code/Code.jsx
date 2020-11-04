import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@Typography/Typography'

const Code = props =>
  <Typography
    className={`text-mono text-mono--code ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

Code.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Code.defaultProps = {
  className: '',
  htmlTag: 'code',
}

export default Code
