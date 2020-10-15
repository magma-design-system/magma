import React from 'react'
import PropTypes from 'prop-types'
import './Usage.scss'

import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import Icon from '@Design/Icon/Icon'
import H5 from '@Typography/H5/H5'

const UsageDo = props =>
  <div className="mds-usage__item mds-usage__item--do">
    <Row className="mds-usage__header">
      <Icon name="status-success"/>
      <H5>Do</H5>
    </Row>
    <Grid gutter="small" className="mds-usage__content">
      {props.children}
    </Grid>
  </div>

const UsageDont = props =>
  <div className="mds-usage__item mds-usage__item--dont">
    <Row className="mds-usage__header">
      <Icon name="status-error"/>
      <H5>Don't</H5>
    </Row>
    <Grid gutter="small" className="mds-usage__content">
      {props.children}
    </Grid>
  </div>

const Usage = props =>
  <Grid columns="2" className={`mds-usage ${props.className}`}>
    {props.children}
  </Grid>

Usage.propTypes = {
  className: PropTypes.string,
}

Usage.defaultProps = {
  className: '',
}

export default Usage
export {
  UsageDo,
  UsageDont,
}
