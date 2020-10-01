import React from 'react'
import PropTypes from 'prop-types'
import ButtonItem from '@Form/Button/Button'
import './Button.scss'

const Button = props =>
  <div className="backend-button">
    <ButtonItem className="backend-button__item">
      {props.children}
    </ButtonItem>
  </div>

Button.propTypes = {
  className: PropTypes.string,
  boxClassName: PropTypes.string,
  isChecked: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
}

Button.defaultProps = {
  className: '',
  boxClassName: '',
  isChecked: false,
  name: 'unassigned',
  onChange: value => { return value },
  value: '0',
}

export default Button
