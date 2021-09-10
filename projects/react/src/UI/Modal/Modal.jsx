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

const Modal = ({ cancelButton, cancelVariant, className, classNameContents, classNameWindow, confirmButton, confirmDisabled, confirmVariant, contentOnly, footer, maxHeight, maxWidth, onCancel, onConfirm, position, title, visible, ...restProps }) => {

  let maxWidthSelector = typeof maxWidth === 'boolean' ? 'modal--max-width' : null

  if (typeof maxWidth !== 'boolean') {
    maxWidthSelector = 'modal--max-width-hardcoded'
  }

  if (maxWidth === undefined) {
    maxWidthSelector = undefined
  }

  const classes = styles('modal', {
    selectors: [
      className,
      maxWidthSelector,
    ],
    modifiers: {
      visible,
      maxHeight,
      position,
    },
  })

  const classesWindow = styles('modal__window', {
    selectors: [
      classNameWindow,
    ],
  })

  const classesContents = styles('modal__contents', {
    selectors: [
      classNameContents,
      contentOnly ? 'modal__contents--clean' : '',
      title ? 'modal__contents--close-outside' : '',
    ],
  })

  return (
    <div className={classes}>
      <Icon className="modal__close" name="action-close" size="large" onClick={() => { onCancel() }}/>
      <div className={classesWindow} style={{ maxWidth: typeof maxWidth !== 'boolean' ? `${maxWidth}px` : undefined }}>
        {title &&
          <header className="modal__header">
            <H4 className="modal__title">
              {title}
            </H4>
            <Icon className="modal__close-inside" name="action-close" onClick={() => { onCancel() }}/>
          </header>
        }
        <div className={classesContents}>
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
  classNameContents: PropTypes.string,
  confirmButton: PropTypes.string,
  confirmDisabled: PropTypes.bool,
  confirmVariant: PropTypes.string,
  contentOnly: PropTypes.bool,
  footer: PropTypes.bool,
  maxHeight: PropTypes.bool,
  maxWidth: PropTypes.any,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  position: PropTypes.string,
  title: PropTypes.string,
  visible: PropTypes.bool,
}

Modal.defaultProps = {
  cancelButton: 'Annulla',
  cancelVariant: 'secondary-outline',
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
