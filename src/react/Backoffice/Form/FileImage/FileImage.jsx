import React from 'react'
import PropTypes from 'prop-types'
import './FileImage.scss'
import Icon from '@Design/Icon/Icon'
import H3 from '@Typography/H3/H3'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'
import Detail from '@Typography/Detail/Detail'
import Button from '@Element/Button/Button'

const FileImage = props => {
  // const [clicked, clickHandler] = useState(false)
  const fakeImage = 'https://via.placeholder.com/1000x1400'
  return (
    <div onClick={props.onClick} className={`backoffice-file-image ${props.clicked ? 'backoffice-file-image--uploaded' : ''} ${props.icon !== '' ? 'backoffice-file-image--has-icon' : ''} ${props.error ? 'backoffice-file-image--has-errors' : ''} ${props.className}`}>
      <input type="file" className="backoffice-file-image__field"/>
      <div className="backoffice-file-image__image" style={{ backgroundImage: `url('${fakeImage}')` }}>
        <Button className="backoffice-file-image__delete" icon="crud-delete" />
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
    </div>
  )
}

FileImage.propTypes = {
  className: PropTypes.string,
  clicked: PropTypes.bool,
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
  clicked: false,
  icon: 'media-image',
  name: 'unassigned',
  onChange: value => { return value },
  onClick: () => {},
  required: false,
}

export default FileImage
