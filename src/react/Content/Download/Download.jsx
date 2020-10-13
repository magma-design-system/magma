import React from 'react'
import PropTypes from 'prop-types'
import './Download.scss'
import Icon from '@Design/Icon/Icon'
import H5 from '@Typography/H5/H5'
import Caption from '@Typography/Caption/Caption'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'

import dictionary from './dictionary.json'

function getExtension(fileName) {
  return fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase()
}

function getName(fileName, extension) {
  return fileName.replace(`.${extension}`, '')
}

function getExtensionInfos(extension) {
  return dictionary.extension[extension] !== undefined ? dictionary.extension[extension] : dictionary.extension.default
}

const Download = props => {
  const extension = getExtension(props.fileName)
  const name = getName(props.fileName, extension)
  const { description, format } = getExtensionInfos(extension)
  const { background, color, icon } = dictionary.format[format]

  return (
    <a href={props.href} title={props.fileName} className={`download ${props.className} ${props.length ? 'download--' + props.length + '-name': ''}`}>
      <div className="download__icon-area">
        <Icon name={`${icon}`} className={`download__icon ${color}`}/>
      </div>
      <div className="download__info">
        <H5 htmlTag="div" className="download__name">
          <div className="download__file-name">{name}</div>
          {extension !== name && extension !== 'default' && <div className="download__file-ext">.{extension}</div>}
        </H5>
        <div className="download__detail">
          {extension !== 'default' && <LabelCaption className={`download__format ${color} ${background}`}>{extension}</LabelCaption> }
          <Caption className="download__description">{description}</Caption>
        </div>
      </div>
    </a>
  )
}

Download.propTypes = {
  className: PropTypes.string,
  fileName: PropTypes.string,
  href: PropTypes.string,
  length: PropTypes.string,
}

Download.defaultProps = {
  className: '',
  fileName: 'File name.ext',
  href: '#',
  length: ''
}

export default Download
