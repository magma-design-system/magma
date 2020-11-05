import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import './Modal.scss'
import Icon from '@Design/Icon/Icon'
import Button from '@UI/Button/Button'
import H4 from '@Typography/H4/H4'

// https://soshace.com/building-react-components-using-children-props-and-context-api/#crayon-5f80341482005894162361
// https://codesandbox.io/s/github/supromikali/react-children-with-context

const Modal = props => {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (props.show) {
      setShow(props.show)
    }
  }, [props.show])
  return (
    <div className={`modal ${props.className} ${show ? 'modal--active' : ''} ${props.desktopMode ? 'modal--centered' : ''} modal--to-${props.position}`}>
      <Icon className="modal__close" name="close" onClick={() => setShow(false)}/>
      <div className="modal__window">
        {props.title &&
          <header className="modal__header">
            <H4 className="modal__title">
              {props.title}
            </H4>
            <Icon className="modal__close-inside" name="action-close" onClick={() => setShow(false)}/>
          </header>
        }
        <div className={`modal__contents ${props.contentOnly ? 'modal__contents--clean' : ''} ${props.title ? 'modal__contents--close-outside' : ''}`}>
          {!props.title &&
            <Icon className="modal__close-inside" name="action-close" onClick={() => setShow(false)}/>
          }
          {props.children}
        </div>
        {props.onConfirm &&
          <footer className="modal__footer grid">
            <Button variant="secondary-outline" onClick={() => { props.onClose() }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => { props.onConfirm() }}>
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
  contentOnly: PropTypes.bool,
  desktopMode: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  position: PropTypes.string,
  show: PropTypes.bool,
  title: PropTypes.string,
}

Modal.defaultProps = {
  className: '',
  contentOnly: false,
  desktopMode: false,
  onClose: null,
  onConfirm: null,
  position: 'right', // right || left
  show: true,
  title: '',
}

export default Modal
