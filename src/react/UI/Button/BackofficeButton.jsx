import React from 'react'
import PropTypes from 'prop-types'
import Button from '@UI/Button/Button'
import './BackofficeButton.scss'

const BackofficeButton = props =>
  <div className="backoffice-button">
    <Button className="backoffice-button__item">
      {props.children}
    </Button>
  </div>

BackofficeButton.propTypes = {
  className: PropTypes.string,
  boxClassName: PropTypes.string,
  isChecked: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  value: PropTypes.string,
}

BackofficeButton.defaultProps = {
  className: '',
  boxClassName: '',
  isChecked: false,
  name: 'unassigned',
  onChange: value => { return value },
  onClick: () => {},
  value: '0',
}

export default BackofficeButton
