import React from 'react'
import PropTypes from 'prop-types'
import './BenchmarkBar.scss'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import H2 from '@Typography/H2/H2'
import Caption from '@Typography/Caption/Caption'
import ProgressBar from '@UI/ProgressBar/ProgressBar'

const BenchmarkBar = props =>
  <Grid className={`benckmark-bar ${props.className}`} gutter="xsmall">
    <Row>
      <H2 className="benckmark-bar__progress">{props.progress}%</H2>
      <Caption>{props.children}</Caption>
    </Row>
    <ProgressBar progress={props.progress}/>
  </Grid>

BenchmarkBar.propTypes = {
  className: PropTypes.string,
  progress: PropTypes.number,
}

BenchmarkBar.defaultProps = {
  className: '',
  progress: 0,
}

export default BenchmarkBar
