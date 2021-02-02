import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Icon from '@Design/Icon/Icon'
import './UrlPreview.scss'

import { styles } from '@Library/styles'

const urlDomain = url => {
  const domain = new URL(url)
  return domain.hostname.replace('www.', '')
}

const urlLastFragment = url => {
  return url.substring(url.lastIndexOf('/') + 1)
}

const UrlPreviewHeader = props =>
  <header className="url-preview__header">
    <Icon name="source-web" className="url-preview__icon"/>
    <div className="url-preview__url-field text-secondary text-secondary--caption">
      <div className="url-preview__domain">{urlDomain(props.url)}</div>
      {urlLastFragment(props.url) &&
        <Fragment>
          <div className="url-preview__separator">/</div>
          <div className="url-preview__frament">{urlLastFragment(props.url)}</div>
        </Fragment>
      }
    </div>
    <Icon name="action-close" className="url-preview__close" onClick={() => { props.onCancel() }}/>
  </header>

UrlPreviewHeader.propTypes = {
  url: PropTypes.string,
  onCancel: PropTypes.func,
}

const UrlPreview = ({ boxShadow, centered, className, onCancel, url, visible, wide }) => {
  const classes = styles('url-preview', {
    selectors: [
      className,
    ],
    modifiers: {
      centered,
      visible,
      wide,
    },
    scaffolded: {
      boxShadow,
    },
  })

  const windowClasses = styles('url-preview__window', {
    scaffolded: {
      boxShadow,
    },
  })

  return <div className={classes}>
    <div className={windowClasses}>
      <UrlPreviewHeader url={url} onCancel={onCancel}/>
      <iframe className="url-preview__iframe" src={url} loading="lazy"></iframe>
    </div>
  </div>
}

UrlPreview.propTypes = {
  centered: PropTypes.bool,
  className: PropTypes.string,
  onCancel: PropTypes.func,
  boxShadow: PropTypes.string,
  url: PropTypes.string,
  visible: PropTypes.bool,
  wide: PropTypes.bool,
}

UrlPreview.defaultProps = {
  centered: false,
  className: '',
  onCancel: null,
  boxShadow: 'soft',
  url: 'https://www.maggioli.com',
  visible: false,
  wide: false,
}

export default UrlPreview
