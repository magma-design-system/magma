import React from 'react'
import PropTypes from 'prop-types'
import './Modal.scss'
import Button from '@UI/Button/Button'
import Grid from '@Layout/Grid/Grid'
import H4 from '@Typography/H4/H4'
import Icon from '@Design/Icon/Icon'

// https://soshace.com/building-react-components-using-children-props-and-context-api/#crayon-5f80341482005894162361
// https://codesandbox.io/s/github/supromikali/react-children-with-context

const Modal = props => {
  return (
    <div className={`modal ${props.className} ${props.visible ? 'modal--visible' : ''} ${props.maxHeight ? 'modal--max-height' : ''} ${props.position ? 'modal--from-' + props.position : ''}`}>
      <Icon className="modal__close" name="action-close" size="large" onClick={() => { props.onCancel() }}/>
      <div className="modal__window">
        {props.title &&
          <header className="modal__header">
            <H4 className="modal__title">
              {props.title}
            </H4>
            <Icon className="modal__close-inside" name="action-close" onClick={() => { props.onCancel() }}/>
          </header>
        }
        <div className={`modal__contents ${props.contentOnly ? 'modal__contents--clean' : ''} ${props.title ? 'modal__contents--close-outside' : ''}`}>
          {!props.title &&
            <Icon className="modal__close-inside" name="action-close" onClick={() => { props.onCancel() }}/>
          }
          {props.children}
        </div>
        {props.footer &&
          <Grid className="modal__footer" columns="2">
            <Button variant={props.cancelVariant} onClick={() => { props.onCancel() }}>
              {props.cancelButton}
            </Button>
            <Button disabled={props.confirmDisabled} variant={props.confirmVariant}
              onClick={() => { props.onConfirm() }}>
              {props.confirmButton}
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
  confirmButton: PropTypes.string,
  confirmDisabled: PropTypes.bool,
  confirmVariant: PropTypes.string,
  contentOnly: PropTypes.bool,
  footer: PropTypes.bool,
  maxHeight: PropTypes.bool,
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
  confirmButton: 'Conferma',
  confirmDisabled: false,
  confirmVariant: 'primary',
  contentOnly: false,
  footer: true,
  maxHeight: false,
  onCancel: null,
  onConfirm: null,
  position: 'right', // right || left || center
  title: '',
  visible: true,
}

export default Modal
