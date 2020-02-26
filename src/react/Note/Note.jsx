import React from 'react'
import PropTypes from 'prop-types'
import './Note.scss'

const Note = props =>
  <div className={`note ${props.className}`}>
    {props.children}
  </div>

Note.propTypes = {
  className: PropTypes.string,
}

Note.defaultProps = {
  className: '',
}

export default Note
