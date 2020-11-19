import React from 'react'
import PropTypes from 'prop-types'
import './Modal.scss'
import Icon from '@Design/Icon/Icon'
import Button from '@UI/Button/Button'
import H4 from '@Typography/H4/H4'

// https://soshace.com/building-react-components-using-children-props-and-context-api/#crayon-5f80341482005894162361
// https://codesandbox.io/s/github/supromikali/react-children-with-context

const Modal = props => {
  return (
    <div className={`modal ${props.className} ${props.visible ? 'modal--visible' : ''} ${props.maxHeight ? 'modal--max-height' : ''} ${props.position ? 'modal--from-' + props.position : ''}`}>
      <Icon className="modal__close" name="action-close" onClick={() => { props.onCancel() }}/>
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
          <footer className="modal__footer grid">
            <Button variant="secondary-outline" onClick={() => { props.onCancel() }}>
              Cancel
            </Button>
            <Button disabled={props.confirmDisabled} variant="primary"
              onClick={() => { props.onConfirm() }}>
              Confirm
            </Button>
          </footer>
        }
      </div>
    </div>
  )
}

Modal.propTypes = {
  className: PropTypes.string,
  confirmDisabled: PropTypes.bool,
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
  className: '',
  confirmDisabled: false,
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
