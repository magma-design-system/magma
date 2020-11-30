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
    <Icon name="action-close" className="url-preview__close" onClick={() => { props.onCancel() }}/>
  </header>

UrlPreviewHeader.propTypes = {
  url: PropTypes.string,
  onCancel: PropTypes.func,
}

const UrlPreview = props =>
  <div className={`url-preview ${props.className} ${props.visible ? 'url-preview--visible' : ''} ${props.wide ? 'url-preview--wide' : ''} ${props.centered ? 'url-preview--centered' : ''}`}>
    <div className={`url-preview__window ${props.shadow ? props.shadow : ''}`}>
      <UrlPreviewHeader url={props.url} onCancel={props.onCancel}/>
      <iframe className="url-preview__iframe" src={props.url} loading="lazy"></iframe>
    </div>
  </div>

UrlPreview.propTypes = {
  centered: PropTypes.bool,
  className: PropTypes.string,
  distractionFree: PropTypes.bool,
  onCancel: PropTypes.func,
  shadow: PropTypes.string,
  url: PropTypes.string,
  visible: PropTypes.bool,
  wide: PropTypes.bool,
}

UrlPreview.defaultProps = {
  centered: false,
  className: '',
  distractionFree: false,
  onCancel: null,
  shadow: 'box-shadow-soft',
  url: 'https://www.maggioli.com',
  visible: false,
  wide: false,
}

export default UrlPreview
