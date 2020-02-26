import React from 'react'
import PropTypes from 'prop-types'
import './Switch.scss'

const Switch = props =>
  <label className={`switch ${props.className}`}>
    <input
      className="switch__field"
      defaultChecked={props.isChecked}
      name={props.name}
      onChange={e => props.onChange(e.target.checked)}
      type="checkbox"
      defaultValue={props.value}
    />
    <div className={`switch__box ${props.boxClassName}`}>
      <div className="switch__dot"></div>
    </div>
    <div className="switch__text">
      {props.children}
    </div>
  </label>

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
