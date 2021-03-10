import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import './Image.scss'
import ExternalLink from '@UI/ExternalLink/ExternalLink'

import { aspectRatioPaddingTop } from '@Content/Image/aspectRatio'

import { styles } from '@Library/styles'

const ImageSource = props =>
  <figcaption className="image__source text-secondary text-secondary--detail">
    { props.url
      ? <ExternalLink href={props.url}>{ props.title ? props.title : props.url }</ExternalLink>
      : <div>{props.title}</div>
    }
  </figcaption>

ImageSource.propTypes = {
  title: PropTypes.string,
  url: PropTypes.string,
}

const Image = ({ alt, aspectRatio, aspectRatioPosition, className, htmlTag, loading, sourceTitle, sourceUrl, src, ...restProps }) => {
  const classes = styles('image', {
    selectors: [
      className,
    ],
  })

  const HtmlTag = htmlTag.toLowerCase()
  let imageStyles = {}
  if (aspectRatio) {
    imageStyles = {
      backgroundImage: 'url(' + src + ')',
      backgroundPosition: aspectRatioPosition,
      paddingTop: aspectRatioPaddingTop(aspectRatio),
    }
  }

  return (
    <Fragment>
      {aspectRatio
        ? <HtmlTag className={classes} {...restProps}>
          <div className="image__container" style={imageStyles}></div>
          {sourceTitle + sourceUrl !== '' && <ImageSource title={sourceTitle} url={sourceUrl} /> }
        </HtmlTag>
        : <HtmlTag className={classes} {...restProps}>
          <img className="image__element" src={src} loading={loading} alt={alt} />
          {sourceTitle + sourceUrl !== '' && <ImageSource title={sourceTitle} url={sourceUrl} /> }
        </HtmlTag>
      }
    </Fragment>
  )
}

Image.propTypes = {
  alt: PropTypes.string,
  aspectRatio: PropTypes.string,
  aspectRatioPosition: PropTypes.string,
  className: PropTypes.string,
  htmlTag: PropTypes.string,
  loading: PropTypes.string,
  sourceTitle: PropTypes.string,
  sourceUrl: PropTypes.string,
  src: PropTypes.string,
}

Image.defaultProps = {
  htmlTag: 'figure',
  loading: 'lazy',
  aspectRatioPosition: '50% 0',
  sourceTitle: '',
  sourceUrl: '',
  src: '',
}

export default Image
