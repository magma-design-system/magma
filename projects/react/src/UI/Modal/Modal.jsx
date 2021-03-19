import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Modal.scss'
import Button from '@UI/Button/Button'
import Grid from '@Layout/Grid/Grid'
import H4 from '@Typography/H4/H4'
import Icon from '@Design/Icon/Icon'

// https://soshace.com/building-react-components-using-children-props-and-context-api/#crayon-5f80341482005894162361
// https://codesandbox.io/s/github/supromikali/react-children-with-context

const Modal = ({ cancelButton, cancelVariant, className, classNameWindow, confirmButton, confirmDisabled, confirmVariant, contentOnly, footer, maxHeight, maxWidth, onCancel, onConfirm, position, title, visible, ...restProps }) => {
  const classes = styles('modal', {
    selectors: [
      className,
    ],
    modifiers: {
      visible,
      maxHeight,
      maxWidth,
      position,
    },
  })

  const classesWindow = styles('modal__window', {
    selectors: [
      classNameWindow,
    ],
  })

  return (
    <div className={classes}>
      <Icon className="modal__close" name="action-close" size="large" onClick={() => { onCancel() }}/>
      <div className={classesWindow}>
        {title &&
          <header className="modal__header">
            <H4 className="modal__title">
              {title}
            </H4>
            <Icon className="modal__close-inside" name="action-close" onClick={() => { onCancel() }}/>
          </header>
        }
        <div className={`modal__contents ${contentOnly ? 'modal__contents--clean' : ''} ${title ? 'modal__contents--close-outside' : ''}`}>
          {!title &&
            <Icon className="modal__close-inside" name="action-close" onClick={() => { onCancel() }}/>
          }
          {restProps.children}
        </div>
        {footer &&
          <Grid className="modal__footer" columns="2">
            <Button variant={cancelVariant} onClick={() => { onCancel() }}>
              {cancelButton}
            </Button>
            <Button disabled={confirmDisabled} variant={confirmVariant}
              onClick={() => { onConfirm() }}>
              {confirmButton}
            </Button>
          </Grid>
        }
      </div>
    </div>
  )
}

Modal.propTypes = {
  cancelButton: PropTypes.string,
  cancelVariant: PropTypes.string,
  className: PropTypes.string,
  classNameWindow: PropTypes.string,
  confirmButton: PropTypes.string,
  confirmDisabled: PropTypes.bool,
  confirmVariant: PropTypes.string,
  contentOnly: PropTypes.bool,
  footer: PropTypes.bool,
  maxHeight: PropTypes.bool,
  maxWidth: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  position: PropTypes.string,
  title: PropTypes.string,
  visible: PropTypes.bool,
}

Modal.defaultProps = {
  cancelButton: 'Annulla',
  cancelVariant: 'secondary-outline',
  className: '',
  classNameWindow: '',
  confirmButton: 'Conferma',
  confirmDisabled: false,
  confirmVariant: 'primary',
  contentOnly: false,
  footer: true,
  maxHeight: false,
  maxWidth: false,
  onCancel: null,
  onConfirm: null,
  position: 'right', // right || left || center
  title: '',
  visible: true,
}

export default Modal
