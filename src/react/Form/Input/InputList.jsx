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
      className={`input__field ${props.font}`}
      defaultValue={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      list={`list-${props.name}`}
    />
    <datalist className="input__list" id={`list-${props.name}`}>
      {props.children}
    </datalist>
  </Input>

InputList.propTypes = {
  autoComplete: PropTypes.string,
  font: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
}

InputList.defaultProps = {
  autoComplete: 'off',
  font: 'text-secondary text-secondary--detail',
  icon: 'data-search',
  iconClassName: '',
  name: 'unassigned',
  onChange: value => { return value },
  placeholder: '',
  value: '',
}

export default InputList
export {
  InputListItem,
}
