// Key Performance Indicators

import React from 'react'
import PropTypes from 'prop-types'
import './Kpi.scss'

import H1 from '@Typography/H1/H1'
import LabelParagraph from '@Typography/LabelParagraph/LabelParagraph'
import Icon from '@Design/Icon/Icon'

const KpiItem = props =>
  <div className={`kpi__item ${props.className}`}>
    {props.icon && <Icon className="kpi__icon" size="xlarge" name={ props.icon }/>}
    <H1 htmlTag="div" className="kpi__title">{props.amount}</H1>
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
  <div className={`kpi ${props.className} ${props.inline ? 'kpi--inline' : ''}`}>
    {props.children}
  </div>

Kpi.propTypes = {
  className: PropTypes.string,
  inline: PropTypes.bool,
}

Kpi.defaultProps = {
  className: '',
  inline: true,
}

export default Kpi
export {
  KpiItem,
}
