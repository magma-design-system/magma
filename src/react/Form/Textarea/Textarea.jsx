import React from 'react'
import PropTypes from 'prop-types'
import './Textarea.scss'
import Icon from '@Design/Icon/Icon'

const Textarea = props =>
  <label className={`textarea ${props.icon ? 'textarea--has-icon' : ''} ${Object.keys(props.errors).length > 0 ? 'textarea--has-errors' : ''}  ${props.className}`}>
    {props.label &&
      <div className="textarea__label text-sans text-sans--h6">
        {props.label}
      </div>
    }
    {props.icon &&
      <div className="textarea__icon-area">
        <Icon className={`textarea__icon ${props.iconClassName}`} name={props.icon}/>
      </div>
    }
    <textarea className="textarea__field text-sans text-sans--paragraph" name={props.name} placeholder={props.placeholder}>
      {props.children}
    </textarea>
    <ul className="textarea__errors">
      {Object.keys(props.errors).map(name =>
        <li className="textarea__error">
          <Icon className="textarea__error-icon" name={props.errors[name].type}/>
          {props.errors[name].message}
        </li>,
      )}
    </ul>
  </label>

Textarea.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.object,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
}

Textarea.defaultProps = {
  className: '',
  errors: {},
  icon: '',
  iconClassName: '',
  label: '',
  name: 'unassigned',
  placeholder: '',
}

export default Textarea
