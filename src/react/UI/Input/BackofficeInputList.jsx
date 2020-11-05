import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './BackofficeInput.scss'
import BackofficeInput from '@UI/Input/BackofficeInput'

const BackofficeInputListItem = props =>
  <Fragment>
    {props.children
      ? <option className="input__list-item" value={props.value}>{props.children}</option>
      : <option className="input__list-item" value={props.value}/>
    }
  </Fragment>

BackofficeInputListItem.propTypes = {
  value: PropTypes.string,
}

const BackofficeInputList = props =>
  <BackofficeInput {...props}>
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
  </BackofficeInput>

BackofficeInputList.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
}

BackofficeInputList.defaultProps = {
  autoComplete: 'off',
  icon: 'data-search',
  iconClassName: '',
  name: 'unassigned',
  onChange: () => {},
  placeholder: '',
  required: false,
  value: '',
}

export default BackofficeInputList
export {
  BackofficeInputListItem,
}
