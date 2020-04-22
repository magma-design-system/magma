import React from 'react'
import PropTypes from 'prop-types'
import Typography from '../Typography'

const Hack = props =>
  <Typography
    className={`text-mono text-mono--hack ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

Hack.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Hack.defaultProps = {
  className: '',
  htmlTag: 'p',
}

export default Hack
