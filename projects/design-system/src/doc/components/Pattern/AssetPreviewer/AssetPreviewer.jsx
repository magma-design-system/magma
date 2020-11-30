import React from 'react'
import PropTypes from 'prop-types'

import Image from '@Content/Image/Image'
import './AssetPreviewer.scss'

const AssetPreviewer = props =>
  <div className={`ds-asset-previewer ${props.className ? 'ds-asset-previewer--no-bg-tester ' + props.className : ''}`}>
    <Image className="ds-asset-previewer__preview" src={props.src}/>
  </div>

AssetPreviewer.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string,
}

AssetPreviewer.defaultProps = {
  className: '',
  src: '',
}

export default AssetPreviewer
