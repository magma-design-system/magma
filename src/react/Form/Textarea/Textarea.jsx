import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { ThemeContext } from '@Design/Theme/ThemeProvider'
import './Textarea.scss'
import Icon from '@Design/Icon/Icon'

const Textarea = props => {
  const state = useContext(ThemeContext)
  const themeName = `textarea--${state.name}`

  return (
    <label className={`textarea ${themeName} ${props.icon ? 'textarea--has-icon' : ''} ${props.error ? 'textarea--has-errors' : ''} ${props.className}`}>
      {props.label &&
        <div className="textarea__label text-primary text-primary--h6">
          {props.label}
        </div>
      }
      {props.icon &&
        <div className="textarea__icon-area">
          <Icon className={`textarea__icon ${props.iconClassName}`} name={props.icon}/>
        </div>
      }
      <textarea className={`textarea__field ${props.font}`} name={props.name} placeholder={props.placeholder}>
        {props.children}
      </textarea>
      {props.error &&
        <div className="input__message">
          <Detail htmlTag="div" className="input__error">
            <Icon className="input__error-icon" name="status-error"/>
            <div className="input__error-text">{props.error}</div>
          </Detail>
        </div>
      }
    </label>
  )
}

Textarea.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  font: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
}

Textarea.defaultProps = {
  className: '',
  font: 'text-secondary text-secondary--detail',
  icon: '',
  iconClassName: '',
  label: '',
  name: 'unassigned',
  placeholder: '',
}

export default Textarea
