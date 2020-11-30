import React from 'react'
import PropTypes from 'prop-types'
import Icon from '@Design/Icon/Icon'
import './Note.scss'

import dictionary from './dictionary.json'

const Note = props =>
  <div className={`note ${props.className} ${props.dismiss ? 'note--dismiss' : ''} ${props.visible ? 'note--visible' : ''} ${dictionary[props.status].background} ${dictionary[props.status].color}`}>
    {props.dismiss && <Icon className="note__close" name="action-close" onClick={() => { props.onCancel() }}/>}
    {props.children}
  </div>

Note.propTypes = {
  className: PropTypes.string,
  dismiss: PropTypes.bool,
  onCancel: PropTypes.func,
  status: PropTypes.string,
  visible: PropTypes.bool,
}

Note.defaultProps = {
  className: '',
  dismiss: false,
  onCancel: null,
  status: 'warning',
  visible: true,
}

export default Note
