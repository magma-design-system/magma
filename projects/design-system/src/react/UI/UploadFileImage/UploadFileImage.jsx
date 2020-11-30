import React from 'react'
import PropTypes from 'prop-types'
import './UploadFileImage.scss'
import Icon from '@Design/Icon/Icon'
import H3 from '@Typography/H3/H3'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'
import Detail from '@Typography/Detail/Detail'
import Button from '@UI/Button/Button'

const UploadFileImage = props => {
  const HTMLElement = props.uriImage !== '' ? 'div' : 'label'
  return (
    <HTMLElement className={`backoffice-file-image ${props.uriImage !== '' ? 'backoffice-file-image--uploaded' : ''} ${props.icon !== '' ? 'backoffice-file-image--has-icon' : ''} ${props.error ? 'backoffice-file-image--has-errors' : ''} ${props.className}`}>
      <input type="file" className="backoffice-file-image__field" onChange={props.onFileChange}/>
      <div className="backoffice-file-image__image" style={{ backgroundImage: `url('${props.uriImage}')` }}>
        <Button onClick={props.deleteImage} className="backoffice-file-image__delete" icon="crud-delete" />
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
            <Detail className="backoffice-file-image__placeholder">
              {props.placeholder}
            </Detail>
          }
        </div>
      </div>
    </HTMLElement>
  )
}

UploadFileImage.propTypes = {
  className: PropTypes.string,
  clicked: PropTypes.bool,
  deleteImage: PropTypes.func,
  error: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  isChecked: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onFileChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  uriImage: PropTypes.string,
  value: PropTypes.string,
}

UploadFileImage.defaultProps = {
  className: '',
  clicked: false,
  deleteImage: () => {},
  icon: 'media-image',
  name: 'unassigned',
  onChange: value => { return value },
  onClick: () => {},
  onFileChange: () => {},
  required: false,
  uriImage: '',
}

export default UploadFileImage
