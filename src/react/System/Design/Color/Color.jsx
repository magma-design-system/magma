import React from 'react'
import PropTypes from 'prop-types'
import './Color.scss'

import Paragraph from '@Typography/Paragraph/Paragraph'
import Caption from '@Typography/Caption/Caption'

const Color = props =>
  <label className="sys-color">
    <div className={`sys-color__dot background-color-${props.name}`}></div>
    <div className="sys-color__infos">
      <Paragraph className="sys-color__name"><b>{props.name.split('-')[1]}</b></Paragraph>
      <input className="sys-color__code" onFocus={event => event.target.setSelectionRange(0, event.target.value.length)} spellcheck="false" type="text" value={props.name} readonly/>
      <Caption className={`sys-color__color color-${props.name}`}>{props.color.replace('#', '')}</Caption>
    </div>
  </label>

Color.propTypes = {
  color: PropTypes.string,
  name: PropTypes.string,
}

Color.defaultProps = {
  color: '#ff00cc',
  name: 'prefix-name',
}

export default Color
