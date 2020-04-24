import React from 'react'
import PropTypes from 'prop-types'
import Icon from '@Design/Icon/Icon'
import './Note.scss'

const Note = props =>
  <div className={`note ${props.className} ${props.dismiss ? 'note--dismiss' : ''} note--${props.variant}`}>
    {props.dismiss && <Icon className="note__close" name="close"/>}
    {props.children}
  </div>

Note.propTypes = {
  className: PropTypes.string,
  dismiss: PropTypes.bool,
  variant: PropTypes.string,
}

Note.defaultProps = {
  className: '',
  dismiss: false,
  variant: 'default',
}

export default Note
