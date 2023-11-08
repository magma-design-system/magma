import React from 'react'
import PropTypes from 'prop-types'
import Icon from '@Design/Icon/Icon'
import './UrlPreview.scss'

import { styles } from '@Library/styles'

const urlDomain = url => {
  const domain = new URL(url)
  return domain.hostname.replace('www.', '')
}

const UrlPreviewHeader = ({ onCancel, title, url, ...restProps }) =>
  <header className="url-preview__header" {...restProps}>
    <Icon name="source-web" className="url-preview__icon"/>
    {typeof title === 'boolean' && title && <div className="url-preview__url-field text-secondary text-secondary--caption">{urlDomain(url)}</div>}
    {typeof title === 'boolean' && !title && <div className="url-preview__url-field text-secondary text-secondary--caption"></div>}
    {typeof title === 'string' && <div className="url-preview__url-field text-secondary text-secondary--caption">{title}</div>}
    <Icon name="action-close" className="url-preview__close" onClick={() => { onCancel() }}/>
  </header>

UrlPreviewHeader.propTypes = {
  onCancel: PropTypes.func,
  title: PropTypes.any,
  url: PropTypes.string,
}

UrlPreviewHeader.defaultProps = {
  onCancel: null,
  title: true,
  url: 'https://www.maggioli.com',
}

const UrlPreview = ({ centered, className, onCancel, size, title, url, visible, windowClassName, ...restProps }) => {
  const classes = styles('url-preview', {
    selectors: [
      className,
    ],
    modifiers: {
      centered,
      visible,
      size,
    },
  })

  const windowClasses = styles('url-preview__window', {
    selectors: [
      windowClassName,
    ],
  })

  return <div className={classes} {...restProps}>
    <div className={windowClasses}>
      <UrlPreviewHeader url={url} onCancel={onCancel} title={title}/>
      <iframe className="url-preview__iframe" src={url} loading="lazy"></iframe>
    </div>
  </div>
}

UrlPreview.propTypes = {
  ...UrlPreviewHeader.propTypes,
  centered: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.string,
  visible: PropTypes.bool,
  windowClassName: PropTypes.string,
}

UrlPreview.defaultProps = {
  ...UrlPreviewHeader.defaultProps,
  centered: false,
  windowClassName: 'shadow-lg',
  visible: false,
  size: 'small',
}

export default UrlPreview
