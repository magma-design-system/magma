import React from 'react'
import PropTypes from 'prop-types'
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

const BenchmarkBar = props => {
  let status = 'info'
  let classNameText = ''

  if (props.autoColor) {
    status = benchmarkStatus(props.progress)
    classNameText = `color-status-${status}-04`
  }

  const className = `background-color-status-${status}-19`
  const progressClassName = `background-color-status-${status}-10`

  return <Grid className={`benckmark-bar ${props.className} ${classNameText}`} gutter="xxsmall">
    <Row>
      <H2 className={`benckmark-bar__progress ${classNameText}`}>{props.progress}%</H2>
      {props.children}
    </Row>
    <ProgressBar className={className} progressClassName={progressClassName} size={props.size} rounded={props.rounded} progress={props.progress}/>
  </Grid>
}

BenchmarkBar.propTypes = {
  autoColor: PropTypes.bool,
  className: PropTypes.string,
  progress: PropTypes.number,
  rounded: PropTypes.bool,
  size: PropTypes.string,
}

BenchmarkBar.defaultProps = {
  autoColor: false,
  className: '',
  progress: 0,
  rounded: true,
  size: 'normal',
}

export default BenchmarkBar
export {
  benchmarkStatus,
}
