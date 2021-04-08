import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './BackofficeSelect.scss'
import Icon from '@Design/Icon/Icon'
import H3 from '@Typography/H3/H3'
import Detail from '@Typography/Detail/Detail'
import { capitalize } from '@UI/Select/functions'

const BackofficeSelectOption = props =>
  <option className={`backoffice-select__option ${props.className}`} value={props.value}>
    { capitalize(props.children) }
  </option>

BackofficeSelectOption.propTypes = {
  className: PropTypes.string,
  value: PropTypes.any,
}

BackofficeSelectOption.defaultProps = {
  className: '',
}

const BackofficeOptionsData = props => {
  return props.data.map((value, key) => <BackofficeSelectOption key={key} value={value}>{value}</BackofficeSelectOption>)
}

BackofficeOptionsData.propTypes = {
  data: PropTypes.any,
  value: PropTypes.string,
}

const BackofficeSelect = props =>
  <label className={`backoffice-select ${props.value ? 'backoffice-select--filled' : ''} ${props.icon ? 'backoffice-select--has-icon' : ''} ${props.error ? 'backoffice-select--has-errors' : ''} ${props.className}`}>
    <div className="backoffice-select__content">
      {props.label &&
        <H3 htmlTag="div" className="backoffice-select__label">
          {props.label}
        </H3>
      }
      {props.icon &&
        <div className="backoffice-select__icon-area">
          <Icon className={`backoffice-select__icon ${props.iconClassName !== '' ? props.iconClassName : ''}`} name={props.icon}/>
        </div>
      }
      <div className="backoffice-select__item">
        <select onChange={props.onChange} className="backoffice-select__field text-secondary text-secondary--detail" name={props.name} value={props.value}>
          {!props.data
            ? <Fragment>{ props.children }</Fragment>
            : <BackofficeOptionsData data={props.data} value={props.value}/>
          }
        </select>
        <Icon className="backoffice-select__field-icon" name="navigation-show"/>
      </div>
    </div>
    {props.error &&
        <div className="backoffice-select__message">
          <Detail htmlTag="div" className="backoffice-select__error">
            <Icon className="backoffice-select__error-icon" name="status-error"/>
            <div className="backoffice-select__error-text">{props.error}</div>
          </Detail>
        </div>
    }
  </label>

BackofficeSelect.propTypes = {
  className: PropTypes.string,
  data: PropTypes.any,
  error: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  theme: PropTypes.string,
  value: PropTypes.string,
}

BackofficeSelect.defaultProps = {
  className: '',
  label: '',
  name: 'unassigned',
  onChange: () => {},
  required: false,
}

export default BackofficeSelect
export {
  BackofficeSelectOption,
}
