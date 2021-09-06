import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './BenchmarkBar.scss'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import LabelDetail from '@Typography/LabelDetail/LabelDetail'
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

const BenchmarkBar = ({ autoColor, className, children, decimals, progress, progressText, radius, rounded, size, ...restProps }) => {
  let status = 'info'

  if (autoColor) {
    status = benchmarkStatus(progress)
  }

  const classNameBg = `background-color-status-${status}-19`
  const progressClassName = `background-color-status-${status}-10`

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
  decimals: PropTypes.bool,
  progress: PropTypes.number,
  progressText: PropTypes.string,
  rounded: PropTypes.bool,
  radius: PropTypes.string,
  size: PropTypes.string,
}

BenchmarkBar.defaultProps = {
  autoColor: false,
  className: '',
  decimals: false,
  progress: 0,
  rounded: true,
  radius: 'xsmall',
  size: 'xsmall',
}

export default BenchmarkBar
export {
  benchmarkStatus,
}
