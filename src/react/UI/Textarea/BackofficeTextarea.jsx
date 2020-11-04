import React from 'react'
import PropTypes from 'prop-types'
import './BackofficeTextarea.scss'
import Icon from '@Design/Icon/Icon'
import H3 from '@Typography/H3/H3'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'
import Detail from '@Typography/Detail/Detail'

const Textarea = props =>
  <label className={`backoffice-textarea ${props.value ? 'backoffice-textarea--filled' : ''} ${props.icon !== '' ? 'backoffice-textarea--has-icon' : ''} ${props.error ? 'backoffice-textarea--has-errors' : ''} ${props.className}`}>
    <div className="backoffice-textarea__content">
      {props.label &&
        <H3 htmlTag="div" className="backoffice-textarea__label">
          {props.label}
        </H3>
      }
      {props.required &&
        <LabelCaption className={`backoffice-textarea__required ${props.error === '' && props.value !== '' ? 'backoffice-textarea__required--valid' : ''}`}>
          {props.error === '' && props.value !== '' ? 'Corretto' : ''}
          {props.value === '' && props.required ? 'Obbligatorio' : ''}
          {props.value !== '' && props.error !== '' ? 'Non valido' : ''}
        </LabelCaption>
      }
      {props.icon &&
        <div className="backoffice-textarea__icon-area">
          <Icon className={`backoffice-textarea__icon ${props.iconClassName !== '' ? props.iconClassName : ''}`} name={props.icon}/>
        </div>
      }
      <textarea className="backoffice-textarea__field text-secondary text-secondary--detail" name={props.name} placeholder={props.placeholder} defaultValue={props.value} onChange={props.onChange}>
        {props.children}
      </textarea>
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

Textarea.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  theme: PropTypes.string,
  value: PropTypes.string,
}

Textarea.defaultProps = {
  className: '',
  icon: '',
  iconClassName: '',
  label: '',
  name: 'unset',
  onChange: () => {},
  placeholder: '',
  required: false,
}

export default Textarea
