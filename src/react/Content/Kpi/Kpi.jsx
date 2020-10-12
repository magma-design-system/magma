// Key Performance Indicators

import React from 'react'
import PropTypes from 'prop-types'
import './Kpi.scss'

import Grid from '@Layout/Grid/Grid'
import H2 from '@Typography/H2/H2'
import LabelParagraph from '@Typography/LabelParagraph/LabelParagraph'
import Icon from '@Design/Icon/Icon'

const KpiItem = props =>
  <div className={`kpi__item ${props.className}`}>
    {props.icon && <Icon className="kpi__icon" name={ props.icon }/>}
    <H2 className="kpi__title">{props.amount}</H2>
    <LabelParagraph>{props.children}</LabelParagraph>
  </div>

KpiItem.propTypes = {
  amount: PropTypes.number,
  className: PropTypes.string,
  icon: PropTypes.string,
}

KpiItem.defaultProps = {
  amount: 0,
  className: '',
}

const Kpi = props =>
  <Grid className={`kpi ${props.className}`}>
    {props.children}
  </Grid>

Kpi.propTypes = {
  className: PropTypes.string,
}

Kpi.defaultProps = {
  className: '',
}

export default Kpi
export {
  KpiItem,
}
