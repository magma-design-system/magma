import React from 'react'
import PropTypes from 'prop-types'
import SwitchItem from '@Form/Switch/Switch'
import './Switch.scss'

const Switch = props =>
  <div className="backoffice-switch">
    <SwitchItem className="backoffice-switch__item">
      {props.children}
    </SwitchItem>
  </div>

Switch.propTypes = {
  className: PropTypes.string,
  boxClassName: PropTypes.string,
  isChecked: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
}

Switch.defaultProps = {
  className: '',
  boxClassName: '',
  isChecked: false,
  name: 'unassigned',
  onChange: value => { return value },
  value: '0',
}

export default Switch
