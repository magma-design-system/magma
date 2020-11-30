import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './BenchmarkBar.scss'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import H2 from '@Typography/H2/H2'
import ProgressBar from '@UI/ProgressBar/ProgressBar'

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

const BenchmarkBar = ({ autoColor, className, children, decimals, progress, progressText, rounded, size, ...restProps }) => {
  let status = 'info'
  let classNameText = ''

  if (autoColor) {
    status = benchmarkStatus(progress)
    classNameText = `color-status-${status}-04`
  }

  const classNameBg = `background-color-status-${status}-19`
  const progressClassName = `background-color-status-${status}-10`

  const classes = styles('benckmark-bar', {
    selectors: [
      classNameText,
      className,
    ],
  })

  const progressClassNames = styles('benckmark-bar__progress', {
    selectors: [
      classNameText,
    ],
  })

  return <Grid {...restProps} className={classes} gutter="xxsmall">
    <Row>
      {progressText && <H2 className={progressClassNames}>
        {decimals ? Number(progress).toFixed(1) : Math.round(progress)}%
      </H2>}
      {children}
    </Row>
    <ProgressBar className={classNameBg} progressClassName={progressClassName} size={size} rounded={rounded} progress={decimals ? Number(progress).toFixed(1) : Math.round(progress)}/>
  </Grid>
}

BenchmarkBar.propTypes = {
  ...Grid.propTypes,
  autoColor: PropTypes.bool,
  className: PropTypes.string,
  decimals: PropTypes.bool,
  progress: PropTypes.number,
  progressText: PropTypes.bool,
  rounded: PropTypes.bool,
  size: PropTypes.string,
}

BenchmarkBar.defaultProps = {
  autoColor: false,
  className: '',
  decimals: false,
  progress: 0,
  progressText: true,
  rounded: true,
  size: 'normal',
}

export default BenchmarkBar
export {
  benchmarkStatus,
}
