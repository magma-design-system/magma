import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Icon from '@Design/Icon/Icon'
import H3 from '@Typography/H3/H3'
import Detail from '@Typography/Detail/Detail'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'

const Input = props =>
  <label className={`backoffice-input ${props.value ? 'backoffice-input--filled' : ''} ${props.icon !== '' ? 'backoffice-input--has-icon' : ''} ${props.error ? 'backoffice-input--has-errors' : ''} ${props.className}`}>
    <div className="backoffice-input__content">
      {props.label &&
        <H3 htmlTag="div" className="backoffice-input__label">
          {props.label}
        </H3>
      }
      {props.required &&
        <LabelCaption className={`backoffice-input__required ${props.error === '' && props.value !== '' ? 'backoffice-input__required--valid' : ''}`}>
          {props.error === '' && props.value !== '' ? 'Corretto' : ''}
          {props.value === '' && props.required ? 'Obbligatorio' : ''}
          {props.value !== '' && props.error !== '' ? 'Non valido' : ''}
        </LabelCaption>
      }
      {props.icon &&
        <div className="backoffice-input__icon-area">
          <Icon className={`backoffice-input__icon ${props.iconClassName !== '' ? props.iconClassName : ''}`} name={props.icon}/>
        </div>
      }
      {props.children}
    </div>
    {props.error &&
        <div className="backoffice-input__message">
          <Detail htmlTag="div" className="backoffice-input__error">
            <Icon className="backoffice-input__error-icon" name="status-error"/>
            <div className="backoffice-input__error-text">{props.error}</div>
          </Detail>
        </div>
    }
  </label>

Input.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  theme: PropTypes.string,
  value: PropTypes.string,
}

Input.defaultProps = {
  className: '',
  icon: '',
  iconClassName: '',
  label: '',
  required: false,
}

export default Input
