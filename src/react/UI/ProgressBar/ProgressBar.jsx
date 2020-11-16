import React from 'react'
import PropTypes from 'prop-types'
import './ProgressBar.scss'

const ProgressBar = props =>
  <div className={`progress-bar ${props.className} ${props.size ? 'progress-bar--size-' + props.size : ''} ${props.rounded ? 'progress-bar--rounded' : ''}`}>
    <div className={`progress-bar__inner ${props.progressClassName}`} style={{ width: `${props.progress}%` }}></div>
  </div>

ProgressBar.propTypes = {
  className: PropTypes.string,
  progress: PropTypes.number,
  progressClassName: PropTypes.string,
  rounded: PropTypes.bool,
  size: PropTypes.string,
}

ProgressBar.defaultProps = {
  className: '',
  progress: 0,
  progressClassName: '',
  rounded: true,
  size: 'normal',
}

export default ProgressBar
