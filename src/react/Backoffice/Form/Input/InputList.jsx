import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from './Input'

const InputListItem = props =>
  <Fragment>
    {props.children
      ? <option className="input__list-item" value={props.value}>{props.children}</option>
      : <option className="input__list-item" value={props.value}/>
    }
  </Fragment>

InputListItem.propTypes = {
  value: PropTypes.string,
}

const InputList = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className="backoffice-input__field text-secondary text-secondary--detail"
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
      placeholder={props.placeholder}
      list={`list-${props.name}`}
    />
    <datalist className="backoffice-input__list" id={`list-${props.name}`}>
      {props.children}
    </datalist>
  </Input>

InputList.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
}

InputList.defaultProps = {
  autoComplete: 'off',
  icon: 'data-search',
  iconClassName: '',
  name: 'unassigned',
  onChange: () => {},
  placeholder: '',
  required: false,
  value: '',
}

export default InputList
export {
  InputListItem,
}
