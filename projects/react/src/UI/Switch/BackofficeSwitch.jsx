import React from 'react'
import PropTypes from 'prop-types'
import Switch from '@UI/Switch/Switch'
import './BackofficeSwitch.scss'

const BackofficeSwitch = props =>
  <div className="backoffice-switch" onChange={props.onChange}>
    <Switch className="backoffice-switch__item">
      {props.children}
    </Switch>
  </div>

BackofficeSwitch.propTypes = {
  className: PropTypes.string,
  boxClassName: PropTypes.string,
  isChecked: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
}

BackofficeSwitch.defaultProps = {
  className: '',
  boxClassName: '',
  isChecked: false,
  name: 'unassigned',
  onChange: value => { return value },
  value: '0',
}

export default BackofficeSwitch
