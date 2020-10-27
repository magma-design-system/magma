import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './Checkbox.scss'
import Icon from '@Design/Icon/Icon'

const Checkbox = props =>
  <label className={`checkbox ${props.className} ${props.textClassName} ${props.icon ? 'checkbox--custom' : ''}`.trim()}>
    {!props.sync
      ? <input onChange={e => props.onChange(e.target.checked)} className="checkbox__field" defaultChecked={props.isChecked} type="checkbox" value="1"/>
      : <input onChange={e => props.onChange(e.target.checked)} className="checkbox__field" checked={props.isChecked} type="checkbox" value="1"/>
    }
    {props.icon
      ? <Fragment>
        <Icon className={`checkbox__icon ${props.iconClassName}`} name={props.icon}/>
        <Icon className={`checkbox__icon ${props.iconClassName}`} name={props.icon}/>
      </Fragment>
      : <Fragment>
        <Icon className={`checkbox__icon ${props.iconClassName}`} name="form-checkbox-unchecked"/>
        <Icon className={`checkbox__icon ${props.iconClassName}`} name="form-checkbox-checked"/>
      </Fragment>
    }
    <div className="checkbox__text">
      {props.children}
    </div>
  </label>

Checkbox.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  isChecked: PropTypes.bool,
  onChange: PropTypes.func,
  sync: PropTypes.bool,
  textClassName: PropTypes.string,
}

Checkbox.defaultProps = {
  className: '',
  icon: '',
  iconClassName: '',
  isChecked: false,
  sync: false,
  textClassName: 'text-secondary text-secondary--caption',
}

export default Checkbox
