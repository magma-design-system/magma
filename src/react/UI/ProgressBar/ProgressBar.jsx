import React from 'react'
import PropTypes from 'prop-types'
import './ProgressBar.scss'

import { benchmarkStatus } from '@Content/BenchmarkBar/BenchmarkBar'

const ProgressBar = props => {
  let status = 'info'
  let className = ''
  let progressClassName = ''

  if (props.autoColor) {
    status = benchmarkStatus(props.progress)
    className = `background-color-status-${status}-19`
    progressClassName = `background-color-status-${status}-10`
  }

  return <div className={`progress-bar ${props.className} ${className} ${props.size ? 'progress-bar--size-' + props.size : ''} ${props.radius ? 'progress-bar--radius-' + props.radius : ''}`}>
    <div className={`progress-bar__inner ${props.progressClassName} ${progressClassName}`} style={{ width: `${props.progress}%` }}></div>
  </div>
}

ProgressBar.propTypes = {
  autoColor: PropTypes.bool,
  className: PropTypes.string,
  progress: PropTypes.number,
  progressClassName: PropTypes.string,
  radius: PropTypes.string,
  size: PropTypes.string,
}

ProgressBar.defaultProps = {
  autoColor: false,
  className: '',
  progress: 0,
  progressClassName: '',
  radius: 'xxlarge',
  size: 'normal',
}

export default ProgressBar
