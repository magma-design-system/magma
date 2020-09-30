import React from 'react'
import PropTypes from 'prop-types'

import './Picture.scss'
import { aspectRatio } from '@Media/Image/aspectRatio'

function getDefaultSrc(sources) {
  let defaultSrc = ''
  sources.map((item, index) => {
    if (index === 0) {
      defaultSrc = item.srcset
    }
  })

  return defaultSrc
}

const Picture = props =>
  <picture className={`picture ${props.className}`} style={props.aspectRatio ? aspectRatio(props.aspectRatio) : {} }>
    {
      props.sources.map((item, index) =>
        <source key={index} media={item.media} srcSet={item.srcset} />,
      )
    }
    <img className="picture__image" src={getDefaultSrc(props.sources)} loading={props.loading} alt={props.alt} />
  </picture>

Picture.propTypes = {
  aspectRatio: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.string,
  sources: PropTypes.array,
}

Picture.defaultProps = {
  className: '',
  loading: 'lazy',
}

export default Picture
