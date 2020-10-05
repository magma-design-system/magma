import React from 'react'
import PropTypes from 'prop-types'
import './Textarea.scss'
import Icon from '@Design/Icon/Icon'
import H3 from '@Typography/H3/H3'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'

const Textarea = props =>
  <label className={`backoffice-textarea ${props.value ? 'backoffice-textarea--filled' : ''} ${props.icon !== '' ? 'backoffice-textarea--has-icon' : ''} ${props.error ? 'backoffice-textarea--has-errors' : ''} ${props.className}`}>
    {props.label &&
      <H3 htmlTag="div" className="backoffice-textarea__label">
        {props.label}
      </H3>
    }
    {props.required &&
      <LabelCaption className="backoffice-textarea__required">
        Obbligatorio
      </LabelCaption>
    }
    {props.icon &&
      <div className="backoffice-textarea__icon-area">
        <Icon className={`backoffice-textarea__icon ${props.iconClassName !== '' ? props.iconClassName : ''}`} name={props.icon}/>
      </div>
    }
    <textarea className="backoffice-textarea__field text-secondary text-secondary--paragraph" name={props.name} placeholder={props.placeholder}>
      {props.children}
    </textarea>
    {props.error &&
      <ul className="backoffice-textarea__error">
        <li className="backoffice-textarea__error">
          <Icon className="backoffice-textarea__error-icon" name="statusError"/>
          {props.error}
        </li>
      </ul>
    }
  </label>

Textarea.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
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
  placeholder: '',
  required: false,
}

export default Textarea
