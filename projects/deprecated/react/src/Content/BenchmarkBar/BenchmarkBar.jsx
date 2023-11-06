import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './BenchmarkBar.scss'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import LabelDetail from '@Typography/LabelDetail/LabelDetail'
import ProgressBar from '@UI/ProgressBar/ProgressBar'

const benchmarkVariants = {
  info: {
    background: 'bg-adjust-tone-19',
    progress: 'bg-status-info-10',
  },
  success: {
    background: 'bg-status-success-19',
    progress: 'bg-status-success-10',
  },
  warning: {
    background: 'bg-status-warning-19',
    progress: 'bg-status-warning-10',
  },
  error: {
    background: 'bg-status-error-19',
    progress: 'bg-status-error-10',
  },
}

const benchmarkStatus = progress => {
  let status = 'success'
  if (progress < 70) {
    status = 'warning'
  }
  if (progress < 40) {
    status = 'error'
  }
  return status
}

const benchmarkStatusInvert = progress => {
  let status = 'error'
  if (progress < 70) {
    status = 'warning'
  }
  if (progress < 40) {
    status = 'success'
  }
  return status
}

const BenchmarkBar = ({ autoColor, className, colorInvert, children, decimals, progress, progressText, radius, rounded, size, ...restProps }) => {
  let status = 'info'

  if (autoColor) {
    status = colorInvert ? benchmarkStatusInvert(progress) : benchmarkStatus(progress)
  }

  const classNameBg = benchmarkVariants[status].background
  const progressClassName = benchmarkVariants[status].progress

  const classes = styles('benckmark-bar', {
    selectors: [
      className,
    ],
  })

  return <Grid {...restProps} className={classes} gutter="xxsmall">
    <Row>
      <LabelDetail title={children} className="benckmark-bar__text"><b>{children}</b></LabelDetail>
      <LabelDetail className="benckmark-bar__progress">
        { progressText
          ? <b>{ progressText }</b>
          : <b>{ decimals ? Number(progress).toFixed(1) : Math.round(progress) }%</b>
        }
      </LabelDetail>
    </Row>
    <ProgressBar className={classNameBg} progressClassName={progressClassName} size={size} radius={radius} rounded={rounded} progress={decimals ? Number(progress).toFixed(1) : Math.round(progress)}/>
  </Grid>
}

BenchmarkBar.propTypes = {
  ...Grid.propTypes,
  autoColor: PropTypes.bool,
  className: PropTypes.string,
  colorInvert: PropTypes.bool,
  decimals: PropTypes.bool,
  progress: PropTypes.number,
  progressText: PropTypes.string,
  radius: PropTypes.string,
  rounded: PropTypes.bool,
  size: PropTypes.string,
}

BenchmarkBar.defaultProps = {
  autoColor: false,
  className: '',
  colorInvert: false,
  decimals: false,
  progress: 0,
  radius: 'xsmall',
  rounded: true,
  size: 'xsmall',
}

export default BenchmarkBar
export {
  benchmarkStatus,
}
