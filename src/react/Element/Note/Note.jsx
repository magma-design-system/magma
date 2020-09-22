import React from 'react'
import PropTypes from 'prop-types'
import Icon from '@Design/Icon/Icon'
import './Note.scss'

import dictionary from './dictionary.json'

const Note = props =>
  <div className={`note ${props.className} ${props.dismiss ? 'note--dismiss' : ''} ${dictionary[props.status].background} ${dictionary[props.status].color}`}>
    {props.dismiss && <Icon className="note__close" name="close"/>}
    {props.children}
  </div>

Note.propTypes = {
  className: PropTypes.string,
  dismiss: PropTypes.bool,
  status: PropTypes.string,
}

Note.defaultProps = {
  className: '',
  dismiss: false,
  status: 'warning',
}

export default Note
