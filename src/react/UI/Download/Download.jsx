import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
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

const Download = ({ fileName, href, name, preview, target, transparencyGrid, ...restProps }) => {
  const extension = getExtension(fileName)
  const fileNameNoExt = getName(fileName, extension)
  const { description, format } = getExtensionInfos(extension)
  const { background, color, icon } = dictionary.format[format]

  const classes = styles('download', {
    selectors: [
      restProps.className,
    ],
    modifiers: {
      name,
    },
  })

  const classesFormat = styles('download__format', {
    selectors: [
      background,
      color,
    ],
  })

  const classesIcon = styles('download__icon-area', {
    modifiers: {
      transparencyGrid,
    },
  })

  return (
    <a target={target} href={href} title={fileName} className={classes}>
      <div className={classesIcon}>
        {preview
          ? <div className="download__preview" style={{ backgroundImage: `url('${href}')` }}></div>
          : <Icon name={`${icon}`} className={`download__icon ${color}`}/>
        }
      </div>
      <div className="download__info">
        <H5 htmlTag="div" className="download__name">
          <div className="download__file-name">{fileNameNoExt}</div>
          {extension !== fileNameNoExt && extension !== 'default' && <div className="download__file-ext">.{extension}</div>}
        </H5>
        <div className="download__detail">
          {extension !== 'default' && <LabelCaption className={classesFormat}>{extension}</LabelCaption> }
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
  name: PropTypes.string,
  preview: PropTypes.bool,
  target: PropTypes.string,
  transparencyGrid: PropTypes.bool,
}

Download.defaultProps = {
  className: '',
  fileName: 'File name.ext',
  href: '#',
  name: 'full',
  preview: false,
  target: '_self',
  transparencyGrid: false,
}

export default Download
