import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import './Image.scss'

import { aspectRatio } from '@Element/Image/aspectRatio'

const Image = props =>
  <Fragment>
    {props.aspectRatio
      ? <div className={`image ${props.className}`} style={aspectRatio(props.aspectRatio)}><img className="image__element" src={props.src} loading={props.loading} alt={props.alt} /></div>
      : <img className={`image ${props.className}`} src={props.src} loading={props.loading} alt={props.alt} />
    }
  </Fragment>

Image.propTypes = {
  alt: PropTypes.string,
  aspectRatio: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.string,
  src: PropTypes.string,
}

Image.defaultProps = {
  className: '',
  loading: 'lazy',
  src: '',
}

export default Image
