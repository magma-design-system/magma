import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Icon from '@Design/Icon/Icon'
import './UrlPreview.scss'

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
    <Icon name="action-close" className="url-preview__close"/>
  </header>

UrlPreviewHeader.propTypes = {
  url: PropTypes.string,
}

const UrlPreview = props =>
  <div className={`url-preview url-preview--active ${props.className} ${props.shadow ? props.shadow : ''}`}>
    <div className="url-preview__window">
      <UrlPreviewHeader url={props.url}/>
      <iframe className="url-preview__iframe" src={props.url}></iframe>
    </div>
  </div>

UrlPreview.propTypes = {
  className: PropTypes.string,
  distractionFree: PropTypes.bool,
  shadow: PropTypes.string,
  url: PropTypes.string,
}

UrlPreview.defaultProps = {
  className: '',
  distractionFree: false,
  shadow: 'box-shadow-soft',
  url: 'https://www.maggioli.com',
}

export default UrlPreview
