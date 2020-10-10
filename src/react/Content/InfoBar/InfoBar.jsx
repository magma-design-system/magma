import React from 'react'
import PropTypes from 'prop-types'
import './InfoBar.scss'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import H2 from '@Typography/H2/H2'
import Caption from '@Typography/Caption/Caption'

const InfoBar = props =>
  <Grid className={`info-bar ${props.className}`} gutter="xsmall">
    <Row>
      <H2 className="info-bar__perc">{props.perc}%</H2>
      <Caption>{props.children}</Caption>
    </Row>
    <div className="info-bar__outer">
      <div className="info-bar__inner" style={{ width: `${props.perc}%` }}></div>
    </div>
  </Grid>

InfoBar.propTypes = {
  className: PropTypes.string,
  perc: PropTypes.number,
}

InfoBar.defaultProps = {
  className: '',
  perc: 0,
}

export default InfoBar
