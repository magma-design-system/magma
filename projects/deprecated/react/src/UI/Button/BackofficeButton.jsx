import React from 'react'
import Button from '@UI/Button/Button'
import './BackofficeButton.scss'

const BackofficeButton = props =>
  <div className="backoffice-button">
    <Button {...props} className="backoffice-button__item">
      {props.children}
    </Button>
  </div>

BackofficeButton.propTypes = {
  ...Button.propTypes,
}

BackofficeButton.defaultProps = {
  ...Button.defaultProps,
}

export default BackofficeButton
