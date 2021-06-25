import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Download.scss'
import Icon from '@Design/Icon/Icon'
import H5 from '@Typography/H5/H5'
import Caption from '@Typography/Caption/Caption'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'

import dictionary from './dictionary.json'

function getExtension(fileName) {
  const extension = fileName.split('.').pop()
  return fileName !== extension ? extension : 'default'
}

function getName(fileName, extension) {
  return fileName.replace(`.${extension}`, '')
}

function getExtensionInfos(extension) {
  return dictionary.extension[extension] !== undefined ? dictionary.extension[extension] : dictionary.extension.default
}

const DownloadContent = ({ description, fileName, preview, transparencyGrid }) => {
  const extension = getExtension(fileName)
  const fileNameNoExt = getName(fileName, extension)
  const { extDescription, format } = getExtensionInfos(extension.toLowerCase())
  const { background, color, icon } = dictionary.format[format]

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
    <Fragment>
      <div className={classesIcon}>
        {preview
          ? <div className="download__preview" style={{ backgroundImage: `url('${preview}')` }}></div>
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
          <Caption className="download__description">{description || extDescription}</Caption>
        </div>
      </div>
    </Fragment>
  )
}

DownloadContent.propTypes = {
  description: PropTypes.string,
  fileName: PropTypes.string,
  preview: PropTypes.string,
  transparencyGrid: PropTypes.bool,
}

DownloadContent.defaultProps = {
  fileName: 'Missing filename',
}

const Download = ({ className, fileName, href, name, target, ...restProps }) => {
  const classes = styles('download', {
    selectors: [
      className,
    ],
    modifiers: {
      name,
    },
  })

  return (
    <Fragment>
      { href
        ? <a target={target} {...restProps} href={href} download={fileName} title={fileName} className={classes}>
          <DownloadContent fileName={fileName} preview={restProps.preview} description={restProps.description} transparencyGrid={restProps.transparencyGrid}/>
        </a>
        : <div className={classes} {...restProps}>
          <DownloadContent fileName={fileName} preview={restProps.preview} description={restProps.description} transparencyGrid={restProps.transparencyGrid}/>
        </div>
      }
    </Fragment>
  )
}

Download.propTypes = {
  ...DownloadContent.propTypes,
  className: PropTypes.string,
  href: PropTypes.string,
  name: PropTypes.string,
  target: PropTypes.string,
}

Download.defaultProps = {
  ...DownloadContent.defaultProps,
  name: 'full',
  target: '_self',
}

export default Download
