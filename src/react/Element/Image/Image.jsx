import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import './Image.scss'
import Link from '@Element/Link/Link'

import { aspectRatio } from '@Element/Image/aspectRatio'

const ImageSource = props =>
  <div className="image__source">
    { props.url
      ? <Link href={props.url}>{ props.title ? props.title : props.url }</Link>
      : props.title
    }
  </div>

ImageSource.propTypes = {
  title: PropTypes.string,
  url: PropTypes.string,
}

const Image = props =>
  <Fragment>
    {props.aspectRatio
      ? <div className={`image ${props.className}`}>
        <div className="image__container" style={aspectRatio(props.aspectRatio)}>
          <img className="image__element" src={props.src} loading={props.loading} alt={props.alt} />
        </div>
        {props.sourceTitle && props.sourceUrl && <ImageSource title={props.sourceTitle} url={props.sourceUrl} /> }
      </div>
      : <div className={`image ${props.className}`}>
        <img className="image__element" src={props.src} loading={props.loading} alt={props.alt} />
        {props.sourceTitle && props.sourceUrl && <ImageSource title={props.sourceTitle} url={props.sourceUrl} /> }
      </div>
    }
  </Fragment>

Image.propTypes = {
  alt: PropTypes.string,
  aspectRatio: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.string,
  src: PropTypes.string,
  sourceTitle: PropTypes.string,
  sourceUrl: PropTypes.string,
}

Image.defaultProps = {
  className: '',
  loading: 'lazy',
  src: '',
}

export default Image
