import React, { useState } from 'react'
import PropTypes from 'prop-types'
import './FileImage.scss'
import Icon from '@Design/Icon/Icon'
import H3 from '@Typography/H3/H3'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Button from '@Element/Button/Button'

const FileImage = props => {
  const [clicked, clickHandler] = useState(false)
  const fakeImage = 'https://via.placeholder.com/1000x1400'
  return (
    <div onClick={() => clickHandler(!clicked)} className={`backoffice-file-image ${clicked ? 'backoffice-file-image--uploaded' : ''} ${props.icon !== '' ? 'backoffice-file-image--has-icon' : ''} ${props.error ? 'backoffice-file-image--has-errors' : ''} ${props.className}`}>
      <input type="file" className="backoffice-file-image__field"/>
      <div className="backoffice-file-image__image" style={{ backgroundImage: `url('${fakeImage}')` }}>
        <Button className="backoffice-file-image__delete" icon="delete" />
      </div>
      <div className="backoffice-file-image__fake-field">
        {props.required &&
          <LabelCaption className="backoffice-file-image__required">
            Obbligatorio
          </LabelCaption>
        }
        {props.icon &&
          <div className="backoffice-file-image__icon-area">
            <Icon className={`backoffice-file-image__icon ${props.iconClassName !== '' ? props.iconClassName : ''}`} name={props.icon}/>
          </div>
        }
        <div className="backoffice-file-image__info">
          {props.label &&
            <H3 htmlTag="div" className="backoffice-file-image__label">
              {props.label}
            </H3>
          }
          {props.placeholder &&
            <Paragraph className="backoffice-file-image__placeholder">
              {props.placeholder}
            </Paragraph>
          }
        </div>
      </div>
    </div>
  )
}

FileImage.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  error: PropTypes.string,
  isChecked: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
}

FileImage.defaultProps = {
  className: '',
  icon: 'file',
  name: 'unassigned',
  onChange: value => { return value },
  onClick: () => {},
  required: 'false',
}

export default FileImage
