import React from 'react'
import PropTypes from 'prop-types'
import { aspectRatio } from '@Content/Image/aspectRatio'
import './Picture.scss'

function getDefaultSrc(sources) {
  let defaultSrc = ''
  sources.map((item, index) => {
    if (index === 0) {
      defaultSrc = item.srcset
    }
  })

  return defaultSrc
}

function getMediaQuery(item) {
  console.log(item)
  if ({}.hasOwnProperty.call(item, 'minWidth')) {
    return `(min-width: ${item.minWidth}px)`
  }

  if ({}.hasOwnProperty.call(item, 'maxWidth')) {
    return `(max-width: ${item.maxWidth}px)`
  }

  return '()'
}

const Picture = props =>
  <picture className={`picture ${props.className}`}>
    {
      props.sources.reverse().map((item, index) =>
        <source className="picture__source" key={index} media={getMediaQuery(item)} srcSet={item.srcset} />,
      )
    }
    <img className="picture__image" src={props.src} loading={props.loading} alt={props.alt} />
  </picture>

Picture.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.string,
  sources: PropTypes.array,
  src: PropTypes.string,
}

Picture.defaultProps = {
  className: '',
  loading: 'lazy',
}

export default Picture
