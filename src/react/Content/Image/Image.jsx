import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import './Image.scss'
import ExternalLink from '@UI/ExternalLink/ExternalLink'

import { aspectRatioPaddingTop } from '@Content/Image/aspectRatio'

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

const Image = props => {
  const HtmlTag = props.htmlTag.toLowerCase()
  let styles = {}
  if (props.aspectRatio) {
    styles = {
      backgroundImage: 'url(' + props.src + ')',
      backgroundPosition: props.aspectRatioPosition,
      paddingTop: aspectRatioPaddingTop(props.aspectRatio),
    }
  }
  return (
    <Fragment>
      {props.aspectRatio
        ? <HtmlTag className={`image ${props.className}`}>
          <div className="image__container" style={styles}></div>
          {props.sourceTitle + props.sourceUrl !== '' && <ImageSource title={props.sourceTitle} url={props.sourceUrl} /> }
        </HtmlTag>
        : <HtmlTag className={`image ${props.className}`}>
          <img className="image__element" src={props.src} loading={props.loading} alt={props.alt} />
          {props.sourceTitle + props.sourceUrl !== '' && <ImageSource title={props.sourceTitle} url={props.sourceUrl} /> }
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
  className: '',
  htmlTag: 'figure',
  loading: 'lazy',
  aspectRatioPosition: '50% 0',
  sourceTitle: '',
  sourceUrl: '',
  src: '',
}

export default Image
