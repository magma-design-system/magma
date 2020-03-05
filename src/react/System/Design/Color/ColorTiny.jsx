import React from 'react'
import PropTypes from 'prop-types'
import AccessibilityTest from './AccessibilityTest'
import './ColorTiny.scss'

import Paragraph from '@Typography/Paragraph/Paragraph'

const ColorTiny = props =>
  <label className="sys-color-tiny">
    <div className={`sys-color-tiny__dot background-color-${props.prefix}`}></div>
    <div className="sys-color-tiny__infos">
      <Paragraph className="sys-color-tiny__name"><b>{props.prefix}</b></Paragraph>
      <AccessibilityTest color={props.color}/>
      <input className={`sys-color-tiny__value color-${props.prefix}`} onFocus={event => event.target.setSelectionRange(0, event.target.value.length)} type="text" value={props.color.replace('#', '')} readonly/>
    </div>
  </label>

ColorTiny.propTypes = {
  color: PropTypes.string,
  prefix: PropTypes.string,
}

ColorTiny.defaultProps = {
  color: '#ff00cc',
  prefix: 'group-name',
}

export default ColorTiny
