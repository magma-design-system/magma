import React from 'react'
import PropTypes from 'prop-types'
import './UploadFileImage.scss'
import { styles } from '@Library/styles'
import Icon from '@Design/Icon/Icon'
import H3 from '@Typography/H3/H3'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'
import Detail from '@Typography/Detail/Detail'
import Button from '@UI/Button/Button'

const UploadFileImage = ({ deleteImage, error, icon, iconClassName, label, name, onFileChange, placeholder, required, uriImage, ...restProps }) => {
  const HTMLElement = uriImage !== '' ? 'div' : 'label'

  const hasIcon = icon !== null
  const hasErrors = error !== null
  const uploaded = uriImage !== null

  const classes = styles('backoffice-file-image', {
    selectors: [
      restProps.className,
    ],
    modifiers: {
      hasIcon,
      hasErrors,
      uploaded,
    },
  })

  const iconClasses = styles('backoffice-file-image__icon', {
    selectors: [
      restProps.className,
      iconClassName,
    ],
  })

  return (
    <HTMLElement className={classes}>
      <input type="file" name={name} className="backoffice-file-image__field" onChange={onFileChange}/>
      <div className="backoffice-file-image__image" style={{ backgroundImage: `url('${uriImage}')` }}>
        <Button onClick={deleteImage} className="backoffice-file-image__delete" icon="crud-delete" />
      </div>
      <div className="backoffice-file-image__fake-field border-radius-small">
        {required &&
          <LabelCaption className="backoffice-file-image__required">
            Obbligatorio
          </LabelCaption>
        }
        {icon &&
          <div className="backoffice-file-image__icon-area">
            <Icon className={iconClasses} name={icon}/>
          </div>
        }
        <div className="backoffice-file-image__info">
          {label &&
            <H3 htmlTag="div" className="backoffice-file-image__label">
              {label}
            </H3>
          }
          {placeholder &&
            <Detail className="backoffice-file-image__placeholder">
              {placeholder}
            </Detail>
          }
        </div>
      </div>
      {error &&
        <div className="backoffice-input__message">
          <Detail htmlTag="div" className="backoffice-input__error">
            <Icon className="backoffice-input__error-icon" name="status-error"/>
            <div className="backoffice-input__error-text">{error}</div>
          </Detail>
        </div>
      }
    </HTMLElement>
  )
}

UploadFileImage.propTypes = {
  className: PropTypes.string,
  deleteImage: PropTypes.func,
  error: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onFileChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  uriImage: PropTypes.string,
}

UploadFileImage.defaultProps = {
  deleteImage: () => {},
  icon: 'media-image',
  name: 'unassigned',
  onFileChange: () => {},
  required: false,
  uriImage: '',
}

export default UploadFileImage
